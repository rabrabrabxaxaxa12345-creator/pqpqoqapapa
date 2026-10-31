import { LEVELS } from "@/game/levels";

export const W = 390;
export const CONTINUE_COST = 25;
const STEP_LOOK = 980;

export type DeathReason = "crash" | "wick";
export type EvType = "pass" | "near" | "oil" | "spark" | "lantern" | "perfect" | "die" | "sky" | "boost" | "magnet" | "win";

export type Input = {
  pointer: boolean;
  pointerX: number;
  left: boolean;
  right: boolean;
  reduced: boolean;
};

type Kind = "bar" | "moth" | "oil" | "spark" | "lantern" | "wind" | "boost" | "magnet" | "slow" | "goal";

type Ent = {
  kind: Kind;
  y: number;
  x: number;
  h: number;
  gapX: number;
  gapW: number;
  phase: number;
  amp: number;
  force: number;
  taken: boolean;
  resolved: boolean;
  r: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  grav: number;
};

export type Popup = { x: number; y: number; text: string; life: number; max: number };

export type Sim = {
  player: {
    x: number;
    y: number;
    vx: number;
    wick: number;
    alive: boolean;
    invuln: number;
    combo: number;
    comboLeft: number;
    score: number;
    dist: number;
  };
  ents: Ent[];
  nextY: number;
  rng: () => number;
  time: number;
  shake: number;
  flash: number;
  hitstop: number;
  continued: boolean;
  particles: Particle[];
  popups: Popup[];
  wind: number;
  deadFor: number;
  reason: DeathReason | null;
  justDied: boolean;
  fanning: boolean;
  events: EvType[];
  biome: number;
  goal: number;
  par: number;
  pace: number;
  finite: boolean;
  sparksGot: number;
  sparksTotal: number;
  boost: number;
  magnet: number;
  slowing: boolean;
  won: boolean;
  levelName: string;
};

export function sparkGain(score: number) {
  return Math.max(3, Math.round(score / 15));
}

export function metersOf(dist: number) {
  return Math.floor(dist / 48);
}

export function climbSpeed(dist: number) {
  const ramp = Math.max(0, dist - 600);
  return Math.min(300, 96 + ramp * 0.026);
}

export const BIOMES = [
  { name: "Двор", until: 22 },
  { name: "Крыши", until: 52 },
  { name: "Метель", until: 90 },
  { name: "Рассвет", until: 140 },
  { name: "Высота", until: Infinity },
] as const;

