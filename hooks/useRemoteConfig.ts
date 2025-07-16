import {
    getBooleanValue,
    getNumberValue,
    getStringValue,
    remoteConfig
} from '@/lib/firebase';
import { useEffect, useState } from 'react';

export const useRemoteConfig = () => {
  const [config, setConfig] = useState({
    enableNewFeature: false,
    maxEntriesPerChild: 1000,
    enablePushNotifications: true,
    enableCollaboration: true,
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Fetch latest remote config values
        await remoteConfig().fetchAndActivate();

        // Update state with current values
        setConfig({
          enableNewFeature: getBooleanValue('enable_new_feature'),
          maxEntriesPerChild: getNumberValue('max_entries_per_child'),
          enablePushNotifications: getBooleanValue('enable_push_notifications'),
          enableCollaboration: getBooleanValue('enable_collaboration'),
          maintenanceMode: getBooleanValue('maintenance_mode'),
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading remote config:', error);
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const refreshConfig = async () => {
    setLoading(true);
    try {
      await remoteConfig().fetchAndActivate();
      setConfig({
        enableNewFeature: getBooleanValue('enable_new_feature'),
        maxEntriesPerChild: getNumberValue('max_entries_per_child'),
        enablePushNotifications: getBooleanValue('enable_push_notifications'),
        enableCollaboration: getBooleanValue('enable_collaboration'),
        maintenanceMode: getBooleanValue('maintenance_mode'),
      });
    } catch (error) {
      console.error('Error refreshing remote config:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    refreshConfig,
  };
};

// Individual hooks for specific config values
export const useFeatureFlag = (key: string): boolean => {
  const [value, setValue] = useState(false);

  useEffect(() => {
    const loadValue = async () => {
      try {
        await remoteConfig().fetchAndActivate();
        setValue(getBooleanValue(key));
      } catch (error) {
        console.error(`Error loading feature flag ${key}:`, error);
      }
    };

    loadValue();
  }, [key]);

  return value;
};

export const useRemoteConfigString = (key: string, defaultValue: string = ''): string => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const loadValue = async () => {
      try {
        await remoteConfig().fetchAndActivate();
        setValue(getStringValue(key) || defaultValue);
      } catch (error) {
        console.error(`Error loading remote config string ${key}:`, error);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  return value;
};

export const useRemoteConfigNumber = (key: string, defaultValue: number = 0): number => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const loadValue = async () => {
      try {
        await remoteConfig().fetchAndActivate();
        setValue(getNumberValue(key) || defaultValue);
      } catch (error) {
        console.error(`Error loading remote config number ${key}:`, error);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  return value;
};
