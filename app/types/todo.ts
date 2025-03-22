export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  listId?: string;
  listName?: string;
  tags?: string[];
  notes?: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number; // радиус в метри
    triggered: boolean; // дали уведомлението е било активирано
  };
} 