export function biomeAt(dist: number) {
  const meters = dist / 48;
  for (let i = 0; i < BIOMES.length; i++) {
    if (meters < BIOMES[i]!.until) return i;
  }
  return BIOMES.length - 1;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function makeBar(y: number, gapX: number, gapW: number, force: number): Ent {
  return {
    kind: "bar",
    y,
    x: 0,
    h: 28,
    gapX,
    gapW,
    phase: 0,
    amp: 0,
    force,
    taken: false,
    resolved: false,
    r: 0,
  };
}

function makeMoth(y: number, x: number, amp: number, speed: number): Ent {
  return {
    kind: "moth",
    y,
    x,
    h: 0,
    gapX: 0,
    gapW: 0,
    phase: Math.random() * Math.PI * 2,
    amp,
    force: speed,
    taken: false,
    resolved: false,
    r: 15,
  };
}

function pickup(kind: "oil" | "spark" | "lantern" | "boost" | "magnet", y: number, x: number, r: number): Ent {
  return {
    kind,
    y,
    x,
    h: 0,
    gapX: 0,
    gapW: 0,
    phase: 0,
    amp: 0,
    force: 0,
    taken: false,
    resolved: false,
    r,
  };
}

function makeSlow(y: number, h: number, x: number, w: number): Ent {
  return {
    kind: "slow",
    y,
    x,
    h,
    gapX: 0,
    gapW: w,
    phase: 0,
    amp: 0,
    force: 0,
    taken: false,
    resolved: false,
    r: 0,
  };
}

function makeGoal(y: number): Ent {
  return {
    kind: "goal",
    y,
    x: 0,
    h: 8,
    gapX: 0,
    gapW: W,
    phase: 0,
    amp: 0,
    force: 0,
    taken: false,
    resolved: false,
    r: 0,
  };
}
function makeWind(y: number, h: number, force: number): Ent {
  return {
    kind: "wind",
    y,
    x: 0,
    h,
    gapX: 0,
    gapW: 0,
    phase: 0,
    amp: 0,
    force,
    taken: false,
    resolved: false,
    r: 0,
  };
}

export function createSim(seed = Date.now() % 1_000_000_000): Sim {
  const sim: Sim = {
    player: {
      x: W / 2,
      y: 0,
      vx: 0,
      wick: 100,
      alive: true,
      invuln: 0.85,
      combo: 0,
      comboLeft: 0,
      score: 0,
      dist: 0,
    },
    ents: [],
    nextY: 0,
    rng: mulberry32(seed),
    time: 0,
    shake: 0,
    flash: 0,
    hitstop: 0,
    continued: false,
    particles: [],
    popups: [],
    wind: 0,
    deadFor: 0,
    reason: null,
    justDied: false,
    fanning: false,
    events: [],
    biome: 0,
    goal: 0,
    par: 0,
    pace: 0,
    finite: false,
    sparksGot: 0,
    sparksTotal: 0,
    boost: 0,
    magnet: 0,
    slowing: false,
    won: false,
    levelName: "",
  };
  sim.ents.push(pickup("spark", 320, W / 2, 12));
  sim.ents.push(pickup("spark", 480, W / 2 - 28, 12));
  sim.ents.push(pickup("oil", 680, W / 2 + 10, 16));
  sim.ents.push(makeBar(980, (W - 270) / 2, 270, 0));
  sim.nextY = 1480;
  return sim;
}

export function createLevel(index: number): Sim {
  const def = LEVELS[index] ?? LEVELS[0]!;
  const sim = createSim(def.seed);
  sim.ents.length = 0;
  sim.goal = def.goal;
  sim.par = def.par;
  sim.pace = def.pace;
  sim.finite = true;
  sim.biome = def.biome;
  sim.levelName = def.name;
  sim.player.invuln = 1.1;
  const rng = sim.rng;
  const addSpark = (y: number, x: number) => {
    sim.ents.push(pickup("spark", y, clamp(x, 22, W - 22), 12));
    sim.sparksTotal++;
  };
  addSpark(300, W / 2);
  addSpark(460, W / 2 - 24);
  sim.ents.push(pickup("oil", 640, W / 2 + 8, 16));

  let y = 980;
  let n = 0;
  while (y < def.goal - 420) {
    const gapW = clamp(252 - index * 8, 118, 270);
    const wander = index === 0 || n < 1 ? 0 : (rng() - 0.5) * (36 + index * 10);
    const gapX = clamp((W - gapW) / 2 + wander, 14, W - 14 - gapW);
    const slide = index >= 7 && n % 4 === 3 ? (rng() < 0.5 ? -1 : 1) * (22 + index * 2) : 0;
    const center = gapX + gapW * 0.5;
    sim.ents.push(pickup("boost", y - 210, center, 16));
    if (n % 2 === 0) addSpark(y - 70, center + (rng() - 0.5) * gapW * 0.3);
    if (n % 4 === 2) {
      sim.ents.push(pickup("magnet", y - 160, center, 16));
      addSpark(y - 40, gapX - 36);
      addSpark(y - 40, gapX + gapW + 36);
    }
    if (n % 3 === 1) sim.ents.push(pickup("oil", y - 120, gapX + gapW * (rng() < 0.5 ? 0.28 : 0.72), 16));
    if (index >= 2 && n % 3 === 0) {
      const left = center >= W / 2;
      sim.ents.push(left ? makeSlow(y - 250, 150, 0, W * 0.36) : makeSlow(y - 250, 150, W * 0.64, W * 0.36));
    }
    if (index >= 6 && n % 5 === 4) {
      sim.ents.push(makeMoth(y - 130, center, 18 + index, 1.4 + rng()));
    }
    sim.ents.push(makeBar(y, gapX, gapW, slide));
    y += 360 - Math.min(50, index * 3);
    n++;
  }
  sim.ents.push(makeGoal(def.goal));
  sim.nextY = 1e9;
  return sim;
}

export function continueRun(sim: Sim) {
  sim.player.alive = true;
  sim.player.wick = 66;
  sim.player.invuln = 1.85;
  sim.continued = true;
  sim.deadFor = 0;
  sim.reason = null;
  sim.shake = 0;
  sim.justDied = false;
  let k = 0;
  for (const e of sim.ents) {
    if (e.y < sim.player.y + 380) continue;
    sim.ents[k++] = e;
  }
  sim.ents.length = k;
  if (sim.nextY < sim.player.y + 460) sim.nextY = sim.player.y + 460;
}

function burst(sim: Sim, x: number, y: number, color: string, n: number, speed: number) {
  const cap = 160;
  for (let i = 0; i < n; i++) {
    if (sim.particles.length > cap) sim.particles.shift();
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.35 + Math.random() * 0.75);
    sim.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 0.35 + Math.random() * 0.4,
      max: 0.75,
      size: 1.6 + Math.random() * 2.6,
      color,
      grav: -90,
    });
  }
}

