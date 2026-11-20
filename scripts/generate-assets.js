const fs = require('fs');
const path = require('path');
const { generateImageAsync } = require('@expo/image-utils');

const rootDir = path.resolve(__dirname, '..');
const sourceImage = 'C:/Users/USER/.gemini/antigravity/brain/3749eb51-0571-4e0b-b4d2-0a850cf9522e/smartgwa_app_icon_1795152400058.jpg';

async function generate() {
  console.log('Generating branded assets from:', sourceImage);

  // 1. Full 1024x1024 App Icon
  const icon1024 = await generateImageAsync({ projectRoot: rootDir }, {
    src: sourceImage,
    width: 1024,
    height: 1024,
    resizeMode: 'cover',
    backgroundColor: '#059669',
  });
  fs.writeFileSync(path.join(rootDir, 'assets/images/icon.png'), icon1024.source);
  console.log('Wrote assets/images/icon.png');

  // 2. Android foreground (432x432)
  const androidForeground = await generateImageAsync({ projectRoot: rootDir }, {
    src: sourceImage,
    width: 432,
    height: 432,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  });
  fs.writeFileSync(path.join(rootDir, 'assets/images/android-icon-foreground.png'), androidForeground.source);
  console.log('Wrote assets/images/android-icon-foreground.png');

  // 3. Android background (solid #059669)
  const androidBackground = await generateImageAsync({ projectRoot: rootDir }, {
    src: sourceImage,
    width: 432,
    height: 432,
    resizeMode: 'cover',
    backgroundColor: '#059669',
  });
  fs.writeFileSync(path.join(rootDir, 'assets/images/android-icon-background.png'), androidBackground.source);
  console.log('Wrote assets/images/android-icon-background.png');

  // 4. Splash Icon (256x256)
  const splashIcon = await generateImageAsync({ projectRoot: rootDir }, {
    src: sourceImage,
    width: 256,
    height: 256,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  });
  fs.writeFileSync(path.join(rootDir, 'assets/images/splash-icon.png'), splashIcon.source);
  console.log('Wrote assets/images/splash-icon.png');

  // 5. Favicon PNG (64x64)
  const favicon = await generateImageAsync({ projectRoot: rootDir }, {
    src: sourceImage,
    width: 64,
    height: 64,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  });
  fs.writeFileSync(path.join(rootDir, 'assets/images/favicon.png'), favicon.source);
  fs.writeFileSync(path.join(rootDir, 'public/favicon.png'), favicon.source);
  // Also write public/favicon.ico as PNG (modern browsers fully support PNG favicon.ico)
  fs.writeFileSync(path.join(rootDir, 'public/favicon.ico'), favicon.source);
  console.log('Wrote favicon to assets & public');

  // 6. Apple Touch Icon for iOS Safari Add to Home Screen (180x180)
  const appleTouchIcon = await generateImageAsync({ projectRoot: rootDir }, {
    src: sourceImage,
    width: 180,
    height: 180,
    resizeMode: 'cover',
    backgroundColor: '#059669',
  });
  fs.writeFileSync(path.join(rootDir, 'public/apple-touch-icon.png'), appleTouchIcon.source);
  fs.writeFileSync(path.join(rootDir, 'public/apple-touch-icon-precomposed.png'), appleTouchIcon.source);
  fs.writeFileSync(path.join(rootDir, 'assets/images/apple-touch-icon.png'), appleTouchIcon.source);
  console.log('Wrote apple-touch-icon.png to public & assets');

  // 7. In-app branded logo for Login / Register / Forgot Password
  const logo = await generateImageAsync({ projectRoot: rootDir }, {
    src: sourceImage,
    width: 256,
    height: 256,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  });
  fs.writeFileSync(path.join(rootDir, 'assets/images/smartgwa-logo.png'), logo.source);
  console.log('Wrote assets/images/smartgwa-logo.png');

  console.log('All branding assets generated successfully!');
}

generate().catch((err) => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
