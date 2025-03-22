import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Дефинираме локално интерфейса
interface WeatherRecommendation {
  timestamp: Date;
  recommended: boolean;
  message: string;
}

// Ключ за WeatherAPI.com - трябва да се замени с истински ключ
const WEATHER_API_KEY = '1e147da7117f4fd286a122257252203';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

// Типове за данните за времето
export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_dir: string;
    precip_mm: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        totalrecip_mm: number;
        avghumidity: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        chance_of_rain: number;
      }>;
    }>;
  };
}

// Интерфейс на контекста за времето
interface WeatherContextType {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchWeather: (latitude?: number, longitude?: number) => Promise<void>;
  getWeatherForLocation: (latitude: number, longitude: number) => Promise<WeatherData | null>;
  isOutdoorTaskRecommended: (latitude: number, longitude: number) => Promise<WeatherRecommendation>;
}

// Създаване на контекста
const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Хук за използване на контекста
export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather трябва да се използва в WeatherProvider');
  }
  return context;
};

// Провайдър компонент
export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Проверяваме и зареждаме запазените данни за времето при стартиране
  useEffect(() => {
    const loadCachedWeather = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('weatherData');
        const lastUpdatedStr = await AsyncStorage.getItem('weatherLastUpdated');
        
        if (cachedData && lastUpdatedStr) {
          const parsedData = JSON.parse(cachedData);
          const updatedDate = new Date(lastUpdatedStr);
          
          // Проверяваме дали данните са по-нови от 1 час
          const now = new Date();
          const oneHourAgo = new Date(now.getTime() - 3600000);
          
          if (updatedDate > oneHourAgo) {
            console.log('WeatherContext: Използване на кеширани данни за времето');
            setWeatherData(parsedData);
            setLastUpdated(updatedDate);
          } else {
            console.log('WeatherContext: Кешираните данни са остарели, ще се обновят');
            // Ще се опитаме да обновим данните със сегашното местоположение
            fetchCurrentLocationWeather();
          }
        } else {
          console.log('WeatherContext: Няма кеширани данни за времето');
          // Ще се опитаме да вземем текущото местоположение и данни за времето
          fetchCurrentLocationWeather();
        }
      } catch (error) {
        console.error('WeatherContext: Грешка при зареждане на кеширани данни:', error);
      }
    };

    loadCachedWeather();
  }, []);

  // Функция за вземане на времето за текущото местоположение
  const fetchCurrentLocationWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Няма разрешение за достъп до местоположение');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log('WeatherContext: Получено текущо местоположение');
      
      // Извикваме fetchWeather с координатите
      await fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('WeatherContext: Грешка при вземане на текущо местоположение:', error);
      setError('Не можем да определим местоположението ви');
    }
  };

  // Основна функция за вземане на данни за времето
  const fetchWeather = async (latitude?: number, longitude?: number) => {
    setLoading(true);
    setError(null);
    console.log('WeatherContext: Започна извличане на данни за времето');
    
    try {
      let url = `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&days=3&aqi=no&alerts=no`;
      
      // Добавяме координатите, ако са предоставени
      if (latitude && longitude) {
        url += `&q=${latitude},${longitude}`;
      } else {
        // Ако няма координати, опитваме се да използваме IP адреса
        url += '&q=auto:ip';
      }
      
      const response = await axios.get(url);
      console.log('WeatherContext: Получени данни за времето');
      
      if (response.data) {
        // Запазваме данните в състоянието
        setWeatherData(response.data);
        
        // Кешираме данните
        const now = new Date();
        await AsyncStorage.setItem('weatherData', JSON.stringify(response.data));
        await AsyncStorage.setItem('weatherLastUpdated', now.toISOString());
        
        setLastUpdated(now);
      }
    } catch (error) {
      console.error('WeatherContext: Грешка при извличане на данни за времето:', error);
      setError('Не можем да получим данни за времето. Проверете интернет връзката си.');
    } finally {
      setLoading(false);
    }
  };

  // Функция за вземане на данни за времето за конкретно местоположение
  const getWeatherForLocation = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
    try {
      const url = `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&days=1&q=${latitude},${longitude}&aqi=no&alerts=no`;
      const response = await axios.get(url);
      
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('WeatherContext: Грешка при вземане на данни за конкретно местоположение:', error);
      return null;
    }
  };

  // Функция, която определя дали е препоръчително да се изпълни задача на открито
  const isOutdoorTaskRecommended = async (latitude: number, longitude: number): Promise<WeatherRecommendation> => {
    const result = {
      recommended: true,
      message: 'Подходящо време за задача на открито.',
      timestamp: new Date()
    };
    
    try {
      const weatherData = await getWeatherForLocation(latitude, longitude);
      
      if (!weatherData) {
        return {
          recommended: true,
          message: 'Не можем да получим данни за времето. Проверете преди да излезете.',
          timestamp: new Date()
        };
      }
      
      const { current, forecast } = weatherData;
      
      // Проверяваме условията, които биха могли да попречат на задачи на открито
      
      // Дъжд
      if (current.precip_mm > 0.5 || current.condition.text.toLowerCase().includes('дъжд') || 
          current.condition.text.toLowerCase().includes('rain')) {
        return {
          recommended: false,
          message: 'Внимание: Има валежи или се очакват. Не е подходящо за задачи на открито.',
          timestamp: new Date()
        };
      }
      
      // Силен вятър
      if (current.wind_kph > 30) {
        return {
          recommended: false,
          message: 'Внимание: Силен вятър. Преценете дали е подходящо за задачи на открито.',
          timestamp: new Date()
        };
      }
      
      // Екстремни температури
      if (current.temp_c < 5) {
        return {
          recommended: false,
          message: 'Внимание: Студено време. Облечете се добре за задачи на открито.',
          timestamp: new Date()
        };
      }
      
      if (current.temp_c > 32) {
        return {
          recommended: false,
          message: 'Внимание: Много горещо време. Вземете предпазни мерки за топлинно изтощение.',
          timestamp: new Date()
        };
      }
      
      // Висок UV индекс
      if (current.uv >= 8) {
        return {
          recommended: true,
          message: 'Висок UV индекс. Препоръчва се слънцезащитен крем и шапка за задачи на открито.',
          timestamp: new Date()
        };
      }

      // Прогноза за влошаване на времето в следващите часове
      if (forecast && forecast.forecastday.length > 0) {
        const nextFewHours = forecast.forecastday[0].hour.slice(0, 3);
        const willRainSoon = nextFewHours.some(hour => hour.chance_of_rain > 50);
        
        if (willRainSoon) {
          return {
            recommended: false,
            message: 'Внимание: Висока вероятност за дъжд през следващите няколко часа.',
            timestamp: new Date()
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('WeatherContext: Грешка при проверка дали е препоръчително изпълнението на задача на открито:', error);
      return {
        recommended: true,
        message: 'Не можем да анализираме времето. Проверете прогнозата преди да излезете.',
        timestamp: new Date()
      };
    }
  };

  // Стойност на контекста
  const value = {
    weatherData,
    loading,
    error,
    lastUpdated,
    fetchWeather,
    getWeatherForLocation,
    isOutdoorTaskRecommended,
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}; 