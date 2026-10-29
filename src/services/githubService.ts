/**
 * Serviço de Integração Direta com GitHub REST API
 * Permite que o Painel Administrativo envie fotos para public/fotos/
 * e dados para src/data/properties.ts diretamente no repositório.
 * Quando o commit é feito na branch (ex: main), a Vercel atualiza o site automaticamente.
 */

const STORAGE_KEY_REPO = 'JR_GITHUB_REPO';
const STORAGE_KEY_TOKEN = 'JR_GITHUB_TOKEN';
const STORAGE_KEY_BRANCH = 'JR_GITHUB_BRANCH';

export interface GitHubConfig {
  repo: string; // Formato: "usuario/repositorio"
  token: string; // Personal Access Token (PAT)
  branch: string; // Padrão: "main"
}

export interface GitHubTestResult {
  success: boolean;
  message: string;
  repoFullName?: string;
  defaultBranch?: string;
  permissions?: { push: boolean };
}

export interface GitHubUploadResult {
  success: boolean;
  url: string; // Ex: "/fotos/fachada-1.jpg"
  githubUrl?: string; // URL do arquivo no GitHub
  commitSha?: string;
  error?: string;
}

/**
 * Lê as configurações do GitHub do localStorage ou de variáveis de ambiente
 */
export function getGitHubConfig(): GitHubConfig {
  let repo = '';
  let token = '';
  let branch = 'main';

  try {
    repo = localStorage.getItem(STORAGE_KEY_REPO) || '';
    token = localStorage.getItem(STORAGE_KEY_TOKEN) || '';
    branch = localStorage.getItem(STORAGE_KEY_BRANCH) || 'main';
  } catch {
    // Ignore
  }

  // Fallbacks de env se disponíveis
  const envRepo = (import.meta as any).env?.VITE_GITHUB_REPO;
  const envToken = (import.meta as any).env?.VITE_GITHUB_TOKEN;
  const envBranch = (import.meta as any).env?.VITE_GITHUB_BRANCH;

  return {
    repo: repo.trim() || envRepo || '',
    token: token.trim() || envToken || '',
    branch: branch.trim() || envBranch || 'main',
  };
}

/**
 * Salva as configurações do GitHub no localStorage
 */
export function saveGitHubConfig(repo: string, token: string, branch = 'main'): void {
  try {
    localStorage.setItem(STORAGE_KEY_REPO, repo.trim());
    localStorage.setItem(STORAGE_KEY_TOKEN, token.trim());
    localStorage.setItem(STORAGE_KEY_BRANCH, (branch || 'main').trim());
  } catch (err) {
    console.error('Falha ao salvar configuração do GitHub:', err);
  }
}

/**
 * Remove a configuração do GitHub
 */
export function removeGitHubConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_REPO);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_BRANCH);
  } catch {
    // Ignore
  }
}

/**
 * Testa a conexão com o repositório do GitHub
 */
export async function testGitHubConnection(): Promise<GitHubTestResult> {
  const config = getGitHubConfig();

  if (!config.repo || !config.repo.includes('/')) {
    return {
      success: false,
      message: 'Nome do repositório inválido. Use o formato: seu-usuario/seu-repositorio',
    };
  }

  if (!config.token) {
    return {
      success: false,
      message: 'Token do GitHub não configurado.',
    };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${config.repo}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, message: 'Token do GitHub inválido ou expirado.' };
      }
      if (res.status === 404) {
        return {
          success: false,
          message: 'Repositório não encontrado. Verifique se o nome está correto e se o token tem acesso a ele.',
        };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || `Erro do GitHub: status ${res.status}` };
    }

    const data = await res.json();
    const canPush = data.permissions?.push ?? true;

    return {
      success: true,
      message: canPush
        ? `Conectado com sucesso ao repositório ${data.full_name}!`
        : `Atenção: Conectado a ${data.full_name}, mas o token não tem permissão de escrita (push).`,
      repoFullName: data.full_name,
      defaultBranch: data.default_branch || 'main',
      permissions: { push: canPush },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha de rede ao conectar com GitHub: ${err.message || 'Erro desconhecido'}`,
    };
  }
}

/**
 * Converte arquivo para Base64 puro (sem o prefixo "data:...;base64,")
 */
function fileToBase64Clean(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const commaIdx = reader.result.indexOf(',');
        resolve(commaIdx !== -1 ? reader.result.slice(commaIdx + 1) : reader.result);
      } else {
        reject(new Error('Erro ao converter arquivo em Base64'));
      }
    };
    reader.onerror = () => reject(new Error('Falha na leitura do arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Envia um arquivo binário ou texto diretamente para o repositório no GitHub
 */
export async function uploadFileToGitHub(
  pathInRepo: string,
  base64CleanContent: string,
  commitMessage: string
): Promise<GitHubUploadResult> {
  const config = getGitHubConfig();

  if (!config.repo || !config.token) {
    return {
      success: false,
      url: '',
      error: 'GitHub não configurado. Adicione seu repositório e token no painel.',
    };
  }

  // Remove barra inicial se houver
  const cleanPath = pathInRepo.startsWith('/') ? pathInRepo.slice(1) : pathInRepo;
  const branch = config.branch || 'main';

  try {
    // 1. Verificar se o arquivo já existe para obter seu SHA (obrigatório para updates no GitHub)
    let fileSha: string | undefined = undefined;
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${config.repo}/contents/${cleanPath}?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (getRes.ok) {
        const existingData = await getRes.json();
        fileSha = existingData.sha;
      }
    } catch {
      // Arquivo ainda não existe, cria novo
    }

    // 2. Fazer PUT no GitHub API
    const body: Record<string, any> = {
      message: commitMessage,
      content: base64CleanContent,
      branch: branch,
    };
    if (fileSha) {
      body.sha = fileSha;
    }

    const putRes = await fetch(
      `https://api.github.com/repos/${config.repo}/contents/${cleanPath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      return {
        success: false,
        url: '',
        error: errData.message || `Erro do GitHub: status ${putRes.status}`,
      };
    }

    const resData = await putRes.json();
    const downloadUrl =
      resData.content?.download_url ||
      `https://raw.githubusercontent.com/${config.repo}/${branch}/${cleanPath}`;
    const relativeUrl = `/${cleanPath.replace(/^public\//, '')}`;

    return {
      success: true,
      url: downloadUrl || relativeUrl,
      githubUrl: resData.content?.html_url || downloadUrl,
      commitSha: resData.commit?.sha,
    };
  } catch (err: any) {
    return {
      success: false,
      url: '',
      error: err.message || 'Erro de conexão ao enviar arquivo para o GitHub',
    };
  }
}

