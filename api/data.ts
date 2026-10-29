import { put, list } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-blob-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const customToken = req.headers['x-blob-token'];
  const token = customToken || process.env.BLOB_READ_WRITE_TOKEN;

  // GET: Obter o catálogo de dados compartilhado (imóveis, banners, corretor)
  if (req.method === 'GET') {
    try {
      if (!token) {
        return res.status(200).json({
          success: false,
          configured: false,
          message: 'Vercel Blob token não configurado',
          data: null,
        });
      }

      // Procurar o arquivo de catálogo no Vercel Blob
      const { blobs } = await list({ prefix: 'site-data/catalog.json', token });
      const catalogBlob = blobs.find((b) => b.pathname === 'site-data/catalog.json');

      if (!catalogBlob) {
        return res.status(200).json({
          success: true,
          configured: true,
          found: false,
          data: null,
          message: 'Nenhum catálogo na nuvem ainda. Usando dados padrão.',
        });
      }

      // Buscar o JSON diretamente da URL pública do Blob com timestamp para evitar cache stale
      const response = await fetch(`${catalogBlob.url}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Falha ao ler dados da nuvem Vercel (${response.status})`);
      }
      const data = await response.json();

      return res.status(200).json({
        success: true,
        configured: true,
        found: true,
        url: catalogBlob.url,
        updatedAt: catalogBlob.uploadedAt,
        data,
      });
    } catch (error: any) {
      console.error('Erro ao buscar dados no Vercel Blob:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar catálogo do Vercel Blob',
      });
    }
  }

  // POST: Salvar ou atualizar o catálogo completo no Vercel Blob
  if (req.method === 'POST') {
    try {
      if (!token) {
        return res.status(400).json({
          success: false,
          error:
            'BLOB_READ_WRITE_TOKEN não configurado. Por favor, forneça o token nas variáveis de ambiente da Vercel ou nas configurações.',
        });
      }

      const bodyData = req.body;
      if (!bodyData || (!bodyData.properties && !bodyData.banners)) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos fornecidos para sincronização.',
        });
      }

      const payload = {
        updatedAt: new Date().toISOString(),
        properties: bodyData.properties || [],
        banners: bodyData.banners || [],
        brokerInfo: bodyData.brokerInfo || null,
        promos: bodyData.promos || [],
      };

      const buffer = Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');

      // Salva no Vercel Blob com allowOverwrite para atualizar o catálogo global
      const blob = await put('site-data/catalog.json', buffer, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
        token,
      });

      return res.status(200).json({
        success: true,
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Erro ao sincronizar catálogo no Vercel Blob:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao salvar dados no Vercel Blob',
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido. Use GET ou POST.' });
}
