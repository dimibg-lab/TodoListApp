import { COLORS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// Помощна функция за взимане на цвят, базиран на текущата тема
export const useAppTheme = () => {
  const { theme } = useTheme();
  
  const getColor = (colorName: keyof typeof COLORS.light) => {
    return COLORS[theme][colorName];
  };
  
  const getShadow = (size: keyof typeof SHADOWS.light) => {
    return SHADOWS[theme][size];
  };
  
  return {
    theme,
    colors: COLORS[theme],
    getColor,
    shadows: SHADOWS[theme],
    getShadow,
    isDark: theme === 'dark',
  };
}; 