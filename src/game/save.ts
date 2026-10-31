import { FLAMES, type FlameId } from "@/game/flames";

export const SAVE_VERSION = 1;
const KEY = "ogonyok-save-v1";

export type SaveData = {
  version: number;
  best: number;
  sparks: number;
  flame: FlameId;
  owned: FlameId[];
  muted: boolean;
  shake: boolean;
  runs: number;
};

export function defaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    best: 0,
    sparks: 0,
    flame: "iskra",
    owned: ["iskra"],
    muted: false,
    shake: true,
    runs: 0,
  };
}

function migrate(raw: Partial<SaveData>): SaveData {
  const base = defaultSave();
  const flame = FLAMES.some((f) => f.id === raw.flame) ? (raw.flame as FlameId) : base.flame;
  const owned = Array.isArray(raw.owned)
    ? raw.owned.filter((id): id is FlameId => FLAMES.some((f) => f.id === id))
    : base.owned;
  if (!owned.includes("iskra")) owned.unshift("iskra");
  return {
    version: SAVE_VERSION,
    best: typeof raw.best === "number" && raw.best > 0 ? Math.floor(raw.best) : 0,
    sparks: typeof raw.sparks === "number" && raw.sparks > 0 ? Math.floor(raw.sparks) : 0,
    flame,
    owned,
    muted: Boolean(raw.muted),
    shake: raw.shake === false ? false : true,
    runs: typeof raw.runs === "number" && raw.runs > 0 ? Math.floor(raw.runs) : 0,
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return migrate(parsed);
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...save, version: SAVE_VERSION }));
  } catch {
    /* private mode / quota — keep playing in memory */
  }
}
