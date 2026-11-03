// 내 컴퓨터에서 미리 실행해 보는 개발용 서버: `node dev-server.mjs` → http://localhost:3000
// .env.local 파일이 있으면 그 값을 읽어요. Redis 값이 없으면 메모리에 임시로 저장해요(서버를 끄면 사라짐).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
for (const f of ['.env.local', '.env']) {
  const p = path.join(root, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) process.env.HANNUN_MEMORY_STORE = '1';
process.env.TEACHER_CODE ||= 'hannun2026';

const { default: api } = await import('./api/index.mjs');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const PORT = Number(process.env.PORT || 3000);

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
      const ctl = new AbortController();
      res.on('close', () => { if (!res.writableFinished) ctl.abort(); });
      const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks), signal: ctl.signal });
      const response = await api.fetch(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.body) for await (const chunk of response.body) res.write(chunk);
      return res.end();
    }
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (!file.startsWith(root) || /[\\/](api|\.)/.test(file.slice(root.length))) { res.writeHead(403); return res.end(); }
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
    const data = await readFile(file).catch(() => null);
    if (!data) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
}).listen(PORT, () => {
  console.log(`한눈학사 개발 서버: http://localhost:${PORT}`);
  console.log(`저장소: ${process.env.HANNUN_MEMORY_STORE === '1' ? '메모리(임시)' : 'Upstash Redis'} · AI: ${process.env.AI_API_KEY || process.env.AI_BASE_URL ? '연결됨' : '미설정(기본 응답)'}`);
});
