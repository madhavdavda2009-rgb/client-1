import type { RoadTheme } from './catalog';

// Light theme particles drawn over the road on a 2D canvas: snow and twinkling stars (Christmas), falling leaves,
// fireflies and the odd pterodactyl (dinosaurs), bats and embers (Halloween), plus a confetti burst on arriving at
// each new station. Particles keep their kind until they leave the screen, so a station change cross-fades
// naturally. Runs only while the road is on screen, at a capped pixel ratio, with small particle counts.
type Kind = 'snow' | 'twinkle' | 'leaf' | 'firefly' | 'ptero' | 'bat' | 'ember' | 'confetti';
type Particle = { kind: Kind; x: number; y: number; vx: number; vy: number; size: number; phase: number; spin: number; angle: number; color: string; life: number; out: number };

const leafColors = ['#4f9a3c', '#7bbf4a', '#a7d36b', '#3f7d33'];
const emberColors = ['#ff9a3c', '#ffb347', '#ff7a1a'];
const confettiColors = ['#f5bc19', '#e7473c', '#00a6ce', '#019e42', '#ffffff'];
// Share of each kind per theme.
// One kind per theme: snow (Christmas), leaves (dinosaurs), bats (Halloween).
const mixFor = (theme: RoadTheme): [Kind, number][] => theme === 'christmas' ? [['snow', 1]] : theme === 'dinosaurs' ? [['leaf', 1]] : [['bat', 1]];
const kindsFor = (theme: RoadTheme): Kind[] => mixFor(theme).map(([kind]) => kind);

