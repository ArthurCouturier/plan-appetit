import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.planappetit.app',
  appName: 'Plan Appetit',
  webDir: 'dist',

  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
    scheme: 'Plan Appetit',
    backgroundColor: '#eda391',
    overscrollBackgroundColor: '#eda391'
  },

  android: {
    backgroundColor: '#eda391'
  },

  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'localhost',
    // Décommenter pour le dev local avec live reload:
    // url: 'http://192.168.1.124:5173',
    // cleartext: true
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#eda391',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#eda391'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'apple.com']
    },
    FirebaseMessaging: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    FacebookLogin: {
      appId: '1195950565200662',
      autoLogAppEvents: true,
      xfbml: true,
      version: 'v18.0',
      enableAdvertiserTracking: true
    }
  }
};

export default config;
