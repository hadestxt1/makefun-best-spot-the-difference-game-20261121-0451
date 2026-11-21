// The three scenes and their hidden differences. Each difference has a fixed
// spot (x, y, r) in panel coordinates (560 x 420) and a mode:
//   remove — the thing is drawn on the left panel, missing on the right
//   add    — the thing is missing on the left, drawn on the right
//   change — the thing is drawn differently on the right
// The names are the praise the game shows when a player finds one.
export const LEVELS = [
  {
    id: 'garden',
    name: 'Lantern Garden',
    tagline: 'Dusk settles over the old garden. The lanterns are lit, the koi are circling — and eight small things are not the same twice.',
    timeLimit: 180,
    diffs: [
      { id: 'moon-phase', name: 'The moon changed its face', x: 470, y: 60, r: 30, mode: 'change' },
      { id: 'lantern-color', name: 'A lantern changed colour', x: 300, y: 178, r: 26, mode: 'change' },
      { id: 'cat-bow', name: "The cat's new bow", x: 468, y: 338, r: 24, mode: 'add' },
      { id: 'flower-missing', name: 'A garden flower vanished', x: 240, y: 396, r: 18, mode: 'remove' },
      { id: 'koi-extra', name: 'An extra koi in the pond', x: 212, y: 366, r: 22, mode: 'add' },
      { id: 'window-dark', name: 'The cottage window went dark', x: 412, y: 234, r: 20, mode: 'change' },
      { id: 'star-missing', name: 'A star blinked out', x: 120, y: 50, r: 14, mode: 'remove' },
      { id: 'bird-on-tree', name: 'A bird landed in the tree', x: 96, y: 150, r: 18, mode: 'add' },
    ],
  },
  {
    id: 'harbor',
    name: 'Harbor Morning',
    tagline: 'First light on the harbor. Gulls overhead, boats rocking, the lighthouse keeping watch — eight details drifted overnight.',
    timeLimit: 180,
    diffs: [
      { id: 'lighthouse-beam', name: 'The lighthouse beam went out', x: 468, y: 128, r: 32, mode: 'remove' },
      { id: 'sail-color', name: 'A sail changed colour', x: 330, y: 272, r: 26, mode: 'change' },
      { id: 'gull-missing', name: 'A gull flew away', x: 260, y: 70, r: 14, mode: 'remove' },
      { id: 'buoy-stripe', name: 'The buoy changed colour', x: 430, y: 332, r: 18, mode: 'change' },
      { id: 'crate-extra', name: 'An extra crate on the pier', x: 112, y: 262, r: 18, mode: 'add' },
      { id: 'flag', name: 'The lighthouse flag is gone', x: 470, y: 78, r: 16, mode: 'remove' },
      { id: 'hut-window', name: 'The hut window opened', x: 70, y: 224, r: 15, mode: 'change' },
      { id: 'fish-jump', name: 'The jumping fish is gone', x: 250, y: 248, r: 18, mode: 'remove' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'The night market glows: string lights, steaming stalls, a cat asleep on a crate. Eight things shifted while the vendors looked away.',
    timeLimit: 180,
    diffs: [
      { id: 'balloon-missing', name: 'A balloon floated off', x: 500, y: 108, r: 18, mode: 'remove' },
      { id: 'awning-stripe', name: 'A stall awning changed colour', x: 415, y: 214, r: 24, mode: 'change' },
      { id: 'bulb-out', name: 'A string light went dark', x: 280, y: 58, r: 13, mode: 'change' },
      { id: 'cat-eyes', name: 'The market cat woke up', x: 280, y: 330, r: 18, mode: 'change' },
      { id: 'jar-extra', name: 'An extra jar on the stall', x: 182, y: 300, r: 15, mode: 'add' },
      { id: 'flag-color', name: 'A bunting flag changed colour', x: 200, y: 148, r: 14, mode: 'change' },
      { id: 'lantern-missing', name: 'A hanging lantern is gone', x: 350, y: 118, r: 16, mode: 'remove' },
      { id: 'moon-phase', name: 'The moon changed its face', x: 80, y: 55, r: 20, mode: 'change' },
    ],
  },
];
