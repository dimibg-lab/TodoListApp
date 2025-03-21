// @ts-nocheck
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useAppTheme } from '../utils/theme';
import { StatusBar } from 'expo-status-bar';

// Типове за навигация
import {
  RootStackParamList,
  MainTabParamList,
  HomeStackParamList,
  TodoListsStackParamList,
  SettingsStackParamList
} from './types';

// Екрани за вграждане (импортирани с лейзи лоадинг за по-добра производителност)
// @ts-ignore
import OnboardingScreen from '../screens/OnboardingScreen';

// Домашни екрани
// @ts-ignore
const HomeScreen = React.lazy(() => import('../screens/HomeScreen'));
// @ts-ignore
const TodoDetailsScreen = React.lazy(() => import('../screens/TodoDetailsScreen'));
// @ts-ignore
const AddEditTodoScreen = React.lazy(() => import('../screens/AddEditTodoScreen'));
// @ts-ignore
const SearchTodosScreen = React.lazy(() => import('../screens/SearchTodosScreen'));

// Екрани за списъци със задачи
// @ts-ignore
const TodoListsScreen = React.lazy(() => import('../screens/TodoListsScreen'));
// @ts-ignore
const TodoListScreen = React.lazy(() => import('../screens/TodoListScreen'));
// @ts-ignore
const AddEditListScreen = React.lazy(() => import('../screens/AddEditListScreen'));

// Екрани за настройки
// @ts-ignore
const SettingsScreen = React.lazy(() => import('../screens/SettingsScreen'));
// @ts-ignore
const ThemeSettingsScreen = React.lazy(() => import('../screens/ThemeSettingsScreen'));
// @ts-ignore
const NotificationSettingsScreen = React.lazy(() => import('../screens/NotificationSettingsScreen'));
// @ts-ignore
const AboutScreen = React.lazy(() => import('../screens/AboutScreen'));

// @ts-ignore
const CalendarScreen = React.lazy(() => import('../screens/CalendarScreen'));
// @ts-ignore
const StatisticsScreen = React.lazy(() => import('../screens/StatisticsScreen'));

// Създаване на навигационните стакове
const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const TodoListsStack = createNativeStackNavigator<TodoListsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

// Компонент за Fallback когато лейзи лоадинг се зарежда
import { View, ActivityIndicator } from 'react-native';

const LoadingFallback = () => {
  const { getColor } = useAppTheme();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: getColor('background') }}>
      <ActivityIndicator size="large" color={getColor('primary')} />
    </View>
  );
};

// Навигация на домашния екран
const HomeStackNavigator = () => {
  const { getColor } = useAppTheme();
  
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: getColor('background'),
        },
        headerTintColor: getColor('text'),
        contentStyle: {
          backgroundColor: getColor('background'),
        },
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={React.Suspense ? 
          (props) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <HomeScreen {...props} />
            </React.Suspense>
          ) : HomeScreen
        }
        options={{ title: 'Моите задачи' }}
      />
      <HomeStack.Screen
        name="TodoDetails"
        component={React.Suspense ? 
          (props) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <TodoDetailsScreen {...props} />
            </React.Suspense>
          ) : TodoDetailsScreen
        }
        options={{ title: 'Детайли за задачата' }}
      />
      <HomeStack.Screen
        name="AddEditTodo"
        component={React.Suspense ? 
          (props: HomeStackParamList['AddEditTodo']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <AddEditTodoScreen {...props} />
            </React.Suspense>
          ) : AddEditTodoScreen
        }
        options={({ route }) => ({ 
          title: route.params?.todoId ? 'Редактиране на задача' : 'Нова задача'
        })}
      />
      <HomeStack.Screen
        name="SearchTodos"
        component={React.Suspense ? 
          (props: HomeStackParamList['SearchTodos']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <SearchTodosScreen {...props} />
            </React.Suspense>
          ) : SearchTodosScreen
        }
        options={{ title: 'Търсене на задачи' }}
      />
    </HomeStack.Navigator>
  );
};

