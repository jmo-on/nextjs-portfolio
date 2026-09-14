// Kept independent from Next.js so the portfolio can stay on static hosting.
interface Env { SCORES: { getByName(name: string): { fetch(request: Request): Promise<Response> } }; ALLOWED_ORIGIN: string }
interface Storage { sql: { exec<T>(query: string, ...args: unknown[]): { toArray(): T[] } }; transactionSync<T>(callback: () => T): T }
export default {
  async fetch(request: Request, env: Env) {
    const origin = request.headers.get('Origin');
    if (origin && origin !== env.ALLOWED_ORIGIN) return new Response('Origin not allowed', { status: 403 });
    const headers = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin', 'Cache-Control': 'no-store' };
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    const result = await env.SCORES.getByName('global').fetch(request);
    const response = new Response(result.body, result); Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value)); return response;
  },
};
export class GlobalScore {
  storage: Storage;
  constructor(ctx: { storage: Storage }) {
    this.storage = ctx.storage;
    this.storage.sql.exec('CREATE TABLE IF NOT EXISTS rescue_records (id INTEGER PRIMARY KEY, points INTEGER NOT NULL)');
    this.storage.sql.exec('INSERT OR IGNORE INTO rescue_records VALUES (1, 0)');
    this.storage.sql.exec('CREATE TABLE IF NOT EXISTS rescue_sessions (token TEXT PRIMARY KEY, points INTEGER NOT NULL, created INTEGER NOT NULL)');
  }
  highScore() { return this.storage.sql.exec<{ points: number }>('SELECT points FROM rescue_records WHERE id = 1').toArray()[0].points; }
  async fetch(request: Request) {
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path === '/score') return Response.json({ highScore: this.highScore() });
    if (request.method !== 'POST') return new Response('Not found', { status: 404 });
    if (path === '/session') {
      const token = crypto.randomUUID();
      this.storage.sql.exec('DELETE FROM rescue_sessions WHERE created < ?', Date.now() - 86400000);
      this.storage.sql.exec('INSERT INTO rescue_sessions VALUES (?, 0, ?)', token, Date.now());
      return Response.json({ token, highScore: this.highScore() });
    }
    if (path !== '/score') return new Response('Not found', { status: 404 });
    let data: { token?: string; points?: number };
    const body = await request.text(); if (body.length > 512) return new Response('Too large', { status: 413 });
    try { data = JSON.parse(body); } catch { return new Response('Invalid JSON', { status: 400 }); }
    if (typeof data.token !== 'string' || !Number.isSafeInteger(data.points) || data.points! < 0) return new Response('Invalid score', { status: 400 });
    return this.storage.transactionSync(() => {
      const session = this.storage.sql.exec<{ points: number; created: number }>('SELECT points, created FROM rescue_sessions WHERE token = ?', data.token).toArray()[0];
      if (!session || Date.now() - session.created > 86400000) return new Response('Session expired', { status: 401 });
      // MAX keeps the best individual score, never a sum. Retries are idempotent. The ceiling limits spam;
      // this casual, anonymous scoreboard is not cheat-proof.
      const ceiling = (Math.floor((Date.now() - session.created) / 1000) * 4) + 2;
      if (data.points! > ceiling) return new Response('Score rate exceeded', { status: 429 });
      const delta = Math.max(0, data.points! - session.points);
      if (delta) {
        this.storage.sql.exec('UPDATE rescue_records SET points = MAX(points, ?) WHERE id = 1', data.points);
        this.storage.sql.exec('UPDATE rescue_sessions SET points = ? WHERE token = ?', data.points, data.token);
      }
      return Response.json({ highScore: this.highScore(), accepted: Math.max(data.points!, session.points) });
    });
  }
}
