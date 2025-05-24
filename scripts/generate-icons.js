const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  favicon: [16, 32, 48, 64],
  logo192: 192,
  logo512: 512
};

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/logo.svg'));

  // Generate favicon.ico
  const faviconBuffers = await Promise.all(
    sizes.favicon.map(size =>
      sharp(svgBuffer)
        .resize(size, size)
        .toBuffer()
    )
  );

  // Generate logo192.png
  const logo192Buffer = await sharp(svgBuffer)
    .resize(sizes.logo192, sizes.logo192)
    .png()
    .toBuffer();

  // Generate logo512.png
  const logo512Buffer = await sharp(svgBuffer)
    .resize(sizes.logo512, sizes.logo512)
    .png()
    .toBuffer();

  // Save files
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), faviconBuffers[0]);
  fs.writeFileSync(path.join(__dirname, '../public/logo192.png'), logo192Buffer);
  fs.writeFileSync(path.join(__dirname, '../public/logo512.png'), logo512Buffer);

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 