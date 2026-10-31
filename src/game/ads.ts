/**
 * Реклама РСЯ. Пока enabled = false — рекламы нет, продолжение за искры.
 * Впиши ID блоков из кабинета Яндекса и поставь enabled: true.
 * fullscreen* — тип «полноэкранный», rewarded* — тип Rewarded.
 */
export const ADS = {
  enabled: false,
  interstitialEvery: 3,
  yandex: {
    banner: "",
    fullscreenTouch: "",
    fullscreenDesktop: "",
    rewardedTouch: "",
    rewardedDesktop: "",
  },
};

type RenderOpts = {
  blockId: string;
  renderTo?: string;
  type?: string;
  platform?: "touch" | "desktop";
  onClose?: () => void;
  onRewarded?: (isRewarded: boolean) => void;
};

declare global {
  interface Window {
    yaContextCb?: Array<() => void>;
    Ya?: { Context: { AdvManager: { render: (opts: RenderOpts) => void; getPlatform?: () => string } } };
  }
}

let loader: Promise<void> | null = null;

export function adPlatform(): "touch" | "desktop" {
  if (typeof window === "undefined") return "touch";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return coarse || window.innerWidth < 900 ? "touch" : "desktop";
}

export function bannerId(): string {
  return ADS.enabled ? ADS.yandex.banner : "";
}

export function rewardedId(): string {
  if (!ADS.enabled) return "";
  const p = adPlatform();
  return p === "touch" ? ADS.yandex.rewardedTouch : ADS.yandex.rewardedDesktop;
}

function fullscreenId(): string {
  if (!ADS.enabled) return "";
  const p = adPlatform();
  return p === "touch" ? ADS.yandex.fullscreenTouch : ADS.yandex.fullscreenDesktop;
}

function loadYandex(): Promise<void> {
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
      reject(new Error("yandex-ads"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

function render(opts: RenderOpts) {
  window.yaContextCb = window.yaContextCb || [];
  window.yaContextCb.push(() => {
    window.Ya?.Context?.AdvManager?.render(opts);
  });
}

export function mountBanner(blockId: string, renderTo: string) {
  if (!blockId) return;
  loadYandex()
    .then(() => render({ blockId, renderTo }))
    .catch(() => {});
}

export function showInterstitial() {
  const blockId = fullscreenId();
  if (!blockId) return;
  const platform = adPlatform();
  loadYandex()
    .then(() =>
      render({
        blockId,
        type: "fullscreen",
        platform,
        onClose: () => {},
      }),
    )
    .catch(() => {});
}

export function showRewarded(onReward: () => void, onDone: () => void) {
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
  const timer = window.setTimeout(finish, 12000);
  loadYandex()
    .then(() =>
      render({
        blockId,
        type: "rewarded",
        platform,
        onRewarded: (ok) => {
          if (ok) onReward();
        },
        onClose: () => {
          window.clearTimeout(timer);
          finish();
        },
      }),
    )
    .catch(() => {
      window.clearTimeout(timer);
      finish();
    });
}
