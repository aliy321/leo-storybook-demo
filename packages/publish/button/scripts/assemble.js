/**
 * Verifies publish/button source is present. Platform files are authored in-repo;
 * no code generation required for Button proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const required = ['Button.web.tsx', 'Button.native.tsx', 'Button.tsx', 'index.ts', 'package.json'];

for (const file of required) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing required publish file: ${file}`);
    process.exit(1);
  }
}

console.log('✓ @leo/button publish package assembled');
