import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Flame, House, Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { ADS, bannerId, mountBanner, rewardedId, showInterstitial, showRewarded } from "@/game/ads";
import { AudioEngine } from "@/game/audio";
import { drawMenu, drawPlay, fit } from "@/game/draw";
import { FLAMES, flameById, type FlameId } from "@/game/flames";
import { defaultSave, loadSave, writeSave, type SaveData } from "@/game/save";
import {
  BIOMES,
  CONTINUE_COST,
  W,
  climbSpeed,
  continueRun,
  createSim,
  metersOf,
  sparkGain,
  tick,
  type DeathReason,
  type Input,
  type Sim,
} from "@/game/sim";

type Screen = "menu" | "play" | "pause" | "over" | "shop";

type RunStats = {
  score: number;
  meters: number;
  gained: number;
  reason: DeathReason | null;
  record: boolean;
};

const STEP = 1 / 60;

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getX: () => number;
      setKeys: (codes: string[]) => void;
    };
    __ogonyok?: {
      kill: () => void;
      start: () => void;
    };
  }
}

function YandexBanner({ blockId }: { blockId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !blockId) return;
    const id = `yandex_rtb_${blockId}`;
    el.id = id;
    mountBanner(blockId, id);
  }, [blockId]);
  if (!blockId) return null;
  return <div ref={ref} className="mt-3 min-h-16 w-full overflow-hidden" />;
}

