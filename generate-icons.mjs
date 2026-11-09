// Generate icons via SVG → Base64 PNG approach (no native deps)
import { writeFileSync, mkdirSync } from 'fs';

// Create a minimal valid PNG from scratch using raw bytes (1x1 upscaled via SVG data URI workaround)
// We'll use a pure JS PNG encoder for a simple icon

function createSimpleSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0f1a"/>
      <stop offset="100%" style="stop-color:#1a0a14"/>
    </linearGradient>
    <linearGradient id="icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899"/>
      <stop offset="50%" style="stop-color:#f43f5e"/>
      <stop offset="100%" style="stop-color:#6366f1"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#f43f5e;stop-opacity:0.4"/>
      <stop offset="100%" style="stop-color:#f43f5e;stop-opacity:0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#glow)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.33}" fill="url(#icon)"/>
  <text x="${size/2 + size*0.02}" y="${size/2 + size*0.14}" font-family="serif" font-size="${size * 0.35}" font-weight="bold" fill="white" text-anchor="middle">♪</text>
</svg>`;
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.svg', createSimpleSVGIcon(192));
writeFileSync('public/icons/icon-512.svg', createSimpleSVGIcon(512));
console.log('SVG icons generated! To use as PNG, convert with an image tool or use them as SVG icons.');
