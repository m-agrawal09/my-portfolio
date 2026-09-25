// Generates high-resolution ID card front and back textures for the 3D Lanyard
export function generateIdCardTextures(profileImgSrc = 'Files/Profile.jpg') {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const frontDataUrl = drawFrontCard(img);
      const backDataUrl = drawBackCard();
      resolve({ frontImage: frontDataUrl, backImage: backDataUrl });
    };
    img.onerror = () => {
      // Fallback if image fails to load
      resolve({ frontImage: profileImgSrc, backImage: null });
    };
    img.src = profileImgSrc;
  });
}

function drawFrontCard(profileImg) {
  const W = 1000;
  const H = 1500;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0D121B');
  bgGrad.addColorStop(0.5, '#090D14');
  bgGrad.addColorStop(1, '#06090E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle geometric grid pattern
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < W; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Outer border with subtle rounded corners
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  roundRect(ctx, 24, 24, W - 48, H - 48, 36);
  ctx.stroke();

  // Top lanyard slot (physical badge cutout look)
  ctx.fillStyle = '#05070B';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  roundRect(ctx, W / 2 - 80, 40, 160, 24, 12);
  ctx.fill();
  ctx.stroke();

  // Header banner
  ctx.fillStyle = '#1769FF';
  ctx.fillRect(40, 95, W - 80, 3);

  // Top header text
  ctx.font = '600 24px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#60A5FA';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText("THE ANALYST'S DESK", W / 2, 140);

  ctx.font = '500 18px "Inter", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('IDENTITY ACCESS PASS · 2026', W / 2, 172);

  // Photo Frame
  const pw = 620;
  const ph = 690;
  const px = (W - pw) / 2;
  const py = 205;

  // Photo border & glow
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
  ctx.lineWidth = 3;
  roundRect(ctx, px, py, pw, ph, 20);
  ctx.stroke();

  // Draw photo inside rounded clipping mask
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, px + 2, py + 2, pw - 4, ph - 4, 18);
  ctx.clip();
  ctx.drawImage(profileImg, px, py, pw, ph);
  ctx.restore();

  // Corner tech ticks on photo frame
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 4;
  const tickLen = 20;
  // Top left
  ctx.beginPath();
  ctx.moveTo(px - 6, py + tickLen);
  ctx.lineTo(px - 6, py - 6);
  ctx.lineTo(px + tickLen, py - 6);
  ctx.stroke();
  // Top right
  ctx.beginPath();
  ctx.moveTo(px + pw + 6 - tickLen, py - 6);
  ctx.lineTo(px + pw + 6, py - 6);
  ctx.lineTo(px + pw + 6, py + tickLen);
  ctx.stroke();
  // Bottom left
  ctx.beginPath();
  ctx.moveTo(px - 6, py + ph - tickLen);
  ctx.lineTo(px - 6, py + ph + 6);
  ctx.lineTo(px + tickLen, py + ph + 6);
  ctx.stroke();
  // Bottom right
  ctx.beginPath();
  ctx.moveTo(px + pw + 6 - tickLen, py + ph + 6);
  ctx.lineTo(px + pw + 6, py + ph + 6);
  ctx.lineTo(px + pw + 6, py + ph - tickLen);
  ctx.stroke();

  // Identity Section
  const ty = py + ph + 60;
  ctx.font = '800 48px "Manrope", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('MEDHAVI AGRAWAL', W / 2, ty);

  // Role Pill Badge
  const pillW = 320;
  const pillH = 46;
  const pillX = (W - pillW) / 2;
  const pillY = ty + 20;
  ctx.fillStyle = 'rgba(23, 105, 255, 0.16)';
  ctx.strokeStyle = '#1769FF';
  ctx.lineWidth = 2;
  roundRect(ctx, pillX, pillY, pillW, pillH, 23);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 22px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#60A5FA';
  ctx.textAlign = 'center';
  ctx.fillText('DATA ANALYST', W / 2, pillY + 31);

  // Key Metadata grid
  const metaY = pillY + 95;
  ctx.font = '500 20px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'center';
  ctx.fillText('MITS GWALIOR · CGPA 9.84 (RANK 1)', W / 2, metaY);

  ctx.font = '400 18px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#4ADE80';
  ctx.fillText('ID: DA-2026-09 · TOP 30 KSP DATATHON', W / 2, metaY + 34);

  // Security Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, metaY + 65);
  ctx.lineTo(W - 80, metaY + 65);
  ctx.stroke();

  // Realistic Barcode at bottom
  const bY = metaY + 90;
  const bH = 65;
  const bX = 140;
  const bW = W - 280;
  drawBarcode(ctx, bX, bY, bW, bH);

  ctx.font = '600 15px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('AUTH CODE: 9840-2026-MEDHAVI-INTEL', W / 2, bY + bH + 28);

  return canvas.toDataURL('image/png');
}

