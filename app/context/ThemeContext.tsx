import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../types';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    // Зареждане на запазената тема при стартиране
    const loadTheme = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('userSettings');
        if (savedSettings) {
          const settings: UserSettings = JSON.parse(savedSettings);
          setTheme(settings.theme);
        }
      } catch (error) {
        console.error('Грешка при зареждане на темата:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme: ThemeType = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      // Запазване на новата тема в AsyncStorage
      const savedSettings = await AsyncStorage.getItem('userSettings');
      let settings: UserSettings;
      
      if (savedSettings) {
        settings = JSON.parse(savedSettings);
        settings.theme = newTheme;
      } else {
        settings = {
          name: '',
          theme: newTheme,
          listsViewMode: 'list'
        };
      }
      
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Грешка при запазване на темата:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme трябва да се използва в ThemeProvider');
  }
  return context;
}; 