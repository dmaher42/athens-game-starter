import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const base64Icon = `AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAbOmb/Gzpm///XXv//117//9de///XXv//117//9de///XXv//117//9de///XXv//117/Gzpm/xs6Zv8bOmb//9de///XXv//117//9de///XXv//117//9de///XXv//117//9de///XXv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm///XXv//117//9de///XXv//117//9de///XXv//117//9de///XXv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb//9de///XXv//117//9de///XXv//117//9de///XXv//117/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm///XXv//117//9de///XXv//117//9de///XXv//117//9de/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb//9de///XXv//117//9de///XXv//117//9de/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm///XXv//117//9de///XXv//117//9de///XXv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb//9de///XXv//117//9de///XXv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm///XXv//117//9de///XXv//117/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb//9de///XXv//117/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm///XXv//117//9de/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb//9de/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm///XXv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/Gzpm/xs6Zv8bOmb/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const faviconPath = resolve(__dirname, '../public/favicon.ico');

const run = async () => {
  await mkdir(dirname(faviconPath), { recursive: true });
  const buffer = Buffer.from(base64Icon, 'base64');
  await writeFile(faviconPath, buffer);
  console.log(`Generated favicon at ${faviconPath}`);
};

run().catch((error) => {
  console.error('Failed to generate favicon.ico', error);
  process.exitCode = 1;
});
