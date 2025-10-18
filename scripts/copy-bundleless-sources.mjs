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
  await rewriteModuleSpecifiers(destination);

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

async function rewriteModuleSpecifiers(targetDir) {
  const entries = await readdir(targetDir, { withFileTypes: true });

  for (const entry of entries) {
    const currentPath = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await rewriteModuleSpecifiers(currentPath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.js')) {
      continue;
    }

    const original = await readFile(currentPath, 'utf8');
    const updated = rewriteSpecifiersForFile(original, currentPath);

    if (updated !== original) {
      await writeFile(currentPath, updated);
    }
  }
}

function rewriteSpecifiersForFile(source, currentPath) {
  let output = source;

  output = output.replace(
    /(from\s+['"])([^'"]+)(['"])/g,
    (full, prefix, specifier, suffix) => {
      const next = normalizeSpecifier(specifier, currentPath);
      return `${prefix}${next}${suffix}`;
    },
  );

  output = output.replace(
    /(import\s+['"])([^'"]+)(['"])/g,
    (full, prefix, specifier, suffix) => {
      const next = normalizeSpecifier(specifier, currentPath);
      return `${prefix}${next}${suffix}`;
    },
  );

  output = output.replace(
    /(import\s*\(\s*['"])([^'"]+)(['"]\s*\))/g,
    (full, prefix, specifier, suffix) => {
      const next = normalizeSpecifier(specifier, currentPath);
      return `${prefix}${next}${suffix}`;
    },
  );

  output = output.replace(
    /(export\s+[^'"`]*?from\s+['"])([^'"]+)(['"])/g,
    (full, prefix, specifier, suffix) => {
      const next = normalizeSpecifier(specifier, currentPath);
      return `${prefix}${next}${suffix}`;
    },
  );

  output = output.replace(
    /(import\s+[^;]*?from\s+['"][^'"]+\.json['"])(\s*;?)/g,
    (full, statement, suffix) => {
      if (/assert\s*\{\s*type\s*:\s*['"]json['"]\s*\}/i.test(full)) {
        return full;
      }
      const finalSuffix = suffix && suffix.length > 0 ? suffix : ';';
      return `${statement} assert { type: 'json' }${finalSuffix}`;
    },
  );

  return output;
}

function normalizeSpecifier(specifier, currentPath) {
  if (!specifier.startsWith('.')) {
    return specifier;
  }

  if (specifier.endsWith('.js') || specifier.endsWith('.json')) {
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

copyBundlelessSources().catch((error) => {
  console.error(error);
  process.exit(1);
});
