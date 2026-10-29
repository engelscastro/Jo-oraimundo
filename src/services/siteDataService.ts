import { Property, BannerSlide, PropertyImage } from '../data/properties';
import { BrokerInfoType, PromoBannerType } from '../context/RealEstateContext';
import { getVercelBlobToken, isVercelBlobUrl } from './vercelBlobService';

export interface SharedCatalogData {
  updatedAt?: string;
  properties: Property[];
  banners: BannerSlide[];
  brokerInfo?: BrokerInfoType;
  promos?: PromoBannerType[];
}

export interface FetchCatalogResult {
  success: boolean;
  configured: boolean;
  found: boolean;
  data: SharedCatalogData | null;
  updatedAt?: string;
  error?: string;
}

export interface SaveCatalogResult {
  success: boolean;
  url?: string;
  uploadedAt?: string;
  error?: string;
}

/**
 * Busca o catálogo compartilhado salvo no Vercel Blob via /api/data
 */
export async function fetchSharedCatalog(): Promise<FetchCatalogResult> {
  const customToken = getVercelBlobToken();

  // Se não há token Vercel válido ou se for um token do GitHub, não faz requisição desnecessária
  if (!customToken || customToken.startsWith('ghp_') || customToken.startsWith('github_pat_')) {
    return {
      success: false,
      configured: false,
      found: false,
      data: null,
      error: 'Vercel Blob não configurado.',
    };
  }

  try {
    const headers: Record<string, string> = {
      'x-blob-token': customToken,
    };

    const res = await fetch(`/api/data?t=${Date.now()}`, { headers });
    if (!res.ok) {
      throw new Error(`Servidor retornou status ${res.status}`);
    }

    const json = await res.json();
    return {
      success: !!json.success,
      configured: !!json.configured,
      found: !!json.found,
      data: json.data || null,
      updatedAt: json.updatedAt,
      error: json.error,
    };
  } catch (err: any) {
    return {
      success: false,
      configured: false,
      found: false,
      data: null,
      error: err.message || 'Falha ao buscar dados da nuvem',
    };
  }
}

/**
 * Salva o catálogo compartilhado no Vercel Blob via /api/data
 */
export async function saveSharedCatalog(data: SharedCatalogData): Promise<SaveCatalogResult> {
  const customToken = getVercelBlobToken();

  // Se não há token Vercel válido ou se for um token do GitHub, não tenta salvar no Vercel Blob
  if (!customToken || customToken.startsWith('ghp_') || customToken.startsWith('github_pat_')) {
    return {
      success: false,
      error: 'Vercel Blob não configurado.',
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-blob-token': customToken,
    };

    const res = await fetch('/api/data', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success) {
      return {
        success: true,
        url: json.url,
        uploadedAt: json.uploadedAt || new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: json.error || 'Falha ao salvar dados no Vercel Blob',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Falha de conexão com a API de sincronização',
    };
  }
}

/**
 * Faz upload de uma string dataUrl/base64 para o Vercel Blob e retorna a URL pública permanente
 */
export async function uploadBase64ToVercel(
  dataUrl: string,
  filename: string
): Promise<string> {
  const customToken = getVercelBlobToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (customToken) {
    headers['x-blob-token'] = customToken;
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filename: filename || `foto-${Date.now()}.jpg`,
      dataUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao fazer upload da foto para o Vercel Blob');
  }

  const data = await res.json();
  if (data.success && data.url) {
    return data.url;
  }

  throw new Error(data.error || 'Não foi possível obter URL pública do Vercel Blob');
}

/**
 * Procura por fotos em formato base64 nos imóveis e banners e faz o upload para o Vercel Blob
 * tornando-as acessíveis em celulares e qualquer outro dispositivo!
 */
export async function migrateLocalImagesToVercel(
  properties: Property[],
  banners: BannerSlide[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{
  properties: Property[];
  banners: BannerSlide[];
  migratedCount: number;
}> {
  // Coletar itens base64 para migrar
  const itemsToUpload: {
    type: 'prop-gallery' | 'banner';
    propIndex?: number;
    imageIndex?: number;
    bannerIndex?: number;
    dataUrl: string;
    filename: string;
  }[] = [];

  properties.forEach((prop, pIdx) => {
    if (prop.images && prop.images.length > 0) {
      prop.images.forEach((img, iIdx) => {
        if (img.url && img.url.startsWith('data:image/')) {
          itemsToUpload.push({
            type: 'prop-gallery',
            propIndex: pIdx,
            imageIndex: iIdx,
            dataUrl: img.url,
            filename: `${prop.code || prop.id}-foto-${iIdx + 1}.jpg`,
          });
        }
      });
    }
  });

  banners.forEach((banner, bIdx) => {
    if (banner.imageUrl && banner.imageUrl.startsWith('data:image/')) {
      itemsToUpload.push({
        type: 'banner',
        bannerIndex: bIdx,
        dataUrl: banner.imageUrl,
        filename: `banner-${banner.id}.jpg`,
      });
    }
  });

  if (itemsToUpload.length === 0) {
    return {
      properties,
      banners,
      migratedCount: 0,
    };
  }

  const updatedProperties = JSON.parse(JSON.stringify(properties)) as Property[];
  const updatedBanners = JSON.parse(JSON.stringify(banners)) as BannerSlide[];
  let migratedCount = 0;

  for (let i = 0; i < itemsToUpload.length; i++) {
    const item = itemsToUpload[i];
    onProgress?.(
      i + 1,
      itemsToUpload.length,
      `Enviando foto ${i + 1} de ${itemsToUpload.length} para a nuvem da Vercel...`
    );

    try {
      const publicUrl = await uploadBase64ToVercel(item.dataUrl, item.filename);

      if (
        item.type === 'prop-gallery' &&
        item.propIndex !== undefined &&
        item.imageIndex !== undefined
      ) {
        updatedProperties[item.propIndex].images[item.imageIndex].url = publicUrl;
        migratedCount++;
      } else if (item.type === 'banner' && item.bannerIndex !== undefined) {
        updatedBanners[item.bannerIndex].imageUrl = publicUrl;
        migratedCount++;
      }
    } catch (err) {
      console.error(`Erro ao migrar item ${i}:`, err);
    }
  }

  return {
    properties: updatedProperties,
    banners: updatedBanners,
    migratedCount,
  };
}
