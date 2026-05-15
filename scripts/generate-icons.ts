import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const svgPath = path.join(publicDir, 'favicon.svg');
if (!fs.existsSync(svgPath)) {
  console.warn('[icons] favicon.svg not found, skipping icon generation');
} else {
  const svg = fs.readFileSync(svgPath);

  const targets: Array<{ file: string; size: number }> = [
    { file: 'favicon-48.png', size: 48 },
    { file: 'icon-192.png', size: 192 },
    { file: 'icon-512.png', size: 512 },
    { file: 'apple-touch-icon.png', size: 180 },
  ];

  await Promise.all(
    targets.map(async (t) => {
      const outPath = path.join(publicDir, t.file);
      const buf = await sharp(svg, { density: 300 })
        .resize(t.size, t.size, { fit: 'cover' })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
      fs.writeFileSync(outPath, buf);
    }),
  );

  console.log(`[icons] generated ${targets.length} icons from favicon.svg`);
}

