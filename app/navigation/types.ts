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

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  ThemeSettings: undefined;
  NotificationSettings: undefined;
  About: undefined;
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

export type SettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'SettingsScreen'>;
export type ThemeSettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'ThemeSettings'>;
export type NotificationSettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'NotificationSettings'>;
export type AboutScreenProps = NativeStackScreenProps<SettingsStackParamList, 'About'>; 