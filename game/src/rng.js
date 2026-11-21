// A tiny deterministic random generator (mulberry32) so every scene renders
// exactly the same way on every load: the game never depends on Math.random
// for anything the player sees, only for picking which hint to show.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Scatter n points inside a rectangle with a fixed seed.
export function scatter(seed, n, x0, y0, x1, y1) {
  const rand = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push({ x: x0 + rand() * (x1 - x0), y: y0 + rand() * (y1 - y0), r: 0.6 + rand() * 1.4 });
  }
  return pts;
}