// Навигация на списъци със задачи
const TodoListsStackNavigator = () => {
  const { getColor } = useAppTheme();
  
  return (
    <TodoListsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: getColor('background'),
        },
        headerTintColor: getColor('text'),
        contentStyle: {
          backgroundColor: getColor('background'),
        },
      }}
    >
      <TodoListsStack.Screen
        name="TodoListsScreen"
        component={React.Suspense ? 
          (props: TodoListsStackParamList['TodoListsScreen']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <TodoListsScreen {...props} />
            </React.Suspense>
          ) : TodoListsScreen
        }
        options={{ title: 'Списъци' }}
      />
      <TodoListsStack.Screen
        name="TodoList"
        component={React.Suspense ? 
          (props: TodoListsStackParamList['TodoList']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <TodoListScreen {...props} />
            </React.Suspense>
          ) : TodoListScreen
        }
        options={({ route }) => ({ title: route.params.listName })}
      />
      <TodoListsStack.Screen
        name="AddEditList"
        component={React.Suspense ? 
          (props: TodoListsStackParamList['AddEditList']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <AddEditListScreen {...props} />
            </React.Suspense>
          ) : AddEditListScreen
        }
        options={({ route }) => ({ 
          title: route.params?.listId ? 'Редактиране на списък' : 'Нов списък'
        })}
      />
    </TodoListsStack.Navigator>
  );
};

// Навигация на настройки
const SettingsStackNavigator = () => {
  const { getColor } = useAppTheme();
  
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: getColor('background'),
        },
        headerTintColor: getColor('text'),
        contentStyle: {
          backgroundColor: getColor('background'),
        },
      }}
    >
      <SettingsStack.Screen
        name="SettingsScreen"
        component={React.Suspense ? 
          (props: SettingsStackParamList['SettingsScreen']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <SettingsScreen {...props} />
            </React.Suspense>
          ) : SettingsScreen
        }
        options={{ title: 'Настройки' }}
      />
      <SettingsStack.Screen
        name="ThemeSettings"
        component={React.Suspense ? 
          (props: SettingsStackParamList['ThemeSettings']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <ThemeSettingsScreen {...props} />
            </React.Suspense>
          ) : ThemeSettingsScreen
        }
        options={{ title: 'Настройки на темата' }}
      />
      <SettingsStack.Screen
        name="NotificationSettings"
        component={React.Suspense ? 
          (props: SettingsStackParamList['NotificationSettings']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <NotificationSettingsScreen {...props} />
            </React.Suspense>
          ) : NotificationSettingsScreen
        }
        options={{ title: 'Настройки на известията' }}
      />
      <SettingsStack.Screen
        name="About"
        component={React.Suspense ? 
          (props: SettingsStackParamList['About']) => (
            <React.Suspense fallback={<LoadingFallback />}>
              <AboutScreen {...props} />
            </React.Suspense>
          ) : AboutScreen
        }
        options={{ title: 'За приложението' }}
      />
    </SettingsStack.Navigator>
  );
};

// Главен таб навигатор за приложението
const MainTabNavigator = () => {
  const { getColor } = useAppTheme();
  
  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: getColor('background'),
          borderTopColor: getColor('border'),
        },
        tabBarActiveTintColor: getColor('primary'),
        tabBarInactiveTintColor: getColor('textLight'),
        headerShown: false,
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Задачи',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="check-circle" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="TodoLists"
        component={TodoListsStackNavigator}
        options={{
          tabBarLabel: 'Списъци',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Календар',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'Статистика',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Настройки',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
};

// Основен навигационен компонент
const Navigation = () => {
  const { userSettings, isFirstLaunch } = useUser();
  const { theme } = useAppTheme();
  
  return (
    <NavigationContainer>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// Експортиране на компонента
export { Navigation }; 