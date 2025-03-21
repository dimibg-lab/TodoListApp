import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../types';

interface UserContextType {
  userSettings: UserSettings;
  updateName: (name: string) => Promise<void>;
  updateViewMode: (mode: 'list' | 'grid') => Promise<void>;
  isFirstLaunch: boolean;
  setIsFirstLaunch: (value: boolean) => void;
}

const defaultSettings: UserSettings = {
  name: '',
  theme: 'light',
  listsViewMode: 'list'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(true);

  useEffect(() => {
    // Зареждане на потребителските настройки при стартиране
    const loadUserSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('userSettings');
        if (savedSettings) {
          const settings: UserSettings = JSON.parse(savedSettings);
          setUserSettings(settings);
          setIsFirstLaunch(false);
        } else {
          setIsFirstLaunch(true);
        }
      } catch (error) {
        console.error('Грешка при зареждане на настройките:', error);
      }
    };

    loadUserSettings();
  }, []);

  const updateSettings = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Грешка при запазване на настройките:', error);
    }
  };

  const updateName = async (name: string) => {
    const newSettings = { ...userSettings, name };
    await updateSettings(newSettings);
  };

  const updateViewMode = async (listsViewMode: 'list' | 'grid') => {
    const newSettings = { ...userSettings, listsViewMode };
    await updateSettings(newSettings);
  };

  return (
    <UserContext.Provider value={{ 
      userSettings, 
      updateName, 
      updateViewMode,
      isFirstLaunch,
      setIsFirstLaunch
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser трябва да се използва в UserProvider');
  }
  return context;
}; 