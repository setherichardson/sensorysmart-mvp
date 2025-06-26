const fs = require('fs');
const path = require('path');

try {
  const sharp = require('sharp');
  
  const createIcon = (size) => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.1875}" fill="#000000"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.25}" fill="#2563eb"/>
      <text x="${size/2}" y="${size/2 + size * 0.08}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold">S</text>
    </svg>`;
  };

  // Create icons directory if it doesn't exist
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate icons
  const icons = [
    { size: 192, filename: 'icon-192.png' },
    { size: 512, filename: 'icon-512.png' },
    { size: 180, filename: 'apple-touch-icon.png' }
  ];

  console.log('Generating PWA icons with sharp...');

  const generateIcon = async (size, filename) => {
    const svgContent = createIcon(size);
    const pngPath = path.join(publicDir, filename);
    
    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(pngPath);
    
    console.log(`✅ Created ${filename}`);
  };

  // Generate all icons
  Promise.all(icons.map(({ size, filename }) => generateIcon(size, filename)))
    .then(() => {
      console.log('🎉 All PWA icons generated successfully!');
    })
    .catch(console.error);

} catch (error) {
  console.log('Sharp not available, creating simple SVG icons as fallback...');
  
  const createSimpleIcon = (size, filename) => {
    const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.1875}" fill="#000000"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.25}" fill="#2563eb"/>
      <text x="${size/2}" y="${size/2 + size * 0.08}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold">S</text>
    </svg>`;
    
    return svgContent;
  };

  // Create icons directory if it doesn't exist
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate icons
  const icons = [
    { size: 192, filename: 'icon-192.png' },
    { size: 512, filename: 'icon-512.png' },
    { size: 180, filename: 'apple-touch-icon.png' }
  ];

  console.log('Generating PWA icons...');

  icons.forEach(({ size, filename }) => {
    const svgContent = createSimpleIcon(size, filename);
    const svgPath = path.join(publicDir, `${filename}.svg`);
    
    // Write SVG file as placeholder
    fs.writeFileSync(svgPath, svgContent);
    console.log(`Created ${filename}.svg as placeholder`);
  });

  console.log('✅ PWA icons generated successfully!');
} 