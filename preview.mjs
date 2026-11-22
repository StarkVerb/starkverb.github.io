import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./dist', import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const bind = '127.0.0.1';
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

createServer(async (request, response) => {
  try {
    const target = new URL(request.url, `http://${bind}:${port}`);
    const path = decodeURIComponent(target.pathname);
    const filename = resolve(root, `.${path.endsWith('/') ? `${path}index.html` : path}`);
    if (!filename.startsWith(`${root}${sep}`)) throw new Error('Invalid path');
    const data = await stat(filename);
    if (!data.isFile()) throw new Error('File missing');
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filename)] ?? 'application/octet-stream',
      'Content-Length': data.size,
      'Cache-Control': 'no-cache',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(filename).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': contentTypes['.txt'] });
    response.end('Страница не найдена');
  }
}).listen(port, bind, () => console.log(`Local http://${bind}:${port}/`));