function award(sim: Sim, base: number, x: number, y: number, text: string) {
  const mult = Math.max(1, sim.player.combo);
  sim.player.score += base * mult;
  sim.player.combo = Math.min(12, sim.player.combo + 1);
  sim.player.comboLeft = 2.6;
  sim.popups.push({ x, y: y + 28, text: mult > 1 ? `${text} ×${mult}` : text, life: 0.7, max: 0.7 });
}

function die(sim: Sim, reason: DeathReason) {
  if (!sim.player.alive) return;
  sim.player.alive = false;
  sim.reason = reason;
  sim.justDied = true;
  sim.hitstop = 0.09;
  sim.shake = Math.min(1, sim.shake + 0.85);
  sim.flash = 0.7;
  sim.events.push("die");
  burst(sim, sim.player.x, sim.player.y, reason === "wick" ? "#ffb03a" : "#ff5a1a", 26, 160);
}

function difficulty(dist: number) {
  return clamp((dist - 700) / 7000, 0, 1);
}

type Pattern = "bar" | "oil" | "sparks" | "lantern" | "moths" | "wind" | "double";

function pick(rng: () => number, d: number): Pattern {
  const bag: Pattern[] = ["bar", "sparks", "oil", "lantern", "bar"];
  if (d > 0.22) bag.push("moths");
  if (d > 0.38) bag.push("wind", "oil");
  if (d > 0.55) bag.push("double");
  return bag[Math.floor(rng() * bag.length)]!;
}

function spawn(sim: Sim) {
  const d = difficulty(sim.player.dist + (sim.nextY - sim.player.y));
  const rng = sim.rng;
  const y = sim.nextY;
  const gapW = d < 0.05 ? 280 : 198 - d * 88;
  let gapX = 16 + rng() * (W - 32 - gapW);
  if (d < 0.05) gapX = (W - gapW) / 2 + (rng() - 0.5) * 16;
  const pattern = pick(rng, d);
  const slide = d > 0.75 && rng() < 0.4 ? (rng() < 0.5 ? -1 : 1) * (28 + d * 50) : 0;

  if (pattern !== "lantern") {
    sim.ents.push(makeBar(y, gapX, gapW, pattern === "double" ? 0 : slide));
  }

  if (pattern === "oil") {
    const side = rng() < 0.5 ? gapX + 22 : gapX + gapW - 22;
    sim.ents.push(pickup("oil", y - 78, clamp(side, 30, W - 30), 16));
  } else if (pattern === "sparks") {
    sim.ents.push(pickup("spark", y - 20, gapX + gapW * 0.5, 12));
    sim.ents.push(pickup("spark", y - 96, gapX + gapW * (rng() < 0.5 ? 0.22 : 0.78), 12));
  } else if (pattern === "lantern") {
    const lx = 64 + rng() * (W - 128);
    sim.ents.push(pickup("lantern", y, lx, 30));
    if (d > 0.45) {
      const gw = Math.min(W - 40, gapW + 36);
      const gx = 16 + rng() * (W - 32 - gw);
      sim.ents.push(makeBar(y + 190, gx, gw, 0));
      sim.nextY += 190;
    }
  } else if (pattern === "moths") {
    const count = d > 0.82 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      sim.ents.push(
        makeMoth(y - 50 - i * 78, gapX + gapW * (0.35 + i * 0.3), 22 + d * 48, 1.7 + rng() * 1.3),
      );
    }
  } else if (pattern === "wind") {
    sim.ents.push(makeWind(y - 210, 170, rng() < 0.5 ? -1 : 1));
  } else if (pattern === "double") {
    const gw2 = gapW + 8;
    const gx2 = 18 + rng() * (W - 36 - gw2);
    sim.ents.push(makeBar(y + 210, gx2, gw2, slide));
    sim.nextY += 210;
  }

  sim.nextY += 390 - d * 120;
}

