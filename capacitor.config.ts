import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.sentinel.app',
  appName: 'Sentinel',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
