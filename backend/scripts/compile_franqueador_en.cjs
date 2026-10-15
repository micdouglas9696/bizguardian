const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../../ebook/marinho ponci');
const tmpDir = '/tmp/franqueador_en_pages';
const outBackend = path.resolve(__dirname, '../private_assets/dossie-futuro-franqueador-en.pdf');
const outEbook = path.resolve(__dirname, '../../ebook/FRANQUEADOR_INGLES.pdf');

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

console.log('1. Convertendo imagens para PDFs individuais...');
const pdfFiles = [];
for (let i = 1; i <= 65; i++) {
    const pngPath = path.join(srcDir, `${i}.png`);
    const pdfPath = path.join(tmpDir, `page_${String(i).padStart(3, '0')}.pdf`);
    execSync(`sips -s format pdf "${pngPath}" --out "${pdfPath}" >/dev/null`);
    pdfFiles.push(pdfPath);
    process.stdout.write(`\rProcessado: ${i}/65`);
}

console.log('\n2. Unindo 65 páginas em PDF único com pdfunite...');
const quotedFiles = pdfFiles.map(p => `"${p}"`).join(' ');
execSync(`pdfunite ${quotedFiles} "${outBackend}"`);

console.log('3. Copiando para pasta ebook/...');
fs.copyFileSync(outBackend, outEbook);

console.log('4. Verificando resultado...');
const stats = fs.statSync(outBackend);
console.log(`✓ PDF gerado com sucesso!`);
console.log(`Arquivo 1: ${outBackend} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Arquivo 2: ${outEbook} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
