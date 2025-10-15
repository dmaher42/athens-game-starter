const fetch = global.fetch || require('node-fetch');
const urls = [
  '/athens-game-starter/models/character/hero.glb',
  '/models/character/hero.glb',
  '/athens-game-starter/models/character/astronaut.glb',
  '/models/character/astronaut.glb',
];
const ports = [5173, 5174];

(async function main() {
  for (const port of ports) {
    console.log('\n--- port', port, '---');
    for (const path of urls) {
      const u = `http://127.0.0.1:${port}${path}`;
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(u, { method: 'HEAD', signal: controller.signal });
        clearTimeout(id);
        const ct = res.headers.get('content-type') || '';
        console.log(u, '->', res.status, ct);
      } catch (e) {
        console.log(u, '-> error', e.message || e);
      }
    }
  }
})();
