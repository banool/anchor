import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import {
    initializeCrashlytics,
    initializeRemoteConfig,
    setCrashlyticsAttribute
} from '@/lib/firebase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Initialize Firebase services
    const initializeFirebase = async () => {
      try {
        // Initialize Crashlytics
        initializeCrashlytics();

        // Set app version for crash reporting
        setCrashlyticsAttribute('app_version', '1.0.0');
        setCrashlyticsAttribute('color_scheme', colorScheme || 'light');

        // Initialize Remote Config
        await initializeRemoteConfig();

        console.log('Firebase services initialized successfully');
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    };

    initializeFirebase();
  }, [colorScheme]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="smart-entry" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
