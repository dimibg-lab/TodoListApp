// @ts-nocheck
import React, { useEffect, lazy, Suspense } from 'react';
import { NavigationContainer, NavigationContainerRef, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useAppTheme } from '../utils/theme';
import { StatusBar, View, ActivityIndicator } from 'react-native';

// Типове за навигация
import {
  RootStackParamList,
  MainTabParamList,
  HomeStackParamList,
  TodoListsStackParamList,
  SettingsStackParamList,
  MoreStackParamList,
  IdeasStackParamList
} from './types';

// Екрани за вграждане (импортирани с лейзи лоадинг за по-добра производителност)
// @ts-ignore
import OnboardingScreen from '../screens/OnboardingScreen';

// Домашни екрани
// @ts-ignore
const HomeScreen = lazy(() => import('../screens/HomeScreen'));
// @ts-ignore
const TodoDetailsScreen = lazy(() => import('../screens/TodoDetailsScreen'));
// @ts-ignore
const AddEditTodoScreen = lazy(() => import('../screens/AddEditTodoScreen'));
// @ts-ignore
const SearchTodosScreen = lazy(() => import('../screens/SearchTodosScreen'));

// Екрани за списъци със задачи
// @ts-ignore
const TodoListsScreen = lazy(() => import('../screens/TodoListsScreen'));
// @ts-ignore
const TodoListScreen = lazy(() => import('../screens/TodoListScreen'));
// @ts-ignore
const AddEditListScreen = lazy(() => import('../screens/AddEditListScreen'));

// Екрани за настройки
// @ts-ignore
const SettingsScreen = lazy(() => import('../screens/SettingsScreen'));
// @ts-ignore
const ThemeSettingsScreen = lazy(() => import('../screens/ThemeSettingsScreen'));
// @ts-ignore
const NotificationSettingsScreen = lazy(() => import('../screens/NotificationSettingsScreen'));
// @ts-ignore
const AboutScreen = lazy(() => import('../screens/AboutScreen'));

// @ts-ignore
const CalendarScreen = lazy(() => import('../screens/CalendarScreen'));
// @ts-ignore
const StatisticsScreen = lazy(() => import('../screens/StatisticsScreen'));

// Добавяне на импорт за LocationSettingsScreen
// @ts-ignore
const LocationSettingsScreen = lazy(() => import('../screens/LocationSettingsScreen'));

// Импортиране на екрани за Още
// @ts-ignore
const MoreScreen = lazy(() => import('../screens/MoreScreen'));
// @ts-ignore
const IdeaListScreen = lazy(() => import('../screens/IdeaListScreen'));
// @ts-ignore
const IdeaDetailsScreen = lazy(() => import('../screens/IdeaDetailsScreen'));
// @ts-ignore
const AddEditIdeaScreen = lazy(() => import('../screens/AddEditIdeaScreen'));
// @ts-ignore
const WeatherScreen = lazy(() => import('../screens/WeatherScreen'));
// @ts-ignore
const QuotesScreen = lazy(() => import('../screens/QuotesScreen'));
// @ts-ignore
const NotificationSoundScreen = lazy(() => import('../screens/NotificationSoundScreen'));

// Създаване на навигационните стакове
const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const TodoListsStack = createNativeStackNavigator<TodoListsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
const IdeasStack = createNativeStackNavigator<IdeasStackParamList>();

// Компонент за Fallback когато лейзи лоадинг се зарежда
import LoadingFallback from '../components/LoadingFallback';

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
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <HomeScreen {...props} />
            </Suspense>
          ) : HomeScreen
        }
        options={{ title: 'Моите задачи' }}
      />
      <HomeStack.Screen
        name="TodoDetails"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <TodoDetailsScreen {...props} />
            </Suspense>
          ) : TodoDetailsScreen
        }
        options={{ title: 'Детайли за задачата' }}
      />
      <HomeStack.Screen
        name="AddEditTodo"
        component={Suspense ? 
          (props: HomeStackParamList['AddEditTodo']) => (
            <Suspense fallback={<LoadingFallback />}>
              <AddEditTodoScreen {...props} />
            </Suspense>
          ) : AddEditTodoScreen
        }
        options={({ route }) => ({ 
          title: route.params?.todoId ? 'Редактиране на задача' : 'Нова задача'
        })}
      />
      <HomeStack.Screen
        name="SearchTodos"
        component={Suspense ? 
          (props: HomeStackParamList['SearchTodos']) => (
            <Suspense fallback={<LoadingFallback />}>
              <SearchTodosScreen {...props} />
            </Suspense>
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
        component={Suspense ? 
          (props: TodoListsStackParamList['TodoListsScreen']) => (
            <Suspense fallback={<LoadingFallback />}>
              <TodoListsScreen {...props} />
            </Suspense>
          ) : TodoListsScreen
        }
        options={{ title: 'Списъци' }}
      />
      <TodoListsStack.Screen
        name="TodoList"
        component={Suspense ? 
          (props: TodoListsStackParamList['TodoList']) => (
            <Suspense fallback={<LoadingFallback />}>
              <TodoListScreen {...props} />
            </Suspense>
          ) : TodoListScreen
        }
        options={({ route }) => ({ title: route.params.listName })}
      />
      <TodoListsStack.Screen
        name="AddEditList"
        component={Suspense ? 
          (props: TodoListsStackParamList['AddEditList']) => (
            <Suspense fallback={<LoadingFallback />}>
              <AddEditListScreen {...props} />
            </Suspense>
          ) : AddEditListScreen
        }
        options={({ route }) => ({ 
          title: route.params?.listId ? 'Редактиране на списък' : 'Нов списък'
        })}
      />
    </TodoListsStack.Navigator>
  );
};

