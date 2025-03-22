export type Priority = 'high' | 'medium' | 'low';

export interface WeatherRecommendation {
  timestamp: Date;
  recommended: boolean;
  message: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: Priority;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  listId: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    triggered: boolean;
  };
  isOutdoor?: boolean;
  weatherChecked?: Date;
  weatherRecommendation?: WeatherRecommendation;
}

export interface TodoList {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark';
  listsViewMode: 'list' | 'grid';
}

export interface Notification {
  id: string;
  todoId: string;
  time: Date;
  title: string;
  body: string;
  read: boolean;
}

export type TodoFilter = 'all' | 'completed' | 'active';
export type TodoSortOption = 'dueDate' | 'priority' | 'title';
export type TodoSortDirection = 'asc' | 'desc';

export interface Idea {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
}

export type IdeasFilter = 'all' | 'favorites';
export type IdeasSortOption = 'createdAt' | 'title'; 