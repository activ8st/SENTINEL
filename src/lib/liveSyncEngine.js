/**
 * liveSyncEngine.js - Production Live Feed Ingestion Engine V12 (PROVENANCE & APP_MODE SUPPORT)
 */

import { fetchAllLiveSentinelFeeds, getColdBootRealLiveFeeds } from '@/lib/newsScraper';
import { db, APP_MODE, IS_DEMO_MODE } from '@/lib/db';
import { fetchApiIncidents } from '@/lib/sentinelApi';

const STORAGE_KEY = `sentinel_live_${APP_MODE}_v12`;

// Helper: Calculate freshness status from timestamp
export const calculateFreshnessStatus = (createdDate) => {
  if (!createdDate) return 'unknown';
  const ageInHours = (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60);
  if (ageInHours <= 6) return 'live';
  if (ageInHours <= 48) return 'recent';
  return 'archived';
};

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
  // If no persistent cache exists, cold boot feeds
  const cold = getColdBootRealLiveFeeds();
  if (!IS_DEMO_MODE) {
    // In production/pilot mode, mark cold boot feeds explicitly as cached fallback
    return cold
      .filter(item => !item.is_demo && !String(item.id).startsWith('mock-'))
      .map(item => ({
        ...item,
        is_fallback: true,
        data_origin: 'cache_cold_boot',
        source_label: `${item.source || 'RSS'} (Cache offline)`
      }));
  }
  return cold;
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

  try {
    let liveFeeds = [];
    let isRssFallback = false;

    try {
      liveFeeds = await fetchApiIncidents();
    } catch (apiError) {
      console.warn('Sentinel API unavailable or cold start, using fast client RSS fallback:', apiError);
    }

    if (liveFeeds.length === 0) {
      isRssFallback = true;
      liveFeeds = await fetchAllLiveSentinelFeeds();
    }
    const titleMap = new Map();

    // Ingest local user reports only in demo mode
    if (IS_DEMO_MODE) {
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
            description: rep.description || 'Segnalazione demo Sentinel.',
            type: rep.type || 'suspicious',
            severity: rep.severity || 'medium',
            status: rep.status || 'active',
            latitude: Number(rep.latitude),
            longitude: Number(rep.longitude),
            address: rep.address || 'Posizione della segnalazione',
            city: rep.city || '',
            is_live: true,
            created_date: rep.created_date || new Date().toISOString(),
            source: 'Demo Community',
            source_label: 'Segnalazione Demo',
            data_origin: 'demo_user',
            verification_status: 'demo',
            source_url: '',
            freshness_status: calculateFreshnessStatus(rep.created_date),
            is_demo: true,
            official_verified: false
          });
        });
      } catch (dbErr) {
        console.warn("IndexedDB user reports read warning:", dbErr);
      }
    }

    // 2. Add real live scraped / API feeds with explicit provenance & fallback metadata
    liveFeeds.forEach(item => {
      if (!item || !item.title) return;
      const isDemoItem = Boolean(item.is_demo || String(item.id).startsWith('mock-'));
      if (!IS_DEMO_MODE && isDemoItem) return;

      const normKey = item.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!titleMap.has(normKey)) {
        const createdDate = item.created_date || item.published_at || new Date().toISOString();
        const enriched = {
          ...item,
          is_fallback: isRssFallback || Boolean(item.is_fallback),
          data_origin: isRssFallback ? 'rss_fallback' : (item.data_origin || 'shared_db'),
          verification_status: isRssFallback ? 'fallback_unverified' : (item.verification_status || 'verified'),
          source_label: isRssFallback
            ? `${item.source || 'RSS'} (Fallback)`
            : (item.source_label || item.source || 'Sentinel Database'),
          source_url: item.source_url || (Array.isArray(item.media_urls) ? item.media_urls[0] : '') || '',
          freshness_status: item.freshness_status || calculateFreshnessStatus(createdDate),
          is_demo: isDemoItem,
          official_verified: !isRssFallback && (item.official_verified ?? false)
        };
        titleMap.set(normKey, enriched);
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
