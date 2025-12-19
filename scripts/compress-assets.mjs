import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputDir = path.join(rootDir, 'public/models/landmarks');
const outputDir = path.join(rootDir, 'public/models/landmarks');

try {
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.glb'));

    files.forEach(file => {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);

        console.log(`Optimizing ${file}...`);

        // Relies on system-installed KTX tools (e.g. via PATH) or fails if missing.
        // Uses npx to run the project-installed gltf-transform.
        execSync(`npx gltf-transform optimize "${inputPath}" "${outputPath}" --texture-compress ktx2 --compress draco`, { stdio: 'inherit' });
    });
} catch (err) {
    console.error("Compression failed.", err);
    process.exit(1);
}
