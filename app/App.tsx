import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { TodoProvider } from './context/TodoContext';
import { LocationReminderProvider } from './context/LocationReminderContext';
import { WeatherProvider } from './context/WeatherContext';
import { IdeasProvider } from './context/IdeasContext';
import { Navigation } from './navigation/Navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Функция за проверка на AsyncStorage
const checkAsyncStorage = async () => {
  try {
    console.log('-------------------------');
    console.log('ПРОВЕРКА НА ASYNCSTORAGE ПРИ СТАРТИРАНЕ');
    
    const keys = await AsyncStorage.getAllKeys();
    console.log('НАЛИЧНИ КЛЮЧОВЕ:', keys);
    
    if (keys.includes('todos')) {
      const todosData = await AsyncStorage.getItem('todos');
      if (todosData) {
        const parsed = JSON.parse(todosData);
        console.log('НАЛИЧНИ ЗАДАЧИ:', parsed.length);
        if (parsed.length > 0) {
          console.log('ПЪРВА ЗАДАЧА:', JSON.stringify(parsed[0]).substring(0, 100) + '...');
        }
      } else {
        console.log('КЛЮЧЪТ todos СЪЩЕСТВУВА, НО НЯМА ДАННИ');
      }
    } else {
      console.log('КЛЮЧЪТ todos НЕ СЪЩЕСТВУВА');
    }
    
    console.log('-------------------------');
  } catch (error) {
    console.error('ГРЕШКА ПРИ ПРОВЕРКА НА ASYNCSTORAGE:', error);
  }
};

// Функция за изчистване на AsyncStorage
const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('ASYNCSTORAGE Е ИЗЧИСТЕН УСПЕШНО');
  } catch (error) {
    console.error('ГРЕШКА ПРИ ИЗЧИСТВАНЕ НА ASYNCSTORAGE:', error);
  }
};

const App = () => {
  // Проверка на AsyncStorage при стартиране
  useEffect(() => {
    // Разкоментирайте следния ред, за да изчистите всички данни и да започнете на чисто
    // clearAsyncStorage();
    
    checkAsyncStorage();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <ThemeProvider>
            <TodoProvider>
              <LocationReminderProvider>
                <WeatherProvider>
                  <IdeasProvider>
                    <Navigation />
                  </IdeasProvider>
                </WeatherProvider>
              </LocationReminderProvider>
            </TodoProvider>
          </ThemeProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App; 