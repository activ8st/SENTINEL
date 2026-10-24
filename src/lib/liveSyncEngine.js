/**
 * Production live-feed ingestion with a fast persistent cache.
 */

import {
  fetchAllLiveSentinelFeeds,
  getColdBootRealLiveFeeds,
  isCoveredLaunchArea,
} from '@/lib/newsScraper';
import { db, APP_MODE, IS_DEMO_MODE } from '@/lib/db';
import { fetchAllApiIncidents, fetchApiIncidents } from '@/lib/sentinelApi';

const STORAGE_KEY = `sentinel_live_${APP_MODE}_v12`;
export const PERSISTED_INCIDENT_LIMIT = 400;
const INDEXED_DB_INCIDENT_LIMIT = 10000;
const FULL_SYNC_PAGE_SIZE = 1000;
const FULL_SYNC_INTERVAL_MS = 5 * 60 * 1000;

const incidentTimestamp = (incident) => {
  const value = incident?.created_date || incident?.published_at || incident?.last_seen_at;
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const normalizedTitle = (item) => String(item?.title || '')
  .toLocaleLowerCase('it-IT')
  .replace(/\s+/g, ' ')
  .trim();

const isDemoIncident = (item) => Boolean(
  item?.is_demo
  || /^inc-m\d+$/i.test(String(item?.id || ''))
  || String(item?.id || '').startsWith('mock-')
);

const isAllowedCachedIncident = (item) => (
  item?.data_origin !== 'rss_fallback'
  || isCoveredLaunchArea(item?.latitude, item?.longitude)
);

export const calculateFreshnessStatus = (createdDate) => {
  const timestamp = new Date(createdDate || 0).getTime();
  if (!Number.isFinite(timestamp) || timestamp <= 0) return 'unknown';
  const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
  if (ageInHours <= 6) return 'live';
  if (ageInHours <= 48) return 'recent';
  return 'archived';
};

export const deduplicateFeeds = (items) => {
  if (!Array.isArray(items)) return [];
  const seenTitles = new Set();
  const result = [];

  for (const item of items) {
    if (!item?.title) continue;
    const key = normalizedTitle(item);
    if (!key || seenTitles.has(key)) continue;
    seenTitles.add(key);
    result.push(item);
  }
  return result;
};

export const keepLatestIncidents = (items, limit = INDEXED_DB_INCIDENT_LIMIT) => (
  deduplicateFeeds(items)
    .filter((item) => IS_DEMO_MODE || !isDemoIncident(item))
    .filter(isAllowedCachedIncident)
    .sort((a, b) => incidentTimestamp(b) - incidentTimestamp(a))
    .slice(0, limit)
);

const persistenceSignature = (incident) => JSON.stringify([
  incident?.title,
  incident?.description,
  incident?.type,
  incident?.severity,
  incident?.status,
  incident?.latitude,
  incident?.longitude,
  incident?.address,
  incident?.city,
  incident?.location_precision,
  incident?.location_evidence,
  incident?.verification_status,
  incident?.confidence_score,
  incident?.source_type,
  incident?.source_trust,
  incident?.source,
  incident?.source_label,
  incident?.source_url,
  incident?.official_verified,
  incident?.data_origin,
  incident?.is_fallback,
  incident?.freshness_status,
  incident?.created_date,
  incident?.published_at,
  incident?.updated_at,
  incident?.resolved_at,
  incident?.resolution_reason,
  incident?.last_verified_at,
  incident?.last_seen_at,
  incident?.reporter_karma,
  incident?.fake_votes,
  incident?.media_urls,
]);

export const savePersistentIncidents = async (items, knownIndexedItems = null) => {
  const latest = keepLatestIncidents(items, INDEXED_DB_INCIDENT_LIMIT);
  const instantCache = latest.slice(0, PERSISTED_INCIDENT_LIMIT);

  try {
    const serializedCache = JSON.stringify(instantCache);
    if (localStorage.getItem(STORAGE_KEY) !== serializedCache) {
      localStorage.setItem(STORAGE_KEY, serializedCache);
    }
  } catch (error) {
    console.warn('LocalStorage persistent write warning:', error);
  }

  try {
    await db.open();
    const existing = Array.isArray(knownIndexedItems)
      ? knownIndexedItems
      : await db.incidents.toArray();
    const existingById = new Map(existing.map((incident) => [incident.id, incident]));
    const latestIds = new Set(latest.map((incident) => incident.id));
    const changed = latest.filter((incident) => {
      const previous = existingById.get(incident.id);
      return !previous || persistenceSignature(previous) !== persistenceSignature(incident);
    });
    const removedIds = existing
      .filter((incident) => !latestIds.has(incident.id))
      .map((incident) => incident.id);

    if (changed.length === 0 && removedIds.length === 0) return latest;

    await db.transaction('rw', db.incidents, async () => {
      if (removedIds.length > 0) await db.incidents.bulkDelete(removedIds);
      if (changed.length > 0) await db.incidents.bulkPut(changed);
    });
  } catch (error) {
    console.warn('IndexedDB persistent write warning:', error);
  }

  return latest;
};

export const getIndexedDbIncidents = async () => {
  try {
    await db.open();
    const items = await db.incidents
      .orderBy('created_date')
      .reverse()
      .limit(INDEXED_DB_INCIDENT_LIMIT)
      .toArray();
    return keepLatestIncidents(items, INDEXED_DB_INCIDENT_LIMIT);
  } catch (error) {
    console.warn('IndexedDB persistent read warning:', error);
    return [];
  }
};

export const getPersistentIncidents = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return keepLatestIncidents(parsed, PERSISTED_INCIDENT_LIMIT);
      }
    }
  } catch (error) {
    console.warn('LocalStorage persistent read warning:', error);
  }

  const coldBootFeeds = keepLatestIncidents(getColdBootRealLiveFeeds(), PERSISTED_INCIDENT_LIMIT);
  if (IS_DEMO_MODE) return coldBootFeeds;

  return coldBootFeeds.map((item) => ({
    ...item,
    is_fallback: true,
    data_origin: 'cache_cold_boot',
    source_label: `${item.source || 'RSS'} (Cache offline)`,
  }));
};