/**
 * Converte URLs relativas como /fotos/nome.jpg para a CDN crua do GitHub
 * quando o repositório estiver configurado, garantindo renderização instantânea em qualquer dispositivo.
 */
export function resolveImageUrl(url?: string): string {
  if (!url) return '';

  // Se já for uma URL remota completa, base64 ou blob, retorna diretamente
  if (
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Se for um caminho relativo para fotos do projeto (ex: /fotos/imagem.jpg)
  if (url.startsWith('/fotos/') || url.startsWith('fotos/')) {
    const config = getGitHubConfig();
    if (config.repo) {
      const branch = config.branch || 'main';
      const cleanPath = url.startsWith('/') ? url.slice(1) : url;
      return `https://raw.githubusercontent.com/${config.repo}/${branch}/public/${cleanPath}`;
    }
  }

  return url;
}

/**
 * Event handler onError para a tag <img>
 * Se o arquivo estático /fotos/... falhar na Vercel (status 404),
 * troca automaticamente o src para a CDN do GitHub em tempo de execução.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string
) {
  const target = e.currentTarget;
  if (target.dataset.hasFailed) return;
  target.dataset.hasFailed = 'true';

  const urlToUse = originalUrl || target.getAttribute('src') || '';
  const config = getGitHubConfig();

  if (config.repo) {
    const branch = config.branch || 'main';
    const match = urlToUse.match(/\/fotos\/(.+)$/);
    if (match) {
      const photoName = match[1];
      target.src = `https://raw.githubusercontent.com/${config.repo}/${branch}/public/fotos/${photoName}`;
      return;
    }
  }
}

/**
 * Envia uma foto para public/fotos/ no GitHub
 */
export async function uploadPhotoToGitHub(
  file: File,
  customFilename?: string
): Promise<GitHubUploadResult> {
  const origName = customFilename || file.name || `foto-${Date.now()}.jpg`;
  let cleanName = origName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]/g, '_');

  if (!/\.(jpe?g|png|webp|gif|svg)$/i.test(cleanName)) {
    cleanName += '.jpg';
  }

  const base64 = await fileToBase64Clean(file);
  const pathInRepo = `public/fotos/${cleanName}`;
  const commitMsg = `Upload de foto via Painel Admin: ${cleanName}`;

  return uploadFileToGitHub(pathInRepo, base64, commitMsg);
}

/**
 * Envia o arquivo src/data/properties.ts atualizado diretamente para o GitHub
 */
export async function commitPropertiesTsToGitHub(
  tsSourceCode: string
): Promise<{ success: boolean; commitSha?: string; error?: string }> {
  // Converte string UTF-8 para base64
  const bytes = new TextEncoder().encode(tsSourceCode);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const pathInRepo = 'src/data/properties.ts';
  const commitMsg = 'Atualização do catálogo de imóveis via Painel Admin';

  const res = await uploadFileToGitHub(pathInRepo, base64, commitMsg);
  return {
    success: res.success,
    commitSha: res.commitSha,
    error: res.error,
  };
}
