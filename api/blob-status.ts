import { head } from '@vercel/blob';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-blob-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const customToken = req.headers['x-blob-token'];
  const token = customToken || process.env.BLOB_READ_WRITE_TOKEN;

  const hasEnvToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const isConfigured = !!token;

  return res.status(200).json({
    configured: isConfigured,
    hasEnvToken,
    hasCustomToken: !!customToken,
    storageType: 'vercel-blob',
    message: isConfigured
      ? 'Vercel Blob ativo e pronto para uploads de imagens.'
      : 'Vercel Blob ainda não configurado.',
  });
}
