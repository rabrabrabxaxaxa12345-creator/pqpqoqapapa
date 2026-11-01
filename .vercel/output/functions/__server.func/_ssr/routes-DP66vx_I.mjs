import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RotateCcw, c as House, l as Flame, n as VolumeX, o as Play, r as Volume2, s as Pause, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DP66vx_I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Реклама РСЯ. Пока enabled = false — рекламы нет, продолжение за искры.
* Впиши ID блоков из кабинета Яндекса и поставь enabled: true.
* fullscreen* — тип «полноэкранный», rewarded* — тип Rewarded.
*/
var ADS = {
	enabled: false,
	interstitialEvery: 3,
	yandex: {
		banner: "",
		fullscreenTouch: "",
		fullscreenDesktop: "",
		rewardedTouch: "",
		rewardedDesktop: ""
	}
};
var loader = null;
function adPlatform() {
	if (typeof window === "undefined") return "touch";
	return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900 ? "touch" : "desktop";
}
function bannerId() {
	return ADS.enabled ? ADS.yandex.banner : "";
}
function rewardedId() {
	if (!ADS.enabled) return "";
	return adPlatform() === "touch" ? ADS.yandex.rewardedTouch : ADS.yandex.rewardedDesktop;
}
function fullscreenId() {
	if (!ADS.enabled) return "";
	return adPlatform() === "touch" ? ADS.yandex.fullscreenTouch : ADS.yandex.fullscreenDesktop;
}
function loadYandex() {
	if (typeof window === "undefined") return Promise.resolve();
	window.yaContextCb = window.yaContextCb || [];
	if (window.Ya?.Context?.AdvManager) return Promise.resolve();
	if (loader) return loader;
	loader = new Promise((resolve, reject) => {
		const s = document.createElement("script");
		s.src = "https://yandex.ru/ads/system/context.js";
		s.async = true;
		s.onload = () => resolve();
		s.onerror = () => {
			loader = null;
			reject(/* @__PURE__ */ new Error("yandex-ads"));
		};
		document.head.appendChild(s);
	});
	return loader;
}
function render(opts) {
	window.yaContextCb = window.yaContextCb || [];
	window.yaContextCb.push(() => {
		window.Ya?.Context?.AdvManager?.render(opts);
	});
}
function mountBanner(blockId, renderTo) {
	if (!blockId) return;
	loadYandex().then(() => render({
		blockId,
		renderTo
	})).catch(() => {});
}
function showInterstitial() {
	const blockId = fullscreenId();
	if (!blockId) return;
	const platform = adPlatform();
	loadYandex().then(() => render({
		blockId,
		type: "fullscreen",
		platform,
		onClose: () => {}
	})).catch(() => {});
}
function showRewarded(onReward, onDone) {
	const blockId = rewardedId();
	if (!blockId) {
		onDone();
		return;
	}
	const platform = adPlatform();
	let settled = false;
	const finish = () => {
		if (settled) return;
		settled = true;
		onDone();
	};
	const timer = window.setTimeout(finish, 12e3);
	loadYandex().then(() => render({
		blockId,
		type: "rewarded",
		platform,
		onRewarded: (ok) => {
			if (ok) onReward();
		},
		onClose: () => {
			window.clearTimeout(timer);
			finish();
		}
	})).catch(() => {
		window.clearTimeout(timer);
		finish();
	});
}
var PHRASES = [
	{
		bass: 73.42,
		notes: [
			220,
			261.6,
			196,
			246.9,
			174.6,
			220,
			293.7,
			196
		],
		step: .48
	},
	{
		bass: 82.41,
		notes: [
			246.9,
			196,
			220,
			293.7,
			174.6,
			246.9,
			329.6,
			196
		],
		step: .44
	},
	{
		bass: 87.31,
		notes: [
			261.6,
			196,
			329.6,
			246.9,
			174.6,
			220,
			311.1,
			196
		],
		step: .52
	},
	{
		bass: 98,
		notes: [
			293.7,
			349.2,
			220,
			261.6,
			392,
			329.6,
			246.9,
			293.7
		],
		step: .42
	},
	{
		bass: 65.41,
		notes: [
			196,
			246.9,
			164.8,
			220,
			293.7,
			174.6,
			329.6,
			246.9
		],
		step: .5
	}
];
var AudioEngine = class {
	ctx = null;
	master = null;
	music = null;
	sfx = null;
	noiseBuf = null;
	nextNote = 0;
	step = 0;
	muted = false;
	unlock() {
		if (!this.ctx) {
			const ctx = new AudioContext({ latencyHint: "interactive" });
			const master = ctx.createGain();
			const music = ctx.createGain();
			const sfx = ctx.createGain();
			music.gain.value = 1;
			sfx.gain.value = 1;
			master.gain.value = this.muted ? 0 : .85;
			music.connect(master);
			sfx.connect(master);
			master.connect(ctx.destination);
			this.ctx = ctx;
			this.master = master;
			this.music = music;
			this.sfx = sfx;
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	resume() {
		if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
	}
	setMuted(m) {
		this.muted = m;
		if (!this.ctx || !this.master) return;
		this.master.gain.setTargetAtTime(m ? 0 : .85, this.ctx.currentTime, .03);
	}
	pump(mood = 0) {
		if (!this.ctx || !this.music || this.muted || this.ctx.state !== "running") return;
		const phrase = PHRASES[Math.abs(mood) % PHRASES.length];
		const t = this.ctx.currentTime;
		if (this.nextNote < t) this.nextNote = t + .02;
		while (this.nextNote < t + .4) {
			const note = phrase.notes[this.step % phrase.notes.length];
			this.tone(note, this.nextNote, .55, .022, "triangle", this.music);
			if (this.step % 8 === 0) {
				this.tone(phrase.bass, this.nextNote, 1.6, .034, "sine", this.music);
				this.tone(phrase.bass * 1.5, this.nextNote, 1.4, .012, "sine", this.music);
			} else if (this.step % 4 === 0) this.tone(phrase.bass, this.nextNote, .7, .02, "sine", this.music);
			if (this.step % 2 === 0) this.tone(note * 2, this.nextNote, .12, .007, "sine", this.music);
			this.step++;
			this.nextNote += phrase.step;
		}
	}
	play(ev) {
		if (!this.ctx || !this.sfx || this.muted) return;
		const now = this.ctx.currentTime;
		const rate = .94 + Math.random() * .12;
		if (ev === "pass") this.tone(620 * rate, now, .05, .03, "triangle", this.sfx);
		else if (ev === "near") this.tone(880 * rate, now, .09, .05, "square", this.sfx);
		else if (ev === "oil") {
			this.tone(420, now, .12, .06, "sine", this.sfx);
			this.tone(640, now + .05, .14, .05, "sine", this.sfx);
		} else if (ev === "spark") this.tone(980 * rate, now, .08, .04, "sine", this.sfx);
		else if (ev === "lantern") this.tone(520, now, .16, .05, "triangle", this.sfx);
		else if (ev === "perfect") {
			this.tone(660, now, .14, .06, "triangle", this.sfx);
			this.tone(990, now + .06, .18, .05, "sine", this.sfx);
		} else if (ev === "die") {
			this.noise(now, .28, .2);
			this.tone(140, now, .32, .12, "sine", this.sfx);
		} else if (ev === "sky") {
			this.tone(523, now, .22, .05, "sine", this.sfx);
			this.tone(784, now + .08, .28, .04, "triangle", this.sfx);
		} else if (ev === "boost") {
			this.tone(440, now, .08, .05, "square", this.sfx);
			this.tone(660, now + .06, .12, .04, "triangle", this.sfx);
		} else if (ev === "magnet") {
			this.tone(310, now, .16, .04, "sine", this.sfx);
			this.tone(466, now + .05, .14, .035, "sine", this.sfx);
		} else if (ev === "win") {
			this.tone(523, now, .16, .05, "triangle", this.sfx);
			this.tone(659, now + .1, .18, .05, "triangle", this.sfx);
			this.tone(784, now + .2, .28, .05, "sine", this.sfx);
		}
	}
	tone(freq, when, dur, gain, type, bus) {
		if (!this.ctx) return;
		const o = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		o.type = type;
		o.frequency.setValueAtTime(freq, when);
		g.gain.setValueAtTime(gain, when);
		g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
		o.connect(g);
		g.connect(bus);
		o.start(when);
		o.stop(when + dur + .02);
	}
	noise(when, dur, gain) {
		if (!this.ctx || !this.sfx) return;
		if (!this.noiseBuf) {
			const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * .4), this.ctx.sampleRate);
			const data = buf.getChannelData(0);
			for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
			this.noiseBuf = buf;
		}
		const src = this.ctx.createBufferSource();
		src.buffer = this.noiseBuf;
		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(900, when);
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(gain, when);
		g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
		src.connect(filter);
		filter.connect(g);
		g.connect(this.sfx);
		src.start(when);
		src.stop(when + dur);
	}
};
var LEVELS = [
	{
		name: "Тихий двор",
		seed: 11,
		goal: 2500,
		par: 26,
		biome: 0,
		pace: 100
	},
	{
		name: "Фонари",
		seed: 23,
		goal: 2900,
		par: 28,
		biome: 0,
		pace: 104
	},
	{
		name: "Провода",
		seed: 37,
		goal: 3100,
		par: 28,
		biome: 1,
		pace: 108
	},
	{
		name: "Проулок",
		seed: 41,
		goal: 3300,
		par: 28,
		biome: 1,
		pace: 110
	},
	{
		name: "Крыши",
		seed: 59,
		goal: 3500,
		par: 28,
		biome: 1,
		pace: 114
	},
	{
		name: "Сквозняк",
		seed: 67,
		goal: 3700,
		par: 28,
		biome: 2,
		pace: 116
	},
	{
		name: "Метель",
		seed: 73,
		goal: 3900,
		par: 32,
		biome: 2,
		pace: 118
	},
	{
		name: "Дым",
		seed: 89,
		goal: 4100,
		par: 33,
		biome: 2,
		pace: 120
	},
	{
		name: "Рассвет",
		seed: 97,
		goal: 4300,
		par: 33,
		biome: 3,
		pace: 122
	},
	{
		name: "Решётки",
		seed: 103,
		goal: 4500,
		par: 34,
		biome: 3,
		pace: 124
	},
	{
		name: "Высота",
		seed: 127,
		goal: 4700,
		par: 35,
		biome: 4,
		pace: 126
	},
	{
		name: "Искра",
		seed: 131,
		goal: 4900,
		par: 35,
		biome: 4,
		pace: 128
	},
	{
		name: "Буря",
		seed: 149,
		goal: 5100,
		par: 36,
		biome: 2,
		pace: 130
	},
	{
		name: "Уголь",
		seed: 157,
		goal: 5300,
		par: 37,
		biome: 3,
		pace: 132
	},
	{
		name: "Последний фитиль",
		seed: 173,
		goal: 5600,
		par: 38,
		biome: 4,
		pace: 134
	}
];
function starCount(mask) {
	return (mask & 1) + ((mask & 2) >> 1) + ((mask & 4) >> 2);
}
function isOpen(masks, index) {
	return index <= 0 || ((masks[index - 1] ?? 0) & 1) === 1;
}
function starsEarned(won, got, need, time, par) {
	if (!won) return 0;
	let mask = 1;
	if (need > 0 && got >= need) mask |= 2;
	if (time <= par + .05) mask |= 4;
	return mask;
}
var STEP_LOOK = 980;
function sparkGain(score) {
	return Math.max(3, Math.round(score / 15));
}
function metersOf(dist) {
	return Math.floor(dist / 48);
}
function climbSpeed(dist) {
	const ramp = Math.max(0, dist - 600);
	return Math.min(300, 96 + ramp * .026);
}
var BIOMES = [
	{
		name: "Двор",
		until: 22
	},
	{
		name: "Крыши",
		until: 52
	},
	{
		name: "Метель",
		until: 90
	},
	{
		name: "Рассвет",
		until: 140
	},
	{
		name: "Высота",
		until: Infinity
	}
];
function biomeAt(dist) {
	const meters = dist / 48;
	for (let i = 0; i < BIOMES.length; i++) if (meters < BIOMES[i].until) return i;
	return BIOMES.length - 1;
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function makeBar(y, gapX, gapW, force) {
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
		r: 0
	};
}
function makeMoth(y, x, amp, speed) {
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
		r: 15
	};
}
function pickup(kind, y, x, r) {
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
		r
	};
}
function makeSlow(y, h, x, w) {
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
		r: 0
	};
}
function makeGoal(y) {
	return {
		kind: "goal",
		y,
		x: 0,
		h: 8,
		gapX: 0,
		gapW: 390,
		phase: 0,
		amp: 0,
		force: 0,
		taken: false,
		resolved: false,
		r: 0
	};
}
function makeWind(y, h, force) {
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
		r: 0
	};
}
function createSim(seed = Date.now() % 1e9) {
	const sim = {
		player: {
			x: 195,
			y: 0,
			vx: 0,
			wick: 100,
			alive: true,
			invuln: .85,
			combo: 0,
			comboLeft: 0,
			score: 0,
			dist: 0
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
		levelName: ""
	};
	sim.ents.push(pickup("spark", 320, 195, 12));
	sim.ents.push(pickup("spark", 480, 167, 12));
	sim.ents.push(pickup("oil", 680, 205, 16));
	sim.ents.push(makeBar(980, 60, 270, 0));
	sim.nextY = 1480;
	return sim;
}
function createLevel(index) {
	const def = LEVELS[index] ?? LEVELS[0];
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
	const addSpark = (y, x) => {
		sim.ents.push(pickup("spark", y, clamp(x, 22, 368), 12));
		sim.sparksTotal++;
	};
	addSpark(300, 195);
	addSpark(460, 171);
	sim.ents.push(pickup("oil", 640, 203, 16));
	let y = 980;
	let n = 0;
	while (y < def.goal - 420) {
		const gapW = clamp(252 - index * 8, 118, 270);
		const wander = index === 0 || n < 1 ? 0 : (rng() - .5) * (36 + index * 10);
		const gapX = clamp((390 - gapW) / 2 + wander, 14, 376 - gapW);
		const slide = index >= 11 && n % 5 === 4 ? (rng() < .5 ? -1 : 1) * 18 : 0;
		const center = gapX + gapW * .5;
		if (n % 2 === 0) sim.ents.push(pickup("boost", y - 220, center, 16));
		if (n % 2 === 0) addSpark(y - 80, center + (rng() - .5) * gapW * .28);
		if (n % 3 === 2) {
			sim.ents.push(pickup("magnet", y - 150, center, 16));
			addSpark(y - 30, gapX - 28);
			addSpark(y - 30, gapX + gapW + 28);
		}
		if (n % 3 === 1) sim.ents.push(pickup("oil", y - 120, gapX + gapW * (rng() < .5 ? .28 : .72), 16));
		if (index >= 3 && n % 3 === 0) {
			const left = center >= 195;
			sim.ents.push(left ? makeSlow(y - 260, 160, 0, 390 * .34) : makeSlow(y - 260, 160, 390 * .66, 390 * .34));
		}
		if (index >= 10 && n % 6 === 5) sim.ents.push(makeMoth(y - 130, gapX + gapW * (rng() < .5 ? .18 : .82), 12, 1.2 + rng() * .4));
		sim.ents.push(makeBar(y, gapX, gapW, slide));
		y += 360 - Math.min(50, index * 3);
		n++;
	}
	sim.ents.push(makeGoal(def.goal));
	sim.nextY = 1e9;
	return sim;
}
function continueRun(sim) {
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
function burst(sim, x, y, color, n, speed) {
	const cap = 160;
	for (let i = 0; i < n; i++) {
		if (sim.particles.length > cap) sim.particles.shift();
		const a = Math.random() * Math.PI * 2;
		const s = speed * (.35 + Math.random() * .75);
		sim.particles.push({
			x,
			y,
			vx: Math.cos(a) * s,
			vy: Math.sin(a) * s,
			life: .35 + Math.random() * .4,
			max: .75,
			size: 1.6 + Math.random() * 2.6,
			color,
			grav: -90
		});
	}
}
function award(sim, base, x, y, text) {
	const mult = Math.max(1, sim.player.combo);
	sim.player.score += base * mult;
	sim.player.combo = Math.min(12, sim.player.combo + 1);
	sim.player.comboLeft = 2.6;
	sim.popups.push({
		x,
		y: y + 28,
		text: mult > 1 ? `${text} ×${mult}` : text,
		life: .7,
		max: .7
	});
}
function die(sim, reason) {
	if (!sim.player.alive) return;
	sim.player.alive = false;
	sim.reason = reason;
	sim.justDied = true;
	sim.hitstop = .09;
	sim.shake = Math.min(1, sim.shake + .85);
	sim.flash = .7;
	sim.events.push("die");
	burst(sim, sim.player.x, sim.player.y, reason === "wick" ? "#ffb03a" : "#ff5a1a", 26, 160);
}
function difficulty(dist) {
	return clamp((dist - 700) / 7e3, 0, 1);
}
function pick(rng, d) {
	const bag = [
		"bar",
		"sparks",
		"oil",
		"lantern",
		"bar"
	];
	if (d > .22) bag.push("moths");
	if (d > .38) bag.push("wind", "oil");
	if (d > .55) bag.push("double");
	return bag[Math.floor(rng() * bag.length)];
}
function spawn(sim) {
	const d = difficulty(sim.player.dist + (sim.nextY - sim.player.y));
	const rng = sim.rng;
	const y = sim.nextY;
	const gapW = d < .05 ? 280 : 198 - d * 88;
	let gapX = 16 + rng() * (358 - gapW);
	if (d < .05) gapX = (390 - gapW) / 2 + (rng() - .5) * 16;
	const pattern = pick(rng, d);
	const slide = d > .75 && rng() < .4 ? (rng() < .5 ? -1 : 1) * (28 + d * 50) : 0;
	if (pattern !== "lantern") sim.ents.push(makeBar(y, gapX, gapW, pattern === "double" ? 0 : slide));
	if (pattern === "oil") {
		const side = rng() < .5 ? gapX + 22 : gapX + gapW - 22;
		sim.ents.push(pickup("oil", y - 78, clamp(side, 30, 360), 16));
	} else if (pattern === "sparks") {
		sim.ents.push(pickup("spark", y - 20, gapX + gapW * .5, 12));
		sim.ents.push(pickup("spark", y - 96, gapX + gapW * (rng() < .5 ? .22 : .78), 12));
	} else if (pattern === "lantern") {
		const lx = 64 + rng() * 262;
		sim.ents.push(pickup("lantern", y, lx, 30));
		if (d > .45) {
			const gw = Math.min(350, gapW + 36);
			const gx = 16 + rng() * (358 - gw);
			sim.ents.push(makeBar(y + 190, gx, gw, 0));
			sim.nextY += 190;
		}
	} else if (pattern === "moths") {
		const count = d > .82 ? 2 : 1;
		for (let i = 0; i < count; i++) sim.ents.push(makeMoth(y - 50 - i * 78, gapX + gapW * (.35 + i * .3), 22 + d * 48, 1.7 + rng() * 1.3));
	} else if (pattern === "wind") sim.ents.push(makeWind(y - 210, 170, rng() < .5 ? -1 : 1));
	else if (pattern === "double") {
		const gw2 = gapW + 8;
		const gx2 = 18 + rng() * (354 - gw2);
		sim.ents.push(makeBar(y + 210, gx2, gw2, slide));
		sim.nextY += 210;
	}
	sim.nextY += 390 - d * 120;
}
function updateFx(sim, dt) {
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
function tick(sim, dt, input) {
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
		if (e.kind === "slow" && sim.player.y > e.y && sim.player.y < e.y + e.h && sim.player.x > e.x && sim.player.x < e.x + e.gapW) slowing = true;
		if (e.kind === "bar" && e.force !== 0 && !e.resolved) {
			e.gapX += e.force * dt;
			const min = 12;
			const max = 378 - e.gapW;
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
	const speed = (sim.pace > 0 ? sim.pace : climbSpeed(sim.player.dist)) * (sim.boost > 0 ? 1.62 : 1) * (slowing ? .5 : 1);
	if (input.pointer) {
		const follow = 1 - Math.exp(-14 * dt);
		sim.player.x += (input.pointerX - sim.player.x) * follow;
		sim.player.x += wind * 26 * dt;
	} else if (input.left !== input.right) {
		sim.player.x += (input.left ? -1 : 1) * 360 * dt;
		sim.player.x += wind * 64 * dt;
	} else sim.player.x += wind * 155 * dt;
	sim.player.x = clamp(sim.player.x, 18, 372);
	sim.player.vx = (sim.player.x - prevX) / Math.max(dt, 1e-4);
	sim.player.y += speed * dt;
	sim.player.dist += speed * dt;
	sim.player.score += speed * dt * .085;
	if (sim.goal > 0 && sim.player.y >= sim.goal) {
		sim.player.y = sim.goal;
		sim.won = true;
		sim.events.push("win");
		sim.flash = Math.max(sim.flash, .55);
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
				text: BIOMES[nextBiome].name,
				life: 1.2,
				max: 1.2
			});
			sim.player.wick = Math.min(100, sim.player.wick + 14);
			sim.player.invuln = Math.max(sim.player.invuln, .85);
			sim.flash = Math.max(sim.flash, .4);
		}
	}
	const drain = 2.35 + speed * .0016;
	sim.player.wick -= drain * dt;
	if (!input.reduced && sim.particles.length < 150 && Math.random() < .8) sim.particles.push({
		x: sim.player.x + (Math.random() - .5) * 8,
		y: sim.player.y - 8,
		vx: (Math.random() - .5) * 16,
		vy: -30 - Math.random() * 40,
		life: .28 + Math.random() * .22,
		max: .5,
		size: 2 + Math.random() * 2.2,
		color: Math.random() > .45 ? "#ffb03a" : "#ff6a2a",
		grav: -40
	});
	const pr = 15;
	if (sim.magnet > 0) for (const e of sim.ents) {
		if (e.kind !== "spark" || e.taken) continue;
		const dx = sim.player.x - e.x;
		const dy = sim.player.y - e.y;
		const d2 = dx * dx + dy * dy;
		if (d2 > 52900 || d2 < 16) continue;
		const d = Math.sqrt(d2);
		const step = Math.min(d - 4, 360 * dt);
		e.x += dx / d * step;
		e.y += dy / d * step;
	}
	for (const e of sim.ents) {
		if (!sim.player.alive) break;
		if (e.kind === "bar" && !e.resolved && prevY < e.y && sim.player.y >= e.y) {
			const left = e.gapX + pr * .35;
			const right = e.gapX + e.gapW - pr * .35;
			if (sim.player.x < left || sim.player.x > right) {
				if (sim.player.invuln <= 0) die(sim, "crash");
				else e.resolved = true;
			} else {
				e.resolved = true;
				sim.player.score += 4;
				sim.events.push("pass");
				if (Math.min(sim.player.x - e.gapX, e.gapX + e.gapW - sim.player.x) < 38) {
					award(sim, 14, sim.player.x, sim.player.y, "близко");
					sim.events.push("near");
					sim.flash = Math.max(sim.flash, .28);
					sim.shake = Math.min(1, sim.shake + .16);
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
				sim.hitstop = Math.max(sim.hitstop, .03);
				burst(sim, e.x, e.y, "#f0c56a", 12, 80);
			} else if (e.kind === "spark") {
				sim.player.wick = Math.min(100, sim.player.wick + 3);
				sim.sparksGot++;
				award(sim, 8, e.x, e.y, "+искра");
				sim.events.push("spark");
				burst(sim, e.x, e.y, "#ffe08a", 7, 60);
			} else {
				const perfect = dx * dx + dy * dy < 576;
				sim.player.wick = Math.min(100, sim.player.wick + (perfect ? 14 : 6));
				award(sim, perfect ? 22 : 8, e.x, e.y, perfect ? "идеально" : "фонарь");
				sim.events.push(perfect ? "perfect" : "lantern");
				if (perfect) {
					sim.hitstop = Math.max(sim.hitstop, .05);
					sim.flash = Math.max(sim.flash, .4);
					sim.shake = Math.min(1, sim.shake + .2);
				}
				burst(sim, e.x, e.y, "#ff7a2f", perfect ? 16 : 8, 100);
			}
		} else if ((e.kind === "boost" || e.kind === "magnet") && !e.taken) {
			const dx = sim.player.x - e.x;
			const dy = sim.player.y - e.y;
			const rr = pr + e.r;
			if (dx * dx + dy * dy >= rr * rr) continue;
			e.taken = true;
			if (e.kind === "boost") {
				sim.boost = 2.3;
				award(sim, 4, e.x, e.y, "порыв");
				sim.events.push("boost");
				burst(sim, e.x, e.y, "#ffb03a", 10, 90);
			} else {
				sim.magnet = 4.6;
				award(sim, 4, e.x, e.y, "магнит");
				sim.events.push("magnet");
				burst(sim, e.x, e.y, "#f6ead7", 10, 70);
			}
		}
	}
	if (sim.player.alive && sim.player.wick <= 0) {
		sim.player.wick = 0;
		die(sim, "wick");
	}
	let k = 0;
	for (const e of sim.ents) if (e.y > sim.player.y - 760) sim.ents[k++] = e;
	sim.ents.length = k;
	let guard = 0;
	while (sim.nextY < sim.player.y + STEP_LOOK && guard++ < 8) spawn(sim);
}
function mothX(e, time) {
	return e.x + Math.sin(time * e.force + e.phase) * e.amp;
}
var SKIES = [
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
		roofs: true
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
		roofs: true
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
		roofs: true
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
		roofs: true
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
		roofs: false
	}
];
function skyOf(index) {
	return SKIES[Math.max(0, Math.min(SKIES.length - 1, index))];
}
function hash(n) {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
}
function screenY(worldY, cam, lh) {
	return cam + lh - worldY;
}
function viewHeight(cssW, cssH) {
	return 390 * (cssH / Math.max(cssW, 1));
}
function fit(ctx, cssW, cssH, dpr) {
	const scale = cssW / 390 * dpr;
	ctx.setTransform(scale, 0, 0, scale, 0, 0);
	return viewHeight(cssW, cssH);
}
function sky(ctx, lh, look) {
	const g = ctx.createLinearGradient(0, 0, 0, lh);
	g.addColorStop(0, look.top);
	g.addColorStop(.45, look.mid);
	g.addColorStop(1, look.bot);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 390, lh);
}
function moon(ctx, lh, look) {
	const x = 304.2;
	const y = lh * .11;
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
function skyline(ctx, cam, lh, parallax, seed, color, win) {
	const span = 78;
	const shift = cam * parallax % span;
	ctx.fillStyle = color;
	for (let i = -2; i < 8; i++) {
		const x = i * span - shift;
		const h = 36 + hash(i * 13 + seed) * (seed > 5 ? 120 : 70);
		ctx.fillRect(x, lh - h, 72, h + 8);
		if (seed > 5) {
			for (let wy = lh - h + 12; wy < lh - 10; wy += 18) for (let wx = x + 10; wx < x + span - 16; wx += 16) {
				if (hash(wx * .17 + wy * .13 + seed) < .62) continue;
				ctx.fillStyle = hash(wx + wy) > .45 ? win : "rgba(255, 120, 60, 0.28)";
				ctx.fillRect(wx, wy, 6, 8);
			}
			ctx.fillStyle = color;
		}
	}
}
function wires(ctx, cam, lh) {
	ctx.strokeStyle = "rgba(40, 16, 22, 0.85)";
	ctx.lineWidth = 1.4;
	for (let row = 0; row < 3; row++) {
		const base = lh * (.16 + row * .07);
		ctx.beginPath();
		for (let x = 0; x <= 390; x += 10) {
			const y = base + Math.sin((x + cam * .25 + row * 40) * .03) * 7;
			if (x === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
	}
}
function backdrop(ctx, cam, lh, biome) {
	const look = skyOf(biome);
	sky(ctx, lh, look);
	moon(ctx, lh, look);
	const stars = look.roofs ? 16 : 36;
	for (let i = 0; i < stars; i++) {
		const x = hash(i + 2 + biome) * 390;
		const drift = look.snow ? cam * .22 : cam * .02;
		const y = (hash(i + 9) * lh * .7 + drift) % (lh * .72);
		ctx.fillStyle = look.star;
		const s = look.snow ? 2.2 : 1.5;
		ctx.fillRect(x, y, s, look.snow ? s + 1 : s);
	}
	if (look.roofs) {
		skyline(ctx, cam, lh, .08, 2, look.far, look.win);
		skyline(ctx, cam, lh, .16, 8, look.near, look.win);
		wires(ctx, cam, lh);
	}
}
function lantern(ctx, x, y, s, lit) {
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
	body.addColorStop(.5, lit ? "#ff7a3a" : "#4a2a28");
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
function drawFlame(ctx, x, y, flame, time, vx, alpha, fan) {
	const stretch = 1 + Math.min(.4, Math.abs(vx) / 900);
	const sx = stretch * (fan ? 1.06 : 1);
	const sy = 1 / stretch * (fan ? 1.08 : 1);
	ctx.save();
	ctx.translate(x, y);
	ctx.globalAlpha = alpha;
	ctx.scale(sx, -sy);
	const glow = ctx.createRadialGradient(0, 10, 2, 0, 8, 52);
	glow.addColorStop(0, flame.core);
	glow.addColorStop(.35, flame.mid);
	glow.addColorStop(1, "rgba(0,0,0,0)");
	ctx.fillStyle = glow;
	ctx.globalAlpha = alpha * .85;
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
	body.addColorStop(.45, flame.mid);
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
function roundBar(ctx, x, y, w, h) {
	if (w <= 2) return;
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, 8);
	ctx.fill();
}
function drawBar(ctx, x, y, gapW, h) {
	const top = y - h / 2;
	const grad = ctx.createLinearGradient(0, top, 0, top + h);
	grad.addColorStop(0, "#3a242c");
	grad.addColorStop(.5, "#1a1014");
	grad.addColorStop(1, "#0e090c");
	ctx.fillStyle = grad;
	roundBar(ctx, -8, top, x + 8, h);
	roundBar(ctx, x + gapW, top, 390 - (x + gapW) + 8, h);
	const glow = ctx.createLinearGradient(x, 0, x + gapW, 0);
	glow.addColorStop(0, "rgba(255, 122, 47, 0.0)");
	glow.addColorStop(.5, "rgba(255, 176, 90, 0.28)");
	glow.addColorStop(1, "rgba(255, 122, 47, 0.0)");
	ctx.fillStyle = glow;
	ctx.fillRect(x, top - 10, gapW, h + 20);
	ctx.fillStyle = "#f0c56a";
	ctx.fillRect(x - 3, top, 3, h);
	ctx.fillRect(x + gapW, top, 3, h);
}
function drawMoth(ctx, x, y, time) {
	const flap = .55 + Math.sin(time * 22) * .35;
	ctx.save();
	ctx.translate(x, y);
	ctx.fillStyle = "rgba(214, 196, 176, 0.9)";
	ctx.beginPath();
	ctx.ellipse(-8, 0, 10, 6 * flap, -.4, 0, Math.PI * 2);
	ctx.ellipse(8, 0, 10, 6 * flap, .4, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "#2a1618";
	ctx.beginPath();
	ctx.ellipse(0, 0, 2.4, 6, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawOil(ctx, x, y, time) {
	ctx.save();
	ctx.translate(x, y + Math.sin(time * 3) * 3);
	const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 14);
	g.addColorStop(0, "#fff4d2");
	g.addColorStop(.45, "#f0c56a");
	g.addColorStop(1, "#e08a22");
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(0, 2, 11, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "rgba(255,255,255,0.7)";
	ctx.beginPath();
	ctx.ellipse(-3, -2, 2.2, 3.4, -.4, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawSpark(ctx, x, y, time) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(time * 1.5);
	ctx.fillStyle = "#ffe7a8";
	ctx.globalAlpha = .95;
	for (let i = 0; i < 4; i++) {
		ctx.rotate(Math.PI / 4);
		ctx.fillRect(-1.3, -9, 2.6, 18);
	}
	ctx.restore();
}
function drawBoost(ctx, x, y, time) {
	ctx.save();
	ctx.translate(x, y);
	ctx.strokeStyle = "#ffb03a";
	ctx.lineWidth = 2.4;
	ctx.beginPath();
	ctx.arc(0, 0, 15 + Math.sin(time * 6) * 1.2, 0, Math.PI * 2);
	ctx.stroke();
	ctx.fillStyle = "#ffd27a";
	ctx.beginPath();
	ctx.moveTo(0, -8);
	ctx.lineTo(6, 2);
	ctx.lineTo(2, 2);
	ctx.lineTo(2, 8);
	ctx.lineTo(-2, 8);
	ctx.lineTo(-2, 2);
	ctx.lineTo(-6, 2);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}
function drawMagnet(ctx, x, y, time) {
	ctx.save();
	ctx.translate(x, y);
	ctx.strokeStyle = "#f6ead7";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(0, 1, 10, Math.PI * .15, Math.PI * .85, true);
	ctx.stroke();
	ctx.fillStyle = "#ffb03a";
	ctx.fillRect(-12, -2, 4, 8);
	ctx.fillRect(8, -2, 4, 8);
	ctx.globalAlpha = .35 + Math.sin(time * 5) * .15;
	ctx.beginPath();
	ctx.arc(0, 0, 16, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}
function fog(ctx, lh) {
	const g = ctx.createLinearGradient(0, lh * .72, 0, lh);
	g.addColorStop(0, "rgba(12, 7, 12, 0)");
	g.addColorStop(1, "rgba(12, 7, 12, 0.55)");
	ctx.fillStyle = g;
	ctx.fillRect(0, lh * .72, 390, lh * .28);
	const v = ctx.createRadialGradient(195, lh * .45, lh * .2, 195, lh * .5, lh * .78);
	v.addColorStop(0, "rgba(0,0,0,0)");
	v.addColorStop(1, "rgba(0,0,0,0.38)");
	ctx.fillStyle = v;
	ctx.fillRect(0, 0, 390, lh);
}
function drawMenu(ctx, time, lh, flame, reduced) {
	const cam = reduced ? 40 : time * 22;
	backdrop(ctx, cam, lh, Math.floor(time / 7) % SKIES.length);
	const count = 4;
	for (let i = 0; i < count; i++) {
		const y = (i * 180 - cam * .4) % (lh + 80) + 20;
		lantern(ctx, 48 + hash(i + 3) * 294, y, .72, hash(i + 1) > .3);
	}
	drawFlame(ctx, 195 + Math.sin(time * .9) * 28, lh * .4, flame, time, Math.cos(time * .9) * 40, 1, false);
	fog(ctx, lh);
}
function drawPlay(ctx, sim, lh, flame, reduced, allowShake) {
	const anchor = lh * .66;
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
			ctx.fillRect(0, y1, 390, y2 - y1);
			ctx.fillStyle = "rgba(246, 234, 215, 0.35)";
			const dir = e.force > 0 ? 1 : -1;
			for (let i = 0; i < 5; i++) {
				const yy = y1 + (i + .5) * (y2 - y1) / 5;
				const xx = (sim.time * 80 * dir + i * 70) % 430 - 20;
				ctx.fillRect(dir > 0 ? xx : 390 - xx, yy, 18, 2);
			}
			continue;
		}
		if (e.kind === "slow") {
			const y1 = screenY(e.y + e.h, cam, lh);
			const y2 = screenY(e.y, cam, lh);
			if (y2 < -20 || y1 > lh + 20) continue;
			ctx.fillStyle = "rgba(42, 18, 16, 0.55)";
			ctx.fillRect(e.x, y1, e.gapW, Math.max(0, y2 - y1));
			ctx.fillStyle = "rgba(90, 36, 28, 0.45)";
			ctx.fillRect(e.x, y1, e.gapW, 6);
			continue;
		}
		if (e.kind === "goal") {
			const gy = screenY(e.y, cam, lh);
			if (gy < -30 || gy > lh + 30) continue;
			const glow = ctx.createLinearGradient(0, gy - 18, 0, gy + 18);
			glow.addColorStop(0, "rgba(255, 176, 58, 0)");
			glow.addColorStop(.5, "rgba(255, 176, 58, 0.55)");
			glow.addColorStop(1, "rgba(255, 176, 58, 0)");
			ctx.fillStyle = glow;
			ctx.fillRect(0, gy - 18, 390, 36);
			ctx.fillStyle = "#ffe7a8";
			ctx.fillRect(0, gy - 2, 390, 4);
			ctx.font = "700 13px Unbounded, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText("финиш", 195, gy - 10);
			continue;
		}
		const sy = screenY(e.y, cam, lh);
		if (sy < -80 || sy > lh + 80) continue;
		if (e.kind === "bar" && !e.taken) drawBar(ctx, e.gapX, sy, e.gapW, e.h);
		else if (e.kind === "moth") drawMoth(ctx, mothX(e, sim.time), sy, sim.time + e.phase);
		else if (e.kind === "oil" && !e.taken) drawOil(ctx, e.x, sy, sim.time);
		else if (e.kind === "spark" && !e.taken) drawSpark(ctx, e.x, sy, sim.time + e.y);
		else if (e.kind === "lantern" && !e.taken) lantern(ctx, e.x, sy, 1, true);
		else if (e.kind === "boost" && !e.taken) drawBoost(ctx, e.x, sy, sim.time);
		else if (e.kind === "magnet" && !e.taken) drawMagnet(ctx, e.x, sy, sim.time);
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
	if (sim.player.invuln <= 0 || Math.sin(sim.time * 28) > 0 || !sim.player.alive) drawFlame(ctx, sim.player.x, py, flame, sim.time, sim.player.vx, fade, sim.fanning && sim.player.alive);
	if (sim.magnet > 0 && sim.player.alive) {
		ctx.strokeStyle = "rgba(246, 234, 215, 0.4)";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(sim.player.x, py, 58 + Math.sin(sim.time * 5) * 3, 0, Math.PI * 2);
		ctx.stroke();
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
		ctx.fillStyle = `rgba(255, 220, 180, ${sim.flash * .22})`;
		ctx.fillRect(-20, -20, 430, lh + 40);
	}
	fog(ctx, lh);
	ctx.restore();
}
var FLAMES = [
	{
		id: "iskra",
		name: "Искра",
		cost: 0,
		hint: "родной огонь",
		core: "#fff4d2",
		mid: "#ffb03a",
		out: "#ff5a1a"
	},
	{
		id: "yantar",
		name: "Янтарь",
		cost: 350,
		hint: "густой мёд",
		core: "#fff1c2",
		mid: "#ff9a1f",
		out: "#e25a00"
	},
	{
		id: "sazha",
		name: "Сажа",
		cost: 500,
		hint: "тёмный фитиль",
		core: "#ffd0c8",
		mid: "#c4382a",
		out: "#2a1214"
	},
	{
		id: "yad",
		name: "Яд",
		cost: 1e3,
		hint: "болотная свеча",
		core: "#e8ffb0",
		mid: "#7dce3a",
		out: "#2f6a18"
	},
	{
		id: "malina",
		name: "Малина",
		cost: 800,
		hint: "ночная ягода",
		core: "#ffe0ea",
		mid: "#ff5d8a",
		out: "#c41d52"
	},
	{
		id: "iney",
		name: "Иней",
		cost: 1600,
		hint: "холодный свет",
		core: "#f3fbff",
		mid: "#8ad7ff",
		out: "#3aa0d8"
	},
	{
		id: "zoloto",
		name: "Золото",
		cost: 3200,
		hint: "царский фитиль",
		core: "#fff8dc",
		mid: "#ffd76a",
		out: "#e0a020"
	},
	{
		id: "prizrak",
		name: "Призрак",
		cost: 2e3,
		hint: "почти не виден",
		core: "#ffffff",
		mid: "#d7e4ff",
		out: "#8aa0c8"
	},
	{
		id: "groza",
		name: "Гроза",
		cost: 2600,
		hint: "синяя искра",
		core: "#e8fbff",
		mid: "#3ec8ff",
		out: "#1a5cff"
	},
	{
		id: "vishnya",
		name: "Вишня",
		cost: 3800,
		hint: "густой сок",
		core: "#ffd0dc",
		mid: "#e23a62",
		out: "#7a1230"
	},
	{
		id: "siren",
		name: "Сирень",
		cost: 5200,
		hint: "ночной сад",
		core: "#f4e4ff",
		mid: "#c084fc",
		out: "#6d28d9"
	}
];
function flameById(id) {
	return FLAMES.find((f) => f.id === id) ?? FLAMES[0];
}
var KEY = "ogonyok-save-v1";
function defaultSave() {
	return {
		version: 1,
		best: 0,
		sparks: 0,
		flame: "iskra",
		owned: ["iskra"],
		muted: false,
		shake: true,
		runs: 0,
		stars: []
	};
}
function migrate(raw) {
	const base = defaultSave();
	const flame = FLAMES.some((f) => f.id === raw.flame) ? raw.flame : base.flame;
	const owned = Array.isArray(raw.owned) ? raw.owned.filter((id) => FLAMES.some((f) => f.id === id)) : base.owned;
	if (!owned.includes("iskra")) owned.unshift("iskra");
	return {
		version: 1,
		best: typeof raw.best === "number" && raw.best > 0 ? Math.floor(raw.best) : 0,
		sparks: typeof raw.sparks === "number" && raw.sparks > 0 ? Math.floor(raw.sparks) : 0,
		flame,
		owned,
		muted: Boolean(raw.muted),
		shake: raw.shake === false ? false : true,
		runs: typeof raw.runs === "number" && raw.runs > 0 ? Math.floor(raw.runs) : 0,
		stars: Array.isArray(raw.stars) ? raw.stars.map((n) => typeof n === "number" ? n & 7 : 0) : []
	};
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return defaultSave();
		return migrate(JSON.parse(raw));
	} catch {
		return defaultSave();
	}
}
function writeSave(save) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			...save,
			version: 1
		}));
	} catch {}
}
var STEP = 1 / 60;
function YandexBanner({ blockId }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el || !blockId) return;
		const id = `yandex_rtb_${blockId}`;
		el.id = id;
		mountBanner(blockId, id);
	}, [blockId]);
	if (!blockId) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "mt-3 min-h-16 w-full overflow-hidden"
	});
}
function Ogonyok() {
	const canvasRef = (0, import_react.useRef)(null);
	const stageRef = (0, import_react.useRef)(null);
	const screenRef = (0, import_react.useRef)("menu");
	const simRef = (0, import_react.useRef)(null);
	const saveRef = (0, import_react.useRef)(defaultSave());
	const keysRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const pointerRef = (0, import_react.useRef)({
		active: false,
		x: 195
	});
	const audioRef = (0, import_react.useRef)(null);
	const accRef = (0, import_react.useRef)(0);
	const menuTime = (0, import_react.useRef)(0);
	const deathLatch = (0, import_react.useRef)(false);
	const winLatch = (0, import_react.useRef)(false);
	const levelRef = (0, import_react.useRef)(-1);
	const tutorialRef = (0, import_react.useRef)(false);
	const reducedRef = (0, import_react.useRef)(false);
	const onDeadRef = (0, import_react.useRef)(() => {});
	const onWinRef = (0, import_react.useRef)(() => {});
	const startRef = (0, import_react.useRef)(() => {});
	const scoreRef = (0, import_react.useRef)(null);
	const meterRef = (0, import_react.useRef)(null);
	const comboRef = (0, import_react.useRef)(null);
	const hintRef = (0, import_react.useRef)(null);
	const wickRef = (0, import_react.useRef)(null);
	const skyRef = (0, import_react.useRef)(null);
	const [screen, setScreenState] = (0, import_react.useState)("menu");
	const [save, setSave] = (0, import_react.useState)(() => typeof window === "undefined" ? defaultSave() : loadSave());
	const [stats, setStats] = (0, import_react.useState)(null);
	const [adBusy, setAdBusy] = (0, import_react.useState)(false);
	saveRef.current = save;
	function go(next) {
		screenRef.current = next;
		setScreenState(next);
	}
	function commit(mutator) {
		setSave((prev) => {
			const next = mutator(prev);
			saveRef.current = next;
			writeSave(next);
			return next;
		});
	}
	function getAudio() {
		if (!audioRef.current) audioRef.current = new AudioEngine();
		return audioRef.current;
	}
	function readInput() {
		const keys = keysRef.current;
		return {
			pointer: pointerRef.current.active,
			pointerX: pointerRef.current.x,
			left: keys.has("ArrowLeft") || keys.has("KeyA"),
			right: keys.has("ArrowRight") || keys.has("KeyD"),
			reduced: reducedRef.current
		};
	}
	function toX(clientX) {
		const canvas = canvasRef.current;
		if (!canvas) return 195;
		const rect = canvas.getBoundingClientRect();
		const rel = (clientX - rect.left) / Math.max(rect.width, 1);
		return Math.max(0, Math.min(390, rel * 390));
	}
	function begin(sim, level) {
		const audio = getAudio();
		audio.unlock();
		audio.setMuted(saveRef.current.muted);
		simRef.current = sim;
		levelRef.current = level;
		deathLatch.current = false;
		winLatch.current = false;
		accRef.current = 0;
		tutorialRef.current = level < 0 ? saveRef.current.runs === 0 : level === 0 && (saveRef.current.stars[0] ?? 0) === 0;
		setStats(null);
		go("play");
	}
	function startGame() {
		begin(createSim(), -1);
	}
	function startLevel(index) {
		begin(createLevel(index), index);
	}
	startRef.current = startGame;
	onDeadRef.current = () => {
		window.setTimeout(() => {
			const sim = simRef.current;
			if (!sim || screenRef.current !== "play") return;
			const score = Math.floor(sim.player.score);
			const prevBest = saveRef.current.best;
			const gained = sparkGain(score);
			const runIndex = saveRef.current.runs + 1;
			commit((s) => ({
				...s,
				best: Math.max(s.best, score),
				sparks: s.sparks + gained,
				runs: s.runs + 1
			}));
			setStats({
				score,
				meters: metersOf(sim.player.dist),
				gained,
				reason: sim.reason,
				record: score > prevBest,
				won: false,
				level: levelRef.current,
				starMask: 0,
				time: sim.time,
				par: sim.par,
				sparksLabel: `${sim.sparksGot}/${sim.sparksTotal}`,
				levelName: sim.levelName
			});
			go("over");
			if (ADS.enabled && runIndex % ADS.interstitialEvery === 0) showInterstitial();
		}, 420);
	};
	onWinRef.current = () => {
		window.setTimeout(() => {
			const sim = simRef.current;
			const level = levelRef.current;
			if (!sim || !sim.won || screenRef.current !== "play") return;
			const score = Math.floor(sim.player.score);
			const gained = sparkGain(score);
			const mask = starsEarned(true, sim.sparksGot, sim.sparksTotal, sim.time, sim.par);
			const prevBest = saveRef.current.best;
			commit((s) => {
				const stars = s.stars.slice();
				while (stars.length <= level) stars.push(0);
				if (level >= 0) stars[level] = (stars[level] ?? 0) | mask;
				return {
					...s,
					stars,
					best: Math.max(s.best, score),
					sparks: s.sparks + gained,
					runs: s.runs + 1
				};
			});
			setStats({
				score,
				meters: metersOf(sim.player.dist),
				gained,
				reason: null,
				record: score > prevBest,
				won: true,
				level,
				starMask: mask,
				time: sim.time,
				par: sim.par,
				sparksLabel: `${sim.sparksGot}/${sim.sparksTotal}`,
				levelName: sim.levelName
			});
			go("over");
		}, 520);
	};
	(0, import_react.useEffect)(() => {
		const loaded = loadSave();
		saveRef.current = loaded;
		setSave(loaded);
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const apply = () => {
			reducedRef.current = mq.matches;
		};
		apply();
		mq.addEventListener("change", apply);
		const onKey = (e, down) => {
			if (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "Space") e.preventDefault();
			if (down) keysRef.current.add(e.code);
			else keysRef.current.delete(e.code);
			if (down && (e.code === "ArrowLeft" || e.code === "KeyA" || e.code === "ArrowRight" || e.code === "KeyD")) {
				const audio = getAudio();
				audio.unlock();
				audio.setMuted(saveRef.current.muted);
			}
		};
		const down = (e) => onKey(e, true);
		const up = (e) => onKey(e, false);
		const blur = () => {
			keysRef.current.clear();
			pointerRef.current.active = false;
		};
		const vis = () => {
			audioRef.current?.resume();
			if (document.hidden && screenRef.current === "play" && simRef.current?.player.alive) go("pause");
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		window.addEventListener("blur", blur);
		document.addEventListener("visibilitychange", vis);
		let raf = 0;
		let last = performance.now();
		const frame = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			const canvas = canvasRef.current;
			const ctx = canvas?.getContext("2d");
			if (canvas && ctx && stageRef.current) {
				const rect = stageRef.current.getBoundingClientRect();
				const dpr = Math.min(2, window.devicePixelRatio || 1);
				const pw = Math.max(1, Math.floor(rect.width * dpr));
				const ph = Math.max(1, Math.floor(rect.height * dpr));
				if (canvas.width !== pw || canvas.height !== ph) {
					canvas.width = pw;
					canvas.height = ph;
				}
				const lh = fit(ctx, rect.width, rect.height, dpr);
				const flame = flameById(saveRef.current.flame);
				const mode = screenRef.current;
				const sim = simRef.current;
				const audio = audioRef.current;
				if (audio) {
					if (audio.muted !== saveRef.current.muted) audio.setMuted(saveRef.current.muted);
					const mood = sim && (mode === "play" || mode === "pause" || mode === "over") ? sim.biome : Math.floor(menuTime.current / 7) % BIOMES.length;
					audio.pump(mood);
				}
				if ((mode === "play" || mode === "over") && sim) {
					if (mode === "play" && sim.hitstop > 0) sim.hitstop = Math.max(0, sim.hitstop - dt);
					else {
						accRef.current += dt;
						let n = 0;
						const input = mode === "play" ? readInput() : {
							pointer: false,
							pointerX: 0,
							left: false,
							right: false,
							reduced: reducedRef.current
						};
						while (accRef.current >= STEP && n < 5) {
							tick(sim, STEP, input);
							accRef.current -= STEP;
							n++;
							if (audio) for (const ev of sim.events) audio.play(ev);
							sim.events.length = 0;
							if (!sim.player.alive && !deathLatch.current) {
								deathLatch.current = true;
								onDeadRef.current();
								break;
							}
							if (sim.won && !winLatch.current) {
								winLatch.current = true;
								onWinRef.current();
								break;
							}
						}
					}
					drawPlay(ctx, sim, lh, flame, reducedRef.current, saveRef.current.shake);
					if (mode === "play") {
						const score = Math.floor(sim.player.score);
						if (scoreRef.current) scoreRef.current.textContent = String(score);
						if (meterRef.current) meterRef.current.textContent = sim.finite ? `${sim.sparksGot}/${sim.sparksTotal} искр` : `${metersOf(sim.player.dist)} м`;
						if (skyRef.current) skyRef.current.textContent = sim.finite ? sim.levelName : BIOMES[sim.biome]?.name ?? "";
						if (comboRef.current) comboRef.current.textContent = sim.player.combo >= 2 ? `серия ×${sim.player.combo}` : sim.boost > 0 ? "порыв" : sim.magnet > 0 ? "магнит" : sim.slowing ? "смола" : "";
						if (wickRef.current) {
							const wick = Math.max(0, sim.player.wick);
							wickRef.current.style.width = `${wick}%`;
							wickRef.current.dataset.low = wick < 28 ? "1" : "0";
						}
						if (hintRef.current) hintRef.current.textContent = tutorialRef.current && sim.time < 3.2 ? sim.finite ? "Кольцо ускоряет. Магнит тянет искры с краёв." : "Веди пальцем — пламя за тобой" : "";
					}
				} else if (mode === "pause" && sim) drawPlay(ctx, sim, lh, flame, reducedRef.current, false);
				else {
					menuTime.current += reducedRef.current ? 0 : dt;
					drawMenu(ctx, menuTime.current, lh, flame, reducedRef.current);
				}
			}
			raf = requestAnimationFrame(frame);
		};
		raf = requestAnimationFrame(frame);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
			window.removeEventListener("blur", blur);
			document.removeEventListener("visibilitychange", vis);
			mq.removeEventListener("change", apply);
		};
	}, []);
	function onPointerDown(e) {
		if (e.target.closest("[data-ui]")) return;
		const audio = getAudio();
		audio.unlock();
		audio.setMuted(saveRef.current.muted);
		if (screenRef.current !== "play") return;
		pointerRef.current.active = true;
		pointerRef.current.x = toX(e.clientX);
		stageRef.current?.setPointerCapture(e.pointerId);
	}
	function onPointerMove(e) {
		if (!pointerRef.current.active) return;
		pointerRef.current.x = toX(e.clientX);
	}
	function onPointerUp() {
		pointerRef.current.active = false;
	}
	function toggleMute() {
		const audio = getAudio();
		audio.unlock();
		commit((s) => {
			audio.setMuted(!s.muted);
			return {
				...s,
				muted: !s.muted
			};
		});
	}
	function pause() {
		if (!simRef.current?.player.alive || simRef.current.won) return;
		go("pause");
	}
	function resume() {
		go("play");
	}
	function continuePaid() {
		const sim = simRef.current;
		if (!sim || sim.continued || saveRef.current.sparks < 25) return;
		commit((s) => ({
			...s,
			sparks: s.sparks - 25
		}));
		continueRun(sim);
		deathLatch.current = false;
		go("play");
	}
	function continueAd() {
		if (adBusy || !simRef.current || simRef.current.continued) return;
		setAdBusy(true);
		getAudio().unlock();
		showRewarded(() => {
			const sim = simRef.current;
			if (!sim || sim.continued) return;
			continueRun(sim);
			deathLatch.current = false;
			go("play");
		}, () => setAdBusy(false));
	}
	const reward = rewardedId();
	const canPay = save.sparks >= 25;
	const continued = simRef.current?.continued ?? false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: stageRef,
		className: "relative mx-auto h-full w-full max-w-[480px] touch-none select-none",
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel: onPointerUp,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full",
				"aria-hidden": true
			}),
			screen === "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "safe pointer-events-none absolute inset-0 flex flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-6 pt-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xs font-semibold tracking-widest text-gold uppercase",
								children: "ночной подъём"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 font-display text-5xl font-bold text-balance text-fg",
								children: "Огонёк"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 max-w-xs text-sm text-pretty text-muted",
								children: "Пятнадцать дворов. Звезда за финиш, за все искры и за быстрый подъём."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-ui": true,
						className: "enter pointer-events-auto mx-3 mb-3 rounded-3xl border border-line bg-bg/85 px-4 py-4 backdrop-blur-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-3 text-sm text-muted tabular-nums",
								children: [
									"Рекорд ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-base text-fg",
										children: save.best
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mx-2 text-line",
										children: "·"
									}),
									"Искры ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gold",
										children: save.sparks
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mx-2 text-line",
										children: "·"
									}),
									"Звёзды ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gold",
										children: save.stars.reduce((sum, mask) => sum + starCount(mask), 0)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => go("levels"),
								className: "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember font-display text-lg font-semibold text-on-ember",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
									className: "size-5",
									"aria-hidden": true
								}), "Уровни"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: startGame,
								className: "mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-semibold text-fg",
								children: "Без конца"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => go("shop"),
								className: "mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-semibold text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, {
									className: "size-4",
									"aria-hidden": true
								}), "Огни"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: toggleMute,
									"aria-label": save.muted ? "Включить звук" : "Выключить звук",
									className: "grid size-11 place-items-center rounded-full text-muted",
									children: save.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YandexBanner, { blockId: bannerId() })
						]
					})
				]
			}),
			screen === "play" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "safe pointer-events-none absolute inset-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between px-4 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								ref: scoreRef,
								className: "font-display text-4xl font-bold text-fg tabular-nums",
								children: "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								ref: meterRef,
								className: "text-xs text-muted tabular-nums",
								children: "0 м"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								ref: skyRef,
								className: "text-xs text-gold",
								children: "Двор"
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-ui": true,
							onClick: pause,
							"aria-label": "Пауза",
							className: "pointer-events-auto grid size-11 place-items-center rounded-full bg-surface text-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-4 mt-3 h-2 overflow-hidden rounded-full bg-surface",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: wickRef,
							className: "wick-fill"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						ref: comboRef,
						className: "mx-4 mt-2 h-5 font-display text-sm text-gold tabular-nums"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						ref: hintRef,
						className: "mx-6 mt-8 text-center text-sm text-fg"
					})
				]
			}),
			screen === "pause" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "safe absolute inset-0 flex items-center justify-center bg-bg/55 px-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-ui": true,
					className: "enter w-full max-w-sm rounded-3xl border border-line bg-bg px-5 py-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl font-bold text-fg",
							children: "Пауза"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: resume,
							className: "mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember font-display text-lg font-semibold text-on-ember",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
								className: "size-5",
								"aria-hidden": true
							}), "Дальше"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: toggleMute,
							className: "mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-semibold text-fg",
							children: [save.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), save.muted ? "Звук выключен" : "Звук включён"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => commit((s) => ({
								...s,
								shake: !s.shake
							})),
							className: "mt-2 flex h-12 w-full items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-fg",
							children: save.shake ? "Тряска включена" : "Тряска выключена"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => go("menu"),
							className: "mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), "В меню"]
						})
					]
				})
			}),
			screen === "over" && stats && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "safe pointer-events-none absolute inset-0 flex items-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-ui": true,
					className: "enter pointer-events-auto m-3 w-full rounded-3xl border border-line bg-bg/92 px-4 py-4 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-gold uppercase",
							children: stats.won ? stats.levelName || "Пройдено" : stats.reason === "wick" ? "Фитиль сгорел" : "Сбился с пути"
						}),
						stats.won ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-display text-3xl tracking-[0.3em] text-gold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: stats.starMask & 1 ? "" : "opacity-25",
									children: "★"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: stats.starMask & 2 ? "" : "opacity-25",
									children: "★"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: stats.starMask & 4 ? "" : "opacity-25",
									children: "★"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-5xl font-bold text-fg tabular-nums",
							children: stats.score
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted tabular-nums",
							children: stats.won ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								stats.time.toFixed(1),
								" с из ",
								stats.par,
								" с",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-2 text-line",
									children: "·"
								}),
								"искры ",
								stats.sparksLabel
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Высота ",
								stats.meters,
								" м",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-2 text-line",
									children: "·"
								}),
								"+",
								stats.gained,
								" искр"
							] })
						}),
						stats.won && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Финиш, все искры, уложиться в темп."
						}),
						stats.record && !stats.won && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-sm text-gold",
							children: "Новый рекорд"
						}),
						stats.won && stats.level >= 0 && stats.level + 1 < LEVELS.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => startLevel(stats.level + 1),
							className: "mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember font-display text-lg font-semibold text-on-ember",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
								className: "size-5",
								"aria-hidden": true
							}), "Дальше"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => stats.level >= 0 ? startLevel(stats.level) : startGame(),
							className: `${stats.won && stats.level + 1 < LEVELS.length ? "mt-2 h-12 border border-line bg-surface text-sm text-fg" : "mt-4 h-14 bg-ember font-display text-lg text-on-ember"} flex w-full items-center justify-center gap-2 rounded-full font-semibold`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								className: "size-5",
								"aria-hidden": true
							}), "Ещё раз"]
						}),
						!stats.won && !continued && reward && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: continueAd,
							disabled: adBusy,
							className: "mt-2 flex h-12 w-full items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-fg",
							children: adBusy ? "Реклама…" : "Продолжить за рекламу"
						}),
						!stats.won && !continued && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: continuePaid,
							disabled: !canPay,
							className: "mt-2 flex h-12 w-full items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-fg",
							children: [
								"Продолжить · ",
								25,
								" искр"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => go(stats.level >= 0 ? "levels" : "menu"),
							className: "mt-2 flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), stats.level >= 0 ? "К уровням" : "В меню"]
						})
					]
				})
			}),
			screen === "levels" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				title: "Уровни",
				subtitle: `${save.stars.reduce((sum, mask) => sum + starCount(mask), 0)} / ${LEVELS.length * 3}`,
				onClose: () => go("menu"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "Звезда за финиш, за каждую искру и за подъём быстрее нормы. Жёлтое кольцо ускоряет, дуга — магнит, тёмная лужа — смола."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: LEVELS.map((level, index) => {
						const open = isOpen(save.stars, index);
						const mask = save.stars[index] ?? 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !open,
							onClick: () => startLevel(index),
							className: "flex h-14 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-3 text-left disabled:opacity-40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-7 font-display text-lg text-gold tabular-nums",
									children: index + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate font-semibold text-fg",
									children: open ? level.name : "Закрыт"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display tracking-widest text-gold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: mask & 1 ? "" : "opacity-25",
											children: "★"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: mask & 2 ? "" : "opacity-25",
											children: "★"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: mask & 4 ? "" : "opacity-25",
											children: "★"
										})
									]
								})
							]
						}) }, level.name);
					})
				})]
			}),
			screen === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				title: "Огни",
				subtitle: `Искры: ${save.sparks}`,
				onClose: () => go("menu"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: [...FLAMES].sort((a, b) => a.cost - b.cost).map((f) => {
						const owned = save.owned.includes(f.id);
						const on = save.flame === f.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flame-swatch shrink-0",
									style: {
										"--flame-core": f.core,
										"--flame-mid": f.mid,
										"--flame-out": f.out
									},
									"aria-hidden": true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-sm font-semibold text-fg",
										children: f.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: owned ? f.hint : `${f.cost} искр`
									})]
								}),
								on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-gold",
									children: "горит"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: !owned && save.sparks < f.cost,
									onClick: () => {
										if (owned) commit((s) => ({
											...s,
											flame: f.id
										}));
										else if (save.sparks >= f.cost) commit((s) => ({
											...s,
											sparks: s.sparks - f.cost,
											flame: f.id,
											owned: s.owned.includes(f.id) ? s.owned : [...s.owned, f.id]
										}));
									},
									className: "h-11 rounded-full bg-ember px-4 text-sm font-semibold text-on-ember",
									children: owned ? "Зажечь" : "Купить"
								})
							]
						}, f.id);
					})
				})
			})
		]
	});
}
function Sheet({ title, subtitle, onClose, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "safe absolute inset-0 flex flex-col bg-bg/92 backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-ui": true,
			className: "flex items-start justify-between gap-3 px-5 pt-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-bold text-fg",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted tabular-nums",
				children: subtitle
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				"aria-label": "Закрыть",
				className: "grid size-11 place-items-center rounded-full bg-surface text-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-ui": true,
			className: "mt-4 flex-1 overflow-y-auto px-5 pb-6",
			children
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "h-dvh overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ogonyok, {})
	});
}
//#endregion
export { Home as component };
