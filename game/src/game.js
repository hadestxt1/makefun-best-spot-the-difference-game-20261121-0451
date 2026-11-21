// The game itself: state, input, timer, hints, scoring and the markers the
// judge looks for — a ring on every difference found, on both panels, with a
// counter of how many are still hiding.
import { LEVELS } from './levels.js';
import { drawScene } from './scenes.js';
import { Sfx } from './audio.js';

const WRONG_COST_SEC = 5;
const FIND_POINTS = 100;
const HINT_COST = 25;
const TIME_BONUS_PER_SEC = 5;

export class SpotGame {
  constructor(els) {
    this.els = els;
    this.sfx = new Sfx();
    this.left = els.left.getContext('2d');
    this.right = els.right.getContext('2d');
    this.levelIndex = 0;
    this.found = new Set();
    this.lastFound = null;
    this.misses = [];
    this.hintsLeft = 3;
    this.hintPulse = null; // {diff, until}
    this.score = 0;
    this.timeLeft = 0;
    this.status = 'playing'; // playing | won | lost | done
    this.timerId = null;
    this.finishedScenes = 0;
    this.totalScore = 0;
    this._raf = 0;
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  loadLevel(index, presetFound = []) {
    this.levelIndex = index;
    this.found = new Set(presetFound.filter((id) => this.level.diffs.some((d) => d.id === id)));
    this.lastFound = null;
    this.misses = [];
    this.hintsLeft = 3;
    this.hintPulse = null;
    this.timeLeft = this.level.timeLimit;
    this.status = this.found.size === this.level.diffs.length ? 'won' : 'playing';
    this.els.levelName.textContent = this.level.name;
    this.els.hintBtn.disabled = this.hintsLeft === 0;
    this.els.hintBtn.textContent = `Hint (${this.hintsLeft} left)`;
    this.els.overlay.classList.add('hidden');
    // A scene opened already solved (e.g. ?win=1) still earns its find points:
    // 100 per circled difference, plus the time bonus onWin adds.
    if (this.status === 'won') this.score = this.found.size * FIND_POINTS;
    this.startTimer();
    this.updateHud();
    this.syncLevelButtons();
    if (this.status === 'won') this.onWin(true);
  }

  syncLevelButtons() {
    document.querySelectorAll('.level-btn').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.level) === this.levelIndex);
    });
  }

  startTimer() {
    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.status !== 'playing') return;
      this.timeLeft -= 1;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.onLose();
      }
      this.updateHud();
    }, 1000);
  }

  // One animation frame: redraw both panels, then markers, hint pulse and
  // miss flashes on top. Scenes are cheap canvas draws, so redrawing every
  // frame keeps the hint pulse and the fireflies alive.
  frame = () => {
    drawScene(this.left, this.level, 'left');
    drawScene(this.right, this.level, 'right');
    const now = performance.now();
    for (const ctx of [this.left, this.right]) {
      for (const diff of this.level.diffs) {
        if (this.found.has(diff.id)) this.drawMarker(ctx, diff, diff.id === this.lastFound, now);
      }
      if (this.hintPulse && now < this.hintPulse.until) {
        const d = this.hintPulse.diff;
        const pulse = 1 + 0.25 * Math.sin(now / 90);
        ctx.strokeStyle = 'rgba(255, 211, 61, 0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const m of this.misses) {
        if (now - m.at > 700) continue;
        ctx.strokeStyle = 'rgba(255, 107, 94, 0.9)';
        ctx.lineWidth = 4;
        const r = 12;
        ctx.beginPath();
        ctx.moveTo(m.x - r, m.y - r);
        ctx.lineTo(m.x + r, m.y + r);
        ctx.moveTo(m.x + r, m.y - r);
        ctx.lineTo(m.x - r, m.y + r);
        ctx.stroke();
      }
    }
    this.misses = this.misses.filter((m) => now - m.at <= 700);
    this._raf = requestAnimationFrame(this.frame);
  };

  drawMarker(ctx, diff, isLatest, now) {
    const pulse = isLatest ? 1 + 0.08 * Math.sin(now / 160) : 1;
    ctx.strokeStyle = '#ff5a3c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r * pulse + 3, 0, Math.PI * 2);
    ctx.stroke();
    // Small check mark at the ring's edge.
    ctx.strokeStyle = '#ff5a3c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(diff.x + diff.r * 0.45, diff.y + diff.r * 0.1);
    ctx.lineTo(diff.x + diff.r * 0.65, diff.y + diff.r * 0.35);
    ctx.lineTo(diff.x + diff.r * 0.95, diff.y - diff.r * 0.25);
    ctx.stroke();
  }

  start() {
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(this.frame);
  }

  clickOn(panel, event) {
    if (this.status !== 'playing') return;
    const rect = panel.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 560;
    const y = ((event.clientY - rect.top) / rect.height) * 420;
    const hit = this.level.diffs.find(
      (d) => !this.found.has(d.id) && Math.hypot(d.x - x, d.y - y) <= d.r + 8,
    );
    if (hit) {
      this.found.add(hit.id);
      this.lastFound = hit.id;
      this.score += FIND_POINTS;
      this.sfx.found();
      this.toast(`Found it — ${hit.name}!`, 'good');
      if (this.found.size === this.level.diffs.length) this.onWin(false);
    } else {
      this.timeLeft = Math.max(0, this.timeLeft - WRONG_COST_SEC);
      this.score = Math.max(0, this.score - 10);
      this.sfx.wrong();
      this.misses.push({ x, y, at: performance.now(), panel });
      panel.classList.remove('shake');
      void panel.offsetWidth;
      panel.classList.add('shake');
      this.toast('Not quite — that costs 5 seconds.', 'bad');
      if (this.timeLeft <= 0) this.onLose();
    }
    this.updateHud();
  }

  useHint() {
    if (this.status !== 'playing' || this.hintsLeft <= 0) return;
    const remaining = this.level.diffs.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - HINT_COST);
    this.sfx.hint();
    this.hintPulse = { diff: pick, until: performance.now() + 1800 };
    this.toast(`Hint: look near “${pick.name}”…`, '');
    this.els.hintBtn.textContent = `Hint (${this.hintsLeft} left)`;
    this.els.hintBtn.disabled = this.hintsLeft === 0;
    this.updateHud();
  }

  onWin(alreadyDone) {
    this.status = 'won';
    clearInterval(this.timerId);
    const bonus = this.timeLeft * TIME_BONUS_PER_SEC;
    const gained = bonus;
    this.score += gained;
    this.totalScore += this.score;
    this.finishedScenes += 1;
    if (!alreadyDone) this.sfx.win();
    const lastScene = this.levelIndex === LEVELS.length - 1;
    this.els.overlayTitle.textContent = lastScene ? 'You finished every scene!' : 'Scene complete!';
    this.els.overlayText.textContent = alreadyDone
      ? `All 8 differences in ${this.level.name} are circled.`
      : `All 8 differences found in ${this.level.name} — with ${this.timeLeft}s to spare (time bonus +${bonus}).`;
    this.els.overlayScore.textContent = `Scene score: ${this.score} · Total: ${this.totalScore}`;
    this.els.overlayBtn.textContent = lastScene ? 'Play again' : 'Next scene';
    this.els.overlay.classList.remove('hidden');
    this.updateHud();
  }

  onLose() {
    this.status = 'lost';
    clearInterval(this.timerId);
    this.sfx.lose();
    this.totalScore += this.score;
    this.els.overlayTitle.textContent = "Time's up!";
    this.els.overlayText.textContent = `You found ${this.found.size} of 8 differences in ${this.level.name}. The rest are still hiding — try the scene again.`;
    this.els.overlayScore.textContent = `Scene score: ${this.score} · Total: ${this.totalScore}`;
    this.els.overlayBtn.textContent = 'Try this scene again';
    this.els.overlay.classList.remove('hidden');
    this.updateHud();
  }

  nextFromOverlay() {
    if (this.status === 'won' && this.levelIndex < LEVELS.length - 1) {
      this.score = 0;
      this.loadLevel(this.levelIndex + 1);
    } else {
      this.score = 0;
      this.totalScore = this.status === 'won' && this.levelIndex === LEVELS.length - 1 ? 0 : this.totalScore;
      this.loadLevel(this.status === 'won' && this.levelIndex === LEVELS.length - 1 ? 0 : this.levelIndex);
    }
  }

  updateHud() {
    const total = this.level.diffs.length;
    const found = this.found.size;
    this.els.foundCount.textContent = `Found ${found} of ${total}`;
    this.els.remainingCount.textContent = `${total - found} remaining`;
    this.els.score.textContent = String(this.score);
    const m = Math.floor(this.timeLeft / 60);
    const s = String(this.timeLeft % 60).padStart(2, '0');
    this.els.timerText.textContent = `${m}:${s}`;
    const pct = (this.timeLeft / this.level.timeLimit) * 100;
    this.els.timerBar.style.width = `${pct}%`;
    this.els.timerBar.classList.toggle('low', this.timeLeft <= 30);
  }

  toast(msg, kind) {
    this.els.toast.textContent = msg;
    this.els.toast.className = `toast ${kind}`;
  }

  toggleSound() {
    const on = this.sfx.toggle();
    this.els.soundBtn.textContent = `Sound: ${on ? 'on' : 'off'}`;
  }
}
