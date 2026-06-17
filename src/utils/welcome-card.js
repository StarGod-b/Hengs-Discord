// ─── welcome-card.js ──────────────────────────────────────────────────────
// Welcome / leave card — dark cosmic design: starfield + member "planet" badge.

let canvasLib;
try { canvasLib = require('@napi-rs/canvas'); } catch { canvasLib = null; }

// Sparkle bintang 4-sudut + glow
function drawSparkle(ctx, x, y, s, accent) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.4, accent + 'aa');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, s * 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.26, y - s * 0.26);
  ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.26, y + s * 0.26);
  ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.26, y + s * 0.26);
  ctx.lineTo(x - s, y); ctx.lineTo(x - s * 0.26, y - s * 0.26);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Taburan bintang halus acak
function drawStars(ctx, W, H) {
  for (let i = 0; i < 95; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.5 + 0.06).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(x, y, Math.random() * 1.2 + 0.3, 0, Math.PI * 2); ctx.fill();
  }
}

async function generateCard(member, type = 'welcome') {
  if (!canvasLib) return null;
  const { createCanvas, loadImage } = canvasLib;
  const isLeave = type === 'leave';

  const W = 900, H = 280;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const accent = isLeave ? '#E53935' : '#5865F2';
  const accRgb = isLeave ? '229,57,53' : '88,101,242';
  const glow   = (a) => `rgba(${accRgb},${a})`;

  // Clip seluruh kartu jadi rounded rect
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 18); ctx.clip();

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (isLeave) { bg.addColorStop(0, '#0d0507'); bg.addColorStop(0.5, '#1a0c0c'); bg.addColorStop(1, '#0d0507'); }
  else { bg.addColorStop(0, '#050916'); bg.addColorStop(0.5, '#0c1730'); bg.addColorStop(1, '#050916'); }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Posisi "planet" member-count (fokus kanan)
  const pcx = 716, pcy = 132, pr = 58;

  // Glow besar di belakang planet (ngisi area kanan)
  const og = ctx.createRadialGradient(pcx, pcy, 0, pcx, pcy, 240);
  og.addColorStop(0, glow(0.22)); og.addColorStop(1, glow(0));
  ctx.fillStyle = og; ctx.fillRect(0, 0, W, H);

  // Starfield + sparkle
  drawStars(ctx, W, H);
  for (const [x, y, s] of [[835, 55, 8], [625, 62, 5], [868, 150, 6], [600, 205, 4.5], [820, 222, 5.5]]) {
    drawSparkle(ctx, x, y, s, accent);
  }

  // Left accent bar
  const barG = ctx.createLinearGradient(0, 0, 0, H);
  barG.addColorStop(0, accent); barG.addColorStop(0.5, accent + 'bb'); barG.addColorStop(1, accent);
  ctx.fillStyle = barG; ctx.beginPath(); ctx.roundRect(0, 0, 7, H, [18, 0, 0, 18]); ctx.fill();

  // ── Member "planet" badge (kanan) ──
  const plg = ctx.createRadialGradient(pcx, pcy, pr - 12, pcx, pcy, pr + 30);
  plg.addColorStop(0, glow(0.38)); plg.addColorStop(1, glow(0));
  ctx.fillStyle = plg; ctx.beginPath(); ctx.arc(pcx, pcy, pr + 30, 0, Math.PI * 2); ctx.fill();
  // orbit ring + dots
  ctx.strokeStyle = glow(0.4); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(pcx, pcy, pr + 16, 0, Math.PI * 2); ctx.stroke();
  for (const a of [-0.7, 2.1, 4.0]) {
    const ox = pcx + Math.cos(a) * (pr + 16), oy = pcy + Math.sin(a) * (pr + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(ox, oy, 2.4, 0, Math.PI * 2); ctx.fill();
  }
  // planet body
  const pb = ctx.createLinearGradient(pcx - pr, pcy - pr, pcx + pr, pcy + pr);
  pb.addColorStop(0, accent); pb.addColorStop(1, isLeave ? '#6e1a1a' : '#26307a');
  ctx.fillStyle = pb; ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(pcx, pcy, pr - 4, 0, Math.PI * 2); ctx.stroke();
  // teks di dalam planet
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.font = 'bold 12px sans-serif';
  ctx.fillText(isLeave ? 'REMAINING' : 'MEMBER NO.', pcx, pcy - 20);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 38px sans-serif';
  ctx.fillText(`#${member.guild.memberCount.toLocaleString()}`, pcx, pcy + 9);

  // ── Avatar (kiri) ──
  const cx = 150, cy = H / 2, r = 84;
  const ah = ctx.createRadialGradient(cx, cy, r - 10, cx, cy, r + 38);
  ah.addColorStop(0, glow(0.3)); ah.addColorStop(1, glow(0));
  ctx.fillStyle = ah; ctx.beginPath(); ctx.arc(cx, cy, r + 38, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.stroke();
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  try {
    const url = member.user.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true });
    const img = await loadImage(url);
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  } catch {
    ctx.fillStyle = accent; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((member.user.username[0] || '?').toUpperCase(), cx, cy);
  }
  ctx.restore();

  // ── Teks (tengah) ──
  const tx = 268;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const serverName = member.guild.name.length > 24 ? member.guild.name.slice(0, 24) + '…' : member.guild.name;
  ctx.fillStyle = accent; ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`${isLeave ? 'GOODBYE' : 'WELCOME'}  ·  ${serverName.toUpperCase()}`, tx, 70);

  const username = member.user.username;
  const dispU = username.length > 15 ? username.slice(0, 15) + '…' : username;
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 40px sans-serif';
  ctx.fillText(dispU, tx, 116);

  const hasDN = member.displayName !== username;
  if (hasDN) {
    const dn = member.displayName.length > 18 ? member.displayName.slice(0, 18) + '…' : member.displayName;
    ctx.fillStyle = 'rgba(180,195,255,0.9)'; ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`@${dn}`, tx, 143);
  }
  const subY = hasDN ? 176 : 154;
  ctx.fillStyle = '#aab3c5'; ctx.font = '19px sans-serif';
  ctx.fillText(isLeave ? "We'll miss you!" : "Glad you're here!", tx, subY);

  // Account age + tanggal — bawah-kiri, subtle (tanpa emoji biar nggak jadi kotak)
  const days = Math.floor((Date.now() - member.user.createdAt.getTime()) / 86400000);
  const ageStr = days >= 365
    ? `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m`
    : `${days}d`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  ctx.fillStyle = 'rgba(255,255,255,0.34)'; ctx.font = '12px sans-serif';
  ctx.fillText(`${dateStr}   ·   Account ${ageStr} old`, tx, H - 28);

  return canvas.toBuffer('image/png');
}

module.exports = { generateCard };
