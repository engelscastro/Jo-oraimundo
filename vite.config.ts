import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
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

        // Servir fotos estáticas da pasta public/fotos dinamicamente
        if (url.startsWith('/fotos/')) {
          const rawFilename = url.replace('/fotos/', '').split('?')[0];
          const cleanFilename = decodeURIComponent(rawFilename);
          const filePath = path.resolve(__dirname, 'public/fotos', cleanFilename);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeMap: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif'
            };
            res.setHeader('Content-Type', mimeMap[ext] || 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.end(fs.readFileSync(filePath));
            return;
          }
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

        // Upload endpoint - salva arquivos diretamente na pasta public/fotos do frontend
        if (url === '/api/upload' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              let filename = data.filename || `foto-${Date.now()}.jpg`;
              let cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
              if (!/\.(jpe?g|png|webp|gif|svg)$/i.test(cleanFilename)) {
                cleanFilename += '.jpg';
              }
              let buffer: Buffer;
              let mimeType = data.contentType || 'image/jpeg';

              if (data.dataUrl && typeof data.dataUrl === 'string') {
                const commaIdx = data.dataUrl.indexOf(',');
                if (commaIdx !== -1) {
                  const metaPart = data.dataUrl.slice(0, commaIdx);
                  const base64Data = data.dataUrl.slice(commaIdx + 1);
                  const mimeMatch = metaPart.match(/data:([^;]+);/);
                  if (mimeMatch) mimeType = mimeMatch[1];
                  buffer = Buffer.from(base64Data.replace(/[\r\n\s]/g, ''), 'base64');
                } else {
                  buffer = Buffer.from(data.dataUrl.replace(/[\r\n\s]/g, ''), 'base64');
                }
              } else if (data.base64 && typeof data.base64 === 'string') {
                buffer = Buffer.from(data.base64.replace(/[\r\n\s]/g, ''), 'base64');
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Nenhum dado de imagem recebido' }));
                return;
              }

              // Salvar fisicamente na pasta public/fotos do projeto
              const fotosDir = path.resolve(__dirname, 'public/fotos');
              if (!fs.existsSync(fotosDir)) {
                fs.mkdirSync(fotosDir, { recursive: true });
              }
              const filePath = path.join(fotosDir, cleanFilename);
              fs.writeFileSync(filePath, buffer);
              const localUrl = `/fotos/${cleanFilename}`;

              const customToken = req.headers['x-blob-token'] as string;
              const token = customToken || process.env.BLOB_READ_WRITE_TOKEN;

              // Se houver token da Vercel configurado, tenta fazer upload para CDN
              if (token && !data.saveLocalOnly) {
                try {
                  const { put } = await import('@vercel/blob');
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
                      localUrl,
                      downloadUrl: blob.downloadUrl,
                      pathname: blob.pathname,
                      contentType: blob.contentType,
                      isVercel: true,
                    })
                  );
                  return;
                } catch (blobErr) {
                  console.warn('Vercel Blob falhou, foto salva com sucesso em public/fotos:', blobErr);
                }
              }

              // Retorna URL estática da pasta fotos do frontend
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  url: localUrl,
                  isLocal: true,
                  isVercel: false,
                  filename: cleanFilename,
                  message: `Foto salva na pasta public/fotos do frontend!`,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: err.message || 'Erro ao processar e salvar imagem',
                })
              );
            }
          });
          return;
        }

        // Endpoint para salvar alterações diretamente no arquivo src/data/properties.ts (Sem Banco de Dados)
        if (url === '/api/save-to-properties-ts' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { properties, banners, brokerInfo, promos } = JSON.parse(body);
              const propertiesPath = path.resolve(__dirname, 'src/data/properties.ts');
              let content = fs.readFileSync(propertiesPath, 'utf-8');

              const propStr = `export const PROPERTIES: Property[] = ${JSON.stringify(properties, null, 2)};`;
              const bannerStr = `export const BANNER_SLIDES: BannerSlide[] = ${JSON.stringify(banners, null, 2)};`;
              const brokerStr = `export const BROKER_INFO = ${JSON.stringify(brokerInfo, null, 2)};`;

              // Substitui as constantes no arquivo
              content = content.replace(/export const PROPERTIES: Property\[\] =[\s\S]*?;\n\nexport const BANNER_SLIDES/, `${propStr}\n\nexport const BANNER_SLIDES`);
              content = content.replace(/export const BANNER_SLIDES: BannerSlide\[\] =[\s\S]*?;\n\nexport const BROKER_INFO/, `${bannerStr}\n\nexport const BROKER_INFO`);
              content = content.replace(/export const BROKER_INFO =[\s\S]*?;\n\nexport const MID_BANNER_PROMOS/, `${brokerStr}\n\nexport const MID_BANNER_PROMOS`);

              fs.writeFileSync(propertiesPath, content, 'utf-8');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: 'Alterações gravadas diretamente em src/data/properties.ts!'
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
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

