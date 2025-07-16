import { initializeApp as initializeJSApp } from '@firebase/app';
import { connectDataConnectEmulator, DataConnect, getDataConnect } from '@firebase/data-connect';
import { initializeApp } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import remoteConfig from '@react-native-firebase/remote-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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

// Initialize Google Sign-In
export const initializeGoogleSignIn = () => {
  try {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID, // From Firebase console
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });

    console.log('Google Sign-In configured');
  } catch (error) {
    console.error('Google Sign-In configuration error:', error);
  }
};

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

// Authentication functions
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();

    if (!signInResult.data?.idToken) {
      throw new Error('Google Sign-In failed - no ID token returned');
    }

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data.idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
};

export const signInWithApple = async (): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const { AppleAuthentication } = require('expo-apple-authentication');

    // Start the sign-in request
    const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }

    // Create a Firebase credential from the response
    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

    // Sign the user in with the credential
    return auth().signInWithCredential(appleCredential);
  } catch (error) {
    console.error('Apple Sign-In error:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    // Sign out from Google
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.warn('Google sign out error:', error);
    }

    // Sign out from Firebase
    await auth().signOut();

    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

export const onAuthStateChanged = (callback: (user: FirebaseAuthTypes.User | null) => void) => {
  return auth().onAuthStateChanged(callback);
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

export { auth, crashlytics, remoteConfig };
export default app;
