import { normalizeIncidentType, TYPE_CONFIG } from '@/components/data/mockData';
import { hasPreciseIncidentLocation } from '@/lib/incidentLocation';

const CATEGORY_PRIORITY = ['crime', 'fire', 'accident', 'weather', 'medical', 'traffic', 'suspicious'];
const typeCache = new WeakMap();
const timestampCache = new WeakMap();

const CATEGORY_RULES = {
  crime: [
    [/\b(?:omicid|femminicid|rapin|furto|ladro|ladri|arrest|accoltell|sparator|aggress|aggredit|pestagg|rissa|sequestr|spacci|droga|truff|maltrattament|violenza domestica|estorsion|vandal|evas)\w*/g, 9],
    [/\b(?:carabinier|polizia|questura|finanza)\w*/g, 2],
    [/\b(?:denunciat|denunce|denuncia)\w*/g, 5],
  ],
  fire: [
    [/\b(?:incendio|rogo|fiamme|canadair|incendio boschivo)\w*/g, 9],
    [/\b(?:vigili del fuoco|brucia|in fumo)\b/g, 6],
    [/\b(?:esplosione|fumo)\w*/g, 4],
  ],
  accident: [
    [/\b(?:incidente stradale|scontro frontale|tamponamento|schianto)\w*/g, 10],
    [/\b(?:travolt|investit|ribaltat|carambola)\w*/g, 8],
    [/\bincidente\w*/g, 5],
  ],
  weather: [
    [/\b(?:allerta meteo|nubifragio|alluvion|esondazion|terremot|sisma|mareggiat|tromba d aria)\w*/g, 10],
    [/\b(?:temporale|frana|neve|grandine|maltempo|vento forte|ondata di calore)\w*/g, 7],
  ],
  medical: [
    [/\b(?:emergenza sanitaria|epidemia|contagio|intossicazion|malore)\w*/g, 9],
    [/\b(?:soccorso sanitario|croce rossa|118)\b/g, 6],
    [/\b(?:ricoverat|evacuat)\w*/g, 3],
  ],
  traffic: [
    [/\b(?:traffico|viabilita|coda|rallentament|deviazion|svincolo|casello|tangenziale)\w*/g, 8],
    [/\b(?:strada chiusa|chiusura stradale|uscita chiusa|lavori stradali)\b/g, 9],
    [/\b(?:anas|autostrade|cciss)\b/g, 5],
  ],
  suspicious: [
    [/\b(?:attivita sospetta|movimenti sospetti|tentata intrusione|intrusione)\w*/g, 8],
    [/\b(?:scomparso|ricercato|allarme|segnalazione)\w*/g, 4],
  ],
};

const normalizeText = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const scoreText = (text, multiplier, scores) => {
  Object.entries(CATEGORY_RULES).forEach(([category, rules]) => {
    rules.forEach(rule => {
      const pattern = rule[0];
      const weight = Number(rule[1]);
      if (!(pattern instanceof RegExp)) return;
      pattern.lastIndex = 0;
      const matches = text.match(pattern);
      if (matches) scores[category] += weight * multiplier * Math.min(matches.length, 2);
    });
  });
};

export const resolveIncidentType = incident => {
  if (!incident || typeof incident !== 'object') return 'other';
  const declared = normalizeIncidentType(incident?.type);
  const signature = [
    declared,
    incident?.title,
    incident?.description,
    incident?.summary,
    incident?.location_evidence,
  ].join('\u0000');
  const cached = typeCache.get(incident);
  if (cached?.signature === signature) return cached.value;

  const scores = Object.fromEntries(CATEGORY_PRIORITY.map(category => [category, 0]));
  const title = normalizeText(incident?.title);
  const description = normalizeText([
    incident?.description,
    incident?.summary,
    incident?.location_evidence,
  ].filter(Boolean).join(' '));

  scoreText(title, 2, scores);
  scoreText(description, 1, scores);
  if (declared !== 'other' && scores[declared] != null) scores[declared] += 3;

  const best = CATEGORY_PRIORITY.reduce((winner, category) => (
    scores[category] > scores[winner] ? category : winner
  ), CATEGORY_PRIORITY[0]);

  const value = scores[best] >= 5
    ? best
    : (TYPE_CONFIG[declared] ? declared : 'other');
  typeCache.set(incident, { signature, value });
  return value;
};

export const incidentTimestamp = incident => {
  const rawDate = incident?.created_date || incident?.published_at || incident?.last_seen_at;
  if (!rawDate) return 0;
  if (incident && typeof incident === 'object') {
    const cached = timestampCache.get(incident);
    if (cached?.rawDate === rawDate) return cached.value;
  }

  const italianDate = String(rawDate).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  let value;
  if (italianDate) {
    const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = italianDate;
    value = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds)).getTime();
  } else {
    const parsed = new Date(rawDate).getTime();
    value = Number.isFinite(parsed) ? parsed : 0;
  }

  if (incident && typeof incident === 'object') {
    timestampCache.set(incident, { rawDate, value });
  }
  return value;
};

export const incidentDistance = (incident, userLocation) => {
  if (!userLocation || !hasPreciseIncidentLocation(incident)) return null;
  const lat1 = Number(userLocation.lat);
  const lon1 = Number(userLocation.lng);
  const lat2 = Number(incident.latitude);
  const lon2 = Number(incident.longitude);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

  const toRadians = value => value * Math.PI / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const enrichIncident = (incident, userLocation) => ({
  ...incident,
  source_type: incident?.source_type || incident?.type || 'other',
  type: resolveIncidentType(incident),
  timestamp: incidentTimestamp(incident),
  distance: incidentDistance(incident, userLocation),
});

export const filterIncidents = (incidents, {
  activeTypes = null,
  selectedHours = 0,
  useRadius = false,
  radius = 1,
  userLocation = null,
  hasUserLocation = false,
  requirePreciseLocation = false,
  sortMode = 'recent',
} = {}) => {
  const allowedTypes = activeTypes ? new Set(activeTypes) : null;
  const cutoff = selectedHours > 0 ? Date.now() - selectedHours * 3600 * 1000 : 0;

  return (Array.isArray(incidents) ? incidents : [])
    .filter(Boolean)
    .map(incident => enrichIncident(incident, hasUserLocation ? userLocation : null))
    .filter(incident => !allowedTypes || allowedTypes.has(incident.type))
    .filter(incident => !requirePreciseLocation || hasPreciseIncidentLocation(incident))
    .filter(incident => !useRadius || !hasUserLocation || (
      incident.distance != null && incident.distance <= Number(radius)
    ))
    .filter(incident => selectedHours === 0 || (
      incident.timestamp > 0 && incident.timestamp >= cutoff
    ))
    .sort((left, right) => {
      if (sortMode === 'distance' && hasUserLocation) {
        return (left.distance ?? Number.POSITIVE_INFINITY) - (right.distance ?? Number.POSITIVE_INFINITY);
      }
      return right.timestamp - left.timestamp;
    });
};
