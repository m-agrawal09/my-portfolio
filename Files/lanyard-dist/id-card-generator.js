// Generates ultra high-resolution, crystal-clear ID card front and back textures for the 3D Lanyard
export async function generateIdCardTextures(profileImgSrc = 'Files/Profile.jpg') {
  // Ensure custom webfonts are fully loaded before rasterizing canvas to avoid blurry fallback text
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if font loading ready promise is delayed
    }
  }

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
  const W = 1600;
  const H = 2400;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Deep obsidian luxury gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0D1424');
  bgGrad.addColorStop(0.4, '#090E1A');
  bgGrad.addColorStop(1, '#05070D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle precision grid pattern
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
  ctx.lineWidth = 1.5;
  const step = 48;
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

  // Outer border with smooth rounded corners
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 4;
  roundRect(ctx, 36, 36, W - 72, H - 72, 48);
  ctx.stroke();

  // Subtle interior cyan glow line
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
  ctx.lineWidth = 2;
  roundRect(ctx, 44, 44, W - 88, H - 88, 42);
  ctx.stroke();

  // Top lanyard slot (physical badge cutout look)
  ctx.fillStyle = '#04060B';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  roundRect(ctx, W / 2 - 120, 56, 240, 36, 18);
  ctx.fill();
  ctx.stroke();

  // Clean vibrant header accent line
  const headerGrad = ctx.createLinearGradient(140, 130, W - 140, 130);
  headerGrad.addColorStop(0, '#06B6D4');
  headerGrad.addColorStop(0.5, '#3B82F6');
  headerGrad.addColorStop(1, '#6366F1');
  ctx.fillStyle = headerGrad;
  roundRect(ctx, 140, 130, W - 280, 5, 2.5);
  ctx.fill();

  // Minimal brand header mark (Clean, no cheesy pass boilerplate)
  ctx.font = '600 32px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#93C5FD';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText("◈  THE ANALYST'S DESK  ◈", W / 2, 190);

  // Photo Frame Setup
  const pw = 1040;
  const ph = 1120;
  const px = (W - pw) / 2;
  const py = 230;

  // Photo outer glow & smooth frame
  ctx.save();
  ctx.shadowColor = 'rgba(37, 99, 235, 0.28)';
  ctx.shadowBlur = 32;
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
  ctx.lineWidth = 3.5;
  roundRect(ctx, px, py, pw, ph, 26);
  ctx.stroke();
  ctx.restore();

  // Draw portrait with perfect aspect-ratio cover fitting inside clipping mask
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, px + 3, py + 3, pw - 6, ph - 6, 23);
  ctx.clip();
  drawImageCover(ctx, profileImg, px + 3, py + 3, pw - 6, ph - 6);
  ctx.restore();

  // Corner precision tech ticks
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 4;
  const tickLen = 28;
  // Top left
  ctx.beginPath();
  ctx.moveTo(px - 8, py + tickLen);
  ctx.lineTo(px - 8, py - 8);
  ctx.lineTo(px + tickLen, py - 8);
  ctx.stroke();
  // Top right
  ctx.beginPath();
  ctx.moveTo(px + pw + 8 - tickLen, py - 8);
  ctx.lineTo(px + pw + 8, py - 8);
  ctx.lineTo(px + pw + 8, py + tickLen);
  ctx.stroke();
  // Bottom left
  ctx.beginPath();
  ctx.moveTo(px - 8, py + ph - tickLen);
  ctx.lineTo(px - 8, py + ph + 8);
  ctx.lineTo(px + tickLen, py + ph + 8);
  ctx.stroke();
  // Bottom right
  ctx.beginPath();
  ctx.moveTo(px + pw + 8 - tickLen, py + ph + 8);
  ctx.lineTo(px + pw + 8, py + ph + 8);
  ctx.lineTo(px + pw + 8, py + ph - tickLen);
  ctx.stroke();

  // Identity Section: Name
  const ty = py + ph + 90;
  ctx.font = '800 68px "Manrope", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('MEDHAVI AGRAWAL', W / 2, ty);

  // Role Pill Badge
  const pillW = 460;
  const pillH = 64;
  const pillX = (W - pillW) / 2;
  const pillY = ty + 24;
  ctx.fillStyle = 'rgba(23, 105, 255, 0.16)';
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 2.5;
  roundRect(ctx, pillX, pillY, pillW, pillH, 32);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 28px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#60A5FA';
  ctx.letterSpacing = '3px';
  ctx.fillText('DATA ANALYST', W / 2, pillY + 43);

  // High-impact Key Credentials (clean & concise)
  const metaY = pillY + 115;
  ctx.font = '600 28px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#F1F5F9';
  ctx.letterSpacing = '1px';
  ctx.fillText('MITS GWALIOR · CGPA 9.84 (RANK 1)', W / 2, metaY);

  ctx.font = '600 25px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#34D399';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('TOP 30 · KSP DATATHON 2026', W / 2, metaY + 48);

  // Sleek Divider Rule
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(180, metaY + 95);
  ctx.lineTo(W - 180, metaY + 95);
  ctx.stroke();

  // Minimalist crisp barcode
  const bY = metaY + 130;
  const bH = 80;
  const bW = 880;
  const bX = (W - bW) / 2;
  drawBarcode(ctx, bX, bY, bW, bH);

  // Clean status footer (Removed all fake auth codes)
  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '3px';
  ctx.fillText('VERIFIED DATA ANALYST CREDENTIAL · 2026', W / 2, bY + bH + 40);

  return canvas.toDataURL('image/png');
}

