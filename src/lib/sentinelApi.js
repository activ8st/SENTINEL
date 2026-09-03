const configuredBaseUrl = String(import.meta.env.VITE_API_URL || '').trim();
const defaultBaseUrl = import.meta.env.DEV
  ? 'http://127.0.0.1:8000'
  : 'https://sentinel-api-6hlm.onrender.com';

export const API_BASE_URL = (configuredBaseUrl || defaultBaseUrl).replace(/\/$/, '');
export const isSentinelApiConfigured = Boolean(API_BASE_URL);

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = async (path, options = {}) => {
  if (!isSentinelApiConfigured) {
    throw new Error('API Sentinel non configurata');
  }

  const { timeoutMs = 12000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(apiUrl(path), {
      ...fetchOptions,
      signal: fetchOptions.signal || controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

export const fetchApiIncidents = async () => {
  if (!isSentinelApiConfigured) return [];

  // Render free instances can need extra time after a cold start.
  const response = await apiFetch('/api/incidents?limit=5000', { timeoutMs: 90000 });
  if (!response.ok) {
    throw new Error(`API eventi non disponibile (${response.status})`);
  }

  const incidents = await response.json();
  if (!Array.isArray(incidents)) {
    throw new Error('Risposta eventi non valida');
  }

  return incidents
    .filter((incident) => (
      incident
      && incident.id
      && incident.title
      && Number.isFinite(Number(incident.latitude))
      && Number.isFinite(Number(incident.longitude))
    ))
    .map((incident) => ({
      ...incident,
      source_url: incident.source_url || incident.media_urls?.[0] || '',
      official_verified: incident.official_verified
        ?? String(incident.source_trust || '').startsWith('institutional'),
    }));
};
