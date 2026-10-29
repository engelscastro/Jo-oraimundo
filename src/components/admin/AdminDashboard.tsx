import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Image as ImageIcon, 
  Building2, 
  User, 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  RotateCcw, 
  Download, 
  Check, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  Sliders,
  DollarSign,
  MapPin,
  Lock,
  Cloud,
  CloudUpload,
  Loader2,
  Copy,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Key,
  Globe,
  GitBranch,
  GitCommit
} from 'lucide-react';
import { useRealEstate } from '../../context/RealEstateContext';
import { Property, BannerSlide, PropertyImage, MACEIO_BAIRROS, MACEIO_BAIRROS_BY_REGION } from '../../data/properties';
import { 
  uploadImageToVercel, 
  isVercelBlobUrl, 
  getVercelBlobToken, 
  setVercelBlobToken, 
  removeVercelBlobToken, 
  testVercelBlobConnection, 
  checkVercelBlobStatus, 
  VercelBlobStatus 
} from '../../services/vercelBlobService';
import {
  getGitHubConfig,
  saveGitHubConfig,
  removeGitHubConfig,
  testGitHubConnection,
  uploadPhotoToGitHub,
  commitPropertiesTsToGitHub,
  resolveImageUrl,
  handleImageError,
  GitHubConfig,
  GitHubTestResult
} from '../../services/githubService';

const POPULAR_MACEIO_BAIRROS = [
  "Ponta Verde",
  "Jatiúca",
  "Pajuçara",
  "Cruz das Almas",
  "Mangabeiras",
  "Guaxuma",
  "Garça Torta",
  "Ipioca",
  "Farol",
  "Gruta de Lourdes",
  "Serraria",
  "Antares"
];

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const {
    properties,
    banners,
    brokerInfo,
    promos,
    updateBanner,
    addBanner,
    deleteBanner,
    updateProperty,
    addProperty,
    deleteProperty,
    updateBroker,
    cloudSync,
    syncToCloud,
    loadFromCloud,
    migratePendingImages,
    resetToDefaults,
    exportJSON,
    importJSON
  } = useRealEstate();

  const [activeTab, setActiveTab] = useState<'banners' | 'properties' | 'broker' | 'github' | 'vercel' | 'backup'>('banners');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // GitHub direct repository integration state
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => getGitHubConfig());
  const [githubRepoInput, setGithubRepoInput] = useState<string>('');
  const [githubTokenInput, setGithubTokenInput] = useState<string>('');
  const [githubBranchInput, setGithubBranchInput] = useState<string>('main');
  const [isTestingGitHub, setIsTestingGitHub] = useState<boolean>(false);
  const [githubTestResult, setGithubTestResult] = useState<GitHubTestResult | null>(null);
  const [isCommittingGitHub, setIsCommittingGitHub] = useState<boolean>(false);

  // Vercel Blob & Cross-Device Cloud Sync State
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [isBatchMigrating, setIsBatchMigrating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; message: string } | null>(null);

  const [uploadingTargetId, setUploadingTargetId] = useState<string | null>(null);
  const [uploadingMessage, setUploadingMessage] = useState<string>('');
  const [vercelStatus, setVercelStatus] = useState<VercelBlobStatus>({
    configured: false,
    hasEnvToken: false,
    hasCustomToken: false,
    message: 'Verificando conexão com a Vercel...'
  });
  const [blobTokenInput, setBlobTokenInput] = useState<string>('');
  const [isTestingToken, setIsTestingToken] = useState<boolean>(false);
  const [tokenTestResult, setTokenTestResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Count pending local base64 images that are only stored in this browser
  const pendingLocalImagesCount = [
    ...banners.filter((b) => b.imageUrl && b.imageUrl.startsWith('data:image/')),
    ...properties.flatMap((p) => p.images.filter((img) => img.url && img.url.startsWith('data:image/'))),
    ...(brokerInfo.avatarUrl && brokerInfo.avatarUrl.startsWith('data:image/') ? [1] : [])
  ].length;

  useEffect(() => {
    if (isOpen) {
      checkVercelBlobStatus().then(setVercelStatus);
      setBlobTokenInput(getVercelBlobToken());
      const gh = getGitHubConfig();
      setGithubConfig(gh);
      setGithubRepoInput(gh.repo);
      setGithubTokenInput(gh.token);
      setGithubBranchInput(gh.branch || 'main');
    }
  }, [isOpen]);

  // New Property Registration Modal State
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [newPropData, setNewPropData] = useState({
    title: '',
    code: '',
    tagline: 'Lançamento Exclusivo',
    bairro: 'Ponta Verde',
    customBairro: '',
    isCustomBairro: false,
    address: 'Maceió - AL',
    price: 850000,
    status: 'Lançamento' as Property['status'],
    deliveryYear: '2027',
    areaMin: 70,
    areaMax: 120,
    bedroomsMin: 2,
    bedroomsMax: 3,
    parkingSpots: 2,
    bathrooms: 2,
    beachfront: false,
    seaView: true
  });

  // Manual Photo URL / Frontend Path addition state
  const [newManualPhotoUrl, setNewManualPhotoUrl] = useState('');
  const [newManualPhotoTitle, setNewManualPhotoTitle] = useState('');
  const [isSavingCode, setIsSavingCode] = useState(false);

  // Selected property reference
  const currentProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const showNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showNotification('Link copiado!');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  if (!isOpen) return null;

  // Upload handler for Vercel Blob
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetId: string,
    onSuccess: (imageUrl: string, isVercel: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification('A imagem é muito grande! Escolha um arquivo de até 10MB.');
      return;
    }

    setUploadingTargetId(targetId);
    setUploadingMessage('Preparando imagem...');

    try {
      const gh = getGitHubConfig();
      if (gh.repo && gh.token) {
        setUploadingMessage('Commitando foto em public/fotos/ no GitHub...');
        const ghRes = await uploadPhotoToGitHub(file);
        if (ghRes.success) {
          onSuccess(ghRes.url, false);
          showNotification(`✓ Foto enviada para public/fotos/ no GitHub! A Vercel iniciou a atualização.`);
          return;
        } else {
          console.warn('Falha ao enviar para o GitHub:', ghRes.error);
          showNotification(`Aviso GitHub: ${ghRes.error}. Salvando localmente.`);
        }
      }

      const res = await uploadImageToVercel(file, (msg) => {
        setUploadingMessage(msg);
      });

      onSuccess(res.url, res.isVercel);

      if (res.isVercel) {
        showNotification('Imagem hospedada na Vercel (CDN) com sucesso!');
        checkVercelBlobStatus().then(setVercelStatus);
      } else if (res.url.startsWith('/fotos/')) {
        showNotification('✓ Foto importada e salva na pasta public/fotos do projeto!');
      } else {
        showNotification('Foto adicionada com sucesso!');
      }
    } catch (err: any) {
      showNotification(err.message || 'Erro ao carregar imagem');
    } finally {
      setUploadingTargetId(null);
      setUploadingMessage('');
      e.target.value = '';
    }
  };

  // Migrate existing dataUrl to GitHub (public/fotos/) or Vercel Blob
  const handleMigrateImageToVercel = async (
    dataUrl: string,
    filename: string,
    onSuccess: (newUrl: string) => void
  ) => {
    setUploadingTargetId(`migrate-${filename}`);

    const gh = getGitHubConfig();

    // 1. Se GitHub estiver configurado, envia DIRETO para public/fotos/ no GitHub!
    if (gh.repo && gh.token) {
      setUploadingMessage('Commitando foto em public/fotos/ no GitHub...');
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
        const ghRes = await uploadPhotoToGitHub(file, filename);

        if (ghRes.success) {
          onSuccess(ghRes.url);
          showNotification(`✓ Foto salva em public/fotos/ no GitHub! A Vercel atualizará o site.`);
          return;
        } else {
          showNotification(`Aviso GitHub: ${ghRes.error}`);
          return;
        }
      } catch (err: any) {
        showNotification('Erro ao enviar para o GitHub: ' + err.message);
        return;
      } finally {
        setUploadingTargetId(null);
        setUploadingMessage('');
      }
    }

    // 2. Se GitHub não estiver configurado, avisa amigavelmente
    setUploadingMessage('Enviando para a Nuvem...');
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
      const uploadRes = await uploadImageToVercel(file, setUploadingMessage);
      if (uploadRes.isVercel) {
        onSuccess(uploadRes.url);
        showNotification('Imagem hospedada na Vercel com sucesso!');
        checkVercelBlobStatus().then(setVercelStatus);
      } else {
        showNotification('Para salvar em public/fotos/, configure a aba "GitHub" com seu repositório e token ghp_!');
      }
    } catch (err: any) {
      showNotification('Erro: ' + err.message);
    } finally {
      setUploadingTargetId(null);
      setUploadingMessage('');
    }
  };


  // Export JSON file
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportJSON());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `joao_raimundo_site_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export full TypeScript code directly for frontend (src/data/properties.ts)
  const generateTSCode = () => {
    return `// Arquivo gerado pelo Painel Administrativo
// Cole este conteúdo em src/data/properties.ts para hospedar 100% no Frontend (Sem banco de dados)!

export interface PropertyImage {
  id: string;
  url: string;
  title: string;
  category: 'exterior' | 'interior' | 'lazer' | 'planta' | 'vista';
}

export const MACEIO_BAIRROS = ${JSON.stringify(MACEIO_BAIRROS, null, 2)} as const;

export type MaceioBairro = (typeof MACEIO_BAIRROS)[number] | string;