function drawBackCard() {
  const W = 1600;
  const H = 2400;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Deep slate background
  ctx.fillStyle = '#070B13';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // Top Magnetic Stripe with metallic highlight
  ctx.fillStyle = '#020408';
  ctx.fillRect(0, 160, W, 220);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fillRect(0, 160, W, 6);
  ctx.fillRect(0, 374, W, 6);

  // Outer Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 4;
  roundRect(ctx, 36, 36, W - 72, H - 72, 48);
  ctx.stroke();

  // Top lanyard slot
  ctx.fillStyle = '#04060B';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  roundRect(ctx, W / 2 - 120, 56, 240, 36, 18);
  ctx.fill();
  ctx.stroke();

  // Holographic Iridescent Security Seal
  const hx = W / 2 - 110;
  const hy = 440;
  const hw = 220;
  const hh = 220;
  const hg = ctx.createLinearGradient(hx, hy, hx + hw, hy + hh);
  hg.addColorStop(0, '#06B6D4');
  hg.addColorStop(0.3, '#3B82F6');
  hg.addColorStop(0.7, '#8B5CF6');
  hg.addColorStop(1, '#10B981');
  ctx.fillStyle = hg;
  roundRect(ctx, hx, hy, hw, hh, 24);
  ctx.fill();

  // Micro security ring inside hologram
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(W / 2, hy + hh / 2, 70, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = '800 58px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('MA', W / 2, hy + hh / 2 + 20);

  // Section Header: Core Competencies
  ctx.font = '800 48px "Manrope", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '1px';
  ctx.fillText('CORE COMPETENCIES', W / 2, 750);

  ctx.font = '500 24px "Inter", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Technical Stack & Analytical Methods', W / 2, 796);

  // Competencies Container Box
  const boxW = W - 280;
  const boxH = 430;
  const boxX = 140;
  const boxY = 850;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 2.5;
  roundRect(ctx, boxX, boxY, boxW, boxH, 20);
  ctx.fill();
  ctx.stroke();

  const skills = [
    { num: '01', title: 'Power BI DAX & Interactive Dashboards' },
    { num: '02', title: 'SQL Data Modeling, Complex Queries & ETL' },
    { num: '03', title: 'Python Statistical Computing & Predictive ML' },
    { num: '04', title: 'Business Intelligence & Executive Storytelling' }
  ];

  skills.forEach((s, idx) => {
    const rowY = boxY + 55 + idx * 88;
    // Row background highlight
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent';
    roundRect(ctx, boxX + 16, rowY - 32, boxW - 32, 68, 10);
    ctx.fill();

    // Number badge
    ctx.font = '700 24px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.textAlign = 'left';
    ctx.fillText(s.num, boxX + 40, rowY + 12);

    // Skill title
    ctx.font = '500 28px "Inter", sans-serif';
    ctx.fillStyle = '#F1F5F9';
    ctx.fillText(s.title, boxX + 110, rowY + 12);
  });

  // Portfolio Verification URL Pill
  const pillW = 680;
  const pillH = 60;
  const pillX = (W - pillW) / 2;
  const pillY = 1340;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.lineWidth = 2;
  roundRect(ctx, pillX, pillY, pillW, pillH, 30);
  ctx.fill();
  ctx.stroke();

  ctx.font = '600 25px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('m-agrawal09.vercel.app', W / 2, pillY + 40);

  // Clean Signature Stripe
  const sigY = 1450;
  ctx.fillStyle = '#F8FAFC';
  roundRect(ctx, 260, sigY, W - 520, 85, 10);
  ctx.fill();

  ctx.font = 'italic 46px "Inter", cursive, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Medhavi Agrawal', W / 2, sigY + 59);

  // Micro barcode at bottom
  drawBarcode(ctx, 340, 1600, W - 680, 68);

  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.letterSpacing = '2px';
  ctx.fillText("THE ANALYST'S DESK · PORTFOLIO CREDENTIAL", W / 2, 1720);

  return canvas.toDataURL('image/png');
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgW = img.naturalWidth || img.width || 1;
  const imgH = img.naturalHeight || img.height || 1;
  const scale = Math.max(w / imgW, h / imgH);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (imgW - sw) / 2;
  const sy = (imgH - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawBarcode(ctx, x, y, width, height) {
  ctx.fillStyle = '#FFFFFF';
  const barCount = 60;
  const barWidth = width / barCount;
  for (let i = 0; i < barCount; i++) {
    if ((i * 7 + 13) % 4 !== 0) {
      const isThick = (i % 3 === 0);
      const w = Math.max(2, Math.floor(isThick ? barWidth * 0.75 : barWidth * 0.4));
      const bx = Math.floor(x + i * barWidth);
      ctx.fillRect(bx, Math.floor(y), w, Math.floor(height));
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
