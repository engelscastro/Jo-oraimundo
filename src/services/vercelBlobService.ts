/**
 * Serviço de Integração com Vercel Blob Storage
 * Permite que o Painel Administrativo envie imagens diretamente para o CDN da Vercel.
 */

const STORAGE_KEY_TOKEN = 'VERCEL_BLOB_READ_WRITE_TOKEN';

export interface VercelBlobStatus {
  configured: boolean;
  hasEnvToken: boolean;
  hasCustomToken: boolean;
  message: string;
}

export interface UploadResult {
  url: string;
  isVercel: boolean;
  pathname?: string;
  error?: string;
}

/**
 * Verifica se uma URL é hospedada no Vercel Blob
 */
export function isVercelBlobUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('.public.blob.vercel-storage.com') ||
    url.includes('blob.vercel-storage.com') ||
    url.includes('vercel.app') ||
    url.includes('.vercel-storage.com')
  );
}

/**
 * Obtém o token configurado (do localStorage ou da variável de ambiente Vite)
 */
export function getVercelBlobToken(): string {
  try {
    const local = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (local && local.trim().length > 0) return local.trim();
  } catch {
    // Ignore localStorage errors
  }
  const envToken = (import.meta as any).env?.VITE_BLOB_READ_WRITE_TOKEN;
  return envToken ? String(envToken).trim() : '';
}

/**
 * Salva o token no localStorage
 */
export function setVercelBlobToken(token: string): void {
  try {
    if (!token || token.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    } else {
      localStorage.setItem(STORAGE_KEY_TOKEN, token.trim());
    }
  } catch (err) {
    console.error('Falha ao salvar token no localStorage:', err);
  }
}

/**
 * Remove o token do localStorage
 */
export function removeVercelBlobToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  } catch {
    // Ignore
  }
}

/**
 * Verifica o status de conexão com o Vercel Blob
 */
export async function checkVercelBlobStatus(): Promise<VercelBlobStatus> {
  const customToken = getVercelBlobToken();

  try {
    const res = await fetch('/api/blob-status', {
      headers: customToken ? { 'x-blob-token': customToken } : {},
    });

    if (res.ok) {
      const data = await res.json();
      return {
        configured: data.configured || !!customToken,
        hasEnvToken: !!data.hasEnvToken,
        hasCustomToken: !!customToken,
        message: data.message || (data.configured ? 'Vercel Blob ativo' : 'Aguardando token'),
      };
    }
  } catch {
    // Fallback if backend route is unreachable
  }

  const hasToken = !!customToken;
  return {
    configured: hasToken,
    hasEnvToken: false,
    hasCustomToken: hasToken,
    message: hasToken
      ? 'Token manual configurado no navegador'
      : 'Vercel Blob não configurado. Adicione seu token.',
  };
}

/**
 * Converte um arquivo para base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Falha ao ler arquivo de imagem'));
      }
    };
    reader.onerror = () => reject(new Error('Erro na leitura do arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Faz upload de imagem para o Vercel Blob via endpoint /api/upload
 * Se o token não estiver configurado, avisa amigavelmente e salva localmente como fallback.
 */
export async function uploadImageToVercel(
  file: File,
  onStatusChange?: (status: string) => void
): Promise<UploadResult> {
  onStatusChange?.('Preparando arquivo para upload...');

  // Validar tamanho
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('A imagem excede 10MB. Escolha uma imagem menor.');
  }

  // Obter data URL
  const dataUrl = await fileToDataUrl(file);
  const token = getVercelBlobToken();

  onStatusChange?.('Enviando para o Vercel Blob Storage...');

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['x-blob-token'] = token;
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filename: file.name,
        dataUrl,
        contentType: file.type || 'image/jpeg',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        onStatusChange?.('Concluído!');
        return {
          url: data.url,
          isVercel: true,
          pathname: data.pathname,
        };
      }
    }

    // Se a resposta retornou erro com mensagem específica
    const errData = await response.json().catch(() => ({}));
    const errorMsg = errData.error || 'Falha ao processar upload no Vercel Blob';

    console.warn('Vercel Blob upload não completou:', errorMsg);

    // Fallback: se não tiver token configurado ou falhou na Vercel,
    // retorna a imagem local em dataUrl mas avisa para que o usuário saiba
    return {
      url: dataUrl,
      isVercel: false,
      error: errorMsg,
    };
  } catch (err: any) {
    console.warn('Erro de rede ao conectar com /api/upload:', err);
    return {
      url: dataUrl,
      isVercel: false,
      error: err.message || 'Não foi possível alcançar o servidor da Vercel. Imagem salva localmente.',
    };
  }
}

/**
 * Testa a conexão com o Vercel Blob enviando um arquivo de teste minúsculo
 */
export async function testVercelBlobConnection(tokenToTest?: string): Promise<{ success: boolean; message: string; url?: string }> {
  const token = tokenToTest || getVercelBlobToken();
  if (!token) {
    return {
      success: false,
      message: 'Nenhum token fornecido. Informe o BLOB_READ_WRITE_TOKEN da Vercel.',
    };
  }

  try {
    // 1x1 transparent PNG data url
    const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-blob-token': token,
      },
      body: JSON.stringify({
        filename: `test-connection-${Date.now()}.png`,
        dataUrl: tinyPng,
        contentType: 'image/png',
      }),
    });

    const data = await response.json();
    if (response.ok && data.success && data.url) {
      return {
        success: true,
        message: 'Conexão bem sucedida com o Vercel Blob! Suas imagens serão salvas na nuvem da Vercel.',
        url: data.url,
      };
    } else {
      return {
        success: false,
        message: data.error || 'A Vercel rejeitou a conexão com este token. Verifique se o token é válido.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao testar conexão: ${err.message || 'Falha de rede'}`,
    };
  }
}
