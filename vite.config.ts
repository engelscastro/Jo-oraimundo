import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function vercelBlobDevPlugin(): Plugin {
  return {
    name: 'vercel-blob-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Handle stale client cache for recharts
        if (url.includes('recharts.js')) {
          res.setHeader('Content-Type', 'application/javascript');
          res.end('export default {}; export const ResponsiveContainer = () => null;');
          return;
        }

        // Status endpoint
        if (url === '/api/blob-status' || url.startsWith('/api/blob-status?')) {
          const customToken = req.headers['x-blob-token'] as string;
          const token = customToken || process.env.BLOB_READ_WRITE_TOKEN;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              configured: !!token,
              hasEnvToken: !!process.env.BLOB_READ_WRITE_TOKEN,
              hasCustomToken: !!customToken,
              storageType: 'vercel-blob',
              message: token
                ? 'Vercel Blob ativo e pronto para uploads de imagens.'
                : 'Aguardando token do Vercel Blob.',
            })
          );
          return;
        }

        // Upload endpoint
        if (url === '/api/upload' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const customToken = req.headers['x-blob-token'] as string;
              const token = customToken || process.env.BLOB_READ_WRITE_TOKEN;

              if (!token) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error:
                      'BLOB_READ_WRITE_TOKEN não configurado. Por favor configure o token nas variáveis de ambiente da Vercel ou no painel admin.',
                  })
                );
                return;
              }

              const { put } = await import('@vercel/blob');
              const data = JSON.parse(body);
              let filename = data.filename || `imovel-${Date.now()}.jpg`;
              const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
              let buffer: Buffer;
              let mimeType = data.contentType || 'image/jpeg';

              if (data.dataUrl) {
                const matches = data.dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                if (matches) {
                  mimeType = matches[1];
                  buffer = Buffer.from(matches[2], 'base64');
                } else {
                  buffer = Buffer.from(data.dataUrl, 'base64');
                }
              } else if (data.base64) {
                buffer = Buffer.from(data.base64, 'base64');
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Nenhum dado de imagem recebido' }));
                return;
              }

              const blob = await put(cleanFilename, buffer, {
                access: 'public',
                contentType: mimeType,
                token,
                addRandomSuffix: true,
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  url: blob.url,
                  downloadUrl: blob.downloadUrl,
                  pathname: blob.pathname,
                  contentType: blob.contentType,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: err.message || 'Erro ao fazer upload para Vercel Blob',
                })
              );
            }
          });
          return;
        }

        // Data endpoint for cross-device shared catalog
        if (url === '/api/data' || url.startsWith('/api/data?')) {
          const customToken = req.headers['x-blob-token'] as string;
          const token = customToken || process.env.BLOB_READ_WRITE_TOKEN;

          if (req.method === 'GET') {
            try {
              if (token) {
                const { list } = await import('@vercel/blob');
                const { blobs } = await list({ prefix: 'site-data/catalog.json', token });
                const catalogBlob = blobs.find((b) => b.pathname === 'site-data/catalog.json');
                if (catalogBlob) {
                  const resp = await fetch(`${catalogBlob.url}?t=${Date.now()}`);
                  if (resp.ok) {
                    const data = await resp.json();
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: true,
                      configured: true,
                      found: true,
                      url: catalogBlob.url,
                      updatedAt: catalogBlob.uploadedAt,
                      data
                    }));
                    return;
                  }
                }
              }
              // Fallback to dev memory or not found
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                configured: !!token,
                found: !!(globalThis as any).__devCatalog,
                data: (globalThis as any).__devCatalog || null
              }));
              return;
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
              return;
            }
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body);
                (globalThis as any).__devCatalog = parsed;

                let blobUrl: string | undefined;
                if (token) {
                  const { put } = await import('@vercel/blob');
                  const buffer = Buffer.from(JSON.stringify(parsed, null, 2), 'utf-8');
                  const blob = await put('site-data/catalog.json', buffer, {
                    access: 'public',
                    addRandomSuffix: false,
                    allowOverwrite: true,
                    contentType: 'application/json',
                    cacheControlMaxAge: 0,
                    token,
                  });
                  blobUrl = blob.url;
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  url: blobUrl,
                  uploadedAt: new Date().toISOString()
                }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), vercelBlobDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

