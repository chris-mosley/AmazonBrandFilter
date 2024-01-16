import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { defaultLocalStorageValue, defaultSyncStorageValue } from 'utils/config';
import { StorageSettings, SyncStorageSettings } from 'utils/types';
import { getSettings } from 'utils/browser-helpers';

const SettingsContext = createContext(
  {} as {
    settings: StorageSettings;
    syncSettings: SyncStorageSettings;
    setAll: () => Promise<void>;
  }
);

interface SettingsProviderProps {
  children: React.ReactNode;
}

const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<StorageSettings>(defaultLocalStorageValue);
  const [syncSettings, setSyncSettings] = useState<SyncStorageSettings>(defaultSyncStorageValue);

  const setAll = async () => {
    const res = await getSettings();
    setSettings(res.settings);
    setSyncSettings(res.syncSettings);
  };

  useEffect(() => {
    setAll();
  }, []);

  const value = useMemo(() => ({ 
    settings,
    syncSettings,
    setAll,
  }), [
    settings,
    syncSettings,
    setAll,
  ]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

const useSettings = () => useContext(SettingsContext);

export { SettingsProvider, useSettings };
