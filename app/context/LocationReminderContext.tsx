import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { useTodo } from './TodoContext';
import { Todo } from '../types';

const LOCATION_TRACKING_TASK = 'location-tracking-task';
const STORAGE_KEY = 'locationReminderSettings';

// Интерфейс за настройки на локационните напомняния
export interface LocationReminderSettings {
  enabled: boolean;
  backgroundTracking: boolean;
  checkFrequency: number; // минути
  minDistance: number; // метри
}

// Интерфейс за типа на контекста
export interface LocationReminderContextType {
  settings: LocationReminderSettings;
  hasLocationPermission: boolean;
  isTracking: boolean;
  enableReminders: (enable: boolean) => Promise<boolean>;
  updateSettings: (settings: Partial<LocationReminderSettings>) => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  checkNearbyTodos: () => Promise<void>;
}

// Създаваме контекста с начални стойности
const LocationReminderContext = createContext<LocationReminderContextType>({
  settings: {
    enabled: false,
    backgroundTracking: false,
    checkFrequency: 15,
    minDistance: 100,
  },
  hasLocationPermission: false,
  isTracking: false,
  enableReminders: async () => false,
  updateSettings: async () => false,
  requestLocationPermission: async () => false,
  checkNearbyTodos: async () => {},
});

// Изчисляване на разстояние между две координати (Haversine формула)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Радиус на Земята в метри
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d; // в метри
};

// Регистрираме задача за проследяване на местоположението
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Грешка в задачата за проследяване:', error);
    return;
  }

  // @ts-ignore: данни за местоположение
  const { locations } = data;
  const currentLocation = locations[0];

  if (!currentLocation) return;

  try {
    // Зареждаме настройки и задачи
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const settings: LocationReminderSettings = settingsJson
      ? JSON.parse(settingsJson)
      : { enabled: false, backgroundTracking: false, checkFrequency: 15, minDistance: 100 };

    // Ако напомнянията не са активирани, прекратяваме
    if (!settings.enabled) return;

    // Зареждаме задачите
    const todosJson = await AsyncStorage.getItem('todos');
    const todos = todosJson ? JSON.parse(todosJson) : [];

    // Проверяваме за близки задачи
    for (const todo of todos) {
      if (
        !todo.completed &&
        todo.location &&
        !todo.location.triggered &&
        todo.dueDate && // проверяваме само задачи със срок
        new Date(todo.dueDate) > new Date() // които не са пропуснати
      ) {
        const distance = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          todo.location.latitude,
          todo.location.longitude
        );

        // Ако сме достатъчно близо, изпращаме известие
        if (distance <= todo.location.radius) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Наблизо сте до задача',
              body: `Наблизо сте до "${todo.title}"`,
              data: { todoId: todo.id },
            },
            trigger: null, // веднага
          });

          // Маркираме, че известието е задействано
          todo.location.triggered = true;
          await AsyncStorage.setItem('todos', JSON.stringify(todos));
        }
      }
    }
  } catch (error) {
    console.error('Грешка при проверка за близки задачи:', error);
  }
});

