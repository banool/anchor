import { initializeApp as initializeJSApp } from '@firebase/app';
import { connectDataConnectEmulator, DataConnect, getDataConnect } from '@firebase/data-connect';
import { initializeApp } from '@react-native-firebase/app';
import crashlytics from '@react-native-firebase/crashlytics';
import remoteConfig from '@react-native-firebase/remote-config';

// Firebase configuration
// Replace these values with your own Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize React Native Firebase (for Crashlytics and Remote Config)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firebase JS SDK (for Data Connect)
let jsApp;
try {
  jsApp = initializeJSApp(firebaseConfig, 'js-app');
} catch (error) {
  console.error('Firebase JS SDK initialization error:', error);
}

// Initialize Data Connect
export let dataConnect: DataConnect | undefined;
try {
  if (jsApp) {
    dataConnect = getDataConnect(jsApp, {
      connector: 'anchor-connector',
      service: 'anchor-service',
      location: 'us-central1', // Change to your preferred region
    });

    // Connect to emulator in development
    if (__DEV__) {
      try {
        connectDataConnectEmulator(dataConnect, 'localhost', 9399);
        console.log('Connected to Firebase Data Connect emulator');
      } catch (error) {
        console.warn('Failed to connect to Data Connect emulator:', error);
      }
    }
  }
} catch (error) {
  console.error('Data Connect initialization error:', error);
}

// Initialize Crashlytics
export const initializeCrashlytics = () => {
  try {
    if (__DEV__) {
      // Disable Crashlytics collection in debug mode
      crashlytics().setCrashlyticsCollectionEnabled(false);
    } else {
      crashlytics().setCrashlyticsCollectionEnabled(true);
    }

    // Set user identifier for better crash reporting
    crashlytics().setUserId('anonymous');

    console.log('Firebase Crashlytics initialized');
  } catch (error) {
    console.error('Crashlytics initialization error:', error);
  }
};

// Initialize Remote Config
export const initializeRemoteConfig = async () => {
  try {
    // Set default values for feature flags
    const defaultValues = {
      enable_new_feature: false,
      max_entries_per_child: 1000,
      enable_push_notifications: true,
      enable_collaboration: true,
      maintenance_mode: false,
    };

    await remoteConfig().setDefaults(defaultValues);

    // Set config settings
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: __DEV__ ? 0 : 43200000, // 12 hours in production, 0 in dev
    });

    // Fetch and activate remote config
    await remoteConfig().fetchAndActivate();

    console.log('Firebase Remote Config initialized');
  } catch (error) {
    console.error('Remote Config initialization error:', error);
  }
};

// Remote Config helpers
export const getRemoteConfigValue = (key: string): any => {
  try {
    return remoteConfig().getValue(key);
  } catch (error) {
    console.error(`Error getting remote config value for ${key}:`, error);
    return null;
  }
};

export const getBooleanValue = (key: string): boolean => {
  try {
    return remoteConfig().getValue(key).asBoolean();
  } catch (error) {
    console.error(`Error getting boolean value for ${key}:`, error);
    return false;
  }
};

export const getNumberValue = (key: string): number => {
  try {
    return remoteConfig().getValue(key).asNumber();
  } catch (error) {
    console.error(`Error getting number value for ${key}:`, error);
    return 0;
  }
};

export const getStringValue = (key: string): string => {
  try {
    return remoteConfig().getValue(key).asString();
  } catch (error) {
    console.error(`Error getting string value for ${key}:`, error);
    return '';
  }
};

// Crashlytics helpers
export const logCrashlytics = (message: string, error?: Error) => {
  try {
    crashlytics().log(message);
    if (error) {
      crashlytics().recordError(error);
    }
  } catch (e) {
    console.error('Error logging to Crashlytics:', e);
  }
};

export const setCrashlyticsAttribute = (key: string, value: string) => {
  try {
    crashlytics().setAttribute(key, value);
  } catch (error) {
    console.error('Error setting Crashlytics attribute:', error);
  }
};

export const setCrashlyticsUserId = (userId: string) => {
  try {
    crashlytics().setUserId(userId);
  } catch (error) {
    console.error('Error setting Crashlytics user ID:', error);
  }
};

export { crashlytics, remoteConfig };
export default app;
