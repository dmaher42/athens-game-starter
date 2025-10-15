import http from 'http';
import https from 'https';

const base = process.argv[2] || 'http://127.0.0.1:5173/athens-game-starter/';
const paths = [
  'textures/ground/grass-albedo.jpg',
  'textures/ground/grass-normal-dx.jpg',
  'textures/ground/grass-metallic.jpg',
  'textures/ground/grass-ao.jpg',
  'textures/ground/grass-height.jpg',
  'textures/ground/grass-roughness.jpg',
  'textures/ground/water_normals.png',
];

function head(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request(
        {
          method: 'HEAD',
          hostname: u.hostname,
          port: u.port,
          path: u.pathname + (u.search || ''),
          timeout: 2000,
        },
        (res) => {
          resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
        }
      );
      req.on('error', (err) => resolve({ url, error: String(err) }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, error: 'timeout' });
      });
      req.end();
    } catch (err) {
      resolve({ url, error: String(err) });
    }
  });
}

(async () => {
  for (const p of paths) {
    const url = new URL(p, base).toString();
    const res = await head(url);
    console.log(p.padEnd(40), res.status ? res.status : res.error, res.ok ? 'OK' : 'FAIL');
  }
})();