export const LocationReminderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { todos, updateTodo } = useTodo();
  const [settings, setSettings] = useState<LocationReminderSettings>({
    enabled: false,
    backgroundTracking: false,
    checkFrequency: 15,
    minDistance: 100,
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  // Зареждане на настройките при стартиране
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsJson = await AsyncStorage.getItem(STORAGE_KEY);
        if (settingsJson) {
          setSettings(JSON.parse(settingsJson));
        }
      } catch (error) {
        console.error('Грешка при зареждане на настройки:', error);
      }
    };

    loadSettings();
  }, []);

  // Задаване на настройки за известия
  useEffect(() => {
    const setupNotifications = async () => {
      await Notifications.requestPermissionsAsync();
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };

    setupNotifications();
  }, []);

  // Запазване на настройките при промяна
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Грешка при запазване на настройки:', error);
      }
    };

    saveSettings();
  }, [settings]);

  // Проверка за разрешения за местоположение
  useEffect(() => {
    const checkLocationPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    };

    checkLocationPermission();
  }, []);

  // Стартиране/спиране на проследяването при промяна на настройките
  useEffect(() => {
    const updateTracking = async () => {
      if (settings.enabled && hasLocationPermission) {
        // Определяме типа на проследяване според настройките
        if (settings.backgroundTracking) {
          // Проверяваме за разрешение за фоново проследяване
          const { status } = await Location.getBackgroundPermissionsAsync();
          if (status !== 'granted') {
            const { status: newStatus } = await Location.requestBackgroundPermissionsAsync();
            if (newStatus !== 'granted') {
              console.log('Няма разрешение за фоново проследяване');
              return;
            }
          }

          // Стартираме фоново проследяване
          await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: settings.checkFrequency * 60 * 1000, // в милисекунди
            distanceInterval: settings.minDistance, // минимално разстояние в метри
            foregroundService: {
              notificationTitle: 'Проследяване на местоположение',
              notificationBody: 'Активно проследяване за локационни напомняния',
            },
          });
          setIsTracking(true);
        } else {
          // Ако е активирано проследяване, но не е фоново, спираме фоновото
          if (await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK)) {
            await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
          }
          setIsTracking(false);
        }
      } else {
        // Спираме проследяването, ако е активно
        if (await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK)) {
          await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
        }
        setIsTracking(false);
      }
    };

    updateTracking();
  }, [settings.enabled, settings.backgroundTracking, hasLocationPermission]);

  // Заявка за разрешение за местоположение
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Грешка при заявка за местоположение:', error);
      return false;
    }
  };

  // Включване/изключване на напомнянията
  const enableReminders = async (enable: boolean): Promise<boolean> => {
    try {
      if (enable && !hasLocationPermission) {
        const granted = await requestLocationPermission();
        if (!granted) return false;
      }

      setSettings(prev => ({ ...prev, enabled: enable }));
      return true;
    } catch (error) {
      console.error('Грешка при включване на напомняния:', error);
      return false;
    }
  };

  // Обновяване на настройките
  const updateSettings = async (
    newSettings: Partial<LocationReminderSettings>
  ): Promise<boolean> => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (error) {
      console.error('Грешка при обновяване на настройки:', error);
      return false;
    }
  };

  // Проверка за близки задачи (ръчно)
  const checkNearbyTodos = async (): Promise<void> => {
    try {
      if (!settings.enabled || !hasLocationPermission) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});

      let updatedTodos = false;

      // Проверяваме всички задачи за локационни напомняния
      for (const todo of todos) {
        if (
          !todo.completed &&
          todo.location &&
          !todo.location.triggered &&
          todo.dueDate && // проверяваме само задачи със срок
          new Date(todo.dueDate) > new Date() // които не са пропуснати
        ) {
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            todo.location.latitude,
            todo.location.longitude
          );

          // Ако сме достатъчно близо, показваме известие
          if (distance <= todo.location.radius) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Наблизо сте до задача',
                body: `Наблизо сте до "${todo.title}"`,
                data: { todoId: todo.id },
              },
              trigger: null, // веднага
            });

            // Маркираме, че известието е задействано и обновяваме задачата
            const updatedTodo = { ...todo };
            if (updatedTodo.location) {
              updatedTodo.location.triggered = true;
              updateTodo(todo.id, { 
                location: {
                  ...todo.location,
                  triggered: true
                }
              });
              updatedTodos = true;
            }
          }
        }
      }
    } catch (error) {
      console.error('Грешка при проверка за близки задачи:', error);
    }
  };

  const contextValue = {
    settings,
    hasLocationPermission,
    isTracking,
    enableReminders,
    updateSettings,
    requestLocationPermission,
    checkNearbyTodos,
  };

  return (
    <LocationReminderContext.Provider value={contextValue}>
      {children}
    </LocationReminderContext.Provider>
  );
};

// Хук за използване на контекста
export const useLocationReminder = () => useContext(LocationReminderContext); 