import { STATIONS } from '../data.js';

// Pipeline Quest: a small top-down canvas game. It has no React code in it.
// The React layer talks to it through the handlers passed to the constructor.

const WORLD = { w: 2200, h: 1400 };
const CHIP_VALUE = 125; // thousand records per chip, 12 chips = 1.5M
const TAU = Math.PI * 2;
const FONT = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const KEYMAP = {
  ArrowLeft: 'l', a: 'l', A: 'l',
  ArrowRight: 'r', d: 'r', D: 'r',
  ArrowUp: 'u', w: 'u', W: 'u',
  ArrowDown: 'd', s: 'd', S: 'd',
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => clamp(v, 0, 255);
  return 'rgb(' + f((n >> 16) + amt) + ',' + f(((n >> 8) & 255) + amt) + ',' + f((n & 255) + amt) + ')';
}

export class PipelineGame {
  constructor(canvas, mini, handlers, opts) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.mini = mini;
    this.mctx = mini.getContext('2d');
    this.h = handlers || {};
    this.reduced = !!(opts && opts.reduced);
    this.st = STATIONS.map((s) => ({ ...s, w: 156, h: 112, door: { x: s.x, y: s.y + 96 } }));
    this.W = 0; this.H = 0; this.dpr = 1; this.scale = 1; this.t = 0;
    this.cam = { x: 0, y: 0 };
    this.p = { x: 280, y: 920, face: 1, inv: 0, trail: [], moving: false };
    this.keys = {}; this.jx = 0; this.jy = 0; this.auto = null;
    this.near = null; this.lockId = null;
    this.uiLock = false; this.stationLock = false;
    this.found = new Set(); this.collected = []; this.parts = [];
    this.shake = 0; this.finaleShown = false;
    this.running = false; this.raf = 0; this.last = 0;
    this.buildWorld();
    this._kd = (e) => this.onKeyDown(e);
    this._ku = (e) => this.onKeyUp(e);
    this._rs = () => this.resize();
    this._bl = () => { this.keys = {}; };
    this._frame = (now) => this.frame(now);
  }

  buildWorld() {
    const n = this.st.length;
    this.chips = [];
    for (let i = 0; i < n; i++) {
      const a = this.st[i];
      const b = this.st[(i + 1) % n];
      this.chips.push({ x: lerp(a.x, b.x, 0.28), y: lerp(a.y, b.y, 0.28), got: false, ph: i });
      if (i % 2 === 1) this.chips.push({ x: lerp(a.x, b.x, 0.72), y: lerp(a.y, b.y, 0.72), got: false, ph: i + 3 });
    }
    // 12 chips x 125K = 1.5M records
    this.enemies = [0, 2, 4, 5, 7].map((seg, k) => ({
      a: this.st[seg], b: this.st[(seg + 1) % n], ph: k * 1.7, sp: 1.1 + (k % 3) * 0.25, x: 0, y: 0,
    }));
  }

  /* ---------- lifecycle ---------- */
  start() {
    if (this.running) return;
    this.running = true;
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup', this._ku);
    window.addEventListener('resize', this._rs);
    window.addEventListener('blur', this._bl);
    this.resize();
    const vw = this.W / this.scale, vh = this.H / this.scale;
    this.cam.x = clamp(this.p.x - vw / 2, 0, Math.max(0, WORLD.w - vw));
    this.cam.y = clamp(this.p.y - vh / 2, 0, Math.max(0, WORLD.h - vh));
    this.emit();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this._frame);
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this._kd);
    window.removeEventListener('keyup', this._ku);
    window.removeEventListener('resize', this._rs);
    window.removeEventListener('blur', this._bl);
  }
  resize() {
    const r = this.cv.getBoundingClientRect();
    if (!r.width) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width; this.H = r.height;
    this.cv.width = Math.round(this.W * this.dpr);
    this.cv.height = Math.round(this.H * this.dpr);
    this.scale = clamp(Math.min(this.W / 560, this.H / 460), 0.55, 1.35);
  }

  /* ---------- state that React reads ---------- */
  emit() {
    if (this.h.onState) {
      this.h.onState({
        found: Array.from(this.found),
        records: this.collected.length,
        nearId: this.near ? this.near.id : null,
      });
    }
  }
  locked() { return this.uiLock || this.stationLock; }
  setUiLock(v) {
    this.uiLock = !!v;
    if (v) { this.keys = {}; this.jx = 0; this.jy = 0; }
  }
  byId(id) { return this.st.find((s) => s.id === id); }

  /* ---------- input ---------- */
  setJoystick(x, y) { this.jx = x; this.jy = y; }
  onKeyDown(e) {
    const k = KEYMAP[e.key];
    if (k) {
      if (!this.locked()) { this.keys[k] = true; e.preventDefault(); }
      return;
    }
    const isE = e.key === 'e' || e.key === 'E';
    const isEnter = (e.key === 'Enter' || e.key === ' ') && document.activeElement === document.body;
    if ((isE || isEnter) && this.near && !this.locked()) {
      e.preventDefault();
      this.openStation(this.near.id);
    }
  }
  onKeyUp(e) {
    const k = KEYMAP[e.key];
    if (k) this.keys[k] = false;
  }
  tap(clientX, clientY) {
    if (this.locked()) return;
    const r = this.cv.getBoundingClientRect();
    const wx = (clientX - r.left) / this.scale + this.cam.x;
    const wy = (clientY - r.top) / this.scale + this.cam.y;
    for (const s of this.st) {
      if (Math.abs(wx - s.x) < s.w / 2 + 14 && Math.abs(wy - s.y) < s.h / 2 + 32) { this.travel(s.id); return; }
    }
  }
  travel(id) {
    const s = this.byId(id);
    if (s) this.auto = { x: s.door.x, y: s.door.y, open: id };
  }

  /* ---------- stations ---------- */
  openStation(id) {
    if (this.stationLock) return;
    const s = this.byId(id);
    if (!s) return;
    this.stationLock = true;
    this.lockId = id;
    if (this.auto && this.auto.open === id) this.auto = null;
    this.keys = {}; this.jx = 0; this.jy = 0;
    if (!this.found.has(id)) {
      this.found.add(id);
      if (this.h.onToast) this.h.onToast('Unlocked: ' + s.name);
    }
    this.emit();
    if (this.h.onOpen) this.h.onOpen(id);
  }
  closeStation() {
    this.stationLock = false;
    this.p.inv = Math.max(this.p.inv, 1);
    if (!this.finaleShown && this.found.size === this.st.length) {
      this.finaleShown = true;
      this.stationLock = true;
      this.burst(this.p.x, this.p.y, 90, true);
      if (this.h.onFinale) this.h.onFinale({ full: this.collected.length === 12 });
    }
    this.emit();
  }

  /* ---------- simulation ---------- */
  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(this._frame);
  }
  burst(x, y, n, confetti) {
    const cols = ['#FFC24B', '#3DDBC0', '#FF7A80', '#8FA0FF', '#FFFFFF'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const v = (confetti ? 150 : 95) * (0.4 + Math.random());
      this.parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (confetti ? 120 : 20),
        life: 0.7 + Math.random() * 0.7, c: cols[(Math.random() * cols.length) | 0], s: 2.5 + Math.random() * 3, g: !!confetti,
      });
    }
  }
  hit() {
    const p = this.p;
    let a = 0;
    if (this.hitFrom) a = Math.atan2(p.y - this.hitFrom.y, p.x - this.hitFrom.x);
    p.x += Math.cos(a) * 90; p.y += Math.sin(a) * 90;
    p.inv = 1.2; this.shake = 0.25;
    this.burst(p.x, p.y, 14, false);
    if (this.collected.length) {
      const c = this.collected.pop();
      c.got = false;
      this.emit();
      if (this.h.onToast) this.h.onToast('409 write conflict. Retrying: a record went back to its spot.');
    } else if (this.h.onToast) this.h.onToast('409 write conflict. Retrying.');
  }
  update(dt) {
    this.t += dt;
    const p = this.p;
    const locked = this.locked();
    let ix = 0, iy = 0;
    if (!locked) {
      if (this.keys.l) ix -= 1;
      if (this.keys.r) ix += 1;
      if (this.keys.u) iy -= 1;
      if (this.keys.d) iy += 1;
      if (Math.hypot(this.jx, this.jy) > 0.15) { ix += this.jx; iy += this.jy; }
      const m = Math.hypot(ix, iy);
      if (m > 1) { ix /= m; iy /= m; }
      if (m > 0.05) this.auto = null;
    }
    let speed = 210;
    if (this.auto && !locked) {
      const dx = this.auto.x - p.x, dy = this.auto.y - p.y, d = Math.hypot(dx, dy);
      if (d < 10) {
        const o = this.auto.open;
        this.auto = null;
        if (o) this.openStation(o);
      } else { ix = dx / d; iy = dy / d; speed = 400; }
    }
    p.moving = Math.hypot(ix, iy) > 0.05;
    if (p.moving) {
      p.x += ix * speed * dt; p.y += iy * speed * dt;
      if (Math.abs(ix) > 0.2) p.face = ix > 0 ? 1 : -1;
      if (!this.reduced) { p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 10) p.trail.shift(); }
    } else if (p.trail.length) p.trail.shift();
    p.x = clamp(p.x, 28, WORLD.w - 28);
    p.y = clamp(p.y, 28, WORLD.h - 28);
    if (p.inv > 0) p.inv -= dt;
    if (this.shake > 0) this.shake -= dt;

    for (const e of this.enemies) {
      const k = 0.5 + 0.12 * Math.sin(this.t * e.sp + e.ph);
      e.x = lerp(e.a.x, e.b.x, k); e.y = lerp(e.a.y, e.b.y, k);
      if (!locked && p.inv <= 0 && !this.auto && Math.hypot(p.x - e.x, p.y - e.y) < 28) {
        this.hitFrom = e;
        this.hit();
      }
    }
    for (const c of this.chips) {
      if (!c.got && Math.hypot(p.x - c.x, p.y - c.y) < 24) {
        c.got = true;
        this.collected.push(c);
        this.burst(c.x, c.y, 10, false);
        this.emit();
        if (this.collected.length === 12 && this.h.onToast) this.h.onToast('All 12 chips: 1.5M records processed');
      }
    }
    let near = null;
    for (const s of this.st) {
      if (Math.hypot(p.x - s.door.x, p.y - s.door.y) < 66) { near = s; break; }
    }
    if (near !== this.near) {
      this.near = near;
      if (this.lockId && (!near || near.id !== this.lockId)) this.lockId = null;
      this.emit();
      if (near && !this.auto && !locked && !this.found.has(near.id) && this.lockId !== near.id) this.openStation(near.id);
    }
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const q = this.parts[i];
      q.life -= dt;
      if (q.life <= 0) { this.parts.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.g) q.vy += 260 * dt;
    }
    const vw = this.W / this.scale, vh = this.H / this.scale;
    const tx = vw >= WORLD.w ? (WORLD.w - vw) / 2 : clamp(p.x - vw / 2, 0, WORLD.w - vw);
    const ty = vh >= WORLD.h ? (WORLD.h - vh) / 2 : clamp(p.y - vh / 2, 0, WORLD.h - vh);
    const f = Math.min(1, dt * 8);
    this.cam.x += (tx - this.cam.x) * f;
    this.cam.y += (ty - this.cam.y) * f;
  }

  /* ---------- drawing ---------- */
  pill(text, x, y, ok) {
    const c = this.ctx;
    c.font = '700 12px ' + FONT;
    const label = (ok ? '✓ ' : '') + text;
    const w = c.measureText(label).width + 22;
    c.save();
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 12; c.shadowOffsetY = 4;
    c.fillStyle = 'rgba(10,16,36,.82)';
    rr(c, x - w / 2, y - 13, w, 26, 13); c.fill();
    c.restore();
    c.strokeStyle = ok ? 'rgba(61,219,192,.7)' : 'rgba(255,255,255,.2)';
    c.lineWidth = 1.5;
    rr(c, x - w / 2, y - 13, w, 26, 13); c.stroke();
    c.fillStyle = ok ? '#7CF0DA' : '#EEF2FF';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(label, x, y + 1);
  }
  drawStation(s) {
    const c = this.ctx;
    const x = s.x - s.w / 2, y = s.y - s.h / 2, ok = this.found.has(s.id);
    // path stub and door ring
    c.fillStyle = 'rgba(20,30,70,.9)';
    c.fillRect(s.x - 13, s.y + s.h / 2 - 6, 26, 50);
    c.save();
    c.strokeStyle = ok ? '#3DDBC0' : '#FFC24B';
    c.lineWidth = 2.5; c.setLineDash([7, 9]);
    c.lineDashOffset = this.reduced ? 0 : -this.t * 12;
    c.beginPath();
    c.arc(s.door.x, s.door.y, 42 + (this.reduced ? 0 : Math.sin(this.t * 3) * 2), 0, TAU);
    c.stroke();
    c.restore();
    // body with colored glow
    c.save();
    c.shadowColor = hexA(s.color, 0.55); c.shadowBlur = 34; c.shadowOffsetY = 12;
    const g = c.createLinearGradient(0, y, 0, y + s.h);
    g.addColorStop(0, shade(s.color, 45)); g.addColorStop(1, shade(s.color, -45));
    c.fillStyle = g;
    rr(c, x, y, s.w, s.h, 24); c.fill();
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2;
    rr(c, x + 1, y + 1, s.w - 2, s.h - 2, 23); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.16)';
    rr(c, x + 10, y + 9, s.w - 20, 22, 12); c.fill();
    c.fillStyle = 'rgba(8,14,30,.5)';
    c.beginPath(); c.arc(s.x, y + 60, 26, 0, TAU); c.fill();
    c.font = '27px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#fff'; c.fillText(s.icon, s.x, y + 61);
    c.fillStyle = 'rgba(6,10,24,.88)';
    rr(c, s.x - 17, y + s.h - 26, 34, 32, 10); c.fill();
    this.pill(s.name, s.x, y - 20, ok);
    if (ok) {
      c.fillStyle = '#3DDBC0';
      c.beginPath(); c.arc(x + s.w - 2, y + 4, 12, 0, TAU); c.fill();
      c.strokeStyle = '#06251F'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x + s.w - 8, y + 4); c.lineTo(x + s.w - 3, y + 9); c.lineTo(x + s.w + 5, y - 1); c.stroke();
    }
  }
  drawChip(k) {
    const c = this.ctx;
    const bob = this.reduced ? 0 : Math.sin(this.t * 3 + k.ph) * 3;
    c.fillStyle = 'rgba(0,0,0,.28)';
    c.beginPath(); c.ellipse(k.x, k.y + 14, 8, 3, 0, 0, TAU); c.fill();
    c.save();
    c.shadowColor = 'rgba(255,176,32,.85)'; c.shadowBlur = 18;
    const g = c.createRadialGradient(k.x - 3, k.y + bob - 3, 1, k.x, k.y + bob, 11);
    g.addColorStop(0, '#FFF3B0'); g.addColorStop(1, '#FFB020');
    c.fillStyle = g;
    c.beginPath(); c.arc(k.x, k.y + bob, 10, 0, TAU); c.fill();
    c.restore();
    c.strokeStyle = 'rgba(120,70,0,.55)'; c.lineWidth = 2;
    c.beginPath(); c.arc(k.x, k.y + bob, 6, 0, TAU); c.stroke();
  }
  drawEnemy(e) {
    const c = this.ctx;
    c.save();
    c.translate(e.x, e.y);
    c.save();
    c.rotate(this.reduced ? 0 : this.t * 1.4);
    c.fillStyle = '#FF5A4F';
    for (let i = 0; i < 8; i++) {
      c.rotate(TAU / 8);
      c.beginPath(); c.moveTo(-6, -15); c.lineTo(0, -25); c.lineTo(6, -15); c.closePath(); c.fill();
    }
    c.restore();
    c.shadowColor = 'rgba(255,90,79,.8)'; c.shadowBlur = 18;
    const g = c.createRadialGradient(-4, -4, 2, 0, 0, 16);
    g.addColorStop(0, '#FF9A7A'); g.addColorStop(1, '#E5383B');
    c.fillStyle = g;
    c.beginPath(); c.arc(0, 0, 15, 0, TAU); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = '#fff'; c.font = '800 11px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('409', 0, 1);
    c.restore();
  }
  drawPlayer() {
    const c = this.ctx, p = this.p;
    if (p.inv > 0 && Math.floor(this.t * 16) % 2 === 0) return;
    p.trail.forEach((t, i) => {
      c.globalAlpha = (i / p.trail.length) * 0.35;
      c.fillStyle = '#8FA0FF';
      c.beginPath(); c.arc(t.x, t.y + 6, 7 * (i / p.trail.length) + 2, 0, TAU); c.fill();
    });
    c.globalAlpha = 1;
    const bob = p.moving && !this.reduced ? Math.sin(this.t * 16) * 2 : 0;
    c.fillStyle = 'rgba(0,0,0,.35)';
    c.beginPath(); c.ellipse(p.x, p.y + 20, 14, 4.5, 0, 0, TAU); c.fill();
    c.save();
    c.translate(p.x, p.y + bob);
    c.shadowColor = 'rgba(143,160,255,.9)'; c.shadowBlur = 22;
    const g = c.createLinearGradient(0, -16, 0, 16);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#C9D2FF');
    c.fillStyle = g;
    rr(c, -15, -16, 30, 34, 11); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = '#1A2350';
    rr(c, -11, -10, 22, 13, 6); c.fill();
    c.fillStyle = '#3DDBC0';
    c.beginPath(); c.arc(-4 + p.face * 2, -3.5, 2.6, 0, TAU); c.arc(4 + p.face * 2, -3.5, 2.6, 0, TAU); c.fill();
    c.strokeStyle = '#C9D2FF'; c.lineWidth = 2.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -16); c.lineTo(0, -23); c.stroke();
    c.fillStyle = '#FFC24B';
    c.beginPath(); c.arc(0, -25, 3.5, 0, TAU); c.fill();
    c.restore();
  }
  render() {
    const c = this.ctx;
    const { W, H, dpr, scale, cam } = this;
    if (!W) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = c.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0D1533'); bg.addColorStop(1, '#08202C');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    let sx = 0, sy = 0;
    if (this.shake > 0 && !this.reduced) { sx = (Math.random() - 0.5) * 8; sy = (Math.random() - 0.5) * 8; }
    c.setTransform(dpr * scale, 0, 0, dpr * scale, (-cam.x * scale + sx) * dpr, (-cam.y * scale + sy) * dpr);
    const vw = W / scale, vh = H / scale;

    c.fillStyle = 'rgba(143,160,255,.12)';
    const x0 = Math.floor(cam.x / 48) * 48, y0 = Math.floor(cam.y / 48) * 48;
    for (let x = x0; x < cam.x + vw + 48; x += 48) for (let y = y0; y < cam.y + vh + 48; y += 48) c.fillRect(x, y, 2.5, 2.5);
    c.strokeStyle = 'rgba(143,160,255,.25)'; c.lineWidth = 4;
    rr(c, 2, 2, WORLD.w - 4, WORLD.h - 4, 28); c.stroke();

    for (const s of this.st) {
      const g = c.createRadialGradient(s.x, s.y + 20, 0, s.x, s.y + 20, 270);
      g.addColorStop(0, hexA(s.color, 0.2)); g.addColorStop(1, hexA(s.color, 0));
      c.fillStyle = g;
      c.fillRect(s.x - 270, s.y - 250, 540, 540);
    }

    c.lineCap = 'round'; c.lineJoin = 'round';
    const path = () => {
      c.beginPath();
      this.st.forEach((s, i) => { if (i) c.lineTo(s.x, s.y); else c.moveTo(s.x, s.y); });
      c.closePath();
    };
    c.strokeStyle = 'rgba(110,130,255,.14)'; c.lineWidth = 58; path(); c.stroke();
    c.strokeStyle = 'rgba(16,26,62,.95)'; c.lineWidth = 46; path(); c.stroke();
    c.save();
    c.setLineDash([10, 26]); c.lineDashOffset = this.reduced ? 0 : -this.t * 48;
    c.strokeStyle = 'rgba(160,175,255,.8)'; c.lineWidth = 3; path(); c.stroke();
    c.setLineDash([4, 60]); c.lineDashOffset = this.reduced ? 0 : -this.t * 80;
    c.strokeStyle = 'rgba(61,219,192,.9)'; c.lineWidth = 5; path(); c.stroke();
    c.restore();

    [...this.st].sort((a, b) => a.y - b.y).forEach((s) => this.drawStation(s));
    this.chips.forEach((k) => { if (!k.got) this.drawChip(k); });
    this.enemies.forEach((e) => this.drawEnemy(e));
    this.drawPlayer();
    for (const q of this.parts) {
      c.globalAlpha = Math.min(1, q.life * 2);
      c.fillStyle = q.c;
      c.fillRect(q.x, q.y, q.s, q.s);
    }
    c.globalAlpha = 1;
    this.drawMini();
  }
  drawMini() {
    const m = this.mctx, w = this.mini.width, h = this.mini.height, k = w / WORLD.w;
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.clearRect(0, 0, w, h);
    m.fillStyle = 'rgba(8,14,30,.85)'; m.fillRect(0, 0, w, h);
    m.strokeStyle = 'rgba(110,130,255,.45)'; m.lineWidth = 5; m.lineJoin = 'round';
    m.beginPath();
    this.st.forEach((s, i) => { if (i) m.lineTo(s.x * k, s.y * k); else m.moveTo(s.x * k, s.y * k); });
    m.closePath(); m.stroke();
    this.chips.forEach((c) => { if (!c.got) { m.fillStyle = '#FFC24B'; m.fillRect(c.x * k - 2, c.y * k - 2, 4, 4); } });
    this.enemies.forEach((e) => { m.fillStyle = '#FF6B6B'; m.fillRect(e.x * k - 3, e.y * k - 3, 6, 6); });
    this.st.forEach((s) => { m.fillStyle = this.found.has(s.id) ? '#3DDBC0' : s.color; m.fillRect(s.x * k - 6, s.y * k - 5, 12, 10); });
    m.strokeStyle = 'rgba(255,255,255,.55)'; m.lineWidth = 2;
    m.strokeRect(this.cam.x * k, this.cam.y * k, (this.W / this.scale) * k, (this.H / this.scale) * k);
    m.fillStyle = '#fff'; m.beginPath(); m.arc(this.p.x * k, this.p.y * k, 4, 0, TAU); m.fill();
  }
}