function updateFx(sim: Sim, dt: number) {
  let k = 0;
  for (const p of sim.particles) {
    p.life -= dt;
    if (p.life <= 0) continue;
    p.vy += p.grav * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    sim.particles[k++] = p;
  }
  sim.particles.length = k;
  let j = 0;
  for (const pop of sim.popups) {
    pop.life -= dt;
    pop.y += 36 * dt;
    if (pop.life > 0) sim.popups[j++] = pop;
  }
  sim.popups.length = j;
}

export function tick(sim: Sim, dt: number, input: Input) {
  if (sim.won) {
    updateFx(sim, dt);
    sim.shake = Math.max(0, sim.shake - dt * 1.55);
    sim.flash = Math.max(0, sim.flash - dt * 2.1);
    return;
  }
  sim.time += dt;
  sim.fanning = input.pointer;
  updateFx(sim, dt);
  sim.shake = Math.max(0, sim.shake - dt * 1.55);
  sim.flash = Math.max(0, sim.flash - dt * 2.1);
  if (sim.player.invuln > 0) sim.player.invuln -= dt;

  if (!sim.player.alive) {
    sim.deadFor += dt;
    return;
  }

  if (sim.player.comboLeft > 0) {
    sim.player.comboLeft -= dt;
    if (sim.player.comboLeft <= 0) sim.player.combo = 0;
  }

  const prevX = sim.player.x;
  const prevY = sim.player.y;

  let wind = 0;
  let slowing = false;
  for (const e of sim.ents) {
    if (e.kind === "wind" && sim.player.y > e.y && sim.player.y < e.y + e.h) wind += e.force;
    if (
      e.kind === "slow" &&
      sim.player.y > e.y &&
      sim.player.y < e.y + e.h &&
      sim.player.x > e.x &&
      sim.player.x < e.x + e.gapW
    ) {
      slowing = true;
    }
    if (e.kind === "bar" && e.force !== 0 && !e.resolved) {
      e.gapX += e.force * dt;
      const min = 12;
      const max = W - 12 - e.gapW;
      if (e.gapX < min) {
        e.gapX = min;
        e.force = Math.abs(e.force);
      } else if (e.gapX > max) {
        e.gapX = max;
        e.force = -Math.abs(e.force);
      }
    }
  }
  sim.wind = wind;
  sim.slowing = slowing;
  if (sim.boost > 0) sim.boost -= dt;
  if (sim.magnet > 0) sim.magnet -= dt;
  const speed =
    (sim.pace > 0 ? sim.pace : climbSpeed(sim.player.dist)) *
    (sim.boost > 0 ? 1.62 : 1) *
    (slowing ? 0.5 : 1);

  if (input.pointer) {
    const follow = 1 - Math.exp(-14 * dt);
    sim.player.x += (input.pointerX - sim.player.x) * follow;
    sim.player.x += wind * 26 * dt;
  } else if (input.left !== input.right) {
    sim.player.x += (input.left ? -1 : 1) * 360 * dt;
    sim.player.x += wind * 64 * dt;
  } else {
    sim.player.x += wind * 155 * dt;
  }
  sim.player.x = clamp(sim.player.x, 18, W - 18);
  sim.player.vx = (sim.player.x - prevX) / Math.max(dt, 0.0001);

  sim.player.y += speed * dt;
  sim.player.dist += speed * dt;
  sim.player.score += speed * dt * 0.085;

  if (sim.goal > 0 && sim.player.y >= sim.goal) {
    sim.player.y = sim.goal;
    sim.won = true;
    sim.events.push("win");
    sim.flash = Math.max(sim.flash, 0.55);
    return;
  }

  if (!sim.finite) {
    const nextBiome = biomeAt(sim.player.dist);
  if (nextBiome !== sim.biome) {
    sim.biome = nextBiome;
    sim.events.push("sky");
    sim.popups.push({
      x: sim.player.x,
      y: sim.player.y + 46,
      text: BIOMES[nextBiome]!.name,
      life: 1.2,
      max: 1.2,
    });
    sim.player.wick = Math.min(100, sim.player.wick + 14);
    sim.player.invuln = Math.max(sim.player.invuln, 0.85);
    sim.flash = Math.max(sim.flash, 0.4);
  }
  }

  const drain = 2.35 + speed * 0.0016;
  sim.player.wick -= drain * dt;

  if (!input.reduced && sim.particles.length < 150 && Math.random() < 0.8) {
    sim.particles.push({
      x: sim.player.x + (Math.random() - 0.5) * 8,
      y: sim.player.y - 8,
      vx: (Math.random() - 0.5) * 16,
      vy: -30 - Math.random() * 40,
      life: 0.28 + Math.random() * 0.22,
      max: 0.5,
      size: 2 + Math.random() * 2.2,
      color: Math.random() > 0.45 ? "#ffb03a" : "#ff6a2a",
      grav: -40,
    });
  }

  const pr = 15;
  for (const e of sim.ents) {
    if (!sim.player.alive) break;
    if (e.kind === "bar" && !e.resolved && prevY < e.y && sim.player.y >= e.y) {
      const left = e.gapX + pr * 0.35;
      const right = e.gapX + e.gapW - pr * 0.35;
      if (sim.player.x < left || sim.player.x > right) {
        if (sim.player.invuln <= 0) die(sim, "crash");
        else e.resolved = true;
      } else {
        e.resolved = true;
        sim.player.score += 4;
        sim.events.push("pass");
        const edge = Math.min(sim.player.x - e.gapX, e.gapX + e.gapW - sim.player.x);
        if (edge < 38) {
          award(sim, 14, sim.player.x, sim.player.y, "близко");
          sim.events.push("near");
          sim.flash = Math.max(sim.flash, 0.28);
          sim.shake = Math.min(1, sim.shake + 0.16);
        }
      }
    } else if (e.kind === "moth") {
      const mx = e.x + Math.sin(sim.time * e.force + e.phase) * e.amp;
      const dx = sim.player.x - mx;
      const dy = sim.player.y - e.y;
      const rr = pr + e.r;
      if (dx * dx + dy * dy < rr * rr && sim.player.invuln <= 0) die(sim, "crash");
    } else if ((e.kind === "oil" || e.kind === "spark" || e.kind === "lantern") && !e.taken) {
      const dx = sim.player.x - e.x;
      const dy = sim.player.y - e.y;
      const rr = pr + e.r;
      if (dx * dx + dy * dy >= rr * rr) continue;
      e.taken = true;
      if (e.kind === "oil") {
        sim.player.wick = Math.min(100, sim.player.wick + 34);
        award(sim, 6, e.x, e.y, "+масло");
        sim.events.push("oil");
        sim.hitstop = Math.max(sim.hitstop, 0.03);
        burst(sim, e.x, e.y, "#f0c56a", 12, 80);
      } else if (e.kind === "spark") {
        sim.player.wick = Math.min(100, sim.player.wick + 3);
        award(sim, 8, e.x, e.y, "+искра");
        sim.events.push("spark");
        burst(sim, e.x, e.y, "#ffe08a", 7, 60);
      } else {
        const perfect = dx * dx + dy * dy < 24 * 24;
        sim.player.wick = Math.min(100, sim.player.wick + (perfect ? 14 : 6));
        award(sim, perfect ? 22 : 8, e.x, e.y, perfect ? "идеально" : "фонарь");
        sim.events.push(perfect ? "perfect" : "lantern");
        if (perfect) {
          sim.hitstop = Math.max(sim.hitstop, 0.05);
          sim.flash = Math.max(sim.flash, 0.4);
          sim.shake = Math.min(1, sim.shake + 0.2);
        }
        burst(sim, e.x, e.y, "#ff7a2f", perfect ? 16 : 8, 100);
      }
    }
  }

  if (sim.player.alive && sim.player.wick <= 0) {
    sim.player.wick = 0;
    die(sim, "wick");
  }

  let k = 0;
  for (const e of sim.ents) {
    if (e.y > sim.player.y - 760) sim.ents[k++] = e;
  }
  sim.ents.length = k;

  let guard = 0;
  while (sim.nextY < sim.player.y + STEP_LOOK && guard++ < 8) spawn(sim);
}

export function mothX(e: { x: number; amp: number; force: number; phase: number }, time: number) {
  return e.x + Math.sin(time * e.force + e.phase) * e.amp;
}
