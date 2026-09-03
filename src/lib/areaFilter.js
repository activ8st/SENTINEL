const AREA_FILTER_VERSION = 'local-1km-v2';
const VERSION_KEY = 'sentinelAreaFilterVersion';
const ENABLED_KEY = 'sentinelUseRadius';
const RADIUS_KEY = 'sentinelRadiusKm';

export const MIN_AREA_RADIUS_KM = 1;
export const MAX_AREA_RADIUS_KM = 100;
export const DEFAULT_AREA_RADIUS_KM = 1;
export const AREA_RADIUS_PRESETS = [1, 3, 5, 10, 25];

const clampRadius = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_AREA_RADIUS_KM;
  return Math.min(MAX_AREA_RADIUS_KM, Math.max(MIN_AREA_RADIUS_KM, parsed));
};

export const loadAreaFilter = () => {
  if (typeof window === 'undefined') return { enabled: true, radius: DEFAULT_AREA_RADIUS_KM };

  if (localStorage.getItem(VERSION_KEY) !== AREA_FILTER_VERSION) {
    return { enabled: true, radius: DEFAULT_AREA_RADIUS_KM };
  }

  return {
    enabled: localStorage.getItem(ENABLED_KEY) !== 'false',
    radius: clampRadius(localStorage.getItem(RADIUS_KEY)),
  };
};

export const saveAreaFilter = (enabled, radius) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VERSION_KEY, AREA_FILTER_VERSION);
  localStorage.setItem(ENABLED_KEY, String(Boolean(enabled)));
  localStorage.setItem(RADIUS_KEY, String(clampRadius(radius)));
};
