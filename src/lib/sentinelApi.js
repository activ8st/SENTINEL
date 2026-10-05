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

  // 15-second timeout to allow Render instances to wake up from cold start
  const { timeoutMs = 15000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(apiUrl(path), {
      ...fetchOptions,
      signal: fetchOptions.signal || controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError' || String(err.message || '').toLowerCase().includes('aborted')) {
      throw new Error('Il server backend si sta avviando (Cold Start su Render). Riprova tra qualche secondo.');
    }
    throw err;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const checkApiHealth = async () => {
  if (!isSentinelApiConfigured) {
    return { status: 'unavailable', mode: 'offline', details: 'API non configurata' };
  }
  try {
    const response = await apiFetch('/api/health', { timeoutMs: 5000 });
    if (response.ok) {
      const data = await response.json();
      return { status: 'backend_live', mode: data.mode || 'pilot', details: data };
    }
  } catch (err) {
    console.warn('API health check error:', err);
  }
  return { status: 'rss_fallback', mode: 'fallback', details: 'Backend offline, fallback a RSS locale/cache' };
};

export const fetchApiIncidents = async () => {
  if (!isSentinelApiConfigured) return [];

  // Fast fetch with 5-second max timeout for incident list
  const response = await apiFetch('/api/incidents?limit=5000', { timeoutMs: 5000 });
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
    .map((incident) => {
      const inferredPrecision = (
        String(incident.address || '').trim().toLocaleLowerCase('it-IT')
        !== String(incident.city || '').trim().toLocaleLowerCase('it-IT')
      ) ? 'precise' : 'municipality';
      return {
        ...incident,
        location_precision: incident.location_precision || inferredPrecision,
        source_url: incident.source_url || incident.media_urls?.[0] || '',
        official_verified: incident.official_verified
          ?? String(incident.source_trust || '').startsWith('institutional'),
      };
    });
};
