import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { initializeDB } from '@/lib/db';
import { incidentDistance, incidentTimestamp, resolveIncidentType } from '@/lib/incidentFilters';
import {
  getIndexedDbIncidents,
  getPersistentIncidents,
  keepLatestIncidents,
  syncSentinelFeedsPermanently,
} from '@/lib/liveSyncEngine';
import { queryClientInstance } from '@/lib/query-client';

const notifyKeyForType = (type) => `notify_${type}`;

const loadNotifySettings = () => {
  try {
    return JSON.parse(localStorage.getItem('sentinel_notify_settings') || '{}');
  } catch {
    return {};
  }
};

const getNotificationRadius = (settings) => {
  const radius = Number(settings.notification_radius);
  return Number.isFinite(radius) ? Math.min(Math.max(radius, 1), 100) : 20;
};

const MAX_ALERT_AGE_MS = 30 * 60 * 1000;
const MAX_ALERTS_PER_REFRESH = 3;

export default function GlobalIncidentMonitor() {
  const previousIncidentIds = useRef(new Set());
  const isFirstFetch = useRef(true);
  const monitorStartedAt = useRef(Date.now());
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    initializeDB().catch((error) => console.error('Sentinel database initialization failed:', error));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.warn('Global GPS radar location error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents-live'],
    queryFn: syncSentinelFeedsPermanently,
    initialData: getPersistentIncidents,
    staleTime: 15000,
    refetchInterval: 30000,
  });

  useEffect(() => {
    let active = true;
    getIndexedDbIncidents().then((cachedIncidents) => {
      if (!active || cachedIncidents.length === 0) return;
      queryClientInstance.setQueryData(['incidents-live'], (current = []) => (
        keepLatestIncidents([...current, ...cachedIncidents])
      ));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (incidents.length === 0) return;
    const notifySettings = loadNotifySettings();
    const notificationRadius = getNotificationRadius(notifySettings);

    if (isFirstFetch.current) {
      incidents.forEach((incident) => previousIncidentIds.current.add(incident.id));
      isFirstFetch.current = false;
      return;
    }
    if (!userLocation) return;

    const unseenIncidents = incidents.filter((incident) => (
      !previousIncidentIds.current.has(incident.id)
    ));
    unseenIncidents.forEach((incident) => previousIncidentIds.current.add(incident.id));

    unseenIncidents
      .filter((incident) => {
        const timestamp = incidentTimestamp(incident);
        return timestamp > 0 && timestamp >= monitorStartedAt.current - MAX_ALERT_AGE_MS;
      })
      .map((incident) => ({
        incident,
        distance: incidentDistance(incident, userLocation),
        resolvedType: resolveIncidentType(incident),
      }))
      .filter(({ distance, resolvedType }) => (
        notifySettings[notifyKeyForType(resolvedType)] !== false
        && distance != null
        && distance <= notificationRadius
      ))
      .slice(0, MAX_ALERTS_PER_REFRESH)
      .forEach(({ incident, distance }) => {
        toast.warning(`ALLERTA IN ZONA: ${incident.title}`, {
          description: `${incident.address || incident.city} (${distance.toFixed(1)} km da te)`,
          duration: 8000,
        });
      });
  }, [incidents, userLocation]);

  return null;
}
