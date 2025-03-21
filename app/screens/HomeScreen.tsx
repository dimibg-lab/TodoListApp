import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodo } from '../context/TodoContext';
import { useUser } from '../context/UserContext';
import { TodoItem } from '../components/TodoItem';
import { Button } from '../components/Button';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { HomeScreenProps } from '../navigation/types';
import { Todo, TodoFilter, TodoSortOption } from '../types';
import { CommonActions } from '@react-navigation/native';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    todos,
    toggleTodoCompleted,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    lists,
    activeListId,
    setActiveList,
  } = useTodo();
  const { userSettings } = useUser();
  const { getColor } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Справяне с клик върху задача
  const handleTodoPress = (todo: Todo) => {
    navigation.navigate('TodoDetails', { todoId: todo.id });
  };

  // Справяне с превключване на изпълнена задача
  const handleToggleComplete = (id: string) => {
    toggleTodoCompleted(id);
  };

  // Добавяне на нова задача
  const handleAddTodo = () => {
    navigation.navigate('AddEditTodo', { listId: activeListId || undefined });
  };

  // Търсене на задачи
  const handleSearch = () => {
    navigation.navigate('SearchTodos');
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

  // Промяна на активния списък
  const handleListChange = () => {
    // Показване на лист с наличните списъци
    if (lists.length <= 1) {
      // Навигация към таба с TodoLists
      navigation.dispatch(
        CommonActions.navigate({
          name: 'TodoLists'
        })
      );
      return;
    }

    Alert.alert(
      'Избиране на списък',
      'Изберете списък със задачи',
      [
        ...lists.map(list => ({
          text: list.name,
          onPress: () => setActiveList(list.id),
        })),
        {
          text: 'Всички задачи',
          onPress: () => setActiveList(null),
        },
        {
          text: 'Отказ',
          style: 'cancel',
        },
      ],
    );
  };

  // Pull to refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Тук можем да заредим отново данните, ако е необходимо
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Рендериране на празен списък
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="check-circle" size={64} color={getColor('disabled')} />
      <Text style={[styles.emptyText, { color: getColor('textLight') }]}>
        {filter === 'all'
          ? 'Нямате задачи. Добавете нови, като натиснете бутона долу.'
          : filter === 'completed'
          ? 'Нямате изпълнени задачи.'
          : 'Нямате активни задачи.'}
      </Text>
    </View>
  );

  // Рендериране на заглавието
  const renderTitle = () => {
    const activeList = lists.find(list => list.id === activeListId);
    const currentHour = new Date().getHours();
    
    let greetingText = 'Здравей';
    if (currentHour >= 5 && currentHour < 12) {
      greetingText = 'Добро утро';
    } else if (currentHour >= 12 && currentHour < 18) {
      greetingText = 'Добър ден';
    } else if (currentHour >= 18 && currentHour < 23) {
      greetingText = 'Добър вечер';
    }
    
    const userName = userSettings.name ? `, ${userSettings.name}` : '';
    
    return (
      <View style={styles.titleContainer}>
        <Text style={[styles.greeting, { color: getColor('text') }]}>
          {`${greetingText}${userName}!`}
        </Text>
        <TouchableOpacity
          style={[styles.listSelector, { backgroundColor: getColor('surface') }]}
          onPress={handleListChange}
        >
          <Text style={[styles.listName, { color: getColor('text') }]} numberOfLines={1}>
            {activeList ? activeList.name : 'Всички задачи'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={getColor('text')} />
        </TouchableOpacity>
      </View>
    );
  };

  // Рендериране на контролите за филтриране
  const renderFilterControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && [styles.activeFilterButton, { backgroundColor: getColor('primary') }],
          ]}
          onPress={() => handleFilterChange('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.activeFilterText,
              { color: filter === 'all' ? '#FFFFFF' : getColor('text') },
            ]}
          >
            Всички
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'active' && [styles.activeFilterButton, { backgroundColor: getColor('primary') }],
          ]}
          onPress={() => handleFilterChange('active')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'active' && styles.activeFilterText,
              { color: filter === 'active' ? '#FFFFFF' : getColor('text') },
            ]}
          >
            Активни
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && [styles.activeFilterButton, { backgroundColor: getColor('primary') }],
          ]}
          onPress={() => handleFilterChange('completed')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'completed' && styles.activeFilterText,
              { color: filter === 'completed' ? '#FFFFFF' : getColor('text') },
            ]}
          >
            Изпълнени
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={[styles.sortTitle, { color: getColor('textLight') }]}>
        Сортиране по:
      </Text>
      
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'dueDate' && styles.activeSortButton
          ]}
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
            Дата
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'priority' && styles.activeSortButton
          ]}
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
          style={[
            styles.sortButton,
            sortBy === 'title' && styles.activeSortButton
          ]}
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
      {renderTitle()}
      
      {renderFilterControls()}
      
      <FlatList
        data={todos}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
          style={[styles.searchButton, { backgroundColor: getColor('surface') }]}
          onPress={handleSearch}
        >
          <MaterialIcons name="search" size={24} color={getColor('primary')} />
        </TouchableOpacity>
        <Button
          title="Нова задача"
          onPress={handleAddTodo}
          style={styles.addButton}
          leftIcon={<MaterialIcons name="add" size={24} color="#FFFFFF" />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    padding: SPACING.m,
    paddingBottom: SPACING.s,
  },
  greeting: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.m,
  },
  listSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.s,
    alignSelf: 'flex-start',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  listName: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginRight: SPACING.xs,
  },
  controlsContainer: {
    padding: SPACING.m,
    paddingTop: 0,
    marginBottom: SPACING.s,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 90,
    alignItems: 'center',
  },
  activeFilterButton: {
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  filterButtonText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  activeFilterText: {
    fontWeight: FONT_WEIGHT.bold as any,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: SPACING.s,
  },
  sortTitle: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.m,
    paddingVertical: SPACING.xs,
  },
  activeSortButton: {
    borderBottomWidth: 2,
    borderBottomColor: 'currentColor',
  },
  sortButtonText: {
    fontSize: FONT_SIZE.xs,
    marginLeft: 2,
  },
  listContent: {
    paddingHorizontal: SPACING.m,
    flexGrow: 1,
  },
  separator: {
    height: SPACING.xs,
  },
  emptyContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.l,
  },
  emptyText: {
    marginTop: SPACING.m,
    textAlign: 'center',
    fontSize: FONT_SIZE.m,
  },
  bottomContainer: {
    flexDirection: 'row',
    padding: SPACING.m,
    alignItems: 'center',
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
  addButton: {
    flex: 1,
  },
});

export default HomeScreen; 