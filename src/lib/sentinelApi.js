const configuredBaseUrl = String(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
const defaultBaseUrl = import.meta.env.DEV
  ? 'http://127.0.0.1:8000'
  : 'https://sentinel-wnnt.onrender.com';

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

  const headers = { ...(fetchOptions.headers || {}) };
  const token = typeof window !== 'undefined' ? localStorage.getItem('sentinel_auth_token') : null;
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(apiUrl(path), {
      ...fetchOptions,
      headers,
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
    return { status: 'unavailable', mode: 'offline', is_fallback: true, details: 'API non configurata' };
  }
  try {
    const response = await apiFetch('/api/health', { timeoutMs: 5000 });
    if (response.ok) {
      const data = await response.json();
      return { status: 'backend_live', mode: data.mode || 'pilot', is_fallback: false, details: data };
    }
  } catch (err) {
    console.warn('API health check error:', err);
  }
  return { status: 'rss_fallback', mode: 'fallback', is_fallback: true, details: 'Backend offline: modalità fallback RSS attiva (non sostituisce il database condiviso)' };
};

export const fetchApiIncidents = async (limit = 400, skip = 0) => {
  if (!isSentinelApiConfigured) return [];

  const safeLimit = Math.min(Math.max(Number(limit) || 400, 1), 1000);
  const safeSkip = Math.max(Number(skip) || 0, 0);
  const response = await apiFetch(`/api/incidents?limit=${safeLimit}&skip=${safeSkip}`, { timeoutMs: 5000 });
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
        data_origin: 'shared_db',
        is_fallback: false,
        location_precision: incident.location_precision || inferredPrecision,
        source_url: incident.source_url || incident.media_urls?.[0] || '',
        official_verified: incident.official_verified
          ?? String(incident.source_trust || '').startsWith('institutional'),
      };
    });
};

export const fetchAllApiIncidents = async ({
  pageSize = 400,
  maxItems = 10000,
  startSkip = 0,
} = {}) => {
  const safePageSize = Math.min(Math.max(Number(pageSize) || 400, 1), 1000);
  const safeMaxItems = Math.max(Number(maxItems) || 10000, safePageSize);
  const safeStartSkip = Math.max(Number(startSkip) || 0, 0);
  const incidents = [];

  while (incidents.length < safeMaxItems) {
    const remaining = safeMaxItems - incidents.length;
    const page = await fetchApiIncidents(
      Math.min(safePageSize, remaining),
      safeStartSkip + incidents.length,
    );
    incidents.push(...page);
    if (page.length < Math.min(safePageSize, remaining)) break;
  }

  return incidents;
};
