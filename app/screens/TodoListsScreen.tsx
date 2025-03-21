import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodo } from '../context/TodoContext';
import { Button } from '../components/Button';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { TodoListsScreenProps } from '../navigation/types';
import { TodoList } from '../types';
import { CommonActions } from '@react-navigation/native';

const TodoListsScreen: React.FC<TodoListsScreenProps> = ({ navigation }) => {
  const { lists, todos, deleteList, activeListId, setActiveList } = useTodo();
  const { getColor } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Функция за преход към екрана за създаване на нов списък
  const handleAddList = () => {
    navigation.navigate('AddEditList', {});
  };

  // Функция за преход към екрана за редактиране на списък
  const handleEditList = (listId: string) => {
    navigation.navigate('AddEditList', { listId });
  };

  // Функция за преход към екрана със задачите от избрания списък
  const handleSelectList = (list: TodoList) => {
    navigation.navigate('TodoList', { listId: list.id, listName: list.name });
  };

  // Функция за изтриване на списък
  const handleDeleteList = (list: TodoList) => {
    // Проверка дали списъкът съдържа задачи
    const hasTodos = todos.some(todo => todo.listId === list.id);

    if (hasTodos) {
      Alert.alert(
        'Внимание',
        `Списъкът "${list.name}" съдържа задачи. Сигурни ли сте, че искате да го изтриете заедно с всички задачи в него?`,
        [
          { text: 'Отказ', style: 'cancel' },
          { 
            text: 'Изтрий', 
            style: 'destructive',
            onPress: async () => {
              await deleteList(list.id);
            }
          },
        ]
      );
    } else {
      Alert.alert(
        'Изтриване на списък',
        `Сигурни ли сте, че искате да изтриете списъка "${list.name}"?`,
        [
          { text: 'Отказ', style: 'cancel' },
          { 
            text: 'Изтрий', 
            style: 'destructive',
            onPress: async () => {
              await deleteList(list.id);
            }
          },
        ]
      );
    }
  };

  // Функция за задаване на списък като активен
  const handleSetActiveList = (listId: string) => {
    // Проверяваме дали този списък вече е активен
    if (activeListId === listId) {
      // Ако е активен, деактивираме го (показваме всички задачи)
      setActiveList(null);
    } else {
      // Задаваме избрания списък като активен
      setActiveList(listId);
      // Връщаме се към началния екран
      navigation.dispatch(CommonActions.navigate({ name: 'HomeScreen' }));
    }
  };

  // Изчисление на броя задачи в списък
  const getListStats = (listId: string) => {
    const listTodos = todos.filter(todo => todo.listId === listId);
    const total = listTodos.length;
    const completed = listTodos.filter(todo => todo.completed).length;
    const active = total - completed;
    
    return { total, completed, active };
  };

  // Форматиране на дата
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Рендериране на отделен списък
  const renderListItem = ({ item }: { item: TodoList }) => {
    const stats = getListStats(item.id);
    const isActive = activeListId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          { backgroundColor: getColor('surface') },
          isActive && { backgroundColor: getColor('primary'), opacity: 0.8 }
        ]}
        onPress={() => handleSelectList(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listContentItem}>
          <Text
            style={[
              styles.listName,
              { color: isActive ? '#FFFFFF' : getColor('text') }
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          
          <Text
            style={[
              styles.listDate,
              { color: isActive ? '#FFFFFF' : getColor('textLight') }
            ]}
          >
            Създаден на: {formatDate(item.createdAt)}
          </Text>
          
          <View style={styles.statsContainer}>
            <Text
              style={[
                styles.statsText,
                { color: isActive ? '#FFFFFF' : getColor('textLight') }
              ]}
            >
              Общо: {stats.total}
            </Text>
            <Text
              style={[
                styles.statsText,
                { color: isActive ? '#FFFFFF' : getColor('success') }
              ]}
            >
              Изпълнени: {stats.completed}
            </Text>
            <Text
              style={[
                styles.statsText,
                { color: isActive ? '#FFFFFF' : getColor('info') }
              ]}
            >
              Активни: {stats.active}
            </Text>
          </View>
        </View>
        
        <View style={styles.listActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : getColor('primary') }
            ]}
            onPress={() => handleSetActiveList(item.id)}
          >
            <MaterialIcons
              name={isActive ? 'check' : 'visibility'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : getColor('info') }
            ]}
            onPress={() => handleEditList(item.id)}
          >
            <MaterialIcons name="edit" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : getColor('error') }
            ]}
            onPress={() => handleDeleteList(item)}
          >
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Рендериране на празно състояние (няма списъци)
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="list" size={64} color={getColor('disabled')} />
      <Text style={[styles.emptyTitle, { color: getColor('textLight') }]}>
        Нямате създадени списъци
      </Text>
      <Text style={[styles.emptySubtitle, { color: getColor('textLight') }]}>
        Създайте нов списък, за да организирате задачите си
      </Text>
      <Button
        title="Създай списък"
        onPress={handleAddList}
        style={styles.emptyButton}
        leftIcon={<MaterialIcons name="add-circle" size={24} color="#FFFFFF" />}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: getColor('text') }]}>
          Моите списъци
        </Text>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />

      {lists.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button
            title="Нов списък"
            onPress={handleAddList}
            leftIcon={<MaterialIcons name="add" size={24} color="#FFFFFF" />}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  listContent: {
    padding: SPACING.m,
    paddingBottom: 100, // Допълнително пространство за бутона
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContentItem: {
    flex: 1,
    padding: SPACING.m,
  },
  listName: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.xs,
  },
  listDate: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.s,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsText: {
    fontSize: FONT_SIZE.s,
    marginRight: SPACING.m,
  },
  listActions: {
    justifyContent: 'space-around',
    padding: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.xs,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.m,
    backgroundColor: 'transparent',
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
    marginBottom: SPACING.l,
  },
  emptyButton: {
    marginTop: SPACING.m,
  },
});

export default TodoListsScreen; 