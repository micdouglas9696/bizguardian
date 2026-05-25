import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const publicDir = '/Users/m.dbranding/Desktop/biz guardian/public';

// Imagens críticas e seus tamanhos máximos de exibição (largura)
const imageConfig = {
  '_DSC4559.jpg':       { width: 1400, quality: 78 },
  'sobre.png':          { width: 900,  quality: 80 },
  'marinho principal.png': { width: 1200, quality: 80 },
  'adriana .png':       { width: 600,  quality: 78 },
  'joao ferrai.png':    { width: 600,  quality: 78 },
  'diego.png':          { width: 600,  quality: 78 },
  'leandro.png':        { width: 600,  quality: 78 },
  'marcelo.png':        { width: 600,  quality: 78 },
  'banner final 02.png':{ width: 1400, quality: 82 },
  'marinho final.png':  { width: 400,  quality: 85 },
  '2.png':              { width: 300,  quality: 85 },
  'marinho-signature.png': { width: 400, quality: 85 },
  'LOGO FUNDO ESCURO.png': { width: 400, quality: 85 },
  'LOGO FUNDO BRANCO.png': { width: 400, quality: 85 },
  'capaebookdesk_franqueado.png': { width: 900, quality: 82 },
  'obile final ebook.png': { width: 600, quality: 82 },
  'Marinho-185.jpg':    { width: 800,  quality: 80 },
  '44.jpg':             { width: 800,  quality: 80 },
  'partns.png':         { width: 600,  quality: 82 },
  'partnses2.png':      { width: 600,  quality: 82 },
};

async function convert() {
  const files = await readdir(publicDir);
  const targets = Object.keys(imageConfig);
  let saved = 0;

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;
    if (!targets.includes(file)) continue;

    const input = join(publicDir, file);
    const output = join(publicDir, basename(file, ext) + '.webp');
    const cfg = imageConfig[file];

    try {
      const before = (await stat(input)).size;
      await sharp(input)
        .resize({ width: cfg.width, withoutEnlargement: true })
        .webp({ quality: cfg.quality })
        .toFile(output);
      const after = (await stat(output)).size;
      const pct = Math.round((1 - after / before) * 100);
      console.log(`✓ ${file} → ${basename(output)}  (${(before/1024/1024).toFixed(1)}MB → ${(after/1024/1024).toFixed(1)}MB, -${pct}%)`);
      saved += (before - after);
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
    }
  }

  console.log(`\nTotal economizado: ${(saved/1024/1024).toFixed(1)} MB`);
}

convert();