function drawBackCard() {
  const W = 1000;
  const H = 1500;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Dark slate background
  ctx.fillStyle = '#080C13';
  ctx.fillRect(0, 0, W, H);

  // Top Magnetic Stripe
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 110, W, 140);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(0, 110, W, 4);

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  roundRect(ctx, 24, 24, W - 48, H - 48, 36);
  ctx.stroke();

  // Top lanyard slot
  ctx.fillStyle = '#05070B';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  roundRect(ctx, W / 2 - 80, 40, 160, 24, 12);
  ctx.fill();
  ctx.stroke();

  // Holographic Security Seal
  const hx = W / 2 - 70;
  const hy = 300;
  const hg = ctx.createLinearGradient(hx, hy, hx + 140, hy + 140);
  hg.addColorStop(0, '#06B6D4');
  hg.addColorStop(0.3, '#3B82F6');
  hg.addColorStop(0.7, '#8B5CF6');
  hg.addColorStop(1, '#10B981');
  ctx.fillStyle = hg;
  roundRect(ctx, hx, hy, 140, 140, 16);
  ctx.fill();

  ctx.font = '700 36px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('MA', W / 2, hy + 85);

  // Back Content
  ctx.font = '700 32px "Manrope", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('DATA INTELLIGENCE WORKSPACE', W / 2, 510);

  ctx.font = '500 20px "Inter", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Personal Analytics & Executive Dossier', W / 2, 550);

  // Skills Table / Box
  const boxW = W - 180;
  const boxH = 260;
  const boxX = 90;
  const boxY = 610;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  roundRect(ctx, boxX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#60A5FA';
  ctx.textAlign = 'left';
  ctx.fillText('CORE COMPETENCIES:', boxX + 30, boxY + 45);

  const skills = [
    '• Business Intelligence & Dashboard Architecture',
    '• SQL Data Modeling, ETL & Complex Analytics',
    '• Python Statistical Computing & Machine Learning',
    '• Power BI DAX & Interactive Storytelling'
  ];

  ctx.font = '400 19px "Inter", sans-serif';
  ctx.fillStyle = '#CBD5E1';
  skills.forEach((s, idx) => {
    ctx.fillText(s, boxX + 30, boxY + 95 + idx * 38);
  });

  // Verification text
  ctx.font = '500 17px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'center';
  ctx.fillText('VERIFIED PORTFOLIO CREDENTIAL', W / 2, 940);
  ctx.fillText('https://m-agrawal09.vercel.app', W / 2, 975);

  // Signature Stripe
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(160, 1030, W - 320, 60);

  ctx.font = 'italic 34px "Inter", cursive, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'center';
  ctx.fillText('Medhavi Agrawal', W / 2, 1072);

  // Security Stamp
  ctx.font = '600 14px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText('AUTHORIZED DATA ANALYST PASS · SYSTEM CLEARANCE', W / 2, 1145);

  // Micro barcode at bottom
  drawBarcode(ctx, 220, 1190, W - 440, 50);

  return canvas.toDataURL('image/png');
}

function drawBarcode(ctx, x, y, width, height) {
  ctx.fillStyle = '#FFFFFF';
  const barCount = 55;
  const barWidth = width / barCount;
  for (let i = 0; i < barCount; i++) {
    // Generate deterministic pattern
    if ((i * 7 + 13) % 4 !== 0) {
      const thickness = (i % 3 === 0) ? barWidth * 0.8 : barWidth * 0.45;
      ctx.fillRect(x + i * barWidth, y, thickness, height);
    }
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
