const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size'); // wait, is image-size installed? We can use a simpler way or try importing it.
// If image-size is not installed, we can just read the first few bytes of the png to parse width/height.
// Or we can use a python script! Python's standard library or PIL is usually available on mac.

const images = [
  'public/dossie_ingles.png',
  'public/capa_franqueador.png'
];

images.forEach(img => {
  const filePath = path.resolve(__dirname, '..', img);
  if (fs.existsSync(filePath)) {
    const dimensions = sizeOf(filePath);
    console.log(`${img}: ${dimensions.width}x${dimensions.height}`);
  } else {
    console.log(`${img} does not exist`);
  }
});
