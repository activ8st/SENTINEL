import Dexie from 'dexie';
import { MOCK_INCIDENTS } from '@/components/data/mockData';

export const APP_MODE = import.meta.env.VITE_APP_MODE || 'production';
export const IS_DEMO_MODE = APP_MODE === 'demo';

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
    if (IS_DEMO_MODE) {
      // In demo mode, seed mock incidents for testing/demonstration
      const count = await db.incidents.count();
      if (count === 0) {
        const freshIncidents = MOCK_INCIDENTS.map(inc => ({
          ...inc,
          is_demo: true,
          created_date: inc.created_date || new Date().toISOString()
        }));
        await db.incidents.bulkAdd(freshIncidents);
      }
    }
  } catch (err) {
    console.error('Failed to open or seed db', err);
  }
};
