// Every scene is drawn from scratch on a 2D canvas — no image files, no
// network. Each scene painter takes two sets of difference ids:
//   hidden  — "remove" differences: drawn on the left panel, omitted here
//   changed — "add"/"change" differences: drawn (or drawn differently) here
// The left panel is always drawn with both sets empty; the right panel with
// hidden = remove-diffs and changed = add/change-diffs. Panel size 560x420.
import { scatter } from './rng.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function poly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

function sparkle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function flower(ctx, x, y, petal, center) {
  ctx.strokeStyle = '#2c5a34';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 14);
  ctx.stroke();
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5);
  }
  ctx.fillStyle = center;
  circle(ctx, x, y, 4);
}

function koi(ctx, x, y, flip) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = '#ff8c42';
  ellipse(ctx, 0, 0, 16, 7);
  poly(ctx, [[-14, 0], [-24, -8], [-24, 8]]);
  ctx.fillStyle = '#fff';
  circle(ctx, 8, -2, 2.5);
  ctx.fillStyle = '#222';
  circle(ctx, 9, -2, 1.2);
  ctx.restore();
}

function bird(ctx, x, y, s = 1) {
  ctx.strokeStyle = '#22303a';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.arc(x - 6 * s, y, 6 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 6 * s, y, 6 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function sittingCat(ctx, x, y, body, withBow) {
  ctx.fillStyle = body;
  ellipse(ctx, x, y + 18, 26, 20); // body
  circle(ctx, x, y - 4, 14); // head
  poly(ctx, [[x - 12, y - 12], [x - 8, y - 26], [x - 2, y - 14]]); // ear L
  poly(ctx, [[x + 12, y - 12], [x + 8, y - 26], [x + 2, y - 14]]); // ear R
  ctx.strokeStyle = body;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x + 24, y + 26, 12, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  if (withBow) {
    ctx.fillStyle = '#d94f3d';
    poly(ctx, [[x, y + 8], [x - 12, y + 2], [x - 12, y + 14]]);
    poly(ctx, [[x, y + 8], [x + 12, y + 2], [x + 12, y + 14]]);
    circle(ctx, x, y + 8, 3);
  }
}

// ---------------------------------------------------------------- garden ---
function drawGarden(ctx, hidden, changed) {
  // Dusk sky
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#2b2350');
  sky.addColorStop(0.6, '#6a4a72');
  sky.addColorStop(1, '#e8825a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 560, 260);

  // Stars (one named star can blink out)
  ctx.fillStyle = '#ffeec2';
  for (const s of scatter(7, 22, 20, 15, 540, 150)) circle(ctx, s.x, s.y, s.r);
  if (!hidden.has('star-missing')) sparkle(ctx, 120, 50, 7, '#fff3c4');

  // Moon: full on the left, crescent on the right
  ctx.fillStyle = '#f7e9b0';
  circle(ctx, 470, 60, 26);
  ctx.fillStyle = '#c9a86a';
  circle(ctx, 462, 54, 4);
  circle(ctx, 478, 68, 3);
  if (changed.has('moon-phase')) {
    ctx.fillStyle = '#2b2350';
    circle(ctx, 482, 54, 24);
  }

  // Clouds
  ctx.fillStyle = 'rgba(233, 190, 160, 0.55)';
  ellipse(ctx, 150, 90, 52, 14);
  ellipse(ctx, 180, 98, 40, 12);
  ellipse(ctx, 350, 60, 44, 11);

  // Distant hills
  ctx.fillStyle = '#3a2c4e';
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.quadraticCurveTo(140, 190, 300, 245);
  ctx.quadraticCurveTo(430, 280, 560, 235);
  ctx.lineTo(560, 260);
  ctx.lineTo(0, 260);
  ctx.fill();

  // Cottage with a window that can go dark
  ctx.fillStyle = '#7a4a32';
  ctx.fillRect(380, 200, 76, 56);
  ctx.fillStyle = '#5a3423';
  poly(ctx, [[372, 202], [418, 172], [464, 202]]);
  ctx.fillStyle = changed.has('window-dark') ? '#241d33' : '#ffd76a';
  ctx.fillRect(402, 220, 24, 28);
  ctx.strokeStyle = '#5a3423';
  ctx.lineWidth = 2;
  ctx.strokeRect(402, 220, 24, 28);
  ctx.beginPath();
  ctx.moveTo(414, 220);
  ctx.lineTo(414, 248);
  ctx.stroke();

  // Garden wall
  ctx.fillStyle = '#8a5a3c';
  ctx.fillRect(0, 252, 560, 14);
  ctx.fillStyle = '#a06a48';
  ctx.fillRect(0, 252, 560, 5);

  // Ground
  const ground = ctx.createLinearGradient(0, 266, 0, 420);
  ground.addColorStop(0, '#46682f');
  ground.addColorStop(1, '#2c4a20');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 266, 560, 154);

  // Tree (a bird may land in it)
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(58, 180, 16, 90);
  ctx.fillStyle = '#2c5a34';
  circle(ctx, 66, 150, 52);
  circle(ctx, 116, 168, 38);
  circle(ctx, 26, 176, 34);
  ctx.fillStyle = '#3a7040';
  circle(ctx, 52, 132, 26);
  if (changed.has('bird-on-tree')) bird(ctx, 96, 150, 1.1);

  // Pond with lily pads and koi
  ctx.fillStyle = '#3a6ea8';
  ellipse(ctx, 150, 360, 112, 34);
  ctx.fillStyle = '#2c5a8a';
  ellipse(ctx, 150, 366, 100, 26);
  ctx.fillStyle = '#3f7a3a';
  ellipse(ctx, 108, 352, 20, 8);
  ellipse(ctx, 172, 372, 22, 8);
  ellipse(ctx, 205, 350, 16, 7);
  ctx.fillStyle = '#e88bb0';
  circle(ctx, 172, 368, 4);
  koi(ctx, 128, 360, false);
  koi(ctx, 178, 366, true);
  if (changed.has('koi-extra')) koi(ctx, 212, 362, false);

  // Lantern posts
  for (const px of [70, 300]) {
    ctx.strokeStyle = '#2c2018';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, 150);
    ctx.lineTo(px, 252);
    ctx.stroke();
  }
  ctx.fillStyle = '#d94f3d';
  rr(ctx, 56, 158, 28, 34, 8);
  ctx.fillStyle = changed.has('lantern-color') ? '#3fb8a6' : '#d94f3d';
  rr(ctx, 286, 154, 28, 34, 8);
  ctx.fillStyle = '#ffd76a';
  circle(ctx, 70, 175, 5);
  circle(ctx, 300, 171, 5);
  ctx.fillStyle = 'rgba(255, 190, 90, 0.18)';
  circle(ctx, 70, 175, 26);
  circle(ctx, 300, 171, 26);

  // Flower row (one can vanish)
  const petals = ['#e88bb0', '#ffd23d', '#fff', '#c9a0ff', '#ff8c42', '#e88bb0', '#ffd23d', '#fff'];
  const fx = [60, 120, 180, 240, 300, 360, 420, 480];
  fx.forEach((x, i) => {
    if (x === 240 && hidden.has('flower-missing')) return;
    flower(ctx, x, 396, petals[i], '#7a4a12');
  });

  // Cat on the grass (may wear a bow)
  sittingCat(ctx, 468, 338, '#3a3a44', changed.has('cat-bow'));
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, 463, 334, 1.6);
  circle(ctx, 473, 334, 1.6);

  // Fireflies
  ctx.fillStyle = '#ffe98a';
  for (const f of scatter(21, 6, 240, 280, 540, 340)) {
    ctx.globalAlpha = 0.85;
    circle(ctx, f.x, f.y, 2.2);
  }
  ctx.globalAlpha = 1;

  // Stepping stones
  ctx.fillStyle = '#8a7a62';
  ellipse(ctx, 300, 404, 18, 6);
  ellipse(ctx, 340, 412, 16, 5);
  ellipse(ctx, 262, 412, 14, 5);
}

