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
    const count = await db.incidents.count();
    if (count === 0) {
      await db.incidents.bulkAdd(MOCK_INCIDENTS);
    }
  } catch (err) {
    console.error('Failed to open or seed db', err);
  }
};
