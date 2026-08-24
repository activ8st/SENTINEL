import Dexie from 'dexie';
import { MOCK_INCIDENTS } from '@/components/data/mockData';

export const db = new Dexie('SentinelDB');

db.version(1).stores({
  incidents: 'id, type, severity, status, created_date, latitude, longitude', // Primary key and indexed props
  readStatus: 'incidentId, timestamp', // To track read incidents
  reports: '++id, type, severity, title, description, latitude, longitude, created_date',
  comments: '++id, incident_id, content, created_date'
});

export const initializeDB = async () => {
  try {
    await db.open();
    // Refresh stale mock incidents with fresh timestamps
    await db.incidents.clear();
    const freshIncidents = MOCK_INCIDENTS.map(inc => ({
      ...inc,
      created_date: inc.created_date || new Date().toISOString()
    }));
    await db.incidents.bulkAdd(freshIncidents);
  } catch (err) {
    console.error('Failed to open or seed db', err);
  }
};