// ---------------------------------------------------------------- harbor ---
function drawHarbor(ctx, hidden, changed) {
  // Morning sky
  const sky = ctx.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, '#8ec3e8');
  sky.addColorStop(1, '#e8f2f0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 560, 240);

  // Sun
  ctx.fillStyle = '#ffd76a';
  circle(ctx, 90, 60, 24);
  ctx.strokeStyle = 'rgba(255, 215, 106, 0.8)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(90 + Math.cos(a) * 30, 60 + Math.sin(a) * 30);
    ctx.lineTo(90 + Math.cos(a) * 40, 60 + Math.sin(a) * 40);
    ctx.stroke();
  }

  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ellipse(ctx, 220, 60, 46, 13);
  ellipse(ctx, 250, 68, 34, 10);
  ellipse(ctx, 420, 100, 40, 11);

  // Gulls (one may fly away)
  if (!hidden.has('gull-missing')) bird(ctx, 260, 70, 1);
  bird(ctx, 200, 90, 0.9);
  bird(ctx, 340, 100, 0.9);

  // Sea
  const sea = ctx.createLinearGradient(0, 240, 0, 420);
  sea.addColorStop(0, '#3a7eae');
  sea.addColorStop(1, '#1d4e74');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 240, 560, 180);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[60, 280, 70], [200, 310, 90], [360, 290, 80], [120, 360, 80], [300, 380, 90], [460, 350, 70]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 6, wx + wl, wy);
    ctx.stroke();
  }

  // Jumping fish (may be gone)
  if (!hidden.has('fish-jump')) {
    ctx.strokeStyle = '#cfe8f5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(250, 252, 12, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#7fb8d8';
    poly(ctx, [[262, 244], [272, 240], [266, 250]]);
  }

  // Sailboats
  function sailboat(x, y, sail) {
    ctx.fillStyle = '#6a4a2c';
    poly(ctx, [[x - 34, y], [x + 34, y], [x + 24, y + 14], [x - 24, y + 14]]);
    ctx.strokeStyle = '#4a3220';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 52);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = sail;
    poly(ctx, [[x + 3, y - 50], [x + 3, y - 4], [x + 34, y - 4]]);
    ctx.fillStyle = '#f2ead8';
    poly(ctx, [[x - 3, y - 44], [x - 3, y - 4], [x - 26, y - 4]]);
  }
  sailboat(150, 268, '#f2ead8');
  sailboat(330, 276, changed.has('sail-color') ? '#ffd23d' : '#d94f3d');

  // Lighthouse (beam and flag can change)
  ctx.fillStyle = '#f2ead8';
  poly(ctx, [[458, 300], [466, 108], [486, 108], [494, 300]]);
  ctx.fillStyle = '#d94f3d';
  poly(ctx, [[461, 250], [463, 220], [489, 220], [491, 250]]);
  poly(ctx, [[463, 180], [465, 150], [487, 150], [489, 180]]);
  ctx.fillStyle = '#33414e';
  ctx.fillRect(460, 96, 32, 16);
  ctx.fillStyle = hidden.has('lighthouse-beam') ? '#5a6a78' : '#ffe98a';
  circle(ctx, 476, 104, 7);
  if (!hidden.has('lighthouse-beam')) {
    ctx.fillStyle = 'rgba(255, 233, 138, 0.22)';
    poly(ctx, [[462, 100], [300, 60], [300, 140]]);
  }
  ctx.strokeStyle = '#33414e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(476, 96);
  ctx.lineTo(476, 66);
  ctx.stroke();
  if (!hidden.has('flag')) {
    ctx.fillStyle = '#d94f3d';
    poly(ctx, [[476, 66], [500, 72], [476, 80]]);
  }

  // Buoy (can change colour)
  ctx.fillStyle = changed.has('buoy-stripe') ? '#3fae6a' : '#e8722a';
  rr(ctx, 420, 322, 20, 22, 6);
  ctx.fillStyle = '#f2ead8';
  ctx.fillRect(420, 330, 20, 6);
  ctx.fillStyle = '#33414e';
  circle(ctx, 430, 320, 3);

  // Pier
  ctx.fillStyle = '#7a5a38';
  ctx.fillRect(0, 306, 560, 24);
  ctx.fillStyle = '#8a6a44';
  ctx.fillRect(0, 306, 560, 6);
  ctx.strokeStyle = '#5a4026';
  ctx.lineWidth = 2;
  for (let x = 40; x < 560; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 306);
    ctx.lineTo(x, 330);
    ctx.stroke();
  }

  // Crates (one extra can appear)
  ctx.fillStyle = '#b98a4a';
  ctx.fillRect(86, 278, 28, 28);
  ctx.fillRect(116, 278, 28, 28);
  ctx.strokeStyle = '#7a5a28';
  ctx.lineWidth = 2;
  ctx.strokeRect(86, 278, 28, 28);
  ctx.strokeRect(116, 278, 28, 28);
  if (changed.has('crate-extra')) {
    ctx.fillStyle = '#b98a4a';
    ctx.fillRect(101, 250, 28, 28);
    ctx.strokeRect(101, 250, 28, 28);
  }

  // Fisherman's hut (window can open)
  ctx.fillStyle = '#b98a5a';
  ctx.fillRect(36, 208, 68, 52);
  ctx.fillStyle = '#8a5a34';
  poly(ctx, [[28, 210], [70, 182], [112, 210]]);
  ctx.fillStyle = changed.has('hut-window') ? '#3a2c20' : '#bfe3f0';
  ctx.fillRect(58, 222, 22, 20);
  ctx.strokeStyle = '#6a4526';
  ctx.lineWidth = 2;
  ctx.strokeRect(58, 222, 22, 20);
}

