import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Todo, TodoList, TodoFilter, TodoSortOption, TodoSortDirection, Priority } from '../types';

interface TodoContextType {
  todos: Todo[];
  lists: TodoList[];
  filter: TodoFilter;
  sortBy: TodoSortOption;
  sortDirection: TodoSortDirection;
  activeListId: string | null;
  
  // Функции за задачите
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodoCompleted: (id: string) => Promise<void>;
  
  // Функции за филтриране и сортиране
  setFilter: (filter: TodoFilter) => void;
  setSortBy: (sortBy: TodoSortOption) => void;
  setSortDirection: (direction: TodoSortDirection) => void;
  
  // Функции за списъци
  addList: (name: string) => Promise<void>;
  updateList: (id: string, name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  setActiveList: (id: string | null) => void;
  
  // Функции за търсене
  searchTodos: (query: string) => Todo[];
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const DEFAULT_LIST_ID = 'default';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lists, setLists] = useState<TodoList[]>([
    {
      id: DEFAULT_LIST_ID,
      name: 'Основни задачи',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [sortBy, setSortBy] = useState<TodoSortOption>('dueDate');
  const [sortDirection, setSortDirection] = useState<TodoSortDirection>('asc');
  const [activeListId, setActiveListId] = useState<string | null>(DEFAULT_LIST_ID);

  useEffect(() => {
    // Зареждане на запазените списъци и задачи
    const loadData = async () => {
      try {
        const savedLists = await AsyncStorage.getItem('todoLists');
        const savedTodos = await AsyncStorage.getItem('todos');
        
        if (savedLists) {
          setLists(JSON.parse(savedLists));
        }
        
        if (savedTodos) {
          const parsedTodos = JSON.parse(savedTodos);
          // Коригиране на датите, които са били запазени като string
          const todosWithDates = parsedTodos.map((todo: Todo) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
          }));
          setTodos(todosWithDates);
        }
      } catch (error) {
        console.error('Грешка при зареждане на данните:', error);
      }
    };

    loadData();
  }, []);

  // Функция за запазване на задачите
  const saveTodos = async (newTodos: Todo[]) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(newTodos));
    } catch (error) {
      console.error('Грешка при запазване на задачите:', error);
    }
  };

  // Функция за запазване на списъците
  const saveLists = async (newLists: TodoList[]) => {
    try {
      await AsyncStorage.setItem('todoLists', JSON.stringify(newLists));
    } catch (error) {
      console.error('Грешка при запазване на списъците:', error);
    }
  };

  // Функции за работа със задачите
  const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newTodo: Todo = {
      ...todo,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    const newTodos = [...todos, newTodo];
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) return;
    
    const updatedTodo = {
      ...todos[todoIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    const newTodos = [...todos];
    newTodos[todoIndex] = updatedTodo;
    
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const deleteTodo = async (id: string) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const toggleTodoCompleted = async (id: string) => {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) return;
    
    const newTodo = {
      ...todos[todoIndex],
      completed: !todos[todoIndex].completed,
      updatedAt: new Date()
    };
    
    const newTodos = [...todos];
    newTodos[todoIndex] = newTodo;
    
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  // Функции за работа със списъците
  const addList = async (name: string) => {
    const now = new Date();
    const newList: TodoList = {
      id: uuidv4(),
      name,
      createdAt: now,
      updatedAt: now
    };
    
    const newLists = [...lists, newList];
    setLists(newLists);
    await saveLists(newLists);
  };

  const updateList = async (id: string, name: string) => {
    const listIndex = lists.findIndex(list => list.id === id);
    if (listIndex === -1) return;
    
    const updatedList = {
      ...lists[listIndex],
      name,
      updatedAt: new Date()
    };
    
    const newLists = [...lists];
    newLists[listIndex] = updatedList;
    
    setLists(newLists);
    await saveLists(newLists);
  };

  const deleteList = async (id: string) => {
    if (id === DEFAULT_LIST_ID) return; // Не позволяваме изтриване на основния списък
    
    const newLists = lists.filter(list => list.id !== id);
    setLists(newLists);
    await saveLists(newLists);
    
    // Изтриваме свързаните с този списък задачи или ги преместваме в основния списък
    const newTodos = todos.map(todo => {
      if (todo.listId === id) {
        return { ...todo, listId: DEFAULT_LIST_ID };
      }
      return todo;
    });
    
    setTodos(newTodos);
    await saveTodos(newTodos);
    
    // Ако активният списък е изтрит, променяме го на основния
    if (activeListId === id) {
      setActiveListId(DEFAULT_LIST_ID);
    }
  };

  // Функция за търсене
  const searchTodos = (query: string): Todo[] => {
    const searchTerm = query.toLowerCase();
    return todos.filter(todo => 
      todo.title.toLowerCase().includes(searchTerm) || 
      (todo.description && todo.description.toLowerCase().includes(searchTerm)) ||
      (todo.notes && todo.notes.toLowerCase().includes(searchTerm))
    );
  };

  // Филтриране и сортиране на задачите
  const getFilteredAndSortedTodos = (): Todo[] => {
    // Филтриране по активен списък
    let filteredTodos = activeListId
      ? todos.filter(todo => todo.listId === activeListId)
      : todos;
    
    // Филтриране по изпълнени/неизпълнени
    if (filter === 'completed') {
      filteredTodos = filteredTodos.filter(todo => todo.completed);
    } else if (filter === 'active') {
      filteredTodos = filteredTodos.filter(todo => !todo.completed);
    }
    
    // Сортиране
    return filteredTodos.sort((a, b) => {
      // Различна логика в зависимост от избраното поле за сортиране
      if (sortBy === 'dueDate') {
        // Ако няма краен срок, показваме го последен
        if (!a.dueDate) return sortDirection === 'asc' ? 1 : -1;
        if (!b.dueDate) return sortDirection === 'asc' ? -1 : 1;
        return sortDirection === 'asc'
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime();
      } else if (sortBy === 'priority') {
        // Сортиране по приоритет (високият е на върха)
        const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        return sortDirection === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      } else {
        // Сортиране по заглавие (азбучен ред)
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
  };

  return (
    <TodoContext.Provider
      value={{
        todos: getFilteredAndSortedTodos(),
        lists,
        filter,
        sortBy,
        sortDirection,
        activeListId,
        
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodoCompleted,
        
        setFilter,
        setSortBy,
        setSortDirection,
        
        addList,
        updateList,
        deleteList,
        setActiveList: setActiveListId,
        
        searchTodos
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo трябва да се използва в TodoProvider');
  }
  return context;
}; 