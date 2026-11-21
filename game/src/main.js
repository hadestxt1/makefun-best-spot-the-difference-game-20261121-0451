// Bootstrap: read the URL (?level=0..2, ?found=id,id.., ?win=1 for a finished
// scene), wire the buttons and keys, and start the render loop.
import { LEVELS } from './levels.js';
import { SpotGame } from './game.js';

const els = {
  left: document.getElementById('panel-left'),
  right: document.getElementById('panel-right'),
  foundCount: document.getElementById('found-count'),
  remainingCount: document.getElementById('remaining-count'),
  score: document.getElementById('score'),
  levelName: document.getElementById('level-name'),
  timerBar: document.getElementById('timer-bar'),
  timerText: document.getElementById('timer-text'),
  hintBtn: document.getElementById('hint-btn'),
  soundBtn: document.getElementById('sound-btn'),
  restartBtn: document.getElementById('restart-btn'),
  toast: document.getElementById('toast'),
  overlay: document.getElementById('overlay'),
  overlayTitle: document.getElementById('overlay-title'),
  overlayText: document.getElementById('overlay-text'),
  overlayScore: document.getElementById('overlay-score'),
  overlayBtn: document.getElementById('overlay-btn'),
};

const game = new SpotGame(els);

const params = new URLSearchParams(location.search);
const levelParam = Number.parseInt(params.get('level') ?? '0', 10);
const startLevel = Number.isInteger(levelParam) && levelParam >= 0 && levelParam < LEVELS.length ? levelParam : 0;
const presetFound = (params.get('found') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const showWin = params.get('win') === '1';

game.loadLevel(startLevel, showWin ? LEVELS[startLevel].diffs.map((d) => d.id) : presetFound);
game.start();

els.left.addEventListener('click', (e) => game.clickOn(els.left, e));
els.right.addEventListener('click', (e) => game.clickOn(els.right, e));
els.hintBtn.addEventListener('click', () => game.useHint());
els.soundBtn.addEventListener('click', () => game.toggleSound());
els.restartBtn.addEventListener('click', () => {
  game.score = 0;
  game.loadLevel(game.levelIndex);
});
els.overlayBtn.addEventListener('click', () => game.nextFromOverlay());
document.querySelectorAll('.level-btn').forEach((b) => {
  b.addEventListener('click', () => {
    game.score = 0;
    game.loadLevel(Number(b.dataset.level));
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') game.useHint();
  else if (e.key === 'r' || e.key === 'R') {
    game.score = 0;
    game.loadLevel(game.levelIndex);
  } else if (e.key === 'm' || e.key === 'M') game.toggleSound();
  else if (e.key >= '1' && e.key <= '3') {
    game.score = 0;
    game.loadLevel(Number(e.key) - 1);
  } else if (e.key === 'Enter' && !els.overlay.classList.contains('hidden')) {
    game.nextFromOverlay();
  }
});
