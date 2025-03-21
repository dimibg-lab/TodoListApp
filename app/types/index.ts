export type Priority = 'high' | 'medium' | 'low';

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