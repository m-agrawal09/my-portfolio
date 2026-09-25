const sharp = require('../build-lanyard/node_modules/sharp');
const fs = require('fs');

const svg = `
<svg width="1024" height="256" viewBox="0 0 1024 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="256" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a101d"/>
      <stop offset="25%" stop-color="#0f172a"/>
      <stop offset="75%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0a101d"/>
    </linearGradient>
    <pattern id="weave" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0 L16 8 L8 16 Z" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
      <path d="M8 8 L16 0 M0 16 L8 8" fill="none" stroke="rgba(59,130,246,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Ribbon Base -->
  <rect width="1024" height="256" fill="url(#bgGrad)"/>
  <rect width="1024" height="256" fill="url(#weave)"/>

  <!-- Top and Bottom Reinforced Stitched Seams -->
  <line x1="0" y1="28" x2="1024" y2="28" stroke="#1d4ed8" stroke-width="3.5" stroke-dasharray="12, 6"/>
  <line x1="0" y1="228" x2="1024" y2="228" stroke="#1d4ed8" stroke-width="3.5" stroke-dasharray="12, 6"/>

  <!-- Outer Protective Edges -->
  <line x1="0" y1="6" x2="1024" y2="6" stroke="rgba(59, 130, 246, 0.3)" stroke-width="2"/>
  <line x1="0" y1="250" x2="1024" y2="250" stroke="rgba(59, 130, 246, 0.3)" stroke-width="2"/>

  <!-- Center Branded Identity Typography -->
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="34" text-anchor="middle" letter-spacing="4">
    <text x="512" y="142" fill="#F8FAFC">
      MEDHAVI AGRAWAL <tspan fill="#3B82F6">✦</tspan> THE ANALYST'S DESK <tspan fill="#3B82F6">✦</tspan>
    </text>
  </g>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('build-lanyard/src/lanyard.png')
  .then(() => {
    fs.copyFileSync('build-lanyard/src/lanyard.png', 'Files/lanyard/lanyard.png');
    console.log('Successfully generated clean custom lanyard.png with no logo!');
  })
  .catch(err => console.error(err));
