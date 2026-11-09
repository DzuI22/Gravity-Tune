// Minimal pure-JS PNG generator for 1x1 pixel (then scale works via manifest)
// Using jimp which is pure JS
import Jimp from 'jimp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

// Generate 192x192 icon
const img192 = new Jimp({ width: 192, height: 192, color: 0x09090bff });

// Draw background
img192.scan(0, 0, 192, 192, function (x, y, idx) {
  // Simple dark gradient background
  this.bitmap.data[idx] = 15;
  this.bitmap.data[idx + 1] = 15;
  this.bitmap.data[idx + 2] = 26;
  this.bitmap.data[idx + 3] = 255;

  // Draw pink circle in center
  const cx = 96, cy = 96, r = 63;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (dist <= r) {
    // Rose to indigo gradient
    const t = dist / r;
    this.bitmap.data[idx] = Math.floor(236 - t * 100);     // R
    this.bitmap.data[idx + 1] = Math.floor(72 + t * 20);   // G
    this.bitmap.data[idx + 2] = Math.floor(153 + t * 90);  // B
    this.bitmap.data[idx + 3] = 255;
  }
});

await img192.write('public/icons/icon-192.png');
console.log('Generated icon-192.png');

const img512 = img192.clone().resize({ w: 512, h: 512 });
await img512.write('public/icons/icon-512.png');
console.log('Generated icon-512.png');
console.log('Done!');