export const MACEIO_BAIRROS_BY_REGION = ${JSON.stringify(MACEIO_BAIRROS_BY_REGION, null, 2)};

export interface Property {
  id: string;
  code: string;
  title: string;
  tagline: string;
  bairro: MaceioBairro;
  address: string;
  status: 'Lançamento' | 'Em Construção' | 'Pronto para Morar' | 'Últimas Unidades';
  statusProgress?: number;
  deliveryYear: string;
  price: number;
  condoFee?: number;
  iptu?: number;
  areaMin: number;
  areaMax: number;
  bedroomsMin: number;
  bedroomsMax: number;
  suitesMin: number;
  suitesMax: number;
  parkingSpots: number;
  bathrooms: number;
  featured: boolean;
  seaView: boolean;
  beachfront: boolean;
  images: PropertyImage[];
  description: string;
  amenities: string[];
  differentials: string[];
  coords?: { lat: number; lng: number };
}

export interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  bairro: string;
  ctaText: string;
  ctaTarget: string;
  secondaryCtaText?: string;
  secondaryCtaTarget?: string;
  priceText?: string;
  imageTheme: 'ponta_verde' | 'jatiuca' | 'pajucara' | 'resort';
  imageUrl?: string;
}

export const PROPERTIES: Property[] = ${JSON.stringify(properties, null, 2)};

export const BANNER_SLIDES: BannerSlide[] = ${JSON.stringify(banners, null, 2)};

export const BROKER_INFO = ${JSON.stringify(brokerInfo, null, 2)};

export const MID_BANNER_PROMOS = [
  {
    id: "promo-1",
    tag: "CONDIÇÃO ESPECIAL DIRETO COM CONSTRUTORA",
    title: "Entrada Facilitada e Parcelamento em até 60 Meses",
    description: "Compre seu imóvel na planta em Maceió sem burocracia bancária durante a fase de obra. Assessoria gratuita na negociação.",
    cta: "Consultar Obras Disponíveis",
    action: "filter_lancamentos"
  },
  {
    id: "promo-2",
    tag: "ASSESSORIA DE FINANCIAMENTO IMOBILIÁRIO",
    title: "Aprovação de Crédito Rápida em até 24 Horas",
    description: "Parceria com Caixa Econômica, Itaú, Santander e Bradesco. Encontramos a menor taxa de juros do mercado para o seu perfil.",
    cta: "Fazer Simulação com João",
    action: "open_simulator"
  },
  {
    id: "promo-3",
    tag: "CONSULTORIA PARA INVESTIDORES",
    title: "Maceió: A Cidade Líder em Valorização Imobiliária do Brasil",
    description: "Rentabilidade consistente em locação por temporada de frente para as piscinas naturais. Receba estudo completo de rentabilidade.",
    cta: "Falar com João no WhatsApp",
    action: "open_whatsapp"
  }
];

export interface NeighborhoodInfo {
  name: string;
  slug: string;
  headline: string;
  description: string;
  highlights: string[];
  avgPricePerSqm: string;
  propertyCount: number;
  coverGradient: string;
}

export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  {
    name: "Ponta Verde",
    slug: "ponta-verde",
    headline: "O Bairro Mais Desejado e Nobre da Orla de Maceió",
    description: "Referência absoluta em qualidade de vida com calçadão vibrante, quiosques famosos (Lopana e Kanoa), feirinha de artesanato e piscinas naturais mornas.",
    highlights: ["Orla marítima com faixa viva para pedestres", "Polo gastronômico refinado", "Escolas e serviços de alto padrão"],
    avgPricePerSqm: "R$ 11.500 / m²",
    propertyCount: 14,
    coverGradient: "from-teal-600 to-cyan-700"
  },
  {
    name: "Jatiúca",
    slug: "jatiuca",
    headline: "A Combinação Perfeita de Praia, Lazer e Gastronomia",
    description: "Famoso pelo corredor gastronômico da Av. Dr. Antônio Gomes de Barros, praias com boas ondas e infraestrutura completa para moradia ou investimento.",
    highlights: ["Melhores restaurantes e bistrôs de Alagoas", "Praia vibrante com ciclovia contínua", "Lançamentos imobiliários modernos"],
    avgPricePerSqm: "R$ 10.200 / m²",
    propertyCount: 18,
    coverGradient: "from-cyan-700 to-blue-800"
  },
  {
    name: "Pajuçara",
    slug: "pajucara",
    headline: "O Cartão Postal das Jangadas e Piscinas Naturais",
    description: "Mar tranquilo de águas calmas e límpidas, perfeito para famílias com crianças e com o maior índice de rentabilidade em locação por temporada (Airbnb).",
    highlights: ["Passeios de jangada às piscinas naturais", "Feira de Artesanato de Maceió", "Excelente retorno de locação por diária"],
    avgPricePerSqm: "R$ 9.800 / m²",
    propertyCount: 12,
    coverGradient: "from-emerald-600 to-teal-700"
  },
  {
    name: "Guaxuma & Litoral Norte",
    slug: "guaxuma",
    headline: "O Novo Vetor de Crescimento e Condomínios Fechados",
    description: "A poucos minutos do Parque Shopping, cercado por coqueirais e mar aberto paradisíaco. A escolha preferida de quem busca exclusividade e contato com a natureza.",
    highlights: ["Condomínios de alto luxo à beira-mar", "Região em plena valorização acelerada", "Praias preservadas e tranquilas"],
    avgPricePerSqm: "R$ 8.900 / m²",
    propertyCount: 9,
    coverGradient: "from-blue-700 to-teal-800"
  }
];

