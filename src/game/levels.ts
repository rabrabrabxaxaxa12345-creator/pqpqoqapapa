export type LevelDef = {
  name: string;
  seed: number;
  goal: number;
  par: number;
  biome: number;
  pace: number;
};

export const LEVELS: LevelDef[] = [
  { name: "Тихий двор", seed: 11, goal: 2500, par: 26, biome: 0, pace: 100 },
  { name: "Фонари", seed: 23, goal: 2900, par: 28, biome: 0, pace: 104 },
  { name: "Провода", seed: 37, goal: 3100, par: 28, biome: 1, pace: 108 },
  { name: "Проулок", seed: 41, goal: 3300, par: 28, biome: 1, pace: 110 },
  { name: "Крыши", seed: 59, goal: 3500, par: 28, biome: 1, pace: 114 },
  { name: "Сквозняк", seed: 67, goal: 3700, par: 28, biome: 2, pace: 116 },
  { name: "Метель", seed: 73, goal: 3900, par: 32, biome: 2, pace: 118 },
  { name: "Дым", seed: 89, goal: 4100, par: 33, biome: 2, pace: 120 },
  { name: "Рассвет", seed: 97, goal: 4300, par: 33, biome: 3, pace: 122 },
  { name: "Решётки", seed: 103, goal: 4500, par: 34, biome: 3, pace: 124 },
  { name: "Высота", seed: 127, goal: 4700, par: 35, biome: 4, pace: 126 },
  { name: "Искра", seed: 131, goal: 4900, par: 35, biome: 4, pace: 128 },
  { name: "Буря", seed: 149, goal: 5100, par: 36, biome: 2, pace: 130 },
  { name: "Уголь", seed: 157, goal: 5300, par: 37, biome: 3, pace: 132 },
  { name: "Последний фитиль", seed: 173, goal: 5600, par: 38, biome: 4, pace: 134 },
];

export function starCount(mask: number) {
  return (mask & 1) + ((mask & 2) >> 1) + ((mask & 4) >> 2);
}

export function isOpen(masks: number[], index: number) {
  return index <= 0 || ((masks[index - 1] ?? 0) & 1) === 1;
}

export function starsEarned(won: boolean, got: number, need: number, time: number, par: number) {
  if (!won) return 0;
  let mask = 1;
  if (need > 0 && got >= need) mask |= 2;
  if (time <= par + 0.05) mask |= 4;
  return mask;
}
