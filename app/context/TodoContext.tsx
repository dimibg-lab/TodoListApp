import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { 
  Todo, 
  TodoList, 
  TodoFilter, 
  TodoSortOption, 
  TodoSortDirection, 
  Priority,
  Idea,
  IdeasFilter,
  IdeasSortOption 
} from '../types';
import { Alert } from 'react-native';

// Добавяме собствен генератор на ID
const generateUniqueId = () => {
  // Създаваме низ от случайни символи със случаен timestamp
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`;
};

interface TodoContextType {
  todos: Todo[];
  lists: TodoList[];
  ideas: Idea[];
  filter: TodoFilter;
  sortBy: TodoSortOption;
  sortDirection: TodoSortDirection;
  ideasFilter: IdeasFilter;
  ideasSortBy: IdeasSortOption;
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
  
  // Нова функция за ръчно презареждане на данните
  reloadDataFromStorage: () => Promise<number>;
  
  // Нови функции за идеи
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>) => Promise<void>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  toggleIdeaFavorite: (id: string) => Promise<void>;
  searchIdeas: (query: string) => Idea[];
  setIdeasFilter: (filter: IdeasFilter) => void;
  setIdeasSortBy: (sortBy: IdeasSortOption) => void;
  convertIdeaToTodo: (ideaId: string, listId: string, priority: Priority) => Promise<void>;
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
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [sortBy, setSortBy] = useState<TodoSortOption>('dueDate');
  const [sortDirection, setSortDirection] = useState<TodoSortDirection>('asc');
  const [ideasFilter, setIdeasFilter] = useState<IdeasFilter>('all');
  const [ideasSortBy, setIdeasSortBy] = useState<IdeasSortOption>('createdAt');
  const [activeListId, setActiveListId] = useState<string | null>(DEFAULT_LIST_ID);

  useEffect(() => {
    // Зареждане на запазените списъци, задачи и идеи
    const loadData = async () => {
      try {
        console.log('TodoContext: ЗАПОЧВА ЗАРЕЖДАНЕ НА ДАННИ ОТ ASYNCSTORAGE');
        const savedLists = await AsyncStorage.getItem('todoLists');
        const savedTodos = await AsyncStorage.getItem('todos');
        const savedIdeas = await AsyncStorage.getItem('ideas');
        
        console.log('TodoContext: ВСИЧКИ КЛЮЧОВЕ В STORAGE:', await AsyncStorage.getAllKeys());
        
        if (savedLists) {
          const parsedLists = JSON.parse(savedLists);
          console.log('TodoContext: ЗАРЕДЕНИ СПИСЪЦИ ОТ ASYNCSTORAGE:', parsedLists.length);
          // Коригиране на датите, които са били запазени като string
          const listsWithDates = parsedLists.map((list: any) => ({
            ...list,
            createdAt: new Date(list.createdAt),
            updatedAt: new Date(list.updatedAt)
          }));
          setLists(listsWithDates);
        }
        
        if (savedTodos) {
          console.log('TodoContext: НАМЕРЕНИ ДАННИ ЗА ЗАДАЧИ В STORAGE, РАЗМЕР:', savedTodos.length);
          try {
            const parsedTodos = JSON.parse(savedTodos);
            console.log('TodoContext: ЗАРЕДЕНИ ЗАДАЧИ ОТ ASYNCSTORAGE:', parsedTodos.length);
            // Коригиране на датите, които са били запазени като string
            const todosWithDates = parsedTodos.map((todo: any) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              updatedAt: new Date(todo.updatedAt),
              dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
              // Осигуряваме се, че всички задължителни полета присъстват
              tags: todo.tags || [],
              priority: todo.priority || 'medium'
            }));
            setTodos(todosWithDates);
            console.log('TodoContext: ЗАДАЧИТЕ СА ПРАВИЛНО ЗАРЕДЕНИ');
          } catch (parseError) {
            console.error('TodoContext: ГРЕШКА ПРИ ПАРСВАНЕ НА ЗАДАЧИТЕ:', parseError);
          }
        } else {
          console.log('TodoContext: НЯМА ЗАПАЗЕНИ ЗАДАЧИ В ASYNCSTORAGE');
        }
        
        if (savedIdeas) {
          console.log('TodoContext: НАМЕРЕНИ ДАННИ ЗА ИДЕИ В STORAGE, РАЗМЕР:', savedIdeas.length);
          try {
            const parsedIdeas = JSON.parse(savedIdeas);
            console.log('TodoContext: ЗАРЕДЕНИ ИДЕИ ОТ ASYNCSTORAGE:', parsedIdeas.length);
            // Коригиране на датите, които са били запазени като string
            const ideasWithDates = parsedIdeas.map((idea: any) => ({
              ...idea,
              createdAt: new Date(idea.createdAt),
              updatedAt: new Date(idea.updatedAt),
              // Осигуряваме се, че всички задължителни полета присъстват
              tags: idea.tags || [],
              isFavorite: idea.isFavorite || false
            }));
            setIdeas(ideasWithDates);
          } catch (error) {
            console.error('TodoContext: ГРЕШКА ПРИ ПАРСВАНЕ НА ИДЕИ:', error);
            // Ако има грешка при парсването, запазваме празен масив
            setIdeas([]);
          }
        } else {
          console.log('TodoContext: НЯМА ЗАПАЗЕНИ ИДЕИ, ИЗПОЛЗВАМЕ ПРАЗЕН МАСИВ');
          setIdeas([]);
        }
        console.log('TodoContext: ЗАРЕЖДАНЕТО НА ДАННИ ПРИКЛЮЧИ УСПЕШНО');
      } catch (error) {
        console.error('TodoContext: ГРЕШКА ПРИ ЗАРЕЖДАНЕ НА ДАННИТЕ:', error);
      }
    };

    loadData();
  }, []);

  // Функция за запазване на задачите
  const saveTodos = async (newTodos: Todo[]) => {
    try {
      console.log('saveTodos: ЗАПОЧВА ЗАПАЗВАНЕ В ASYNCSTORAGE, БРОЙ ЗАДАЧИ:', newTodos.length);
      
      // Проверка дали списъкът с задачи не е празен или null
      if (!newTodos || newTodos.length === 0) {
        console.warn('saveTodos: ВНИМАНИЕ - ОПИТ ЗА ЗАПАЗВАНЕ НА ПРАЗЕН СПИСЪК');
      }
      
      // Сериализираме датите правилно преди запазване
      const todosToSave = newTodos.map(todo => ({
        ...todo,
        // Преобразуваме Date обектите в ISO стрингове
        createdAt: todo.createdAt instanceof Date ? todo.createdAt.toISOString() : todo.createdAt,
        updatedAt: todo.updatedAt instanceof Date ? todo.updatedAt.toISOString() : todo.updatedAt,
        dueDate: todo.dueDate instanceof Date ? todo.dueDate.toISOString() : todo.dueDate
      }));
      
      const dataToSave = JSON.stringify(todosToSave);
      console.log('saveTodos: ДАННИ ЗА ЗАПАЗВАНЕ:', dataToSave.substring(0, 100) + '...');
      
      // Използваме setItem с await и try/catch
      await AsyncStorage.setItem('todos', dataToSave);
      console.log('saveTodos: ДАННИТЕ СА УСПЕШНО ЗАПИСАНИ В ASYNCSTORAGE');
      
      // Потвърждение на записа чрез четене
      const savedData = await AsyncStorage.getItem('todos');
      if (savedData) {
        console.log('saveTodos: ПОТВЪРЖДЕНИЕ - ДАННИТЕ СА ЗАПАЗЕНИ, РАЗМЕР:', savedData.length);
      } else {
        console.error('saveTodos: КРИТИЧНА ГРЕШКА - ДАННИТЕ НЕ СА ЗАПАЗЕНИ СЛЕД ОПИТ ЗА ЗАПИС');
      }
    } catch (error) {
      console.error('saveTodos: ГРЕШКА ПРИ ЗАПАЗВАНЕ:', error);
      // Опит за алтернативно запазване
      try {
        const simpleData = JSON.stringify(newTodos.map(todo => ({
          id: todo.id,
          title: todo.title,
          completed: todo.completed,
          listId: todo.listId
        })));
        await AsyncStorage.setItem('todos_simple', simpleData);
        console.log('saveTodos: НАПРАВЕН Е ОПРОСТЕН РЕЗЕРВЕН ЗАПИС');
      } catch (backupError) {
        console.error('saveTodos: ГРЕШКА ПРИ РЕЗЕРВЕН ЗАПИС:', backupError);
      }
    }
  };

  // Функция за запазване на списъците
  const saveLists = async (newLists: TodoList[]) => {
    try {
      // Сериализираме датите правилно преди запазване
      const listsToSave = newLists.map(list => ({
        ...list,
        // Преобразуваме Date обектите в ISO стрингове
        createdAt: list.createdAt instanceof Date ? list.createdAt.toISOString() : list.createdAt,
        updatedAt: list.updatedAt instanceof Date ? list.updatedAt.toISOString() : list.updatedAt
      }));
      await AsyncStorage.setItem('todoLists', JSON.stringify(listsToSave));
    } catch (error) {
      console.error('Грешка при запазване на списъците:', error);
    }
  };

  // Функция за запазване на идеи
  const saveIdeas = async (newIdeas: Idea[]) => {
    try {
      console.log('TodoContext: ЗАПАЗВАНЕ НА ИДЕИ В ASYNCSTORAGE:', newIdeas.length);
      await AsyncStorage.setItem('ideas', JSON.stringify(newIdeas));
      setIdeas(newIdeas);
    } catch (error) {
      console.error('TodoContext: ГРЕШКА ПРИ ЗАПАЗВАНЕ НА ИДЕИ:', error);
      Alert.alert('Грешка', 'Неуспешно запазване на идеи');
    }
  };

  // Функции за работа със задачите
  const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('addTodo: СТАРТИРАНЕ НА ФУНКЦИЯТА');
    const now = new Date();
    const newTodo: Todo = {
      ...todo,
      id: generateUniqueId(),
      createdAt: now,
      updatedAt: now,
      // Осигуряваме се, че всички задължителни полета са налични
      tags: todo.tags || [],
      priority: todo.priority || 'medium'
    };
    
    try {
      console.log('addTodo: СЪЗДАВАНЕ НА НОВА ЗАДАЧА:', newTodo.title, 'С ID:', newTodo.id);
      const newTodos = [...todos, newTodo];
      console.log('addTodo: ОБНОВЯВАНЕ НА СПИСЪКА, НОВ БРОЙ ЗАДАЧИ:', newTodos.length);
      
      // Директен опит за запис в AsyncStorage
      try {
        console.log('addTodo: ЗАПОЧВА ЗАПИС В ASYNCSTORAGE');
        const todosToSave = newTodos.map(todo => ({
          ...todo,
          createdAt: todo.createdAt instanceof Date ? todo.createdAt.toISOString() : todo.createdAt,
          updatedAt: todo.updatedAt instanceof Date ? todo.updatedAt.toISOString() : todo.updatedAt,
          dueDate: todo.dueDate instanceof Date ? todo.dueDate.toISOString() : todo.dueDate
        }));
        
        const jsonValue = JSON.stringify(todosToSave);
        console.log('addTodo: ДИРЕКТЕН ЗАПИС В ASYNCSTORAGE, РАЗМЕР ДАННИ:', jsonValue.length);
        
        // Извършваме запис в AsyncStorage
        await AsyncStorage.setItem('todos', jsonValue);
        console.log('addTodo: ДИРЕКТЕН ЗАПИС УСПЕШЕН');
        
        // Проверка дали данните са записани
        const savedData = await AsyncStorage.getItem('todos');
        if (savedData) {
          console.log('addTodo: ПОТВЪРЖДЕНИЕ - ДАННИТЕ СА ЗАПИСАНИ, ДЪЛЖИНА:', savedData.length);
          console.log('addTodo: БРОЙ ЗАДАЧИ В ЗАПИСА:', JSON.parse(savedData).length);
          
          // Записваме списък от всички ID-та
          const ids = JSON.parse(savedData).map((t: any) => t.id);
          console.log('addTodo: СПИСЪК С ID-ТА НА ЗАДАЧИ:', ids.join(', '));
        } else {
          console.error('addTodo: КРИТИЧНА ГРЕШКА - ДАННИТЕ НЕ СА ЗАПАЗЕНИ');
          throw new Error('Данните не бяха записани в AsyncStorage');
        }
      } catch (directError) {
        console.error('addTodo: ГРЕШКА ПРИ ДИРЕКТЕН ЗАПИС:', directError);
        throw directError; // Предаваме грешката нагоре
      }
      
      // Обновяваме state след успешен запис
      setTodos(newTodos);
      console.log('addTodo: STATE ОБНОВЕН, ЗАДАЧА ДОБАВЕНА УСПЕШНО');
      
      // Запазваме ID-то на създадената задача в променлива, но не го връщаме
      const createdTaskId = newTodo.id;
      console.log('addTodo: УСПЕШНО ДОБАВЕНА ЗАДАЧА С ID:', createdTaskId);
    } catch (error) {
      console.error('addTodo: ОБЩА ГРЕШКА ПРИ ДОБАВЯНЕ НА ЗАДАЧА:', error);
      Alert.alert('Грешка', 'Възникна проблем при запазване на задачата.');
      throw error; // Хвърляме грешката нагоре, за да може компонентът да я обработи
    }
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
      id: generateUniqueId(),
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
    console.log('ОБЩО ЗАДАЧИ В STATE:', todos.length);
    
    // Филтриране по активен списък
    let filteredTodos = activeListId
      ? todos.filter(todo => todo.listId === activeListId)
      : todos;
    
    console.log('СЛЕД ФИЛТРИРАНЕ ПО СПИСЪК:', filteredTodos.length, 'АКТИВЕН СПИСЪК:', activeListId);
    
    // Филтриране по изпълнени/неизпълнени
    if (filter === 'completed') {
      filteredTodos = filteredTodos.filter(todo => todo.completed);
      console.log('СЛЕД ФИЛТРИРАНЕ ПО ЗАВЪРШЕНИ:', filteredTodos.length);
    } else if (filter === 'active') {
      filteredTodos = filteredTodos.filter(todo => !todo.completed);
      console.log('СЛЕД ФИЛТРИРАНЕ ПО АКТИВНИ:', filteredTodos.length);
    }
    
    // Сортиране
    const result = filteredTodos.sort((a, b) => {
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
    
    console.log('КРАЕН РЕЗУЛТАТ СЛЕД ФИЛТРИРАНЕ И СОРТИРАНЕ:', result.length);
    return result;
  };

  // Функция за създаване на списък по подразбиране
  const handleInitialListCreation = async () => {
    console.log('TodoContext: СЪЗДАВАНЕ НА СПИСЪК ПО ПОДРАЗБИРАНЕ');
    const defaultList = {
      id: generateUniqueId(),
      name: 'Моите задачи',
      color: '#4A6FA5',
      createdAt: new Date(),
      updatedAt: new Date(),
      icon: 'list'
    };
    
    const newLists = [defaultList];
    setLists(newLists);
    
    try {
      const jsonValue = JSON.stringify(newLists);
      await AsyncStorage.setItem('todoLists', jsonValue);
      console.log('TodoContext: СПИСЪКЪТ ПО ПОДРАЗБИРАНЕ Е СЪЗДАДЕН И ЗАПАЗЕН');
      return defaultList.id;
    } catch (error) {
      console.error('TodoContext: ГРЕШКА ПРИ СЪЗДАВАНЕ НА СПИСЪК ПО ПОДРАЗБИРАНЕ:', error);
      return null;
    }
  };

  // Функция за презареждане на данните от хранилището
  const reloadDataFromStorage = useCallback(async () => {
    console.log('TodoContext: ЗАПОЧВАМ ПРЕЗАРЕЖДАНЕ НА ДАННИ ОТ ХРАНИЛИЩЕТО');
    try {
      // Получаваме списък с наличните ключове
      const keys = await AsyncStorage.getAllKeys();
      console.log('TodoContext: НАЛИЧНИ КЛЮЧОВЕ:', JSON.stringify(keys));
      
      // Проверяваме дали имаме запазени списъци
      if (keys.includes('todoLists')) {
        const storedListsJson = await AsyncStorage.getItem('todoLists');
        if (storedListsJson) {
          console.log('TodoContext: ЗАРЕДЕНИ СПИСЪЦИ, ДЪЛЖИНА НА ДАННИТЕ:', storedListsJson.length);
          const storedLists = JSON.parse(storedListsJson);
          console.log('TodoContext: БРОЙ НА СПИСЪЦИ:', storedLists.length);
          setLists(storedLists);
        }
      } else {
        console.log('TodoContext: ЛИПСВА КЛЮЧ todoLists, СЪЗДАВАНЕ НА СПИСЪК ПО ПОДРАЗБИРАНЕ');
        // Ако нямаме списъци, създаваме такъв по подразбиране
        await handleInitialListCreation();
      }
      
      // Проверяваме дали имаме запазени задачи
      if (keys.includes('todos')) {
        const storedTodosJson = await AsyncStorage.getItem('todos');
        if (storedTodosJson) {
          console.log('TodoContext: ЗАРЕДЕНИ ЗАДАЧИ, ДЪЛЖИНА НА ДАННИТЕ:', storedTodosJson.length);
          let storedTodos = JSON.parse(storedTodosJson);
          
          // Поправяме дати и други данни
          storedTodos = storedTodos.map((todo: any) => ({
            ...todo,
            createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
            updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : new Date(),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
            tags: todo.tags || [],
            priority: todo.priority || 'medium'
          }));
          
          console.log('TodoContext: БРОЙ НА ЗАДАЧИ:', storedTodos.length);
          
          // Записваме списък от всички ID-та
          const ids = storedTodos.map((t: any) => t.id);
          console.log('TodoContext: СПИСЪК С ID-ТА НА ЗАДАЧИ:', ids.join(', '));
          
          setTodos(storedTodos);
          console.log('TodoContext: ЗАДАЧИТЕ СА ЗАРЕДЕНИ УСПЕШНО');
          return storedTodos.length; // Връщаме брой задачи
        }
      } else {
        console.log('TodoContext: ЛИПСВА КЛЮЧ todos, НЯМА ЗАРЕДЕНИ ЗАДАЧИ');
      }
      
      return 0; // Няма задачи
    } catch (error) {
      console.error('TodoContext: ГРЕШКА ПРИ ПРЕЗАРЕЖДАНЕ НА ДАННИ:', error);
      return -1; // Грешка
    }
  }, []);

  // Нови функции за работа с идеи
  const addIdea = async (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>) => {
    try {
      console.log('TodoContext: ДОБАВЯНЕ НА НОВА ИДЕЯ:', idea.title);
      
      const now = new Date();
      const newIdea: Idea = {
        ...idea,
        id: generateUniqueId(),
        createdAt: now,
        updatedAt: now,
        isFavorite: false
      };
      
      const updatedIdeas = [...ideas, newIdea];
      await saveIdeas(updatedIdeas);
      
      console.log('TodoContext: ИДЕЯТА ДОБАВЕНА УСПЕШНО');
      return;
    } catch (error) {
      console.error('TodoContext: ГРЕШКА ПРИ ДОБАВЯНЕ НА ИДЕЯ:', error);
      Alert.alert('Грешка', 'Неуспешно добавяне на идея');
    }
  };
  
  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    try {
      console.log('TodoContext: ОБНОВЯВАНЕ НА ИДЕЯ:', id);
      
      const updatedIdeas = ideas.map(idea => {
        if (idea.id === id) {
          return {
            ...idea,
            ...updates,
            updatedAt: new Date()
          };
        }
        return idea;
      });
      
      await saveIdeas(updatedIdeas);
      console.log('TodoContext: ИДЕЯТА ОБНОВЕНА УСПЕШНО');
    } catch (error) {
      console.error('TodoContext: ГРЕШКА ПРИ ОБНОВЯВАНЕ НА ИДЕЯ:', error);
      Alert.alert('Грешка', 'Неуспешно обновяване на идея');
    }
  };
  
  const deleteIdea = async (id: string) => {
    try {
      console.log('TodoContext: ИЗТРИВАНЕ НА ИДЕЯ:', id);
      
      const updatedIdeas = ideas.filter(idea => idea.id !== id);
      await saveIdeas(updatedIdeas);
      
      console.log('TodoContext: ИДЕЯТА ИЗТРИТА УСПЕШНО');
    } catch (error) {
      console.error('TodoContext: ГРЕШКА ПРИ ИЗТРИВАНЕ НА ИДЕЯ:', error);
      Alert.alert('Грешка', 'Неуспешно изтриване на идея');
    }
  };
  
  const toggleIdeaFavorite = async (id: string) => {
    try {
      console.log('TodoContext: ПРЕВКЛЮЧВАНЕ ИЗБРАНА ИДЕЯ:', id);
      
      const updatedIdeas = ideas.map(idea => {
        if (idea.id === id) {
          return {
            ...idea,
            isFavorite: !idea.isFavorite,
            updatedAt: new Date()
          };
        }
        return idea;
      });
      
      await saveIdeas(updatedIdeas);
      console.log('TodoContext: СТАТУСЪТ НА ИДЕЯТА ПРОМЕНЕН УСПЕШНО');
    } catch (error) {
      console.error('TodoContext: ГРЕШКА ПРИ ПРОМЯНА НА СТАТУСА НА ИДЕЯТА:', error);
      Alert.alert('Грешка', 'Неуспешна промяна на статуса на идеята');
    }
  };
  
  const searchIdeas = (query: string): Idea[] => {
    const lowerCaseQuery = query.toLowerCase();
    return ideas.filter(idea => 
      idea.title.toLowerCase().includes(lowerCaseQuery) || 
      (idea.description && idea.description.toLowerCase().includes(lowerCaseQuery)) ||
      idea.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    );
  };
  
  const convertIdeaToTodo = async (ideaId: string, listId: string, priority: Priority) => {
    try {
      console.log('TodoContext: ПРЕВРЪЩАНЕ НА ИДЕЯ В ЗАДАЧА:', ideaId);
      
      const idea = ideas.find(idea => idea.id === ideaId);
      if (!idea) {
        throw new Error('Идеята не е намерена');
      }
      
      // Създаваме нова задача от идеята
      const todoData = {
        title: idea.title,
        description: idea.description,
        completed: false,
        priority,
        tags: idea.tags,
        listId
      };
      
      // Добавяме задачата
      await addTodo(todoData);
      
      // Изтриваме идеята
      await deleteIdea(ideaId);
      
      console.log('TodoContext: ИДЕЯТА УСПЕШНО ПРЕВЪРНАТА В ЗАДАЧА');
    } catch (error) {
      console.error('TodoContext: ГРЕШКА ПРИ ПРЕВРЪЩАНЕ НА ИДЕЯ В ЗАДАЧА:', error);
      Alert.alert('Грешка', 'Неуспешно превръщане на идея в задача');
    }
  };
  
  // Филтриране и сортиране на идеи
  const getFilteredAndSortedIdeas = (): Idea[] => {
    // Първо филтрираме
    let filtered = ideas;
    if (ideasFilter === 'favorites') {
      filtered = ideas.filter(idea => idea.isFavorite);
    }
    
    // След това сортираме
    return [...filtered].sort((a, b) => {
      if (ideasSortBy === 'createdAt') {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  };

  return (
    <TodoContext.Provider
      value={{
        todos: getFilteredAndSortedTodos(),
        lists,
        ideas,
        filter,
        sortBy,
        sortDirection,
        ideasFilter,
        ideasSortBy,
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
        
        searchTodos,
        reloadDataFromStorage,
        
        addIdea,
        updateIdea,
        deleteIdea,
        toggleIdeaFavorite,
        searchIdeas,
        setIdeasFilter,
        setIdeasSortBy,
        convertIdeaToTodo
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