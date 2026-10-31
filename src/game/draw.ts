import type { Flame } from "@/game/flames";
import { mothX, W, type Sim } from "@/game/sim";

type Sky = {
  top: string;
  mid: string;
  bot: string;
  moon: string;
  glow: string;
  far: string;
  near: string;
  star: string;
  win: string;
  snow: boolean;
  roofs: boolean;
};

const SKIES: Sky[] = [
  {
    top: "#2a1420",
    mid: "#1a0e14",
    bot: "#10080c",
    moon: "#f3e2c8",
    glow: "rgba(255, 228, 190, 0.5)",
    far: "#1a0d14",
    near: "#120910",
    star: "rgba(246, 234, 215, 0.35)",
    win: "rgba(255, 176, 86, 0.55)",
    snow: false,
    roofs: true,
  },
  {
    top: "#1a1840",
    mid: "#14122c",
    bot: "#0c0a18",
    moon: "#d7def8",
    glow: "rgba(180, 196, 255, 0.45)",
    far: "#12101f",
    near: "#0c0a16",
    star: "rgba(210, 220, 255, 0.45)",
    win: "rgba(255, 196, 120, 0.4)",
    snow: false,
    roofs: true,
  },
  {
    top: "#1c3048",
    mid: "#142433",
    bot: "#0c141c",
    moon: "#e7f2ff",
    glow: "rgba(210, 230, 255, 0.5)",
    far: "#101820",
    near: "#0c1218",
    star: "rgba(230, 240, 255, 0.7)",
    win: "rgba(186, 214, 255, 0.35)",
    snow: true,
    roofs: true,
  },
  {
    top: "#4a2a38",
    mid: "#2a1a28",
    bot: "#140e14",
    moon: "#ffe0c2",
    glow: "rgba(255, 186, 140, 0.55)",
    far: "#2a1820",
    near: "#1a1014",
    star: "rgba(255, 214, 180, 0.4)",
    win: "rgba(255, 150, 90, 0.6)",
    snow: false,
    roofs: true,
  },
  {
    top: "#0c1c28",
    mid: "#08141c",
    bot: "#06080e",
    moon: "#f4f7ff",
    glow: "rgba(160, 220, 255, 0.4)",
    far: "#081018",
    near: "#060a10",
    star: "rgba(220, 236, 255, 0.75)",
    win: "rgba(140, 200, 255, 0.3)",
    snow: false,
    roofs: false,
  },
];

function skyOf(index: number) {
  return SKIES[Math.max(0, Math.min(SKIES.length - 1, index))]!;
}

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function screenY(worldY: number, cam: number, lh: number) {
  return cam + lh - worldY;
}

export function viewHeight(cssW: number, cssH: number) {
  return W * (cssH / Math.max(cssW, 1));
}

export function fit(ctx: CanvasRenderingContext2D, cssW: number, cssH: number, dpr: number) {
  const scale = (cssW / W) * dpr;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return viewHeight(cssW, cssH);
}

function sky(ctx: CanvasRenderingContext2D, lh: number, look: Sky) {
  const g = ctx.createLinearGradient(0, 0, 0, lh);
  g.addColorStop(0, look.top);
  g.addColorStop(0.45, look.mid);
  g.addColorStop(1, look.bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, lh);
}