// Навигация за идеите
const IdeasStackNavigator = () => {
  const { getColor } = useAppTheme();
  
  return (
    <IdeasStack.Navigator
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
      <IdeasStack.Screen
        name="IdeaListScreen"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <IdeaListScreen {...props} />
            </Suspense>
          ) : IdeaListScreen
        }
        options={{ title: 'Моите идеи' }}
      />
      <IdeasStack.Screen
        name="IdeaDetails"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <IdeaDetailsScreen {...props} />
            </Suspense>
          ) : IdeaDetailsScreen
        }
        options={{ title: 'Детайли за идеята' }}
      />
      <IdeasStack.Screen
        name="AddEditIdea"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <AddEditIdeaScreen {...props} />
            </Suspense>
          ) : AddEditIdeaScreen
        }
        options={({ route }) => ({ 
          title: route.params?.ideaId ? 'Редактиране на идея' : 'Нова идея'
        })}
      />
    </IdeasStack.Navigator>
  );
};

// Навигация секция "Още"
const MoreStackNavigator = () => {
  const { getColor } = useAppTheme();
  
  return (
    <MoreStack.Navigator
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
      <MoreStack.Screen
        name="MoreScreen"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <MoreScreen {...props} />
            </Suspense>
          ) : MoreScreen
        }
        options={{ title: 'Още функции' }}
      />
      <MoreStack.Screen
        name="Ideas"
        component={IdeasStackNavigator}
        options={{ 
          title: 'Моите идеи',
          headerShown: false
        }}
      />
      <MoreStack.Screen
        name="Weather"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <WeatherScreen {...props} />
            </Suspense>
          ) : WeatherScreen
        }
        options={{ title: 'Прогноза за времето' }}
      />
      <MoreStack.Screen
        name="Quotes"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <QuotesScreen {...props} />
            </Suspense>
          ) : QuotesScreen
        }
        options={{ title: 'Цитати и мотивация' }}
      />
      <MoreStack.Screen
        name="Priorities"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <TodoListScreen {...props} />
            </Suspense>
          ) : TodoListScreen
        }
        options={{ title: 'Приоритети' }}
      />
      <MoreStack.Screen
        name="Export"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <TodoListScreen {...props} />
            </Suspense>
          ) : TodoListScreen
        }
        options={{ title: 'Експорт на данни' }}
      />
      <MoreStack.Screen
        name="Help"
        component={Suspense ? 
          (props) => (
            <Suspense fallback={<LoadingFallback />}>
              <TodoListScreen {...props} />
            </Suspense>
          ) : TodoListScreen
        }
        options={{ title: 'Помощ и съвети' }}
      />
    </MoreStack.Navigator>
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
        component={Suspense ? 
          (props: SettingsStackParamList['SettingsScreen']) => (
            <Suspense fallback={<LoadingFallback />}>
              <SettingsScreen {...props} />
            </Suspense>
          ) : SettingsScreen
        }
        options={{ title: 'Настройки' }}
      />
      <SettingsStack.Screen
        name="ThemeSettings"
        component={Suspense ? 
          (props: SettingsStackParamList['ThemeSettings']) => (
            <Suspense fallback={<LoadingFallback />}>
              <ThemeSettingsScreen {...props} />
            </Suspense>
          ) : ThemeSettingsScreen
        }
        options={{ title: 'Настройки на темата' }}
      />
      <SettingsStack.Screen
        name="NotificationSettings"
        component={Suspense ? 
          (props: SettingsStackParamList['NotificationSettings']) => (
            <Suspense fallback={<LoadingFallback />}>
              <NotificationSettingsScreen {...props} />
            </Suspense>
          ) : NotificationSettingsScreen
        }
        options={{ title: 'Настройки на известията' }}
      />
      <SettingsStack.Screen
        name="About"
        component={Suspense ? 
          (props: SettingsStackParamList['About']) => (
            <Suspense fallback={<LoadingFallback />}>
              <AboutScreen {...props} />
            </Suspense>
          ) : AboutScreen
        }
        options={{ title: 'За приложението' }}
      />
      <SettingsStack.Screen
        name="LocationSettings"
        component={Suspense ? 
          (props: SettingsStackParamList['LocationSettings']) => (
            <Suspense fallback={<LoadingFallback />}>
              <LocationSettingsScreen {...props} />
            </Suspense>
          ) : LocationSettingsScreen
        }
        options={{ title: 'Локационни напомняния' }}
      />
      <SettingsStack.Screen
        name="NotificationSound"
        component={Suspense ? 
          (props: SettingsStackParamList['NotificationSound']) => (
            <Suspense fallback={<LoadingFallback />}>
              <NotificationSoundScreen {...props} />
            </Suspense>
          ) : NotificationSoundScreen
        }
        options={{ title: 'Избор на звук' }}
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
      <MainTab.Screen
        name="More"
        component={MoreStackNavigator}
        options={{
          tabBarLabel: 'Още',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="more-horiz" size={size} color={color} />
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