export interface Testimonial {
  name: string;
  role: string;
  location: string;
  property: string;
  rating: number;
  date: string;
  comment: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Eduardo & Mariana Silveira",
    role: "Médicos",
    location: "São Paulo - SP",
    property: "Residencial Mare Nostrum · Ponta Verde",
    rating: 5,
    date: "Fevereiro de 2026",
    comment: "Procurávamos um apartamento de frente para o mar para as férias da família e futura moradia. O João Raimundo foi impecável, fez vídeo-chamada ao vivo de cada detalhe da obra e cuidou de toda a burocracia documental. Atendimento nota 10!"
  },
  {
    name: "Ricardo Mendonça",
    role: "Empresário & Investidor",
    location: "Brasília - DF",
    property: "Studio Premium · Pajuçara",
    rating: 5,
    date: "Janeiro de 2026",
    comment: "Comprei dois studios para locação por temporada por indicação do João. Os imóveis entregam exatamente a rentabilidade que ele calculou no estudo financeiro inicial. Transparência e conhecimento de mercado incomparáveis."
  },
  {
    name: "Patrícia Cavalcante",
    role: "Advogada",
    location: "Maceió - AL",
    property: "Edifício Porto Bellagio · Jatiúca",
    rating: 5,
    date: "Março de 2026",
    comment: "João Raimundo me ajudou a encontrar a planta perfeita para a minha família na Jatiúca, a duas quadras da praia. Negociação justa com a construtora e suporte em todas as etapas até o cartório."
  }
];
`;
  };

  const handleDownloadTS = () => {
    const code = generateTSCode();
    const dataStr = "data:text/typescript;charset=utf-8," + encodeURIComponent(code);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "properties.ts");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Arquivo properties.ts baixado!');
  };

  const handleCopyTSCode = () => {
    const code = generateTSCode();
    navigator.clipboard.writeText(code);
    showNotification('Código TypeScript copiado! Basta colar em src/data/properties.ts.');
  };

  const handleSaveCodeToDisk = async () => {
    setIsSavingCode(true);
    try {
      const res = await fetch('/api/save-to-properties-ts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties,
          banners,
          brokerInfo,
          promos
        })
      });
      if (res.ok) {
        showNotification('✓ Alterações salvas com sucesso em src/data/properties.ts!');
      } else {
        handleDownloadTS();
      }
    } catch {
      handleDownloadTS();
    } finally {
      setIsSavingCode(false);
    }
  };

  // GitHub integration handlers
  const handleSaveGitHubConfig = () => {
    if (!githubRepoInput.trim() || !githubTokenInput.trim()) {
      showNotification('Preencha o repositório (ex: usuario/repo) e o token do GitHub.');
      return;
    }
    saveGitHubConfig(githubRepoInput.trim(), githubTokenInput.trim(), githubBranchInput.trim() || 'main');
    const updated = getGitHubConfig();
    setGithubConfig(updated);
    showNotification('Configurações do GitHub salvas com sucesso!');
    testGitHubConnection().then(setGithubTestResult);
  };

  const handleDisconnectGitHub = () => {
    removeGitHubConfig();
    setGithubConfig({ repo: '', token: '', branch: 'main' });
    setGithubRepoInput('');
    setGithubTokenInput('');
    setGithubTestResult(null);
    showNotification('GitHub desconectado.');
  };

  const handleTestGitHubConnection = async () => {
    setIsTestingGitHub(true);
    setGithubTestResult(null);
    try {
      saveGitHubConfig(githubRepoInput.trim(), githubTokenInput.trim(), githubBranchInput.trim() || 'main');
      const res = await testGitHubConnection();
      setGithubTestResult(res);
      if (res.success) {
        setGithubConfig(getGitHubConfig());
        showNotification('✓ Conexão com GitHub realizada com sucesso!');
      } else {
        showNotification(res.message);
      }
    } catch (err: any) {
      setGithubTestResult({ success: false, message: err.message || 'Erro ao conectar com GitHub' });
    } finally {
      setIsTestingGitHub(false);
    }
  };

  const handleCommitAllToGitHub = async () => {
    const gh = getGitHubConfig();
    if (!gh.repo || !gh.token) {
      setActiveTab('github');
      showNotification('Configure o Repositório e Token do GitHub primeiro.');
      return;
    }

    setIsCommittingGitHub(true);
    try {
      const code = generateTSCode();
      const res = await commitPropertiesTsToGitHub(code);
      if (res.success) {
        showNotification('✓ Catálogo commitado no GitHub com sucesso! A Vercel está atualizando o site (~45s).');
      } else {
        showNotification(`Erro ao enviar para o GitHub: ${res.error}`);
      }
    } catch (err: any) {
      showNotification(err.message || 'Erro ao commitar no GitHub');
    } finally {
      setIsCommittingGitHub(false);
    }
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importJSON(content);
        if (ok) {
          showNotification('Backup importado com sucesso!');
        } else {
          showNotification('Erro ao importar arquivo JSON. Verifique o formato.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualSyncToCloud = async () => {
    setIsManualSyncing(true);
    try {
      const ok = await syncToCloud();
      if (ok) {
        showNotification('Sincronizado na Nuvem! Seu celular e visitantes já veem os imóveis e fotos.');
      } else {
        showNotification(cloudSync.error || 'Falha ao sincronizar. Verifique se o token Vercel está configurado.');
      }
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleBatchMigrateAll = async () => {
    if (pendingLocalImagesCount === 0) {
      showNotification('Todas as fotos já estão salvas permanentemente!');
      return;
    }

    const gh = getGitHubConfig();
    if (gh.repo && gh.token) {
      setIsBatchMigrating(true);
      setBatchProgress({ current: 0, total: pendingLocalImagesCount, message: 'Iniciando upload de fotos para o GitHub...' });

      try {
        let count = 0;
        // Banners
        for (const b of banners) {
          if (b.imageUrl && b.imageUrl.startsWith('data:')) {
            setBatchProgress({ current: count + 1, total: pendingLocalImagesCount, message: `Enviando banner ${b.title || b.id} para o GitHub...` });
            const res = await fetch(b.imageUrl);
            const blob = await res.blob();
            const file = new File([blob], `banner-${b.id}.jpg`, { type: 'image/jpeg' });
            const ghRes = await uploadPhotoToGitHub(file, `banner-${b.id}.jpg`);
            if (ghRes.success) {
              updateBanner({ ...b, imageUrl: ghRes.url });
              count++;
            }
          }
        }

        // Properties
        for (const p of properties) {
          let propUpdated = false;
          const newImages = [...p.images];
          for (let i = 0; i < newImages.length; i++) {
            const img = newImages[i];
            if (img.url && img.url.startsWith('data:')) {
              setBatchProgress({ current: count + 1, total: pendingLocalImagesCount, message: `Enviando foto de ${p.title} para o GitHub...` });
              const res = await fetch(img.url);
              const blob = await res.blob();
              const file = new File([blob], `prop-${p.code}-${i}.jpg`, { type: 'image/jpeg' });
              const ghRes = await uploadPhotoToGitHub(file, `prop-${p.code}-${i}.jpg`);
              if (ghRes.success) {
                newImages[i] = { ...img, url: ghRes.url };
                propUpdated = true;
                count++;
              }
            }
          }
          if (propUpdated) {
            updateProperty({ ...p, images: newImages });
          }
        }

        // Broker
        if (brokerInfo.avatarUrl && brokerInfo.avatarUrl.startsWith('data:')) {
          setBatchProgress({ current: count + 1, total: pendingLocalImagesCount, message: 'Enviando foto do corretor para o GitHub...' });
          const res = await fetch(brokerInfo.avatarUrl);
          const blob = await res.blob();
          const file = new File([blob], 'joao-raimundo-corretor.jpg', { type: 'image/jpeg' });
          const ghRes = await uploadPhotoToGitHub(file, 'joao-raimundo-corretor.jpg');
          if (ghRes.success) {
            updateBroker({ avatarUrl: ghRes.url });
            count++;
          }
        }

        // Commita properties.ts atualizado
        setBatchProgress({ current: count, total: pendingLocalImagesCount, message: 'Atualizando catálogo no GitHub...' });
        const tsCode = generateTSCode();
        await commitPropertiesTsToGitHub(tsCode);

        showNotification(`✓ ${count} foto(s) enviadas com sucesso para public/fotos/ no GitHub! A Vercel atualizará o site.`);
      } catch (err: any) {
        showNotification('Erro ao enviar fotos para o GitHub: ' + err.message);
      } finally {
        setIsBatchMigrating(false);
        setBatchProgress(null);
      }
      return;
    }

    // Se GitHub não configurado, tenta Vercel Blob
    setIsBatchMigrating(true);
    setBatchProgress({ current: 0, total: pendingLocalImagesCount, message: 'Iniciando upload de fotos...' });
    try {
      const res = await migratePendingImages((curr, tot, msg) => {
        setBatchProgress({ current: curr, total: tot, message: msg });
      });
      if (res.migratedCount > 0) {
        showNotification(`Sucesso! ${res.migratedCount} foto(s) migradas.`);
      } else {
        showNotification('Configure o repositório e o token na aba "GitHub" para enviar para public/fotos/.');
      }
    } catch (err: any) {
      showNotification('Erro: ' + err.message);
    } finally {
      setIsBatchMigrating(false);
      setBatchProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="relative bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Painel Administrativo do Site
              </h2>
              <p className="text-xs text-teal-400">
                Gerencie fotos, banners, imóveis e dados do corretor com sincronização em nuvem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Vercel Status Indicator */}
            <button
              onClick={() => setActiveTab('vercel')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                vercelStatus.configured
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Gerenciar Hospedagem Vercel Blob & Sincronização"
            >
              <Cloud className="w-3.5 h-3.5 text-teal-400" />
              <span>{vercelStatus.configured ? 'Vercel CDN Ativo' : 'Vercel: Conectar'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  vercelStatus.configured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
            </button>

            {saveSuccessNotice && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30">
                <Check className="w-4 h-4" />
                <span>{saveSuccessNotice}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Cloud Sync Status Strip */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                cloudSync.isSyncing || isManualSyncing
                  ? 'bg-amber-400 animate-ping'
                  : vercelStatus.configured
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <div className="min-w-0">
              <span className="font-semibold text-white">
                {cloudSync.isSyncing || isManualSyncing
                  ? 'Sincronizando...'
                  : vercelStatus.configured
                  ? 'Nuvem Vercel Conectada (Fotos e dados na CDN)'
                  : 'Modo Frontend (Sem Banco de Dados): Fotos salvas diretamente no site'}
              </span>
              {cloudSync.lastSyncedAt && (
                <span className="hidden md:inline text-slate-400 text-[11px] ml-2">
                  (Última atualização: {new Date(cloudSync.lastSyncedAt).toLocaleTimeString('pt-BR')})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pendingLocalImagesCount > 0 && (
              <button
                type="button"
                onClick={handleBatchMigrateAll}
                disabled={isBatchMigrating}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg font-bold text-xs transition-colors"
                title="Fotos salvas na memória local deste navegador. Clique para enviar para a CDN da Vercel."
              >
                {isBatchMigrating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{batchProgress ? `${batchProgress.current}/${batchProgress.total}` : 'Enviando...'}</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5 text-amber-300" />
                    <span>Migrar {pendingLocalImagesCount} fotos p/ Nuvem</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveCodeToDisk}
              disabled={isSavingCode}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-colors shadow-sm"
              title="Grava todos os imóveis e fotos diretamente no código do site (src/data/properties.ts) sem banco de dados"
            >
              {isSavingCode ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gravando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Gravar no Código (properties.ts)</span>
                </>
              )}
            </button>

            {githubConfig.repo && githubConfig.token && (
              <button
                type="button"
                onClick={handleCommitAllToGitHub}
                disabled={isCommittingGitHub}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-700 text-teal-300 border border-teal-500/40 rounded-lg font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                title="Commitar dados e propriedades diretamente no GitHub para atualizar celulares e computadores"
              >
                {isCommittingGitHub ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Commitando no GitHub...</span>
                  </>
                ) : (
                  <>
                    <GitCommit className="w-3.5 h-3.5 text-teal-400" />
                    <span>Commitar no GitHub</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleManualSyncToCloud}
              disabled={isManualSyncing || cloudSync.isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
              title="Salva o catálogo completo na Nuvem Vercel para carregar no celular e em outros computadores"
            >
              {isManualSyncing || cloudSync.isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Publicar p/ Celular</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'banners'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-teal-600" />
            <span>Banners Rotativos ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'properties'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Imóveis &amp; Fotos ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('broker')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'broker'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-teal-600" />
            <span>Perfil do Corretor</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCommit className="w-4 h-4 text-teal-600" />
            <span>GitHub (public/fotos)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                githubConfig.repo && githubConfig.token ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4 text-teal-600" />
            <span>Nuvem Vercel (Opcional)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                vercelStatus.configured ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Save className="w-4 h-4 text-teal-600" />
            <span>Backup &amp; Restaurar</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          
          {/* TAB 1: BANNERS ROTATIVOS */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Gerenciar Banners do Topo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edite as fotos, títulos e botões que aparecem no carrossel da página inicial.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newId = `slide-${Date.now()}`;
                    addBanner({
                      id: newId,
                      badge: "NOVO LANÇAMENTO",
                      title: "Novo Empreendimento em Maceió",
                      highlight: "Condições Especiais de Lançamento",
                      subtitle: "Apartamentos com vista mar e infraestrutura completa.",
                      bairro: "Ponta Verde",
                      ctaText: "Ver Empreendimento",
                      ctaTarget: "#imoveis",
                      priceText: "A partir de R$ 900.000",
                      imageTheme: "ponta_verde"
                    });
                    showNotification('Novo banner adicionado!');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Novo Banner</span>
                </button>
              </div>

              {/* Banners List */}
              <div className="space-y-6">
                {banners.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {slide.title || 'Banner sem título'}
                        </h4>
                      </div>

                      {banners.length > 1 && (
                        <button
                          onClick={() => {
                            deleteBanner(slide.id);
                            showNotification('Banner removido');
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      )}
                    </div>

                    {/* Image Preview & Upload Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      <div className="md:col-span-5 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Prévia da Imagem do Banner
                        </label>
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
                          {slide.imageUrl ? (
                            <>
                              <img
                                src={resolveImageUrl(slide.imageUrl)}
                                onError={(e) => handleImageError(e, slide.imageUrl)}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                              />
                              {slide.imageUrl?.includes('github') || slide.imageUrl?.includes('raw.githubusercontent') ? (
                                <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-teal-300 border border-teal-500/40 shadow-sm backdrop-blur-xs">
                                  <GitCommit className="w-3 h-3 text-teal-400" />
                                  <span>GitHub CDN</span>
                                </span>
                              ) : isVercelBlobUrl(slide.imageUrl) ? (
                                <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-500/40 shadow-sm backdrop-blur-xs">
                                  <Cloud className="w-3 h-3 text-emerald-400" />
                                  <span>Vercel CDN</span>
                                </span>
                              ) : (
                                <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/80 text-amber-300 border border-amber-500/30 shadow-sm backdrop-blur-xs">
                                  <span>Local/Web</span>
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="text-center p-4">
                              <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                              <p className="text-[11px] text-slate-400">Usando ilustração padrão de Maceió</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-7 space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                            <span>Upload da Foto (PNG/JPG)</span>
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                              {uploadingTargetId === slide.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                                  <span>{uploadingMessage || 'Enviando...'}</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-teal-400" />
                                  <span>{githubConfig.repo && githubConfig.token ? 'Upload p/ GitHub (public/fotos)' : 'Upload de Foto (PC)'}</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingTargetId === slide.id}
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(e, slide.id, (imageUrl) => {
                                    updateBanner({ ...slide, imageUrl });
                                  })
                                }
                              />
                            </label>

                            {slide.imageUrl && !isVercelBlobUrl(slide.imageUrl) && slide.imageUrl.startsWith('data:') && (
                              <button
                                type="button"
                                disabled={uploadingTargetId === `migrate-${slide.id}`}
                                onClick={() =>
                                  handleMigrateImageToVercel(slide.imageUrl!, `banner-${slide.id}.jpg`, (newUrl) => {
                                    updateBanner({ ...slide, imageUrl: newUrl });
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                              >
                                {uploadingTargetId === `migrate-${slide.id}` ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Salvando...</span>
                                  </>
                                ) : (
                                  <>
                                    <GitCommit className="w-3.5 h-3.5 text-teal-600" />
                                    <span>{githubConfig.repo && githubConfig.token ? 'Salvar no GitHub (public/fotos)' : 'Salvar no GitHub'}</span>
                                  </>
                                )}
                              </button>
                            )}

                            {slide.imageUrl && (
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(slide.imageUrl!)}
                                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Copiar URL da imagem"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            )}

                            {slide.imageUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateBanner({ ...slide, imageUrl: undefined });
                                  showNotification('Imagem personalizada removida');
                                }}
                                className="px-3 py-2 text-xs text-slate-600 hover:text-red-600 font-medium"
                              >
                                Remover foto
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Ou insira o caminho / URL da Imagem:
                          </label>
                          <input
                            type="text"
                            value={slide.imageUrl || ''}
                            onChange={(e) => updateBanner({ ...slide, imageUrl: e.target.value })}
                            placeholder="Ex: /images/banner-ponta-verde.jpg ou https://..."
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Text Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Badge Superior</label>
                        <input
                          type="text"
                          value={slide.badge}
                          onChange={(e) => updateBanner({ ...slide, badge: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Título Principal</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateBanner({ ...slide, title: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Destaque Promocional</label>
                        <input
                          type="text"
                          value={slide.highlight}
                          onChange={(e) => updateBanner({ ...slide, highlight: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Bairro</label>
                        <input
                          type="text"
                          value={slide.bairro}
                          onChange={(e) => updateBanner({ ...slide, bairro: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Subtítulo / Descrição</label>
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={(e) => updateBanner({ ...slide, subtitle: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Texto de Preço</label>
                        <input
                          type="text"
                          value={slide.priceText || ''}
                          onChange={(e) => updateBanner({ ...slide, priceText: e.target.value })}
                          placeholder="Ex: A partir de R$ 1.890.000"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: IMÓVEIS & FOTOS */}
          {activeTab === 'properties' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Gerenciar Imóveis e Galerias de Fotos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adicione fotos, altere preços, metragens e informações de cada empreendimento.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setNewPropData({
                      title: '',
                      code: `JR-${Math.floor(Math.random() * 900 + 100)}`,
                      tagline: 'Lançamento exclusivo em Maceió',
                      bairro: 'Ponta Verde',
                      customBairro: '',
                      isCustomBairro: false,
                      address: 'Ponta Verde, Maceió - AL',
                      price: 950000,
                      status: 'Lançamento',
                      deliveryYear: '2027',
                      areaMin: 80,
                      areaMax: 130,
                      bedroomsMin: 2,
                      bedroomsMax: 3,
                      parkingSpots: 2,
                      bathrooms: 2,
                      beachfront: false,
                      seaView: true
                    });
                    setIsCreatingProperty(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-md transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Imóvel</span>
                </button>
              </div>

              {/* MODAL: CADASTRAR NOVO IMÓVEL COM TODOS OS 50 BAIRROS DE MACEIÓ */}
              {isCreatingProperty && (
                <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    {/* Modal Header */}
                    <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            Cadastrar Novo Imóvel em Maceió
                          </h3>
                          <p className="text-xs text-teal-400">
                            Selecione entre todos os 50 bairros oficiais de Maceió
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreatingProperty(false)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const finalBairro = newPropData.isCustomBairro && newPropData.customBairro.trim()
                          ? newPropData.customBairro.trim()
                          : newPropData.bairro;

                        const newProp: Property = {
                          id: `prop-${Date.now()}`,
                          code: newPropData.code || `JR-${Math.floor(Math.random() * 900 + 100)}`,
                          title: newPropData.title.trim() || `Residencial em ${finalBairro}`,
                          tagline: newPropData.tagline || 'Lançamento exclusivo em Maceió',
                          bairro: finalBairro,
                          address: newPropData.address.trim() || `${finalBairro}, Maceió - AL`,
                          status: newPropData.status,
                          deliveryYear: newPropData.deliveryYear || '2027',
                          price: Number(newPropData.price) || 850000,
                          condoFee: 750,
                          iptu: 250,
                          areaMin: Number(newPropData.areaMin) || 70,
                          areaMax: Number(newPropData.areaMax) || 120,
                          bedroomsMin: Number(newPropData.bedroomsMin) || 2,
                          bedroomsMax: Number(newPropData.bedroomsMax) || 3,
                          suitesMin: 1,
                          suitesMax: 2,
                          parkingSpots: Number(newPropData.parkingSpots) || 1,
                          bathrooms: Number(newPropData.bathrooms) || 2,
                          featured: true,
                          seaView: newPropData.seaView,
                          beachfront: newPropData.beachfront,
                          images: [
                            {
                              id: `img-${Date.now()}-1`,
                              url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='100%' height='100%'><rect width='800' height='600' fill='%230f172a'/><text x='400' y='300' fill='%23ffffff' font-size='24' font-family='sans-serif' text-anchor='middle'>Insira a foto da fachada</text></svg>",
                              title: "Fachada Principal",
                              category: "exterior"
                            }
                          ],
                          description: `Excelente oportunidade imobiliária no bairro ${finalBairro} em Maceió. Projeto com acabamento primoroso, área de lazer equipada e localização estratégica.`,
                          amenities: [
                            "Piscina com deck molhado",
                            "Espaço Fitness / Academia",
                            "Varanda Gourmet integrada",
                            "Portaria e segurança 24h"
                          ],
                          differentials: [
                            `Localização privilegiada no bairro ${finalBairro}`,
                            "Alto potencial de valorização em Maceió"
                          ]
                        };

                        addProperty(newProp);
                        setSelectedPropertyId(newProp.id);
                        setIsCreatingProperty(false);
                        showNotification(`Imóvel cadastrado com sucesso em ${finalBairro}!`);
                      }}
                      className="p-6 overflow-y-auto space-y-5"
                    >
                      {/* Row 1: Title and Code */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Título do Empreendimento *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Mansão Vista Mar, Edifício Ilhas do Sul..."
                            value={newPropData.title}
                            onChange={(e) => setNewPropData({ ...newPropData, title: e.target.value })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Código de Referência
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: JR-810"
                            value={newPropData.code}
                            onChange={(e) => setNewPropData({ ...newPropData, code: e.target.value })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Row 2: BAIRROS DE MACEIÓ (TODOS OS 50 BAIRROS) */}
                      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-teal-700" />
                            <span>Bairro de Maceió (50 Bairros Oficiais Disponíveis) *</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setNewPropData({ ...newPropData, isCustomBairro: !newPropData.isCustomBairro })}
                            className="text-[11px] text-teal-800 hover:text-teal-950 font-semibold underline text-left"
                          >
                            {newPropData.isCustomBairro ? 'Voltar para lista de bairros' : 'Digitar outro bairro / condomínio'}
                          </button>
                        </div>

                        {newPropData.isCustomBairro ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Digite o nome do bairro ou condomínio (ex: Reserva Pratagy, Aldebaran...)"
                              value={newPropData.customBairro}
                              onChange={(e) => setNewPropData({ ...newPropData, customBairro: e.target.value })}
                              className="w-full text-xs px-3 py-2.5 rounded-lg border border-teal-300 bg-white focus:ring-2 focus:ring-teal-500 font-semibold text-slate-900"
                            />
                            <p className="text-[11px] text-teal-700">
                              O nome personalizado será exibido no cartão do imóvel e na busca.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <select
                              value={newPropData.bairro}
                              onChange={(e) => setNewPropData({ ...newPropData, bairro: e.target.value })}
                              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-teal-300 bg-white focus:ring-2 focus:ring-teal-500 font-semibold text-slate-900 shadow-xs"
                            >
                              {MACEIO_BAIRROS_BY_REGION.map((group) => (
                                <optgroup key={group.region} label={`📍 ${group.region} (${group.bairros.length} bairros)`}>
                                  {group.bairros.map((b) => (
                                    <option key={b} value={b}>
                                      {b}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>

                            {/* Quick selection chips for top demand neighborhoods */}
                            <div className="pt-1">
                              <span className="text-[11px] font-bold text-teal-900 block mb-1.5">
                                Bairros Mais Procurados (Clique rápido para selecionar):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {POPULAR_MACEIO_BAIRROS.map((popB) => (
                                  <button
                                    type="button"
                                    key={popB}
                                    onClick={() => setNewPropData({ ...newPropData, bairro: popB, isCustomBairro: false })}
                                    className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                                      newPropData.bairro === popB && !newPropData.isCustomBairro
                                        ? 'bg-teal-700 text-white shadow-xs'
                                        : 'bg-white hover:bg-teal-100 text-teal-900 border border-teal-200'
                                    }`}
                                  >
                                    {popB}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1 pt-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Endereço / Localização Específica
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Av. Álvaro Otacílio, 450 - Ponta Verde, Maceió - AL"
                            value={newPropData.address}
                            onChange={(e) => setNewPropData({ ...newPropData, address: e.target.value })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      {/* Row 3: Preço, Status e Entrega */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Valor de Venda (R$) *
                          </label>
                          <input
                            type="number"
                            required
                            value={newPropData.price}
                            onChange={(e) => setNewPropData({ ...newPropData, price: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-bold text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Status da Obra
                          </label>
                          <select
                            value={newPropData.status}
                            onChange={(e) => setNewPropData({ ...newPropData, status: e.target.value as any })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                          >
                            <option value="Lançamento">Lançamento</option>
                            <option value="Em Construção">Em Construção</option>
                            <option value="Pronto para Morar">Pronto para Morar</option>
                            <option value="Últimas Unidades">Últimas Unidades</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Previsão de Entrega
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 2027 ou Pronto"
                            value={newPropData.deliveryYear}
                            onChange={(e) => setNewPropData({ ...newPropData, deliveryYear: e.target.value })}
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Row 4: Specs (Área, Quartos, Vagas) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Área Mín (m²)</label>
                          <input
                            type="number"
                            value={newPropData.areaMin}
                            onChange={(e) => setNewPropData({ ...newPropData, areaMin: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Área Máx (m²)</label>
                          <input
                            type="number"
                            value={newPropData.areaMax}
                            onChange={(e) => setNewPropData({ ...newPropData, areaMax: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Quartos Mín</label>
                          <input
                            type="number"
                            value={newPropData.bedroomsMin}
                            onChange={(e) => setNewPropData({ ...newPropData, bedroomsMin: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Quartos Máx</label>
                          <input
                            type="number"
                            value={newPropData.bedroomsMax}
                            onChange={(e) => setNewPropData({ ...newPropData, bedroomsMax: Number(e.target.value) })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-medium"
                          />
                        </div>
                      </div>

                      {/* Row 5: Diferenciais Rápidos */}
                      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newPropData.seaView}
                            onChange={(e) => setNewPropData({ ...newPropData, seaView: e.target.checked })}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>Vista para o Mar</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newPropData.beachfront}
                            onChange={(e) => setNewPropData({ ...newPropData, beachfront: e.target.checked })}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>Frente Mar / Pé na Areia</span>
                        </label>
                      </div>

                      {/* Modal Footer Actions */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setIsCreatingProperty(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-md transition-all hover:scale-[1.02]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Concluir Cadastro e Inserir Fotos</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Property Selector & Editor Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Selector List (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3 space-y-2 max-h-[70vh] overflow-y-auto">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                    Selecione um Imóvel:
                  </span>
                  {properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPropertyId(p.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        p.id === currentProperty?.id
                          ? 'bg-teal-50 border-teal-500 shadow-xs'
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-teal-800">{p.bairro}</span>
                        <span className="font-mono text-slate-400">{p.code}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-[11px] font-extrabold text-slate-700 mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.price)}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Right Editor Form (8 cols) */}
                {currentProperty && (
                  <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                    
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                          Editando Imóvel:
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {currentProperty.title} ({currentProperty.code})
                        </h3>
                      </div>

                      {properties.length > 1 && (
                        <button
                          onClick={() => {
                            deleteProperty(currentProperty.id);
                            showNotification('Imóvel excluído');
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir Imóvel</span>
                        </button>
                      )}
                    </div>

                    {/* SECTION: PHOTO GALLERY MANAGER */}
                    <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-teal-600" />
                            <span>Galeria de Fotos do Imóvel ({currentProperty.images.length} fotos)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Faça upload das fotos diretamente no Vercel Blob CDN.
                          </p>
                        </div>

                        {/* Add Photo Button */}
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                          {uploadingTargetId === `prop-gallery-${currentProperty.id}` ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{uploadingMessage || 'Enviando...'}</span>
                            </>
                          ) : (
                            <>
                              <CloudUpload className="w-3.5 h-3.5" />
                              <span>Upload Imagem do PC</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingTargetId === `prop-gallery-${currentProperty.id}`}
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(e, `prop-gallery-${currentProperty.id}`, (imageUrl, isVercel) => {
                                const newImg: PropertyImage = {
                                  id: `img-${Date.now()}`,
                                  url: imageUrl,
                                  title: `Foto ${currentProperty.images.length + 1} (${isVercel ? 'Vercel CDN' : 'Nova'})`,
                                  category: 'interior'
                                };
                                updateProperty({
                                  ...currentProperty,
                                  images: [...currentProperty.images, newImg]
                                });
                              })
                            }
                          />
                        </label>
                      </div>

                      {/* Add Photo by Frontend Path / URL (No Database required) */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex-1 space-y-0.5">
                          <label className="text-[11px] font-semibold text-slate-700 block">
                            Adicionar Foto no Frontend (Sem banco de dados):
                          </label>
                          <input
                            type="text"
                            value={newManualPhotoUrl}
                            onChange={(e) => setNewManualPhotoUrl(e.target.value)}
                            placeholder="Ex: /fotos/fachada.jpg ou link https://..."
                            className="w-full text-xs px-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                          />
                        </div>
                        <div className="w-full sm:w-48 space-y-0.5">
                          <label className="text-[11px] font-semibold text-slate-700 block">
                            Título / Legenda:
                          </label>
                          <input
                            type="text"
                            value={newManualPhotoTitle}
                            onChange={(e) => setNewManualPhotoTitle(e.target.value)}
                            placeholder="Ex: Fachada Principal"
                            className="w-full text-xs px-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newManualPhotoUrl.trim()) {
                              showNotification('Digite o caminho ou link da foto!');
                              return;
                            }
                            const newImg: PropertyImage = {
                              id: `img-${Date.now()}`,
                              url: newManualPhotoUrl.trim(),
                              title: newManualPhotoTitle.trim() || `Foto ${currentProperty.images.length + 1}`,
                              category: 'interior'
                            };
                            updateProperty({
                              ...currentProperty,
                              images: [...currentProperty.images, newImg]
                            });
                            setNewManualPhotoUrl('');
                            setNewManualPhotoTitle('');
                            showNotification('Foto adicionada ao imóvel!');
                          }}
                          className="self-end px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded shadow-sm whitespace-nowrap"
                        >
                          + Adicionar Foto
                        </button>
                      </div>

                      {/* Photo Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentProperty.images.map((img, photoIdx) => {
                          const isVercel = isVercelBlobUrl(img.url);
                          return (
                            <div
                              key={img.id}
                              className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-[4/3]"
                            >
                              <img
                                src={resolveImageUrl(img.url)}
                                onError={(e) => handleImageError(e, img.url)}
                                alt={img.title}
                                className="w-full h-full object-cover"
                              />

                              {/* GitHub / Vercel Badge */}
                              {img.url?.includes('github') || img.url?.includes('raw.githubusercontent') ? (
                                <span className="absolute top-1 left-1 z-10 bg-slate-900/90 text-teal-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow backdrop-blur-xs border border-teal-500/30">
                                  <GitCommit className="w-2.5 h-2.5 text-teal-400" />
                                  <span>GitHub</span>
                                </span>
                              ) : isVercel ? (
                                <span className="absolute top-1 left-1 z-10 bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow backdrop-blur-xs">
                                  <Cloud className="w-2.5 h-2.5" />
                                  <span>Vercel</span>
                                </span>
                              ) : (
                                <span className="absolute top-1 left-1 z-10 bg-slate-800/80 text-amber-300 text-[9px] font-medium px-1.5 py-0.5 rounded shadow backdrop-blur-xs">
                                  <span>Local</span>
                                </span>
                              )}
                              
                              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                                <span className="text-[10px] text-white font-semibold truncate">
                                  {img.title}
                                </span>

                                <div className="flex items-center justify-between gap-1">
                                  {!isVercel && img.url.startsWith('data:') && (
                                    <button
                                      type="button"
                                      disabled={uploadingTargetId === `migrate-${img.id}`}
                                      onClick={() =>
                                        handleMigrateImageToVercel(img.url, `prop-${currentProperty.code}-${photoIdx}.jpg`, (newUrl) => {
                                          const updated = currentProperty.images.map((im, i) =>
                                            i === photoIdx ? { ...im, url: newUrl } : im
                                          );
                                          updateProperty({ ...currentProperty, images: updated });
                                        })
                                      }
                                      className="p-1 rounded bg-teal-600 hover:bg-teal-700 text-white text-[9px] font-bold flex items-center gap-0.5"
                                      title={githubConfig.repo && githubConfig.token ? "Salvar no GitHub (public/fotos/)" : "Salvar no GitHub"}
                                    >
                                      {uploadingTargetId === `migrate-${img.id}` ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <>
                                          <GitCommit className="w-2.5 h-2.5" />
                                          <span>GitHub</span>
                                        </>
                                      )}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleCopyUrl(img.url)}
                                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs ml-auto"
                                    title="Copiar URL"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      const updated = currentProperty.images.filter((_, i) => i !== photoIdx);
                                      updateProperty({ ...currentProperty, images: updated });
                                      showNotification('Foto removida');
                                    }}
                                    className="p-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                                    title="Excluir foto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded">
                                {photoIdx + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Manual Image URL Adder */}
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          id={`new-url-${currentProperty.id}`}
                          placeholder="Ou cole a URL direta de uma imagem da internet..."
                          className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`new-url-${currentProperty.id}`) as HTMLInputElement;
                            if (input && input.value) {
                              const newImg: PropertyImage = {
                                id: `img-${Date.now()}`,
                                url: input.value,
                                title: `Foto ${currentProperty.images.length + 1}`,
                                category: 'exterior'
                              };
                              updateProperty({
                                ...currentProperty,
                                images: [...currentProperty.images, newImg]
                              });
                              input.value = '';
                              showNotification('Foto adicionada via link!');
                            }
                          }}
                          className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700"
                        >
                          Adicionar Link
                        </button>
                      </div>
                    </div>

                    {/* Basic Data Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Título do Empreendimento</label>
                        <input
                          type="text"
                          value={currentProperty.title}
                          onChange={(e) => updateProperty({ ...currentProperty, title: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Código</label>
                        <input
                          type="text"
                          value={currentProperty.code}
                          onChange={(e) => updateProperty({ ...currentProperty, code: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Endereço Completo</label>
                        <input
                          type="text"
                          value={currentProperty.address}
                          onChange={(e) => updateProperty({ ...currentProperty, address: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-600" />
                            <span>Bairro de Maceió</span>
                          </label>
                          <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-bold">
                            50 bairros
                          </span>
                        </div>
                        <select
                          value={currentProperty.bairro}
                          onChange={(e) => updateProperty({ ...currentProperty, bairro: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                        >
                          {!MACEIO_BAIRROS.includes(currentProperty.bairro as any) && (
                            <option value={currentProperty.bairro}>
                              {currentProperty.bairro} (Personalizado)
                            </option>
                          )}
                          {MACEIO_BAIRROS_BY_REGION.map((group) => (
                            <optgroup key={group.region} label={`📍 ${group.region}`}>
                              {group.bairros.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>

                        {/* Quick Selection Chips */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {POPULAR_MACEIO_BAIRROS.slice(0, 6).map((popB) => (
                            <button
                              type="button"
                              key={popB}
                              onClick={() => updateProperty({ ...currentProperty, bairro: popB })}
                              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                                currentProperty.bairro === popB
                                  ? 'bg-teal-700 text-white font-bold'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {popB}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Valor (R$)</label>
                        <input
                          type="number"
                          value={currentProperty.price}
                          onChange={(e) => updateProperty({ ...currentProperty, price: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Status da Obra</label>
                        <select
                          value={currentProperty.status}
                          onChange={(e) => updateProperty({ ...currentProperty, status: e.target.value as any })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="Lançamento">Lançamento</option>
                          <option value="Em Construção">Em Construção</option>
                          <option value="Pronto para Morar">Pronto para Morar</option>
                          <option value="Últimas Unidades">Últimas Unidades</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Previsão de Entrega</label>
                        <input
                          type="text"
                          value={currentProperty.deliveryYear}
                          onChange={(e) => updateProperty({ ...currentProperty, deliveryYear: e.target.value })}
                          placeholder="Ex: 2026 ou Pronto"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Specs Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Área Mín (m²)</label>
                        <input
                          type="number"
                          value={currentProperty.areaMin}
                          onChange={(e) => updateProperty({ ...currentProperty, areaMin: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Área Máx (m²)</label>
                        <input
                          type="number"
                          value={currentProperty.areaMax}
                          onChange={(e) => updateProperty({ ...currentProperty, areaMax: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Quartos Mín</label>
                        <input
                          type="number"
                          value={currentProperty.bedroomsMin}
                          onChange={(e) => updateProperty({ ...currentProperty, bedroomsMin: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Quartos Máx</label>
                        <input
                          type="number"
                          value={currentProperty.bedroomsMax}
                          onChange={(e) => updateProperty({ ...currentProperty, bedroomsMax: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-1 pt-3 border-t border-slate-100">
                      <label className="text-xs font-semibold text-slate-700">Descrição Detalhada</label>
                      <textarea
                        rows={3}
                        value={currentProperty.description}
                        onChange={(e) => updateProperty({ ...currentProperty, description: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 3: PERFIL DO CORRETOR */}
          {activeTab === 'broker' && (
            <div className="max-w-3xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dados e Foto do Corretor João Raimundo
                </h3>
                <p className="text-xs text-slate-500">
                  Atualize suas informações de contato, telefone WhatsApp, CRECI e foto de apresentação.
                </p>
              </div>

              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                  {brokerInfo.avatarUrl ? (
                    <>
                      <img
                        src={resolveImageUrl(brokerInfo.avatarUrl)}
                        onError={(e) => handleImageError(e, brokerInfo.avatarUrl)}
                        alt={brokerInfo.name}
                        className="w-full h-full object-cover"
                      />
                      {brokerInfo.avatarUrl?.includes('github') || brokerInfo.avatarUrl?.includes('raw.githubusercontent') ? (
                        <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/90 text-teal-300 border border-teal-500/40 shadow">
                          <GitCommit className="w-2.5 h-2.5 text-teal-400" />
                          <span>GitHub</span>
                        </span>
                      ) : isVercelBlobUrl(brokerInfo.avatarUrl) ? (
                        <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-500/40 shadow">
                          <Cloud className="w-2.5 h-2.5" />
                          <span>Vercel</span>
                        </span>
                      ) : (
                        <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800/80 text-amber-300 border border-amber-500/30 shadow">
                          <span>Local</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <User className="w-12 h-12 text-slate-500" />
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Foto de Perfil do Corretor
                    </h4>
                    {brokerInfo.avatarUrl && isVercelBlobUrl(brokerInfo.avatarUrl) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Hospedada na Vercel</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Aparece na seção "Sobre João Raimundo" e no rodapé do site. Salva automaticamente no Vercel Blob CDN.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                      {uploadingTargetId === 'broker-avatar' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                          <span>{uploadingMessage || 'Enviando...'}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-teal-400" />
                          <span>{githubConfig.repo && githubConfig.token ? 'Upload Foto p/ GitHub' : 'Upload Foto de Perfil'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingTargetId === 'broker-avatar'}
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e, 'broker-avatar', (imageUrl) => {
                            updateBroker({ avatarUrl: imageUrl });
                          })
                        }
                      />
                    </label>

                    {brokerInfo.avatarUrl && !isVercelBlobUrl(brokerInfo.avatarUrl) && brokerInfo.avatarUrl.startsWith('data:') && (
                      <button
                        type="button"
                        disabled={uploadingTargetId === 'migrate-broker'}
                        onClick={() =>
                          handleMigrateImageToVercel(brokerInfo.avatarUrl!, 'joao-raimundo-corretor.jpg', (newUrl) => {
                            updateBroker({ avatarUrl: newUrl });
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                      >
                        {uploadingTargetId === 'migrate-broker' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Salvando...</span>
                          </>
                        ) : (
                          <>
                            <GitCommit className="w-3.5 h-3.5 text-teal-600" />
                            <span>{githubConfig.repo && githubConfig.token ? 'Salvar no GitHub (public/fotos)' : 'Salvar no GitHub'}</span>
                          </>
                        )}
                      </button>
                    )}

                    {brokerInfo.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(brokerInfo.avatarUrl!)}
                        className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Copiar URL da foto"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}

                    {brokerInfo.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateBroker({ avatarUrl: "" });
                          showNotification('Foto removida');
                        }}
                        className="px-3 py-2 text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nome do Corretor</label>
                  <input
                    type="text"
                    value={brokerInfo.name}
                    onChange={(e) => updateBroker({ name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Número do CRECI</label>
                  <input
                    type="text"
                    value={brokerInfo.creci}
                    onChange={(e) => updateBroker({ creci: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">WhatsApp (apenas números com DDD)</label>
                  <input
                    type="text"
                    value={brokerInfo.whatsappNumber}
                    onChange={(e) => updateBroker({ whatsappNumber: e.target.value })}
                    placeholder="Ex: 558293154400"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Telefone Formatado</label>
                  <input
                    type="text"
                    value={brokerInfo.phoneFormatted}
                    onChange={(e) => updateBroker({ phoneFormatted: e.target.value })}
                    placeholder="Ex: (82) 9315-4400"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">E-mail Profissional</label>
                  <input
                    type="email"
                    value={brokerInfo.email}
                    onChange={(e) => updateBroker({ email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Endereço do Escritório</label>
                  <input
                    type="text"
                    value={brokerInfo.address}
                    onChange={(e) => updateBroker({ address: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Biografia / Apresentação</label>
                  <textarea
                    rows={4}
                    value={brokerInfo.bio}
                    onChange={(e) => updateBroker({ bio: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB: GITHUB & PUBLIC/FOTOS/ */}
          {activeTab === 'github' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Status Header Card */}
              <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                      <GitCommit className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Integração Direta com GitHub</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono">
                          public/fotos/
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Envie fotos diretamente para o repositório no GitHub sem precisar de terminal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {githubConfig.repo && githubConfig.token ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Conectado: {githubConfig.repo}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Não Conectado</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <p className="text-slate-300 leading-relaxed max-w-xl">
                    Com o GitHub configurado, toda foto selecionada no painel é <strong>enviada e commitada automaticamente</strong> na pasta <code className="text-teal-300">public/fotos/</code> do seu repositório. A Vercel detecta o commit e atualiza o site no celular e computadores em ~45s!
                  </p>

                  {githubConfig.repo && githubConfig.token && (
                    <button
                      type="button"
                      onClick={handleCommitAllToGitHub}
                      disabled={isCommittingGitHub}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shrink-0 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isCommittingGitHub ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Publicando...</span>
                        </>
                      ) : (
                        <>
                          <GitCommit className="w-4 h-4" />
                          <span>Publicar properties.ts</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* GitHub Configuration Form */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-teal-600" />
                    <span>Configuração do Repositório e Token</span>
                  </h4>

                  {githubConfig.repo && (
                    <button
                      type="button"
                      onClick={handleDisconnectGitHub}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Desconectar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Repositório no GitHub (usuario/nome-do-repo)
                    </label>
                    <input
                      type="text"
                      value={githubRepoInput}
                      onChange={(e) => setGithubRepoInput(e.target.value)}
                      placeholder="ex: engelsbarros/jo-oraimundo"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      O nome exato do seu repositório no GitHub.
                    </p>
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Branch Principal
                    </label>
                    <input
                      type="text"
                      value={githubBranchInput}
                      onChange={(e) => setGithubBranchInput(e.target.value)}
                      placeholder="main"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Geralmente <code>main</code> (a branch conectada à Vercel).
                    </p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        GitHub Personal Access Token (PAT)
                      </label>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=Painel+Admin+Imobiliaria"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                      >
                        <span>Gerar Token no GitHub (1 clique)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={githubTokenInput}
                      onChange={(e) => setGithubTokenInput(e.target.value)}
                      placeholder="ghp_... ou github_pat_..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Token pessoal com permissão de <strong>repo</strong> (escrita). Salvo apenas no seu navegador.
                    </p>
                  </div>
                </div>

                {githubTestResult && (
                  <div
                    className={`p-3 rounded-lg text-xs border flex items-start gap-2.5 ${
                      githubTestResult.success
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-red-50 text-red-900 border-red-200'
                    }`}
                  >
                    {githubTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{githubTestResult.message}</p>
                      {githubTestResult.defaultBranch && (
                        <p className="text-[11px] opacity-80 mt-0.5">
                          Branch padrão do repositório: <code>{githubTestResult.defaultBranch}</code>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestGitHubConnection}
                    disabled={isTestingGitHub || !githubRepoInput.trim() || !githubTokenInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {isTestingGitHub ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Testando Conexão...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 text-teal-400" />
                        <span>Testar Conexão</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveGitHubConfig}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Configuração</span>
                  </button>
                </div>
              </div>

              {/* Instructions Guide */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Como gerar seu token do GitHub em 3 passos:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
                  <li>
                    Acesse <a href="https://github.com/settings/tokens/new?scopes=repo&description=Painel+Admin+Imobiliaria" target="_blank" rel="noopener noreferrer" className="text-teal-700 font-semibold underline">github.com/settings/tokens/new</a> no seu navegador.
                  </li>
                  <li>
                    Dê um nome (ex: <code>Painel Imobiliario</code>) e confirme se a opção <strong>repo</strong> está marcada.
                  </li>
                  <li>
                    Clique em <strong>Generate token</strong> no final da página, copie o código gerado (começa com <code>ghp_</code>) e cole no campo acima.
                  </li>
                </ol>
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-teal-900 text-[11px] leading-relaxed">
                  💡 <strong>Vantagem:</strong> Depois de salvar o token uma única vez, toda foto que você adicionar no painel vai direto para o repositório na pasta <code>public/fotos/</code> e a Vercel atualiza o site automaticamente para todos os celulares!
                </div>
              </div>

            </div>
          )}

          {/* TAB: HOSPEDAGEM VERCEL (BLOB) */}
          {activeTab === 'vercel' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Status Header Card */}
              <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Hospedagem no Vercel Blob</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono">
                          CDN Global
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Armazene as fotos de imóveis e banners diretamente na infraestrutura da Vercel
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {vercelStatus.configured ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Conectado à Vercel</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Aguardando Token</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        checkVercelBlobStatus().then((s) => {
                          setVercelStatus(s);
                          showNotification('Status atualizado!');
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Atualizar status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 block mb-1">Rota de Upload</span>
                    <span className="font-mono text-teal-400 font-semibold">/api/upload</span>
                  </div>

                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 block mb-1">Status do Armazenamento</span>
                    <span className="font-semibold text-white">
                      {vercelStatus.configured ? 'Vercel Blob Ativo (Público)' : 'Armazenamento Local'}
                    </span>
                  </div>

                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 block mb-1">Origem do Token</span>
                    <span className="font-semibold text-white">
                      {vercelStatus.hasEnvToken
                        ? 'Variável BLOB_READ_WRITE_TOKEN'
                        : vercelStatus.hasCustomToken
                        ? 'Configurado no Painel'
                        : 'Não configurado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cross-Device & Mobile Sync Diagnostic Card */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-2xl border border-teal-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Sincronização com o Celular &amp; Outros Dispositivos</span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                          Multi-dispositivo
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600">
                        Como garantir que as fotos e novos imóveis apareçam imediatamente no smartphone
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleManualSyncToCloud}
                      disabled={isManualSyncing || cloudSync.isSyncing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                    >
                      {isManualSyncing || cloudSync.isSyncing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sincronizando...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sincronizar Agora para Celular</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white/80 rounded-xl border border-teal-100 text-xs text-slate-700 space-y-2">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5 text-teal-800">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Por que as fotos apareciam no seu PC, mas não no celular?</span>
                  </p>
                  <p className="leading-relaxed">
                    Quando você cadastra fotos no computador, se o <strong>Vercel Blob</strong> ainda não tiver o token configurado, as fotos e imóveis ficam armazenados apenas no navegador do seu computador (<em>localStorage</em>). Como o celular é outro dispositivo, ele não tem acesso à memória do seu computador.
                  </p>
                  <p className="leading-relaxed">
                    Com o <strong>Vercel Blob</strong> conectado e o catálogo sincronizado, todas as fotos são salvas na CDN mundial da Vercel e o catálogo fica salvo online em <code>/api/data</code>. Assim, <strong>qualquer celular ou visitante abre o site e vê exatamente as fotos e imóveis cadastrados</strong>!
                  </p>
                </div>

                {/* Batch Migration Callout if local images exist */}
                {pendingLocalImagesCount > 0 ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-amber-900">
                        ⚠️ Você possui {pendingLocalImagesCount} foto(s) salvas apenas na memória deste computador!
                      </p>
                      <p className="text-amber-700 text-[11px] mt-0.5">
                        Essas fotos ainda não foram para a Vercel e por isso não aparecem no seu celular. Clique no botão ao lado para enviá-las para a nuvem da Vercel.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleBatchMigrateAll}
                      disabled={isBatchMigrating}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                      {isBatchMigrating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{batchProgress ? `${batchProgress.current}/${batchProgress.total} fotos...` : 'Enviando...'}</span>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-3.5 h-3.5 text-white" />
                          <span>Migrar Todas as Fotos para Vercel</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Todas as suas fotos cadastradas já estão salvas na CDN pública da Vercel! Elas aparecem perfeitamente em qualquer smartphone.</span>
                  </div>
                )}
              </div>

              {/* Token Configuration Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Key className="w-4 h-4 text-teal-600" />
                      <span>Configuração do Token do Vercel Blob</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Insira o token de leitura e escrita gerado no painel da Vercel (Storage &gt; Blob).
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      BLOB_READ_WRITE_TOKEN
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="password"
                        value={blobTokenInput}
                        onChange={(e) => setBlobTokenInput(e.target.value)}
                        placeholder="Ex: vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                      />

                      {(blobTokenInput.startsWith('ghp_') || blobTokenInput.startsWith('github_pat_')) && (
                        <div className="w-full p-3 bg-amber-50 rounded-lg border border-amber-300 text-xs text-amber-900 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Este é um Token do GitHub (começa com ghp_), não da Vercel!</span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Você gerou um token para o <strong>GitHub</strong> para salvar fotos na pasta <code>public/fotos/</code>. Para usá-lo:
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setGithubTokenInput(blobTokenInput);
                              setActiveTab('github');
                              showNotification('Token transferido para a aba GitHub!');
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[11px] flex items-center gap-1.5"
                          >
                            <GitCommit className="w-3.5 h-3.5 text-teal-400" />
                            <span>Ir para a aba GitHub e usar este token</span>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVercelBlobToken(blobTokenInput);
                            checkVercelBlobStatus().then(setVercelStatus);
                            showNotification('Token salvo com sucesso!');
                          }}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors whitespace-nowrap"
                        >
                          Salvar Token
                        </button>

                        <button
                          type="button"
                          disabled={isTestingToken || !blobTokenInput.trim()}
                          onClick={async () => {
                            setIsTestingToken(true);
                            setTokenTestResult(null);
                            const res = await testVercelBlobConnection(blobTokenInput);
                            setTokenTestResult(res);
                            setIsTestingToken(false);
                            if (res.success) {
                              setVercelBlobToken(blobTokenInput);
                              checkVercelBlobStatus().then(setVercelStatus);
                            }
                          }}
                          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                        >
                          {isTestingToken ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Testando...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Testar Conexão</span>
                            </>
                          )}
                        </button>

                        {blobTokenInput && (
                          <button
                            type="button"
                            onClick={() => {
                              removeVercelBlobToken();
                              setBlobTokenInput('');
                              checkVercelBlobStatus().then(setVercelStatus);
                              showNotification('Token removido');
                            }}
                            className="px-3 py-2.5 text-xs text-red-600 hover:text-red-700 font-semibold"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Test Result Message */}
                  {tokenTestResult && (
                    <div
                      className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                        tokenTestResult.success
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {tokenTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{tokenTestResult.message}</p>
                        {tokenTestResult.url && (
                          <p className="text-[11px] text-emerald-700 mt-1 font-mono break-all">
                            URL de teste: {tokenTestResult.url}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>Como obter seu token do Vercel Blob (30 segundos)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <p className="font-bold text-slate-900">Acesse seu projeto Vercel</p>
                    <p className="text-slate-600 text-[11px]">
                      Abra o dashboard da <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-teal-600 underline font-semibold">vercel.com</a> e selecione seu site.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <p className="font-bold text-slate-900">Crie o banco Blob</p>
                    <p className="text-slate-600 text-[11px]">
                      Vá na aba <strong>Storage</strong>, clique em <strong>Create Database</strong> e selecione <strong>Blob</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <p className="font-bold text-slate-900">Copie o Token</p>
                    <p className="text-slate-600 text-[11px]">
                      Copie a variável <code>BLOB_READ_WRITE_TOKEN</code> e cole no campo acima ou no seu arquivo de deploy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Site Images Inventory */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-teal-600" />
                      <span>Fotos Cadastradas no Site</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Veja onde cada foto do site está hospedada (Vercel CDN ou Local).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      ✓ Vercel CDN:{' '}
                      {[
                        ...banners.filter((b) => isVercelBlobUrl(b.imageUrl)),
                        ...properties.flatMap((p) => p.images.filter((i) => isVercelBlobUrl(i.url))),
                        ...(isVercelBlobUrl(brokerInfo.avatarUrl) ? [1] : [])
                      ].length}
                    </span>
                  </div>
                </div>

                {/* List of images */}
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {/* Banners */}
                  {banners.filter((b) => b.imageUrl).map((b) => {
                    const isVercel = isVercelBlobUrl(b.imageUrl);
                    return (
                      <div key={b.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={resolveImageUrl(b.imageUrl)}
                            onError={(e) => handleImageError(e, b.imageUrl)}
                            alt={b.title}
                            className="w-12 h-8 rounded object-cover bg-slate-900 shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">Banner: {b.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{b.imageUrl}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isVercel ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Cloud className="w-3 h-3 text-emerald-600" />
                              <span>Vercel CDN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                              <span>Local</span>
                            </span>
                          )}

                          {!isVercel && b.imageUrl?.startsWith('data:') && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMigrateImageToVercel(b.imageUrl!, `banner-${b.id}.jpg`, (newUrl) => {
                                  updateBanner({ ...b, imageUrl: newUrl });
                                })
                              }
                              className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200"
                            >
                              Enviar p/ Vercel
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopyUrl(b.imageUrl!)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="Copiar Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Properties Images */}
                  {properties.flatMap((p) =>
                    p.images.map((img, idx) => {
                      const isVercel = isVercelBlobUrl(img.url);
                      return (
                        <div key={`${p.id}-${img.id}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={resolveImageUrl(img.url)}
                              onError={(e) => handleImageError(e, img.url)}
                              alt={img.title}
                              className="w-12 h-8 rounded object-cover bg-slate-900 shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {p.title} - {img.title}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono truncate">{img.url}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {img.url?.includes('github') || img.url?.includes('raw.githubusercontent') ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-teal-300 border border-teal-500/30">
                                <GitCommit className="w-3 h-3 text-teal-400" />
                                <span>GitHub CDN</span>
                              </span>
                            ) : isVercel ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <Cloud className="w-3 h-3 text-emerald-600" />
                                <span>Vercel CDN</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                                <span>Local</span>
                              </span>
                            )}

                            {!isVercel && img.url.startsWith('data:') && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMigrateImageToVercel(img.url, `prop-${p.code}-${idx}.jpg`, (newUrl) => {
                                    const updated = p.images.map((im) =>
                                      im.id === img.id ? { ...im, url: newUrl } : im
                                    );
                                    updateProperty({ ...p, images: updated });
                                  })
                                }
                                className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200"
                              >
                                Salvar no GitHub
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCopyUrl(img.url)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                              title="Copiar Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Broker Avatar */}
                  {brokerInfo.avatarUrl && (
                    <div className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={resolveImageUrl(brokerInfo.avatarUrl)}
                          onError={(e) => handleImageError(e, brokerInfo.avatarUrl)}
                          alt={brokerInfo.name}
                          className="w-12 h-8 rounded object-cover bg-slate-900 shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            Foto de Perfil ({brokerInfo.name})
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{brokerInfo.avatarUrl}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isVercelBlobUrl(brokerInfo.avatarUrl) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Cloud className="w-3 h-3 text-emerald-600" />
                            <span>Vercel CDN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                            <span>Local</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyUrl(brokerInfo.avatarUrl!)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                          title="Copiar Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: BACKUP & RESTAURAR */}
          {activeTab === 'backup' && (
            <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Backup e Exportação de Conteúdo
                </h3>
                <p className="text-xs text-slate-500">
                  Todas as suas alterações são salvas automaticamente no navegador. Você também pode exportar um arquivo de backup para salvar ou levar para outro computador.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Exportar Arquivo JSON
                </h4>
                <p className="text-xs text-slate-600">
                  Baixe um arquivo contendo todos os seus imóveis, fotos e banners cadastrados.
                </p>
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Baixar Backup Completo (.JSON)</span>
                </button>
              </div>

              {/* Frontend-only Export without Database */}
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-3">
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>2. Como Publicar no Celular e no Ar (Sem Banco de Dados)</span>
                </h4>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Quando você adiciona fotos pelo painel no computador, elas ficam salvas no navegador local. Para que apareçam <strong>no celular e para todos os visitantes na Vercel</strong>, as fotos precisam ir para o GitHub via Git:
                </p>

                <div className="bg-white/80 rounded-lg p-3 border border-teal-200/60 text-xs text-teal-950 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>Coloque os arquivos das fotos dentro da pasta <code>public/fotos/</code> no seu computador.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>Clique em <strong>Baixar properties.ts Atualizado</strong> abaixo e substitua o arquivo <code>src/data/properties.ts</code>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>No seu terminal, envie para o GitHub: <code className="bg-slate-900 text-teal-300 px-1.5 py-0.5 rounded text-[11px]">git add . && git commit -m "Fotos" && git push</code></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                    <span>A <strong>Vercel</strong> compila o site automaticamente e as fotos passam a aparecer no seu celular e em qualquer dispositivo!</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleDownloadTS}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar properties.ts Atualizado</span>
                  </button>
                  <button
                    onClick={handleCopyTSCode}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 font-bold rounded-lg text-xs shadow-sm transition-colors"
                  >
                    <Copy className="w-4 h-4 text-teal-600" />
                    <span>Copiar Código TypeScript</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Importar Arquivo de Backup
                </h4>
                <p className="text-xs text-slate-600">
                  Restaure seus dados a partir de um arquivo JSON salvo anteriormente.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-lg text-xs shadow-sm transition-colors">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span>Selecionar Arquivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </label>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                  4. Restaurar Valores Originais
                </h4>
                <p className="text-xs text-red-700">
                  Apaga todas as alterações salvas no navegador e retorna o site aos dados originais.
                </p>
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restaurar Padrão do Sistema</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            ✓ Alterações salvas instantaneamente no seu navegador.
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