const performSentinelFeedSync = async () => {
  const cached = getPersistentIncidents();

  try {
    const indexedIncidentsPromise = getIndexedDbIncidents();
    let liveFeeds = [];
    let isRssFallback = false;

    try {
      liveFeeds = await fetchApiIncidents(PERSISTED_INCIDENT_LIMIT);
    } catch (apiError) {
      console.warn('Sentinel API unavailable or cold start, using fast client RSS fallback:', apiError);
    }

    if (liveFeeds.length === 0) {
      isRssFallback = true;
      liveFeeds = await fetchAllLiveSentinelFeeds();
    }
    const titleMap = new Map();
    const addOrReplace = (item) => {
      if (!item?.title || (!IS_DEMO_MODE && isDemoIncident(item))) return;
      titleMap.set(normalizedTitle(item), item);
    };

    const indexedIncidents = await indexedIncidentsPromise;
    [...indexedIncidents, ...cached].forEach(addOrReplace);

    liveFeeds.forEach((item) => {
      if (!item?.title || (!IS_DEMO_MODE && isDemoIncident(item))) return;
      const createdDate = item.created_date || item.published_at || new Date().toISOString();
      addOrReplace({
        ...item,
        is_fallback: isRssFallback || Boolean(item.is_fallback),
        data_origin: isRssFallback
          ? 'rss_fallback'
          : (item.data_origin || item.source_type || (item.official_verified ? 'official_feed' : 'shared_db')),
        verification_status: isRssFallback
          ? 'fallback_unverified'
          : (item.verification_status || (item.official_verified ? 'official' : 'verified')),
        source_label: isRssFallback
          ? `${item.source || 'RSS'} (Fallback)`
          : (item.source_label || item.source || 'Sentinel Database'),
        source_url: item.source_url || (Array.isArray(item.media_urls) ? item.media_urls[0] : '') || '',
        freshness_status: item.freshness_status || calculateFreshnessStatus(createdDate),
        is_demo: isDemoIncident(item),
        official_verified: !isRssFallback && (item.official_verified ?? false),
      });
    });

    // Local-only reports are valid in demo mode. Production reports arrive from
    // the shared backend and are already part of liveFeeds.
    if (IS_DEMO_MODE) {
      try {
        await db.open();
        const userReports = await db.reports.toArray();
        userReports.forEach((report) => {
          if (!report?.title) return;
          if (!Number.isFinite(Number(report.latitude)) || !Number.isFinite(Number(report.longitude))) return;
          addOrReplace({
            id: report.id || `usr-${Date.now()}`,
            title: report.title,
            description: report.description || 'Segnalazione demo Sentinel.',
            type: report.type || 'suspicious',
            severity: report.severity || 'medium',
            status: report.status || 'active',
            latitude: Number(report.latitude),
            longitude: Number(report.longitude),
            address: report.address || 'Posizione della segnalazione',
            city: report.city || '',
            is_live: true,
            created_date: report.created_date || new Date().toISOString(),
            source: 'Demo Community',
            source_label: 'Segnalazione Demo',
            data_origin: 'demo_user',
            verification_status: 'demo',
            source_url: '',
            freshness_status: calculateFreshnessStatus(report.created_date),
            is_demo: true,
            official_verified: false,
          });
        });
      } catch (dbError) {
        console.warn('IndexedDB user reports read warning:', dbError);
      }
    }

    const latest = await savePersistentIncidents(Array.from(titleMap.values()), indexedIncidents);
    scheduleBackgroundFullSync(liveFeeds);
    return latest;
  } catch (error) {
    console.warn('Live sync error fallback to persistent cache:', error);
    return cached;
  }
};

