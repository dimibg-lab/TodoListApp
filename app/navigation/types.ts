import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Todo, TodoList } from '../types';

// Типове за основните навигационни стекове
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  TodoLists: undefined;
  Calendar: undefined;
  Statistics: undefined;
  Settings: undefined;
  More: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  TodoDetails: { todoId: string };
  AddEditTodo: { todoId?: string; listId?: string };
  SearchTodos: undefined;
};

export type TodoListsStackParamList = {
  TodoListsScreen: undefined;
  TodoList: { listId: string; listName: string };
  AddEditList: { listId?: string };
};

export type CalendarStackParamList = {
  CalendarScreen: undefined;
};

export type StatisticsStackParamList = {
  StatisticsScreen: undefined;
};

export type IdeasStackParamList = {
  IdeaListScreen: undefined;
  IdeaDetails: { ideaId: string };
  AddEditIdea: { ideaId?: string };
};

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  ThemeSettings: undefined;
  NotificationSettings: undefined;
  LocationSettings: undefined;
  About: undefined;
  NotificationSound: { type: 'default' | 'task' | 'urgent' | 'reminder' | 'dailySummary' };
};

export type MoreStackParamList = {
  MoreScreen: undefined;
  Ideas: undefined;
  Weather: undefined;
  Quotes: undefined;
  Statistics: undefined;
  Priorities: undefined;
  Export: undefined;
  Help: undefined;
};

// Типове за пропс-ите на екраните
export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>;
export type TodoDetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'TodoDetails'>;
export type AddEditTodoScreenProps = NativeStackScreenProps<HomeStackParamList, 'AddEditTodo'>;
export type SearchTodosScreenProps = NativeStackScreenProps<HomeStackParamList, 'SearchTodos'>;

export type TodoListsScreenProps = NativeStackScreenProps<TodoListsStackParamList, 'TodoListsScreen'>;
export type TodoListScreenProps = NativeStackScreenProps<TodoListsStackParamList, 'TodoList'>;
export type AddEditListScreenProps = NativeStackScreenProps<TodoListsStackParamList, 'AddEditList'>;

export type CalendarScreenProps = NativeStackScreenProps<CalendarStackParamList, 'CalendarScreen'>;
export type StatisticsScreenProps = NativeStackScreenProps<StatisticsStackParamList, 'StatisticsScreen'>;

export type SettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'SettingsScreen'>;
export type ThemeSettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'ThemeSettings'>;
export type NotificationSettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'NotificationSettings'>;
export type LocationSettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'LocationSettings'>;
export type AboutScreenProps = NativeStackScreenProps<SettingsStackParamList, 'About'>;

export type IdeasScreenProps = NativeStackScreenProps<IdeasStackParamList, 'IdeaListScreen'>;
export type IdeaDetailsScreenProps = NativeStackScreenProps<IdeasStackParamList, 'IdeaDetails'>;
export type AddEditIdeaScreenProps = NativeStackScreenProps<IdeasStackParamList, 'AddEditIdea'>;

export type MoreScreenProps = NativeStackScreenProps<MoreStackParamList, 'MoreScreen'>; 