import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-blob-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const customToken = req.headers['x-blob-token'];
    const token = customToken || process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN não configurado. Por favor, forneça o token do Vercel Blob nas variáveis de ambiente da Vercel ou no painel administrativo.',
      });
    }

    let { filename, dataUrl, base64, contentType } = req.body || {};

    if (!filename) {
      filename = `imovel-${Date.now()}.jpg`;
    }

    // Sanitize filename
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

    let buffer: Buffer;
    let mimeType = contentType || 'image/jpeg';

    if (dataUrl) {
      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(dataUrl, 'base64');
      }
    } else if (base64) {
      buffer = Buffer.from(base64, 'base64');
    } else {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado de imagem recebido (envie dataUrl ou base64)',
      });
    }

    // Upload to Vercel Blob
    const blob = await put(cleanFilename, buffer, {
      access: 'public',
      contentType: mimeType,
      token,
      addRandomSuffix: true,
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
    });
  } catch (error: any) {
    console.error('Erro no upload para Vercel Blob:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar upload para Vercel Blob',
    });
  }
}