function moon(ctx: CanvasRenderingContext2D, lh: number, look: Sky) {
  const x = W * 0.78;
  const y = lh * 0.11;
  const glow = ctx.createRadialGradient(x, y, 4, x, y, 78);
  glow.addColorStop(0, look.glow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = look.moon;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();
}

function skyline(
  ctx: CanvasRenderingContext2D,
  cam: number,
  lh: number,
  parallax: number,
  seed: number,
  color: string,
  win: string,
) {
  const span = 78;
  const shift = (cam * parallax) % span;
  ctx.fillStyle = color;
  for (let i = -2; i < 8; i++) {
    const x = i * span - shift;
    const h = 36 + hash(i * 13 + seed) * (seed > 5 ? 120 : 70);
    ctx.fillRect(x, lh - h, span - 6, h + 8);
    if (seed > 5) {
      for (let wy = lh - h + 12; wy < lh - 10; wy += 18) {
        for (let wx = x + 10; wx < x + span - 16; wx += 16) {
          if (hash(wx * 0.17 + wy * 0.13 + seed) < 0.62) continue;
          ctx.fillStyle = hash(wx + wy) > 0.45 ? win : "rgba(255, 120, 60, 0.28)";
          ctx.fillRect(wx, wy, 6, 8);
        }
      }
      ctx.fillStyle = color;
    }
  }
}

function wires(ctx: CanvasRenderingContext2D, cam: number, lh: number) {
  ctx.strokeStyle = "rgba(40, 16, 22, 0.85)";
  ctx.lineWidth = 1.4;
  for (let row = 0; row < 3; row++) {
    const base = lh * (0.16 + row * 0.07);
    ctx.beginPath();
    for (let x = 0; x <= W; x += 10) {
      const y = base + Math.sin((x + cam * 0.25 + row * 40) * 0.03) * 7;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function backdrop(ctx: CanvasRenderingContext2D, cam: number, lh: number, biome: number) {
  const look = skyOf(biome);
  sky(ctx, lh, look);
  moon(ctx, lh, look);
  const stars = look.roofs ? 16 : 36;
  for (let i = 0; i < stars; i++) {
    const x = hash(i + 2 + biome) * W;
    const drift = look.snow ? cam * 0.22 : cam * 0.02;
    const y = (hash(i + 9) * lh * 0.7 + drift) % (lh * 0.72);
    ctx.fillStyle = look.star;
    const s = look.snow ? 2.2 : 1.5;
    ctx.fillRect(x, y, s, look.snow ? s + 1 : s);
  }
  if (look.roofs) {
    skyline(ctx, cam, lh, 0.08, 2, look.far, look.win);
    skyline(ctx, cam, lh, 0.16, 8, look.near, look.win);
    wires(ctx, cam, lh);
  }
}

function lantern(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, lit: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "rgba(80, 40, 36, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(0, -18);
  ctx.stroke();
  const body = ctx.createLinearGradient(0, -16, 0, 18);
  body.addColorStop(0, lit ? "#ffd7a1" : "#6a4038");
  body.addColorStop(0.5, lit ? "#ff7a3a" : "#4a2a28");
  body.addColorStop(1, lit ? "#c4382a" : "#3a2020");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-12, -12);
  ctx.quadraticCurveTo(-16, 4, -10, 16);
  ctx.lineTo(10, 16);
  ctx.quadraticCurveTo(16, 4, 12, -12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = lit ? "#5a241c" : "#2a1614";
  ctx.fillRect(-13, -16, 26, 5);
  ctx.fillRect(-11, 15, 22, 4);
  ctx.strokeStyle = lit ? "rgba(90, 30, 20, 0.45)" : "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.moveTo(0, 19);
  ctx.lineTo(0, 30);
  ctx.stroke();
  if (lit) {
    const glow = ctx.createRadialGradient(0, 2, 2, 0, 2, 36);
    glow.addColorStop(0, "rgba(255, 170, 70, 0.45)");
    glow.addColorStop(1, "rgba(255, 120, 40, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 2, 36, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flame: Flame,
  time: number,
  vx: number,
  alpha: number,
  fan: boolean,
) {
  const stretch = 1 + Math.min(0.4, Math.abs(vx) / 900);
  const sx = stretch * (fan ? 1.06 : 1);
  const sy = (1 / stretch) * (fan ? 1.08 : 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.scale(sx, -sy);
  const glow = ctx.createRadialGradient(0, 10, 2, 0, 8, 52);
  glow.addColorStop(0, flame.core);
  glow.addColorStop(0.35, flame.mid);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.globalAlpha = alpha * 0.85;
  ctx.beginPath();
  ctx.arc(0, 10, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha;
  const wob = Math.sin(time * 16) * 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 38);
  ctx.bezierCurveTo(14 + wob, 22, 13, 6, 0, -8);
  ctx.bezierCurveTo(-13, 6, -14 + wob, 22, 0, 38);
  const body = ctx.createLinearGradient(0, -8, 0, 38);
  body.addColorStop(0, flame.core);
  body.addColorStop(0.45, flame.mid);
  body.addColorStop(1, flame.out);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.bezierCurveTo(6, 16, 5, 8, 0, 2);
  ctx.bezierCurveTo(-5, 8, -6, 16, 0, 26);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();
  ctx.restore();
}

function roundBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  if (w <= 2) return;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
}

function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, gapW: number, h: number) {
  const top = y - h / 2;
  const grad = ctx.createLinearGradient(0, top, 0, top + h);
  grad.addColorStop(0, "#3a242c");
  grad.addColorStop(0.5, "#1a1014");
  grad.addColorStop(1, "#0e090c");
  ctx.fillStyle = grad;
  roundBar(ctx, -8, top, x + 8, h);
  roundBar(ctx, x + gapW, top, W - (x + gapW) + 8, h);
  const glow = ctx.createLinearGradient(x, 0, x + gapW, 0);
  glow.addColorStop(0, "rgba(255, 122, 47, 0.0)");
  glow.addColorStop(0.5, "rgba(255, 176, 90, 0.28)");
  glow.addColorStop(1, "rgba(255, 122, 47, 0.0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x, top - 10, gapW, h + 20);
  ctx.fillStyle = "#f0c56a";
  ctx.fillRect(x - 3, top, 3, h);
  ctx.fillRect(x + gapW, top, 3, h);
}

function drawMoth(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  const flap = 0.55 + Math.sin(time * 22) * 0.35;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(214, 196, 176, 0.9)";
  ctx.beginPath();
  ctx.ellipse(-8, 0, 10, 6 * flap, -0.4, 0, Math.PI * 2);
  ctx.ellipse(8, 0, 10, 6 * flap, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1618";
  ctx.beginPath();
  ctx.ellipse(0, 0, 2.4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOil(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 3) * 3);
  const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 14);
  g.addColorStop(0, "#fff4d2");
  g.addColorStop(0.45, "#f0c56a");
  g.addColorStop(1, "#e08a22");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 2, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(-3, -2, 2.2, 3.4, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSpark(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(time * 1.5);
  ctx.fillStyle = "#ffe7a8";
  ctx.globalAlpha = 0.95;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-1.3, -9, 2.6, 18);
  }
  ctx.restore();
}

function fog(ctx: CanvasRenderingContext2D, lh: number) {
  const g = ctx.createLinearGradient(0, lh * 0.72, 0, lh);
  g.addColorStop(0, "rgba(12, 7, 12, 0)");
  g.addColorStop(1, "rgba(12, 7, 12, 0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, lh * 0.72, W, lh * 0.28);
  const v = ctx.createRadialGradient(W / 2, lh * 0.45, lh * 0.2, W / 2, lh * 0.5, lh * 0.78);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, lh);
}

export function drawMenu(
  ctx: CanvasRenderingContext2D,
  time: number,
  lh: number,
  flame: Flame,
  reduced: boolean,
) {
  const cam = reduced ? 40 : time * 22;
  const biome = Math.floor(time / 7) % SKIES.length;
  backdrop(ctx, cam, lh, biome);
  const count = 4;
  for (let i = 0; i < count; i++) {
    const y = ((i * 180 - cam * 0.4) % (lh + 80)) + 20;
    const x = 48 + hash(i + 3) * (W - 96);
    lantern(ctx, x, y, 0.72, hash(i + 1) > 0.3);
  }
  drawFlame(ctx, W / 2 + Math.sin(time * 0.9) * 28, lh * 0.4, flame, time, Math.cos(time * 0.9) * 40, 1, false);
  fog(ctx, lh);
}

export function drawPlay(
  ctx: CanvasRenderingContext2D,
  sim: Sim,
  lh: number,
  flame: Flame,
  reduced: boolean,
  allowShake: boolean,
) {
  const anchor = lh * 0.66;
  const cam = sim.player.y - anchor;
  ctx.save();
  if (!reduced && allowShake && sim.shake > 0) {
    const mag = sim.shake * sim.shake * 8;
    ctx.translate(Math.sin(sim.time * 71) * mag, Math.cos(sim.time * 57) * mag);
  }
  backdrop(ctx, cam, lh, sim.biome);

  for (const e of sim.ents) {
    if (e.kind === "wind") {
      const y1 = screenY(e.y + e.h, cam, lh);
      const y2 = screenY(e.y, cam, lh);
      if (y2 < -20 || y1 > lh + 20) continue;
      ctx.fillStyle = e.force > 0 ? "rgba(120, 190, 210, 0.08)" : "rgba(210, 140, 120, 0.08)";
      ctx.fillRect(0, y1, W, y2 - y1);
      ctx.fillStyle = "rgba(246, 234, 215, 0.35)";
      const dir = e.force > 0 ? 1 : -1;
      for (let i = 0; i < 5; i++) {
        const yy = y1 + ((i + 0.5) * (y2 - y1)) / 5;
        const xx = ((sim.time * 80 * dir + i * 70) % (W + 40)) - 20;
        ctx.fillRect(dir > 0 ? xx : W - xx, yy, 18, 2);
      }
      continue;
    }
    const sy = screenY(e.y, cam, lh);
    if (sy < -80 || sy > lh + 80) continue;
    if (e.kind === "bar" && !e.taken) {
      drawBar(ctx, e.gapX, sy, e.gapW, e.h);
    } else if (e.kind === "moth") {
      drawMoth(ctx, mothX(e, sim.time), sy, sim.time + e.phase);
    } else if (e.kind === "oil" && !e.taken) {
      drawOil(ctx, e.x, sy, sim.time);
    } else if (e.kind === "spark" && !e.taken) {
      drawSpark(ctx, e.x, sy, sim.time + e.y);
    } else if (e.kind === "lantern" && !e.taken) {
      lantern(ctx, e.x, sy, 1, true);
    }
  }

  for (const p of sim.particles) {
    const sy = screenY(p.y, cam, lh);
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, sy, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const fade = sim.player.alive ? 1 : Math.max(0, 1 - sim.deadFor * 1.4);
  const py = screenY(sim.player.y + 14, cam, lh);
  if (sim.player.invuln <= 0 || Math.sin(sim.time * 28) > 0 || !sim.player.alive) {
    drawFlame(ctx, sim.player.x, py, flame, sim.time, sim.player.vx, fade, sim.fanning && sim.player.alive);
  }

  ctx.font = "700 15px Unbounded, sans-serif";
  ctx.textAlign = "center";
  for (const pop of sim.popups) {
    ctx.globalAlpha = Math.max(0, pop.life / pop.max);
    ctx.fillStyle = "#f6ead7";
    ctx.fillText(pop.text, pop.x, screenY(pop.y, cam, lh));
  }
  ctx.globalAlpha = 1;

  if (sim.flash > 0) {
    ctx.fillStyle = `rgba(255, 220, 180, ${sim.flash * 0.22})`;
    ctx.fillRect(-20, -20, W + 40, lh + 40);
  }
  fog(ctx, lh);
  ctx.restore();
}
