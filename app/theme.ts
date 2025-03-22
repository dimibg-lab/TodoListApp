import { useEffect, useState } from 'react';
import { useTheme as useContextTheme } from './context/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from './constants/theme';

// Основни цветове, които не зависят от светла или тъмна тема
export const SHARED_COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  primary: '#2196F3',
  primaryLight: '#BBDEFB',
  primaryDark: '#1976D2',
  accent: '#FF4081',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FFC107',
};

// Типове за справка с TypeScript
export interface ThemeColors {
  // Основни цветове
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  
  // Фонове и повърхности
  background: string;
  card: string;
  surface: string;
  inputBackground: string;
  
  // Текст и граници
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  divider: string;
  
  // Състояния
  error: string;
  success: string;
  warning: string;
  info: string;
  
  // Приоритети
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  
  // Специфични цветове
  completed: string;
  white: string;
  black: string;
  transparent: string;
}

export interface ThemeFonts {
  heading: {
    fontSize: number;
    fontWeight: string;
  };
  subheading: {
    fontSize: number;
    fontWeight: string;
  };
  body: {
    fontSize: number;
    fontWeight: string;
  };
  label: {
    fontSize: number;
    fontWeight: string;
  };
  caption: {
    fontSize: number;
    fontWeight: string;
  };
}

// Кука за използване на общата тема
export const useTheme = () => {
  const { theme } = useContextTheme();
  const [colors, setColors] = useState<ThemeColors>({
    ...(COLORS[theme] as any),
    ...SHARED_COLORS
  });
  
  // Шрифтове за различни елементи
  const fonts: ThemeFonts = {
    heading: {
      fontSize: FONT_SIZE.heading,
      fontWeight: FONT_WEIGHT.bold,
    },
    subheading: {
      fontSize: FONT_SIZE.l,
      fontWeight: FONT_WEIGHT.medium,
    },
    body: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.normal,
    },
    label: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.medium,
    },
    caption: {
      fontSize: FONT_SIZE.xs,
      fontWeight: FONT_WEIGHT.normal,
    },
  };
  
  // Обновяване на цветовете при промяна на темата
  useEffect(() => {
    setColors({
      ...(COLORS[theme] as any),
      ...SHARED_COLORS
    });
  }, [theme]);
  
  // Връщаме всички нужни стойности и функции
  return {
    theme,
    colors,
    fonts,
    spacing: SPACING,
    fontSize: FONT_SIZE,
    fontWeight: FONT_WEIGHT,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS[theme],
    isDark: theme === 'dark'
  };
};

export { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS }; 