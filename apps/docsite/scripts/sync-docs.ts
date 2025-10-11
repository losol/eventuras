import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_SOURCE = join(__dirname, '../../../docs');
const DOCS_DEST = join(__dirname, '../content');

function copyRecursiveSync(src: string, dest: string, exclude: string[] = []): void {
  if (!existsSync(src)) {
    return;
  }

  const stats = statSync(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    readdirSync(src).forEach((childItemName: string) => {
      if (exclude.includes(childItemName)) {
        return;
      }
      copyRecursiveSync(
        join(src, childItemName),
        join(dest, childItemName),
        exclude
      );
    });
  } else {
    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  }
}

// Clean existing docs directory
if (existsSync(DOCS_DEST)) {
  console.log('Cleaning existing docs directory...');
  rmSync(DOCS_DEST, { recursive: true, force: true });
  console.log(`Cleaned: ${DOCS_DEST}`);
}

// Copy docs
console.log('Syncing documentation from @eventuras/docs...');
copyRecursiveSync(DOCS_SOURCE, DOCS_DEST, ['package.json', 'node_modules']);
console.log('Documentation sync complete!');
