const AREA_FILTER_VERSION = 'shared-area-filter-v4';
const VERSION_KEY = 'sentinelAreaFilterVersion';
const ENABLED_KEY = 'sentinelUseRadius';
const RADIUS_KEY = 'sentinelRadiusKm';
const CHANGE_EVENT = 'sentinel-area-filter-change';

export const MIN_AREA_RADIUS_KM = 1;
export const MAX_AREA_RADIUS_KM = 2000;
export const DEFAULT_AREA_RADIUS_KM = 1;
export const AREA_RADIUS_PRESETS = [1, 5, 10, 25, 50, 100];

const clampRadius = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_AREA_RADIUS_KM;
  return Math.min(MAX_AREA_RADIUS_KM, Math.max(MIN_AREA_RADIUS_KM, parsed));
};

export const loadAreaFilter = () => {
  if (typeof window === 'undefined') return { enabled: false, radius: DEFAULT_AREA_RADIUS_KM };

  if (localStorage.getItem(VERSION_KEY) !== AREA_FILTER_VERSION) {
    return { enabled: false, radius: DEFAULT_AREA_RADIUS_KM };
  }

  return {
    enabled: localStorage.getItem(ENABLED_KEY) === 'true',
    radius: clampRadius(localStorage.getItem(RADIUS_KEY)),
  };
};

export const saveAreaFilter = (enabled, radius) => {
  if (typeof window === 'undefined') return;
  const next = { enabled: Boolean(enabled), radius: clampRadius(radius) };
  localStorage.setItem(VERSION_KEY, AREA_FILTER_VERSION);
  localStorage.setItem(ENABLED_KEY, String(next.enabled));
  localStorage.setItem(RADIUS_KEY, String(next.radius));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
};

export const subscribeAreaFilter = listener => {
  if (typeof window === 'undefined') return () => {};
  const handleChange = event => listener(event.detail || loadAreaFilter());
  const handleStorage = event => {
    if ([VERSION_KEY, ENABLED_KEY, RADIUS_KEY].includes(event.key)) listener(loadAreaFilter());
  };
  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
};
