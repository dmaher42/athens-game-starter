import {
  cp,
  mkdir,
  stat,
  rm,
  readdir,
  copyFile,
  readFile,
  writeFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

async function findBuildDir() {
  const candidates = ['docs', 'dist'];
  for (const dir of candidates) {
    const candidate = join(process.cwd(), dir);
    try {
      const indexPath = join(candidate, 'index.html');
      await stat(indexPath);
      return candidate;
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  throw new Error('Unable to locate build directory (expected docs/ or dist/)');
}

async function copyBundlelessSources() {
  const buildDir = await findBuildDir();
  const destination = join(buildDir, 'src');

  // Do not ship source code inside the published docs/ directory.
  if (buildDir.endsWith('docs')) {
    await rm(destination, { recursive: true, force: true });
    console.log(`Skipped copying bundleless sources into ${buildDir}.`);
    return;
  }

  const compiledSource = join(process.cwd(), '.bundleless');
  const source = join(process.cwd(), 'src');

  try {
    await stat(compiledSource);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(
        'Bundleless sources not found. Run scripts/build-bundleless-sources.mjs first.',
      );
    }
    throw error;
  }

  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await cp(compiledSource, destination, { recursive: true });
  await copyOverlayJs(source, destination);
  const jsonDependencies = new Set();
  await rewriteModuleSpecifiers(destination, jsonDependencies);
  await emitJsonModules(jsonDependencies);

  console.log(`Copied bundleless sources to ${destination}`);
}

async function copyOverlayJs(source, destination) {
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(source, entry.name);
    const destPath = join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyOverlayJs(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      await mkdir(dirname(destPath), { recursive: true });
      await copyFile(srcPath, destPath);
    }
  }
}

async function rewriteModuleSpecifiers(targetDir, jsonDependencies) {
  const entries = await readdir(targetDir, { withFileTypes: true });

  for (const entry of entries) {
    const currentPath = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await rewriteModuleSpecifiers(currentPath, jsonDependencies);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.js')) {
      continue;
    }

    const original = await readFile(currentPath, 'utf8');
    const updated = rewriteSpecifiersForFile(original, currentPath, jsonDependencies);

    if (updated !== original) {
      await writeFile(currentPath, updated);
    }
  }
}

function rewriteSpecifiersForFile(source, currentPath, jsonDependencies) {
  let output = source;

  output = output.replace(
    /(from\s+['"])([^'"]+)(['"])/g,
    (full, prefix, specifier, suffix) => {
      const next = normalizeSpecifier(specifier, currentPath, jsonDependencies);
      return `${prefix}${next}${suffix}`;
    },
  );

  output = output.replace(
    /(import\s+['"])([^'"]+)(['"])/g,
    (full, prefix, specifier, suffix) => {
      const next = normalizeSpecifier(specifier, currentPath, jsonDependencies);
      return `${prefix}${next}${suffix}`;
    },
  );

  output = output.replace(
    /(import\s*\(\s*['"])([^'"]+)(['"]\s*\))/g,
    (full, prefix, specifier, suffix) => {
      const next = normalizeSpecifier(specifier, currentPath, jsonDependencies);
      return `${prefix}${next}${suffix}`;
    },
  );

  output = output.replace(
    /(export\s+[^'"`]*?from\s+['"])([^'"]+)(['"])/g,
    (full, prefix, specifier, suffix) => {
      const next = normalizeSpecifier(specifier, currentPath, jsonDependencies);
      return `${prefix}${next}${suffix}`;
    },
  );

  return output;
}

function normalizeSpecifier(specifier, currentPath, jsonDependencies) {
  if (!specifier.startsWith('.')) {
    return specifier;
  }

  if (specifier.endsWith('.json')) {
    if (jsonDependencies) {
      const resolvedJson = resolve(dirname(currentPath), specifier);
      jsonDependencies.add(resolvedJson);
    }
    return `${specifier}.js`;
  }

  if (specifier.endsWith('.js')) {
    return specifier;
  }

  if (specifier.endsWith('.ts')) {
    return `${specifier.slice(0, -3)}.js`;
  }

  const extension = extname(specifier);
  if (extension && extension !== '.js') {
    return specifier;
  }

  const base = specifier;
  const resolved = resolve(dirname(currentPath), base);
  const jsCandidate = `${resolved}.js`;

  if (existsSync(jsCandidate)) {
    return `${base}.js`;
  }

  const indexCandidate = resolve(dirname(currentPath), base, 'index.js');
  if (existsSync(indexCandidate)) {
    const separator = base.endsWith('/') ? '' : '/';
    return `${base}${separator}index.js`;
  }

  return specifier;
}

async function emitJsonModules(jsonDependencies) {
  if (!jsonDependencies || jsonDependencies.size === 0) {
    return;
  }

  await Promise.all(
    Array.from(jsonDependencies).map(async (jsonPath) => {
      try {
        const content = await readFile(jsonPath, 'utf8');
        const parsed = JSON.parse(content);
        const moduleSource = `export default ${JSON.stringify(parsed, null, 2)};\n`;
        await writeFile(`${jsonPath}.js`, moduleSource, 'utf8');
      } catch (error) {
        console.warn(`Unable to emit JSON module for ${jsonPath}:`, error.message);
      }
    }),
  );
}

copyBundlelessSources().catch((error) => {
  console.error(error);
  process.exit(1);
});
