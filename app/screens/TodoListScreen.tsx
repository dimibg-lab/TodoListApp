import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodo } from '../context/TodoContext';
import { TodoItem } from '../components/TodoItem';
import { Button } from '../components/Button';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { TodoListScreenProps } from '../navigation/types';
import { Todo, TodoFilter, TodoSortOption } from '../types';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { FloatingButton } from '../components/FloatingButton';
import Tooltip from '../components/Tooltip';

const TodoListScreen: React.FC<TodoListScreenProps> = ({ route, navigation }) => {
  const { listId, listName } = route.params;
  const {
    todos,
    toggleTodoCompleted,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    reloadDataFromStorage
  } = useTodo();
  const { getColor } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState('');

  // Логване при монтиране на компонента
  useEffect(() => {
    console.log('TodoListScreen: МОНТИРАН ЗА СПИСЪК:', listId, listName);
    console.log('TodoListScreen: ПОЛУЧЕНИ ЗАДАЧИ ОТ КОНТЕКСТА:', todos.length);
  }, []);

  // Добавяме фокус слушател
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Опресняваме данните автоматично при връщане към екрана
      console.log('TodoListScreen: ФОКУС ПОЛУЧЕН, ОБНОВЯВАМЕ ДАННИ');
      onRefresh();
    });

    return unsubscribe;
  }, [navigation]);

  // Добавяме useFocusEffect, за да презареждаме данните при връщане към екрана
  useFocusEffect(
    useCallback(() => {
      console.log('TodoListScreen: ЕКРАНЪТ ПОЛУЧИ ФОКУС, ПРЕЗАРЕЖДАНЕ НА ДАННИ');
      // Ще използваме функция за презареждане на данни от контекста
      reloadDataFromStorage().then(() => {
        console.log('TodoListScreen: ДАННИТЕ СА ПРЕЗАРЕДЕНИ УСПЕШНО');
      }).catch(error => {
        console.error('TodoListScreen: ГРЕШКА ПРИ ПРЕЗАРЕЖДАНЕ НА ДАННИ:', error);
      });
      
      return () => {
        console.log('TodoListScreen: ЕКРАНЪТ ЗАГУБИ ФОКУС');
      };
    }, [reloadDataFromStorage])
  );

  // Филтрираме задачите, за да покажем само тези от текущия списък
  const listTodos = todos.filter(todo => todo.listId === listId);
  console.log('TodoListScreen: ЗАДАЧИ В ТЕКУЩИЯ СПИСЪК:', listTodos.length);

  // Филтрираме според активния филтър
  const getFilteredTodos = () => {
    if (filter === 'completed') {
      return listTodos.filter(todo => todo.completed);
    } else if (filter === 'active') {
      return listTodos.filter(todo => !todo.completed);
    }
    return listTodos;
  };

  // Сортираме задачите
  const getSortedTodos = () => {
    const filtered = getFilteredTodos();
    console.log('TodoListScreen: ФИЛТРИРАНИ ЗАДАЧИ:', filtered.length);
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return sortDirection === 'asc' ? 1 : -1;
        if (!b.dueDate) return sortDirection === 'asc' ? -1 : 1;
        return sortDirection === 'asc'
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return sortDirection === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      } else {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
    
    console.log('TodoListScreen: СОРТИРАНИ ЗАДАЧИ:', sorted.length);
    
    if (sorted.length > 0) {
      console.log('TodoListScreen: ПРИМЕР ЗА ПЪРВА ЗАДАЧА:', JSON.stringify(sorted[0]));
    }
    
    return sorted;
  };

  // Обработка при клик върху задача
  const handleTodoPress = (todo: Todo) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'TodoDetails',
        params: { todoId: todo.id }
      })
    );
  };

  // Обработка на превключване на изпълнена задача
  const handleToggleComplete = (id: string) => {
    toggleTodoCompleted(id);
  };

  // Добавяне на нова задача
  const handleAddTodo = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddEditTodo',
        params: { listId }
      })
    );
  };

  // Търсене на задачи
  const handleSearch = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SearchTodos'
      })
    );
  };

  // Промяна на филтъра
  const handleFilterChange = (newFilter: TodoFilter) => {
    setFilter(newFilter);
  };

  // Промяна на сортировката
  const handleSortChange = (option: TodoSortOption) => {
    if (sortBy === option) {
      // Ако избраната опция е същата, обърнете посоката
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  // Редактиране на списъка
  const handleEditList = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddEditList',
        params: { listId }
      })
    );
  };

  // Изтриване на списъка
  const handleDeleteList = () => {
    Alert.alert(
      'Изтриване на списък',
      `Сигурни ли сте, че искате да изтриете списъка "${listName}"?`,
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: () => {
            // Тук трябва да извикате функцията за изтриване на списък
            // deleteList(listId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  // Обновяване на данните
  const onRefresh = async () => {
    setRefreshing(true);
    console.log('TodoListScreen: ЗАПОЧНА ОБНОВЯВАНЕ');
    
    try {
      // Принудително презареждаме данните от AsyncStorage
      const count = await reloadDataFromStorage();
      console.log(`TodoListScreen: ПРЕЗАРЕДЕНИ ${count} ЗАДАЧИ ОТ ASYNCSTORAGE`);
    } catch (error) {
      console.error('TodoListScreen: ГРЕШКА ПРИ ПРЕЗАРЕЖДАНЕ НА ДАННИ:', error);
    }
    
    // Изчакваме малко за по-добро потребителско преживяване
    setTimeout(() => {
      // За да сме сигурни, че React ще презареди компонента с новите данни
      setFilter(filter);
      console.log('TodoListScreen: ОБНОВЯВАНЕТО ПРИКЛЮЧИ');
      setRefreshing(false);
    }, 500);
  };

  // Функция за показване на tooltip
  const showTooltip = (text: string, event: GestureResponderEvent) => {
    setTooltipPosition({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY
    });
    setTooltipText(text);
    setTooltipVisible(true);
  };

  // Функция за скриване на tooltip
  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  // Рендериране на секцията с филтри и сортиране
  const renderFilterControls = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && {
              backgroundColor: getColor('primary'),
            },
          ]}
          onPress={() => handleFilterChange('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && { color: '#FFFFFF' },
              filter !== 'all' && { color: getColor('text') },
            ]}
          >
            Всички
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'active' && {
              backgroundColor: getColor('primary'),
            },
          ]}
          onPress={() => handleFilterChange('active')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'active' && { color: '#FFFFFF' },
              filter !== 'active' && { color: getColor('text') },
            ]}
          >
            Активни
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && {
              backgroundColor: getColor('primary'),
            },
          ]}
          onPress={() => handleFilterChange('completed')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'completed' && { color: '#FFFFFF' },
              filter !== 'completed' && { color: getColor('text') },
            ]}
          >
            Завършени
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { color: getColor('textLight') }]}>
          Сортиране:
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSortChange('dueDate')}
        >
          <MaterialIcons
            name={sortDirection === 'asc' ? 'arrow-upward' : 'arrow-downward'}
            size={18}
            color={sortBy === 'dueDate' ? getColor('primary') : getColor('textLight')}
          />
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sortBy === 'dueDate' ? getColor('primary') : getColor('textLight'),
              },
            ]}
          >
            Срок
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSortChange('priority')}
        >
          <MaterialIcons
            name={sortDirection === 'asc' ? 'arrow-upward' : 'arrow-downward'}
            size={18}
            color={sortBy === 'priority' ? getColor('primary') : getColor('textLight')}
          />
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sortBy === 'priority' ? getColor('primary') : getColor('textLight'),
              },
            ]}
          >
            Приоритет
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSortChange('title')}
        >
          <MaterialIcons
            name={sortDirection === 'asc' ? 'arrow-upward' : 'arrow-downward'}
            size={18}
            color={sortBy === 'title' ? getColor('primary') : getColor('textLight')}
          />
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sortBy === 'title' ? getColor('primary') : getColor('textLight'),
              },
            ]}
          >
            Име
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Рендериране на празно състояние
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="list-alt" size={64} color={getColor('disabled')} />
      <Text style={[styles.emptyTitle, { color: getColor('textLight') }]}>
        Няма задачи в този списък
      </Text>
      <Text style={[styles.emptySubtitle, { color: getColor('textLight') }]}>
        Добавете нова задача, като натиснете бутона отдолу
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: getColor('text') }]}>
            {listName}
          </Text>
          <Text style={[styles.subtitle, { color: getColor('textLight') }]}>
            {getSortedTodos().length} задачи
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: getColor('info') }]}
            onPress={handleEditList}
          >
            <MaterialIcons name="edit" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: getColor('error'), marginLeft: SPACING.s }]}
            onPress={handleDeleteList}
          >
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {renderFilterControls()}

      <FlatList
        data={getSortedTodos()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onPress={handleTodoPress}
            onToggleComplete={handleToggleComplete}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[getColor('primary')]}
            tintColor={getColor('primary')}
          />
        }
      />

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.actionButtonSmall, { backgroundColor: getColor('surface') }]}
          onPress={handleSearch}
        >
          <MaterialIcons name="search" size={22} color={getColor('primary')} />
        </TouchableOpacity>
        
        <FloatingButton 
          icon="add" 
          onPress={handleAddTodo}
          onLongPress={(e: GestureResponderEvent) => showTooltip('Добавете нова задача', e)}
          delayLongPress={500}
        />
      </View>

      <Tooltip 
        visible={tooltipVisible}
        onClose={hideTooltip}
        text={tooltipText}
        position={tooltipPosition}
        isAbove={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  subtitle: {
    fontSize: FONT_SIZE.s,
    marginTop: SPACING.xs,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  filtersContainer: {
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.s,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.m,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterButtonText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  sortLabel: {
    fontSize: FONT_SIZE.s,
    marginRight: SPACING.m,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.s,
    marginRight: SPACING.m,
  },
  sortButtonText: {
    fontSize: FONT_SIZE.s,
    marginLeft: SPACING.xs,
  },
  listContent: {
    padding: SPACING.m,
    paddingBottom: 100,
    flexGrow: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    backgroundColor: 'transparent',
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  actionButtonSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    flex: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
    marginLeft: SPACING.xs,
  },
  addButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginTop: SPACING.m,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.m,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});

export default TodoListScreen; 