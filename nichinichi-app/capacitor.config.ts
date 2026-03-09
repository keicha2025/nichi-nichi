import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nichinichi.app',
  appName: '日日記',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      androidClientId: '690825505366-uo56fb79qbh5462v5efq0heip02nfmor.apps.googleusercontent.com',
      serverClientId: '690825505366-uo56fb79qbh5462v5efq0heip02nfmor.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
