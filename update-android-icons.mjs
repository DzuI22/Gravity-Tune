import { Jimp } from 'jimp';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

async function generateAppIcons() {
  const logoPath = path.resolve('public/logo.png');
  console.log('Loading logo from:', logoPath);

  const image = await Jimp.read(logoPath);

  const mipmaps = [
    { dir: 'android/app/src/main/res/mipmap-mdpi', size: 48 },
    { dir: 'android/app/src/main/res/mipmap-hdpi', size: 72 },
    { dir: 'android/app/src/main/res/mipmap-xhdpi', size: 96 },
    { dir: 'android/app/src/main/res/mipmap-xxhdpi', size: 144 },
    { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 },
  ];

  for (const m of mipmaps) {
    if (!existsSync(m.dir)) {
      mkdirSync(m.dir, { recursive: true });
    }

    const cloned = image.clone();
    cloned.resize({ w: m.size, h: m.size });
    await cloned.write(path.join(m.dir, 'ic_launcher.png'));
    await cloned.write(path.join(m.dir, 'ic_launcher_round.png'));
    await cloned.write(path.join(m.dir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${m.dir} (${m.size}x${m.size})`);
  }

  // Also update splash screens
  const splashDirs = [
    'android/app/src/main/res/drawable',
    'android/app/src/main/res/drawable-port-mdpi',
    'android/app/src/main/res/drawable-port-hdpi',
    'android/app/src/main/res/drawable-port-xhdpi',
    'android/app/src/main/res/drawable-port-xxhdpi',
    'android/app/src/main/res/drawable-port-xxxhdpi',
  ];

  for (const s of splashDirs) {
    if (!existsSync(s)) mkdirSync(s, { recursive: true });
    const splashImg = image.clone();
    splashImg.resize({ w: 480, h: 480 });
    await splashImg.write(path.join(s, 'splash.png'));
  }

  console.log('All Android icons and splash screens updated successfully!');
}

generateAppIcons().catch(console.error);
