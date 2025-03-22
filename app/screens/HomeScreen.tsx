import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
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
    reloadDataFromStorage
  } = useTodo();
  const { userSettings } = useUser();
  const { getColor } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // За анимация на зареждане

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Добавяме фокус слушател за опресняване
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Опресняваме данните автоматично при връщане към екрана
      console.log('HomeScreen: ФОКУС ПОЛУЧЕН, ОБНОВЯВАМЕ ДАННИ');
      setRefreshing(true);
      
      // Презареждаме данните от AsyncStorage
      reloadDataFromStorage().then(count => {
        console.log(`HomeScreen: ПРЕЗАРЕДЕНИ ${count} ЗАДАЧИ ОТ ASYNCSTORAGE`);
        // Симулираме забавяне за по-добро потребителско преживяване
        setTimeout(() => {
          setRefreshing(false);
          console.log('HomeScreen: ОБНОВЯВАНЕТО ПРИКЛЮЧИ');
        }, 500);
      }).catch(error => {
        console.error('HomeScreen: ГРЕШКА ПРИ ПРЕЗАРЕЖДАНЕ НА ДАННИ:', error);
        setRefreshing(false);
      });
    });

    return unsubscribe;
  }, [navigation]);

  // Изчисление на прогрес
  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  // Динамично приветствие
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Добро утро';
    if (hour >= 12 && hour < 18) return 'Добър ден';
    return 'Добър вечер';
  };

  // Обработка на действия
  const handleTodoPress = (todo: Todo) => navigation.navigate('TodoDetails', { todoId: todo.id });
  const handleAddTodo = () => navigation.navigate('AddEditTodo', { listId: activeListId || undefined });
  const handleSearch = () => navigation.navigate('SearchTodos');
  const handleToggleComplete = (id: string) => toggleTodoCompleted(id);
  const handleFilterChange = (newFilter: TodoFilter) => setFilter(newFilter);
  const handleSortChange = (option: TodoSortOption) => {
    setSortBy(option);
    setSortDirection(sortBy === option && sortDirection === 'asc' ? 'desc' : 'asc');
  };
  const handleListChange = () => {
    // Използваме CommonActions.navigate вместо директно navigation.navigate
    navigation.dispatch(
      CommonActions.navigate({
        name: 'TodoLists',
      })
    );
  };

  // Pull to refresh
  const onRefresh = () => {
    console.log('HomeScreen: ЗАПОЧНА ОБНОВЯВАНЕ (РЪЧНО)');
    setRefreshing(true);
    
    // Презареждаме данните от AsyncStorage
    reloadDataFromStorage().then(count => {
      console.log(`HomeScreen: ПРЕЗАРЕДЕНИ ${count} ЗАДАЧИ ОТ ASYNCSTORAGE (РЪЧНО)`);
      setTimeout(() => {
        setRefreshing(false);
        console.log('HomeScreen: ОБНОВЯВАНЕТО ПРИКЛЮЧИ (РЪЧНО)');
      }, 500);
    }).catch(error => {
      console.error('HomeScreen: ГРЕШКА ПРИ ПРЕЗАРЕЖДАНЕ НА ДАННИ (РЪЧНО):', error);
      setRefreshing(false);
    });
  };

  // Рендериране на заглавие с прогрес
  const renderHeader = () => {
    const activeList = lists.find((list) => list.id === activeListId);
    return (
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={[styles.greeting, { color: getColor('text') }]}>
          {`${getGreeting()}, ${userSettings.name || 'Потребител'}!`}
        </Text>
        <TouchableOpacity
          style={[styles.listSelector, { backgroundColor: getColor('surface') }]}
          onPress={handleListChange}
        >
          <Text style={[styles.listName, { color: getColor('text') }]}>
            {activeList?.name || 'Всички задачи'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={getColor('text')} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: getColor('primary') },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: getColor('textLight') }]}>
          {completedCount} от {todos.length} завършени
        </Text>
      </Animated.View>
    );
  };

  // Рендериране на филтри и сортиране
  const renderControls = () => (
    <View style={styles.controls}>
      <View style={styles.filterRow}>
        {['all', 'active', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && { backgroundColor: getColor('primary') },
            ]}
            onPress={() => handleFilterChange(f as TodoFilter)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? '#FFF' : getColor('text') },
              ]}
            >
              {f === 'all' ? 'Всички' : f === 'active' ? 'Активни' : 'Изпълнени'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.sortRow}>
        {['dueDate', 'priority', 'title'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.sortButton, sortBy === option && styles.activeSort]}
            onPress={() => handleSortChange(option as TodoSortOption)}
          >
            <MaterialIcons
              name={sortDirection === 'asc' ? 'arrow-upward' : 'arrow-downward'}
              size={16}
              color={sortBy === option ? getColor('primary') : getColor('textLight')}
            />
            <Text
              style={[
                styles.sortText,
                { color: sortBy === option ? getColor('primary') : getColor('textLight') },
              ]}
            >
              {option === 'dueDate' ? 'Дата' : option === 'priority' ? 'Приоритет' : 'Име'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Рендериране на празен списък
  const renderEmpty = () => (
    <View style={styles.empty}>
      <MaterialIcons name="check-circle-outline" size={60} color={getColor('disabled')} />
      <Text style={[styles.emptyText, { color: getColor('textLight') }]}>
        {filter === 'all'
          ? 'Няма задачи. Добави първата си!'
          : filter === 'active'
          ? 'Няма активни задачи.'
          : 'Няма завършени задачи.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
      {renderHeader()}
      {renderControls()}
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
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[getColor('primary')]}
          />
        }
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: getColor('surface') }]}
          onPress={handleSearch}
        >
          <MaterialIcons name="search" size={24} color={getColor('primary')} />
        </TouchableOpacity>
        <Button
          title="Нова задача"
          onPress={handleAddTodo}
          leftIcon={<MaterialIcons name="add" size={24} color="#FFF" />}
          style={styles.addButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: SPACING.m,
    paddingBottom: SPACING.s,
  },
  greeting: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  listSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    marginTop: SPACING.s,
    alignSelf: 'flex-start',
  },
  listName: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginRight: SPACING.xs,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: SPACING.s,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  controls: {
    paddingHorizontal: SPACING.m,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.s,
  },
  filterButton: {
    flex: 1,
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  filterText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.m,
    paddingVertical: SPACING.xs,
  },
  activeSort: {
    borderBottomWidth: 2,
    borderBottomColor: 'currentColor',
  },
  sortText: {
    fontSize: FONT_SIZE.s,
    marginLeft: SPACING.xs,
  },
  listContent: {
    padding: SPACING.m,
    flexGrow: 1,
  },
  separator: {
    height: SPACING.s,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.l,
  },
  emptyText: {
    fontSize: FONT_SIZE.m,
    textAlign: 'center',
    marginTop: SPACING.m,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.m,
    alignItems: 'center',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  addButton: {
    flex: 1,
  },
});

export default HomeScreen;