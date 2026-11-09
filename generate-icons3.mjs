// Generate minimal valid PNG icons using pure Node.js (no native deps)
// Based on PNG spec: IHDR + IDAT (compressed DEFLATE) + IEND
import { createHash } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (~crc) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBytes = Buffer.from(type, 'ascii');
  const payload = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload), 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

function generatePNG(size) {
  // Build raw RGBA rows
  const rows = [];
  const cx = size / 2, cy = size / 2, r = size * 0.33;
  for (let y = 0; y < size; y++) {
    // Filter byte 0 = None
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      let ri, gi, bi;
      if (dist <= r) {
        // Rose-to-indigo gradient circle
        const t = dist / r;
        ri = Math.round(236 - t * 100);
        gi = Math.round(72 + t * 20);
        bi = Math.round(153 + t * 100);
      } else {
        // Dark background
        ri = 15; gi = 15; bi = 26;
      }
      const idx = 1 + x * 4;
      row[idx] = ri;
      row[idx + 1] = gi;
      row[idx + 2] = bi;
      row[idx + 3] = 255;
    }
    rows.push(row);
  }

  const raw = Buffer.concat(rows);
  const compressed = deflateSync(raw);

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // RGB color type (changed from 6/RGBA to 2/RGB for simplicity)
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', generatePNG(192));
console.log('Generated icon-192.png (' + generatePNG(192).length + ' bytes)');
writeFileSync('public/icons/icon-512.png', generatePNG(512));
console.log('Generated icon-512.png (' + generatePNG(512).length + ' bytes)');
console.log('All icons created!');