// ---------------------------------------------------------------- market ---
function drawMarket(ctx, hidden, changed) {
  // Night sky
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#1d1440');
  sky.addColorStop(1, '#4a2560');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 560, 260);
  ctx.fillStyle = '#ffeec2';
  for (const s of scatter(31, 18, 20, 15, 540, 130)) circle(ctx, s.x, s.y, s.r);

  // Moon: full on the left, crescent on the right
  ctx.fillStyle = '#f7e9b0';
  circle(ctx, 80, 55, 18);
  if (changed.has('moon-phase')) {
    ctx.fillStyle = '#1d1440';
    circle(ctx, 88, 50, 16);
  }

  // String lights across the top (one bulb can go dark)
  ctx.strokeStyle = '#1a1026';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 30);
  ctx.quadraticCurveTo(280, 78, 550, 30);
  ctx.stroke();
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const x = 10 + t * 540;
    const y = 30 + Math.sin(t * Math.PI) * 34 + 6;
    const dark = changed.has('bulb-out') && i === 6;
    ctx.fillStyle = dark ? '#3a2c4e' : ['#ffd76a', '#ff8c42', '#7fd4a8', '#e88bb0'][i % 4];
    circle(ctx, x, y, 5);
    if (!dark) {
      ctx.fillStyle = 'rgba(255, 220, 130, 0.18)';
      circle(ctx, x, y, 11);
    }
  }

  // Bunting flags (one can change colour)
  const flagColors = ['#ffd23d', '#d94f3d', '#7fd4a8', '#5aa8e8'];
  for (let i = 0; i < 10; i++) {
    const x = 70 + i * 44;
    let c = flagColors[i % 4];
    if (changed.has('flag-color') && i === 3) c = '#3fae6a';
    ctx.fillStyle = c;
    poly(ctx, [[x, 148], [x + 26, 148], [x + 13, 172]]);
  }

  // Hanging lantern (can be gone)
  if (!hidden.has('lantern-missing')) {
    ctx.strokeStyle = '#1a1026';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 96);
    ctx.lineTo(350, 106);
    ctx.stroke();
    ctx.fillStyle = '#d94f3d';
    rr(ctx, 338, 106, 24, 28, 8);
    ctx.fillStyle = '#ffd76a';
    circle(ctx, 350, 120, 4);
  }
  ctx.fillStyle = '#e8722a';
  rr(ctx, 108, 108, 22, 26, 8);
  ctx.fillStyle = '#ffd76a';
  circle(ctx, 119, 121, 4);

  // Ground
  ctx.fillStyle = '#2c2233';
  ctx.fillRect(0, 360, 560, 60);
  ctx.fillStyle = '#3a2c44';
  for (let x = 20; x < 560; x += 46) ellipse(ctx, x, 392, 16, 5);

  // Stall A — tea stall with jars (one extra can appear)
  ctx.fillStyle = '#6a4a72';
  ctx.fillRect(60, 240, 160, 120);
  ctx.fillStyle = '#8a5a8a';
  ctx.fillRect(60, 240, 160, 10);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? '#f2ead8' : '#d94f3d';
    poly(ctx, [[60 + i * 40, 214], [60 + i * 40 + 40, 214], [60 + i * 40 + 34, 240], [60 + i * 40 + 6, 240]]);
  }
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(96, 252, 88, 20);
  ctx.fillStyle = '#3a2c20';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('TEA · KOPI', 140, 266);
  const jarColors = ['#7fb8d8', '#e88bb0', '#7fd4a8'];
  [96, 128, 160].forEach((x, i) => {
    ctx.fillStyle = jarColors[i];
    rr(ctx, x, 292, 20, 26, 5);
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(x, 292, 20, 5);
  });
  if (changed.has('jar-extra')) {
    ctx.fillStyle = '#ffd23d';
    rr(ctx, 182, 292, 20, 26, 5);
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(182, 292, 20, 5);
  }

  // Stall B — snack stall (awning can change colour)
  ctx.fillStyle = '#4a5a72';
  ctx.fillRect(330, 240, 170, 120);
  ctx.fillStyle = '#5a6a8a';
  ctx.fillRect(330, 240, 170, 10);
  const awn = changed.has('awning-stripe') ? '#7a4a9e' : '#3fb8a6';
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? '#f2ead8' : awn;
    poly(ctx, [[330 + i * 43, 214], [330 + i * 43 + 43, 214], [330 + i * 43 + 36, 240], [330 + i * 43 + 7, 240]]);
  }
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(370, 252, 90, 20);
  ctx.fillStyle = '#3a2c20';
  ctx.fillText('SNACKS', 415, 266);
  ctx.fillStyle = '#e8722a';
  for (const x of [360, 400, 440]) {
    circle(ctx, x, 300, 12);
    ctx.fillStyle = '#c95a1e';
    circle(ctx, x, 300, 5);
    ctx.fillStyle = '#e8722a';
  }

  // Balloons (one can float off)
  ctx.strokeStyle = 'rgba(242,234,216,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(492, 130);
  ctx.lineTo(480, 108);
  ctx.moveTo(492, 130);
  ctx.lineTo(506, 100);
  ctx.moveTo(492, 130);
  ctx.lineTo(500, 122);
  ctx.stroke();
  ctx.fillStyle = '#d94f3d';
  ellipse(ctx, 480, 96, 12, 15);
  ctx.fillStyle = '#5aa8e8';
  ellipse(ctx, 508, 86, 12, 15);
  if (!hidden.has('balloon-missing')) {
    ctx.fillStyle = '#ffd23d';
    ellipse(ctx, 500, 108, 12, 15);
  }

  // Market cat asleep on a crate (may wake up)
  ctx.fillStyle = '#8a6a44';
  ctx.fillRect(252, 344, 58, 30);
  ctx.strokeStyle = '#5a4026';
  ctx.lineWidth = 2;
  ctx.strokeRect(252, 344, 58, 30);
  ctx.beginPath();
  ctx.moveTo(281, 344);
  ctx.lineTo(281, 374);
  ctx.stroke();
  ctx.fillStyle = '#e8a34a';
  ellipse(ctx, 281, 340, 26, 12);
  circle(ctx, 281, 326, 12);
  poly(ctx, [[272, 318], [276, 306], [282, 316]]);
  poly(ctx, [[290, 318], [286, 306], [280, 316]]);
  if (changed.has('cat-eyes')) {
    ctx.fillStyle = '#222';
    circle(ctx, 277, 326, 1.8);
    circle(ctx, 285, 326, 1.8);
  } else {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(277, 326, 3, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(285, 326, 3, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  if (!changed.has('cat-eyes')) {
    ctx.fillStyle = '#fff';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('z z z', 306, 322);
  }
}

// The scene painters, keyed by level id.
export const SCENES = { garden: drawGarden, harbor: drawHarbor, market: drawMarket };

// Draw one panel: side 'left' draws the plain scene, side 'right' draws it
// with every difference applied.
export function drawScene(ctx, level, side) {
  const hidden = new Set();
  const changed = new Set();
  if (side === 'right') {
    for (const d of level.diffs) {
      if (d.mode === 'remove') hidden.add(d.id);
      else changed.add(d.id);
    }
  }
  ctx.clearRect(0, 0, 560, 420);
  SCENES[level.id](ctx, hidden, changed);
}
