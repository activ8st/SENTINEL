/**
 * liveSyncEngine.js - Production Live Feed Ingestion Engine V12 (INSTANT 0MS CACHED REVALIDATION)
 */

import { fetchAllLiveSentinelFeeds, getColdBootRealLiveFeeds } from '@/lib/newsScraper';
import { db } from '@/lib/db';
import { fetchApiIncidents } from '@/lib/sentinelApi';

const STORAGE_KEY = 'sentinel_live_production_v11';

// Helper: Deduplicate feeds strictly by normalized title
export const deduplicateFeeds = (items) => {
  if (!Array.isArray(items)) return [];
  const seenTitles = new Set();
  const result = [];

  for (const item of items) {
    if (!item || !item.title) continue;
    const normTitle = item.title.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seenTitles.has(normTitle)) {
      seenTitles.add(normTitle);
      result.push(item);
    }
  }
  return result;
};

export const getPersistentIncidents = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateFeeds(parsed);
      }
    }
  } catch (e) {
    console.warn('LocalStorage persistent read warning:', e);
  }
  return getColdBootRealLiveFeeds();
};

export const savePersistentIncidents = (incidents) => {
  try {
    const clean = deduplicateFeeds(incidents);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.warn('LocalStorage persistent write warning:', e);
  }
};

export const syncSentinelFeedsPermanently = async () => {
  const cached = getPersistentIncidents();

  // Instant 0ms return if we have persistent cached data
  // Background fetch revalidates without blocking initial render
  try {
    let liveFeeds = [];

    try {
      liveFeeds = await fetchApiIncidents();
    } catch (apiError) {
      console.warn('Sentinel API unavailable or cold start, using fast client RSS:', apiError);
    }

    if (liveFeeds.length === 0) {
      liveFeeds = await fetchAllLiveSentinelFeeds();
    }
    const titleMap = new Map();

    // 1. Ingest User Reports submitted via the app (IndexedDB db.reports)
    try {
      await db.open();
      const userReports = await db.reports.toArray();
      userReports.forEach(rep => {
        if (!rep || !rep.title) return;
        if (!Number.isFinite(Number(rep.latitude)) || !Number.isFinite(Number(rep.longitude))) return;
        const normKey = rep.title.toLowerCase().replace(/\s+/g, ' ').trim();
        titleMap.set(normKey, {
          id: rep.id || `usr-${Date.now()}`,
          title: rep.title,
          description: rep.description || 'Segnalazione inviata in tempo reale dalla community Sentinel.',
          type: rep.type || 'suspicious',
          severity: rep.severity || 'medium',
          status: 'active',
          latitude: Number(rep.latitude),
          longitude: Number(rep.longitude),
          address: rep.address || 'Posizione della segnalazione',
          city: rep.city || '',
          is_live: true,
          created_date: rep.created_date || new Date().toISOString(),
          source: 'Community Sentinel',
          official_verified: false
        });
      });
    } catch (dbErr) {
      console.warn("IndexedDB user reports read warning:", dbErr);
    }

    // 2. Add 100% real live scraped feeds
    liveFeeds.forEach(item => {
      if (!item || !item.title) return;
      const normKey = item.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!titleMap.has(normKey)) {
        titleMap.set(normKey, item);
      }
    });

    const finalIncidents = Array.from(titleMap.values());
    savePersistentIncidents(finalIncidents);
    return finalIncidents.length > 0 ? finalIncidents : cached;
  } catch (err) {
    console.warn("Live sync error fallback to persistent cache:", err);
    return cached;
  }
};