let activeFullSyncPromise = null;
let lastFullSyncAt = 0;
let fullSyncScheduled = false;

const runBackgroundFullSync = async (firstPage) => {
  const remaining = await fetchAllApiIncidents({
    pageSize: FULL_SYNC_PAGE_SIZE,
    maxItems: INDEXED_DB_INCIDENT_LIMIT - firstPage.length,
    startSkip: firstPage.length,
  });
  const indexed = await getIndexedDbIncidents();
  const mergedByTitle = new Map();
  [...indexed, ...remaining, ...firstPage].forEach((incident) => {
    const key = normalizedTitle(incident);
    if (key) mergedByTitle.set(key, incident);
  });
  await savePersistentIncidents(Array.from(mergedByTitle.values()), indexed);
  lastFullSyncAt = Date.now();
};

function scheduleBackgroundFullSync(firstPage) {
  if (
    IS_DEMO_MODE
    || firstPage.length < PERSISTED_INCIDENT_LIMIT
    || activeFullSyncPromise
    || fullSyncScheduled
    || Date.now() - lastFullSyncAt < FULL_SYNC_INTERVAL_MS
  ) return;

  fullSyncScheduled = true;
  const start = () => {
    fullSyncScheduled = false;
    activeFullSyncPromise = runBackgroundFullSync(firstPage)
      .catch((error) => console.warn('Background incident hydration warning:', error))
      .finally(() => {
        activeFullSyncPromise = null;
      });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 2500 });
  } else {
    window.setTimeout(start, 750);
  }
}

let activeSyncPromise = null;

export const syncSentinelFeedsPermanently = () => {
  if (activeSyncPromise) return activeSyncPromise;
  activeSyncPromise = performSentinelFeedSync().finally(() => {
    activeSyncPromise = null;
  });
  return activeSyncPromise;
};

let isLoopRunning = false;

export const startPermanentBackgroundSync = () => {
  if (isLoopRunning) return;
  isLoopRunning = true;
  syncSentinelFeedsPermanently();
  window.setInterval(syncSentinelFeedsPermanently, 30000);
};