export function Ogonyok() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<Screen>("menu");
  const simRef = useRef<Sim | null>(null);
  const saveRef = useRef<SaveData>(defaultSave());
  const keysRef = useRef(new Set<string>());
  const pointerRef = useRef({ active: false, x: W / 2 });
  const audioRef = useRef<AudioEngine | null>(null);
  const accRef = useRef(0);
  const menuTime = useRef(0);
  const deathLatch = useRef(false);
  const tutorialRef = useRef(false);
  const reducedRef = useRef(false);
  const onDeadRef = useRef<() => void>(() => {});
  const startRef = useRef<() => void>(() => {});
  const scoreRef = useRef<HTMLParagraphElement>(null);
  const meterRef = useRef<HTMLParagraphElement>(null);
  const comboRef = useRef<HTMLParagraphElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const wickRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLParagraphElement>(null);

  const [screen, setScreenState] = useState<Screen>("menu");
  const [save, setSave] = useState<SaveData>(() =>
    typeof window === "undefined" ? defaultSave() : loadSave(),
  );
  const [stats, setStats] = useState<RunStats | null>(null);
  const [adBusy, setAdBusy] = useState(false);

  saveRef.current = save;

  function go(next: Screen) {
    screenRef.current = next;
    setScreenState(next);
  }

  function commit(mutator: (s: SaveData) => SaveData) {
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

  function readInput(): Input {
    const keys = keysRef.current;
    return {
      pointer: pointerRef.current.active,
      pointerX: pointerRef.current.x,
      left: keys.has("ArrowLeft") || keys.has("KeyA"),
      right: keys.has("ArrowRight") || keys.has("KeyD"),
      reduced: reducedRef.current,
    };
  }

  function toX(clientX: number) {
    const canvas = canvasRef.current;
    if (!canvas) return W / 2;
    const rect = canvas.getBoundingClientRect();
    const rel = (clientX - rect.left) / Math.max(rect.width, 1);
    return Math.max(0, Math.min(W, rel * W));
  }

  function startGame() {
    const audio = getAudio();
    audio.unlock();
    audio.setMuted(saveRef.current.muted);
    simRef.current = createSim();
    deathLatch.current = false;
    accRef.current = 0;
    tutorialRef.current = saveRef.current.runs === 0;
    setStats(null);
    go("play");
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
        runs: s.runs + 1,
      }));
      setStats({
        score,
        meters: metersOf(sim.player.dist),
        gained,
        reason: sim.reason,
        record: score > prevBest,
      });
      go("over");
      if (ADS.enabled && runIndex % ADS.interstitialEvery === 0) showInterstitial();
    }, 420);
  };

  useEffect(() => {
    const loaded = loadSave();
    saveRef.current = loaded;
    setSave(loaded);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reducedRef.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);

    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "Space") e.preventDefault();
      if (down) keysRef.current.add(e.code);
      else keysRef.current.delete(e.code);
      if (down && (e.code === "ArrowLeft" || e.code === "KeyA" || e.code === "ArrowRight" || e.code === "KeyD")) {
        const audio = getAudio();
        audio.unlock();
        audio.setMuted(saveRef.current.muted);
      }
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
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

    if (import.meta.env.DEV) {
      window.__controlsTest = {
        getYaw: () => 0,
        getSpeed: () => {
          const sim = simRef.current;
          if (!sim || screenRef.current !== "play" || !sim.player.alive) return 0;
          return climbSpeed(sim.player.dist);
        },
        getX: () => simRef.current?.player.x ?? 0,
        setKeys: (codes) => {
          keysRef.current = new Set(codes);
        },
      };
      window.__ogonyok = {
        kill: () => {
          const sim = simRef.current;
          if (sim) sim.player.wick = 0;
        },
        start: () => startRef.current(),
      };
    }

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
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
          const mood =
            sim && (mode === "play" || mode === "pause" || mode === "over")
              ? sim.biome
              : Math.floor(menuTime.current / 7) % BIOMES.length;
          audio.pump(mood);
        }
        if ((mode === "play" || mode === "over") && sim) {
          if (mode === "play" && sim.hitstop > 0) sim.hitstop = Math.max(0, sim.hitstop - dt);
          else {
            accRef.current += dt;
            let n = 0;
            const input = mode === "play" ? readInput() : { pointer: false, pointerX: 0, left: false, right: false, reduced: reducedRef.current };
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
            }
          }
          drawPlay(ctx, sim, lh, flame, reducedRef.current, saveRef.current.shake);
          if (mode === "play") {
            const score = Math.floor(sim.player.score);
            if (scoreRef.current) scoreRef.current.textContent = String(score);
            if (meterRef.current) meterRef.current.textContent = `${metersOf(sim.player.dist)} м`;
            if (skyRef.current) skyRef.current.textContent = BIOMES[sim.biome]?.name ?? "";
            if (comboRef.current) {
              comboRef.current.textContent = sim.player.combo >= 2 ? `серия ×${sim.player.combo}` : "";
            }
            if (wickRef.current) {
              const wick = Math.max(0, sim.player.wick);
              wickRef.current.style.width = `${wick}%`;
              wickRef.current.dataset.low = wick < 28 ? "1" : "0";
            }
            if (hintRef.current) {
              hintRef.current.textContent =
                tutorialRef.current && sim.time < 2.8 ? "Веди пальцем — пламя за тобой" : "";
            }
          }
        } else if (mode === "pause" && sim) {
          drawPlay(ctx, sim, lh, flame, reducedRef.current, false);
        } else {
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
    // Loop closes over refs only. go() is stable enough for the hidden-tab pause.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPointerDown(e: ReactPointerEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-ui]")) return;
    const audio = getAudio();
    audio.unlock();
    audio.setMuted(saveRef.current.muted);
    if (screenRef.current !== "play") return;
    pointerRef.current.active = true;
    pointerRef.current.x = toX(e.clientX);
    stageRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent) {
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
      return { ...s, muted: !s.muted };
    });
  }

  function pause() {
    if (!simRef.current?.player.alive) return;
    go("pause");
  }

  function resume() {
    go("play");
  }

  function continuePaid() {
    const sim = simRef.current;
    if (!sim || sim.continued || saveRef.current.sparks < CONTINUE_COST) return;
    commit((s) => ({ ...s, sparks: s.sparks - CONTINUE_COST }));
    continueRun(sim);
    deathLatch.current = false;
    go("play");
  }

  function continueAd() {
    if (adBusy || !simRef.current || simRef.current.continued) return;
    setAdBusy(true);
    getAudio().unlock();
    showRewarded(
      () => {
        const sim = simRef.current;
        if (!sim || sim.continued) return;
        continueRun(sim);
        deathLatch.current = false;
        go("play");
      },
      () => setAdBusy(false),
    );
  }

  const reward = rewardedId();
  const canPay = save.sparks >= CONTINUE_COST;
  const continued = simRef.current?.continued ?? false;

  return (
    <div
      ref={stageRef}
      className="relative mx-auto h-full w-full max-w-[480px] touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

      {screen === "menu" && (
        <div className="safe pointer-events-none absolute inset-0 flex flex-col">
          <div className="px-6 pt-7">
            <p className="font-display text-xs font-semibold tracking-widest text-gold uppercase">ночной подъём</p>
            <h1 className="mt-2 font-display text-5xl font-bold text-balance text-fg">Огонёк</h1>
            <p className="mt-3 max-w-xs text-sm text-pretty text-muted">
              Веди пальцем или мышью. Пролетай в просветы и пей масло — фитиль тает сам.
            </p>
          </div>
          <div className="flex-1" />
          <div data-ui className="enter pointer-events-auto mx-3 mb-3 rounded-3xl border border-line bg-bg/85 px-4 py-4 backdrop-blur-md">
            <p className="mb-3 text-sm text-muted tabular-nums">
              Рекорд <span className="font-display text-base text-fg">{save.best}</span>
              <span className="mx-2 text-line">·</span>
              Искры <span className="text-gold">{save.sparks}</span>
            </p>
            <button
              type="button"
              onClick={startGame}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember font-display text-lg font-semibold text-on-ember"
            >
              <Play className="size-5" aria-hidden />
              Играть
            </button>
            <button
              type="button"
              onClick={() => go("shop")}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-semibold text-fg"
            >
              <Flame className="size-4" aria-hidden />
              Огни
            </button>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={save.muted ? "Включить звук" : "Выключить звук"}
                className="grid size-11 place-items-center rounded-full text-muted"
              >
                {save.muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
            </div>
            <YandexBanner blockId={bannerId()} />
          </div>
        </div>
      )}

      {screen === "play" && (
        <div className="safe pointer-events-none absolute inset-0">
          <div className="flex items-start justify-between px-4 pt-3">
            <div>
              <p ref={scoreRef} className="font-display text-4xl font-bold text-fg tabular-nums">
                0
              </p>
              <p ref={meterRef} className="text-xs text-muted tabular-nums">
                0 м
              </p>
              <p ref={skyRef} className="text-xs text-gold">
                Двор
              </p>
            </div>
            <button
              type="button"
              data-ui
              onClick={pause}
              aria-label="Пауза"
              className="pointer-events-auto grid size-11 place-items-center rounded-full bg-surface text-fg"
            >
              <Pause className="size-5" />
            </button>
          </div>
          <div className="mx-4 mt-3 h-2 overflow-hidden rounded-full bg-surface">
            <div ref={wickRef} className="wick-fill" />
          </div>
          <p ref={comboRef} className="mx-4 mt-2 h-5 font-display text-sm text-gold tabular-nums" />
          <p ref={hintRef} className="mx-6 mt-8 text-center text-sm text-fg" />
        </div>
      )}

      {screen === "pause" && (
        <div className="safe absolute inset-0 flex items-center justify-center bg-bg/55 px-5">
          <div data-ui className="enter w-full max-w-sm rounded-3xl border border-line bg-bg px-5 py-5">
            <h2 className="font-display text-2xl font-bold text-fg">Пауза</h2>
            <button
              type="button"
              onClick={resume}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember font-display text-lg font-semibold text-on-ember"
            >
              <Play className="size-5" aria-hidden />
              Дальше
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-semibold text-fg"
            >
              {save.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              {save.muted ? "Звук выключен" : "Звук включён"}
            </button>
            <button
              type="button"
              onClick={() => commit((s) => ({ ...s, shake: !s.shake }))}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-fg"
            >
              {save.shake ? "Тряска включена" : "Тряска выключена"}
            </button>
            <button
              type="button"
              onClick={() => go("menu")}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-muted"
            >
              <House className="size-4" />
              В меню
            </button>
          </div>
        </div>
      )}

      {screen === "over" && stats && (
        <div className="safe pointer-events-none absolute inset-0 flex items-end">
          <div data-ui className="enter pointer-events-auto m-3 w-full rounded-3xl border border-line bg-bg/92 px-4 py-4 backdrop-blur-md">
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">
              {stats.reason === "wick" ? "Фитиль сгорел" : "Сбился с пути"}
            </p>
            <p className="mt-1 font-display text-5xl font-bold text-fg tabular-nums">{stats.score}</p>
            <p className="mt-1 text-sm text-muted tabular-nums">
              Высота {stats.meters} м
              <span className="mx-2 text-line">·</span>
              +{stats.gained} искр
            </p>
            {stats.record && <p className="mt-1 font-display text-sm text-gold">Новый рекорд</p>}
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember font-display text-lg font-semibold text-on-ember"
            >
              <RotateCcw className="size-5" aria-hidden />
              Ещё раз
            </button>
            {!continued && reward && (
              <button
                type="button"
                onClick={continueAd}
                disabled={adBusy}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-fg"
              >
                {adBusy ? "Реклама…" : "Продолжить за рекламу"}
              </button>
            )}
            {!continued && (
              <button
                type="button"
                onClick={continuePaid}
                disabled={!canPay}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-fg"
              >
                Продолжить · {CONTINUE_COST} искр
              </button>
            )}
            <button
              type="button"
              onClick={() => go("menu")}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold text-muted"
            >
              <House className="size-4" />
              В меню
            </button>
          </div>
        </div>
      )}

      {screen === "shop" && (
        <Sheet title="Огни" subtitle={`Искры: ${save.sparks}`} onClose={() => go("menu")}>
          <ul className="flex flex-col gap-2">
            {[...FLAMES].sort((a, b) => a.cost - b.cost).map((f) => {
              const owned = save.owned.includes(f.id);
              const on = save.flame === f.id;
              return (
                <li
                  key={f.id}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-3"
                >
                  <div
                    className="flame-swatch shrink-0"
                    style={
                      {
                        "--flame-core": f.core,
                        "--flame-mid": f.mid,
                        "--flame-out": f.out,
                      } as CSSProperties
                    }
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-fg">{f.name}</p>
                    <p className="text-xs text-muted">{owned ? f.hint : `${f.cost} искр`}</p>
                  </div>
                  {on ? (
                    <span className="text-xs font-semibold text-gold">горит</span>
                  ) : (
                    <button
                      type="button"
                      disabled={!owned && save.sparks < f.cost}
                      onClick={() => {
                        if (owned) commit((s) => ({ ...s, flame: f.id }));
                        else if (save.sparks >= f.cost) {
                          commit((s) => ({
                            ...s,
                            sparks: s.sparks - f.cost,
                            flame: f.id,
                            owned: s.owned.includes(f.id) ? s.owned : [...s.owned, f.id as FlameId],
                          }));
                        }
                      }}
                      className="h-11 rounded-full bg-ember px-4 text-sm font-semibold text-on-ember"
                    >
                      {owned ? "Зажечь" : "Купить"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Sheet>
      )}
    </div>
  );
}

function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="safe absolute inset-0 flex flex-col bg-bg/92 backdrop-blur-sm">
      <div data-ui className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-fg">{title}</h2>
          <p className="text-sm text-muted tabular-nums">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="grid size-11 place-items-center rounded-full bg-surface text-fg"
        >
          <X className="size-5" />
        </button>
      </div>
      <div data-ui className="mt-4 flex-1 overflow-y-auto px-5 pb-6">
        {children}
      </div>
    </div>
  );
}