export function startRoadParticles(canvas: HTMLCanvasElement, options: { theme: () => RoadTheme | undefined; station: () => number; running: () => boolean; busy?: () => boolean }) {
  const ctx = canvas.getContext('2d'); if (!ctx) return () => {};
  let width = 0, height = 0, ratio = 1, raf = 0, last = 0, fade = 0, visible = true, stopped = false, lastStation = -1, skip = false;
  const particles: Particle[] = [];
  const resize = () => {
    // Small soft dots need no extra pixels on phones.
    ratio = Math.min(devicePixelRatio || 1, canvas.clientWidth < 620 ? 1 : 1.5); width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  };
  const target = () => (width < 620 ? 46 : 90);
  const spawn = (kind: Kind, anywhere: boolean): Particle => {
    const small = width < 620, s = small ? .8 : 1;
    const p: Particle = { kind, x: Math.random() * width, y: anywhere ? Math.random() * height : -20, vx: 0, vy: 0, size: 0, phase: Math.random() * Math.PI * 2, spin: 0, angle: Math.random() * Math.PI * 2, color: '#fff', life: 1, out: 1 };
    if (kind === 'snow') { p.size = (1.2 + Math.random() * 2.6) * s; p.vy = 22 + Math.random() * 38; p.vx = -6 + Math.random() * 12; }
    else if (kind === 'leaf') { p.size = (3.5 + Math.random() * 3.5) * s; p.vy = 24 + Math.random() * 28; p.vx = 8 + Math.random() * 18; p.spin = -1.6 + Math.random() * 3.2; p.color = leafColors[Math.floor(Math.random() * leafColors.length)]; }
    else if (kind === 'twinkle') { p.size = (5 + Math.random() * 6) * s; p.y = height * Math.random() * .65; p.vx = -3 + Math.random() * 6; p.vy = -2 + Math.random() * 4; p.color = Math.random() < .5 ? '#fff6c8' : '#ffffff'; }
    else if (kind === 'firefly') { p.size = (1.6 + Math.random() * 1.6) * s; p.y = height * (.25 + Math.random() * .7); p.vx = -10 + Math.random() * 20; p.vy = -8 + Math.random() * 16; p.color = Math.random() < .5 ? '#e9ff7a' : '#fff27a'; }
    else if (kind === 'ptero') { p.size = (22 + Math.random() * 12) * s; p.vx = (Math.random() < .5 ? -1 : 1) * (55 + Math.random() * 30); p.x = p.vx > 0 ? -60 : width + 60; p.y = height * (.06 + Math.random() * .22); }
    else if (kind === 'confetti') { p.size = (4 + Math.random() * 4) * s; p.x = width / 2 + (Math.random() - .5) * width * .12; p.y = height * .42; const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 260 + Math.random() * 320; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; p.spin = -8 + Math.random() * 16; p.color = confettiColors[Math.floor(Math.random() * confettiColors.length)]; p.life = 1; }
    else if (kind === 'bat') { p.size = (12 + Math.random() * 10) * s; p.vx = (Math.random() < .5 ? -1 : 1) * (40 + Math.random() * 40); p.vy = 0; p.x = p.vx > 0 ? -30 : width + 30; p.y = height * (.06 + Math.random() * .42); if (anywhere) p.x = Math.random() * width; }
    else { p.size = (1.4 + Math.random() * 2.2) * s; p.vy = -(16 + Math.random() * 26); p.vx = -8 + Math.random() * 16; p.y = anywhere ? Math.random() * height : height + 10; p.color = emberColors[Math.floor(Math.random() * emberColors.length)]; p.life = .6 + Math.random() * .4; }
    return p;
  };
  const pick = (theme: RoadTheme): Kind => { let roll = Math.random(); for (const [kind, share] of mixFor(theme)) { roll -= share; if (roll <= 0) return kind; } return mixFor(theme)[0][0]; };

  const draw = (p: Particle, time: number, alpha: number) => {
    ctx.globalAlpha = alpha;
    if (p.kind === 'snow') { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
    else if (p.kind === 'ember') { ctx.globalAlpha = alpha * p.life * (.55 + .45 * Math.sin(time * 6 + p.phase)); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
    else if (p.kind === 'twinkle') {
      const t = .5 + .5 * Math.sin(time * 3 + p.phase), r = p.size * (.6 + .4 * t);
      ctx.globalAlpha = alpha * (.25 + .75 * t); ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(time * .3 + p.phase);
      ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, d = i % 2 ? r * .22 : r; ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); } ctx.closePath(); ctx.fill(); ctx.restore();
    }
    else if (p.kind === 'firefly') {
      const t = .5 + .5 * Math.sin(time * 2.2 + p.phase);
      ctx.globalAlpha = alpha * .22 * t; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = alpha * (.4 + .6 * t); ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    else if (p.kind === 'confetti') {
      ctx.globalAlpha = alpha * Math.min(1, p.life * 2); ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.scale(1, Math.cos(time * 9 + p.phase));
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore();
    }
    else if (p.kind === 'leaf') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.scale(1, .45 + .55 * Math.abs(Math.cos(time * 2 + p.phase)));
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * .5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else {
      // Bat or pterodactyl: body plus two wings that flap (the pterodactyl glides with slow beats and has a crest).
      const ptero = p.kind === 'ptero', flap = Math.sin(time * (ptero ? 4.5 : 14) + p.phase), w = p.size, dir = p.vx > 0 ? 1 : -1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(dir, 1); ctx.fillStyle = ptero ? '#3b2b22' : '#24122b';
      if (ptero) { ctx.globalAlpha = alpha * .8; ctx.beginPath(); ctx.moveTo(w * .12, -w * .1); ctx.lineTo(w * .5, -w * .02); ctx.lineTo(w * .14, w * .04); ctx.moveTo(w * .02, -w * .12); ctx.lineTo(-w * .22, -w * .26); ctx.lineTo(-w * .06, -w * .06); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(0, 0, w * .18, w * .26, 0, 0, Math.PI * 2); ctx.fill();
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, -w * .05);
        ctx.quadraticCurveTo(side * w * .5, -w * (.55 * flap + .1), side * w, -w * .25 * flap);
        ctx.quadraticCurveTo(side * w * .55, w * .05, 0, w * .12); ctx.fill();
      }
      ctx.restore();
    }
  };

  const frame = (now: number) => {
    raf = 0; if (stopped) return;
    // The road may still be hidden (size 0) when the loop starts, e.g. on phones: measure again once it has a size.
    if (canvas.clientWidth !== width || canvas.clientHeight !== height) resize();
    if (!width || !height) { if (visible && !document.hidden) raf = requestAnimationFrame(frame); return; }
    // While the road is scrolling, update every other frame so the 3D road keeps the frame budget.
    if (options.busy?.() && (skip = !skip)) { if (visible && !document.hidden) raf = requestAnimationFrame(frame); return; }
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    const theme = options.theme(), on = options.running() && !!theme;
    fade += ((on ? 1 : 0) - fade) * Math.min(1, dt * 4);
    if (fade < .01 && !on) { particles.length = 0; ctx.clearRect(0, 0, canvas.width, canvas.height); return; } // sleep until woken
    const kinds = theme ? kindsFor(theme) : [];
    // Arriving at a new station: a short confetti burst from around the O.
    const station = options.station();
    
    if (on) lastStation = station;
    if (on) {
      // Count only particles of the current theme, so the next theme fills in while the old one fades away.
      const want = Math.round(target() * (kinds.includes('bat') ? .18 : kinds.includes('leaf') ? .6 : 1)), current = particles.filter(p => kinds.includes(p.kind)).length; let ptero = particles.filter(p => p.kind === 'ptero').length;
      if (current < want) { const fresh = current === 0, add = fresh ? want : Math.min(2, want - current); const handover = fresh && particles.length > 0;
        for (let i = 0; i < add; i++) { let kind = pick(theme!); if (kind === 'ptero' && ptero >= 1) kind = 'leaf'; else if (kind === 'ptero') ptero++; const p = spawn(kind, fresh); if (handover) p.out = .01; particles.push(p); }
      }
    }
    const time = now / 1000;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.kind === 'snow') { p.x += (p.vx + Math.sin(time * 1.3 + p.phase) * 14) * dt; p.y += p.vy * dt; }
      else if (p.kind === 'leaf') { p.x += (p.vx + Math.sin(time * 1.1 + p.phase) * 22) * dt; p.y += p.vy * dt; p.angle += p.spin * dt; }
      else if (p.kind === 'bat' || p.kind === 'ptero') { p.x += p.vx * dt; p.y += Math.sin(time * (p.kind === 'ptero' ? 1.2 : 2.4) + p.phase) * 18 * dt; }
      else if (p.kind === 'twinkle') { p.x += p.vx * dt; p.y += p.vy * dt; }
      else if (p.kind === 'firefly') { p.x += (p.vx + Math.sin(time * .9 + p.phase) * 16) * dt; p.y += (p.vy + Math.cos(time * .7 + p.phase) * 12) * dt; if (p.x < -10 || p.x > width + 10) p.vx *= -1; if (p.y < height * .2 || p.y > height) p.vy *= -1; }
      else if (p.kind === 'confetti') { p.vy += 520 * dt; p.vx *= Math.pow(.35, dt); p.x += p.vx * dt; p.y += p.vy * dt; p.angle += p.spin * dt; p.life -= dt / 2.6; }
      else { p.x += (p.vx + Math.sin(time * 2 + p.phase) * 10) * dt; p.y += p.vy * dt; p.life -= dt * .08; }
      if (on && p.kind !== 'confetti' && !kinds.includes(p.kind)) p.out -= dt / .8; // previous theme fades out
      else if (p.out < 1) p.out = Math.min(1, p.out + dt / .8); // new theme fades in
      const gone = p.y > height + 30 || p.y < -40 || p.x < -60 || p.x > width + 60 || p.life <= 0 || p.out <= 0;
      if (gone) { particles.splice(i, 1); continue; }
      draw(p, time, fade * p.out * (p.kind === 'snow' ? .85 : p.kind === 'leaf' ? .85 : 1));
    }
    ctx.globalAlpha = 1;
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  // On screen? Checked directly (an IntersectionObserver can miss the road growing out of a clipped circle on phones).
  const onScreen = () => { const box = canvas.getBoundingClientRect(); return box.bottom > 0 && box.top < innerHeight && box.width > 0; };
  const wake = () => { visible = onScreen(); if (!raf && !stopped && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
  const onResize = () => { resize(); wake(); };
  resize(); addEventListener('resize', onResize); document.addEventListener('visibilitychange', wake);
  const poll = setInterval(wake, 400); // wakes the loop when the road phase starts
  return () => { stopped = true; cancelAnimationFrame(raf); clearInterval(poll); removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', wake); };
}
