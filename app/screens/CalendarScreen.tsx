import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView as RNSafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { useTodo } from '../context/TodoContext';
import { TodoItem } from '../types/todo';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 360;
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 44; // Използваме 44 като стойност по подразбиране за iOS

const CalendarScreen = () => {
  const { todos } = useTodo();
  const { getColor } = useAppTheme();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [todosForSelectedDate, setTodosForSelectedDate] = useState<TodoItem[]>([]);

  // Подготвя маркираните дати за календара
  useEffect(() => {
    const marked: Record<string, any> = {};
    
    todos.forEach(todo => {
      if (todo.dueDate) {
        const dateStr = new Date(todo.dueDate).toISOString().split('T')[0];
        
        // Определяне на цвета според приоритета
        let dotColor = getColor('primary');
        if (todo.priority === 'high') {
          dotColor = getColor('error');
        } else if (todo.priority === 'medium') {
          dotColor = getColor('warning');
        }
        
        if (!marked[dateStr]) {
          marked[dateStr] = { dots: [], marked: true };
        }
        
        // Добавя точка за всяка задача
        marked[dateStr].dots.push({
          key: todo.id,
          color: dotColor,
          selectedDotColor: dotColor
        });
      }
    });
    
    // Добавя специално маркиране за избраната дата
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: getColor('primary'),
      };
    }
    
    setMarkedDates(marked);
  }, [todos, selectedDate]);

  // Филтрира задачите за избраната дата
  useEffect(() => {
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const filteredTodos = todos.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate >= startOfDay && dueDate <= endOfDay;
      });
      
      // Конвертиране на типове Todo към TodoItem
      const formattedTodos: TodoItem[] = filteredTodos.map(todo => ({
        ...todo,
        dueDate: todo.dueDate ? (typeof todo.dueDate === 'string' ? todo.dueDate : todo.dueDate.toISOString()) : undefined,
        createdAt: typeof todo.createdAt === 'string' ? todo.createdAt : todo.createdAt.toISOString(),
        updatedAt: typeof todo.updatedAt === 'string' ? todo.updatedAt : todo.updatedAt.toISOString()
      }) as TodoItem);
      
      setTodosForSelectedDate(formattedTodos);
    }
  }, [selectedDate, todos]);

  // Обработва избор на дата
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  // Обработва натискане на задача
  const handleTodoPress = (todoId: string) => {
    navigation.dispatch(
      CommonActions.navigate('TodoDetails', { todoId })
    );
  };

  // Отваря екрана за добавяне на нова задача с предварително зададена дата
  const handleAddTodo = () => {
    navigation.dispatch(
      CommonActions.navigate('AddEditTodo', { 
        presetDueDate: selectedDate ? new Date(selectedDate).toISOString() : undefined 
      })
    );
  };

  // Форматира датата за заглавие (съкратено за по-малки екрани)
  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    
    try {
      const dateObj = new Date(selectedDate);
      
      // Проверка дали dateObj е валидна дата
      if (isNaN(dateObj.getTime())) {
        return 'Невалидна дата';
      }
      
      let options: Intl.DateTimeFormatOptions; 
      
      if (IS_SMALL_SCREEN) {
        // Съкратен формат за малки екрани
        options = { 
          day: 'numeric', 
          month: 'short',
          weekday: 'short'
        };
      } else {
        // Пълен формат за нормални екрани
        options = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        };
      }
      
      return dateObj.toLocaleDateString('bg-BG', options);
    } catch (error) {
      console.error('Грешка при форматиране на дата:', error);
      return 'Грешка';
    }
  };

  // Рендерира елемент от списъка със задачи
  const renderTodoItem = ({ item }: { item: TodoItem }) => {
    return (
      <TouchableOpacity
        style={[
          styles.todoItem,
          { backgroundColor: getColor('background') }
        ]}
        onPress={() => handleTodoPress(item.id)}
      >
        <View style={styles.todoContent}>
          <View style={styles.todoHeader}>
            <View 
              style={[
                styles.priorityIndicator, 
                { 
                  backgroundColor: item.priority === 'high' 
                    ? getColor('error') 
                    : item.priority === 'medium' 
                      ? getColor('warning') 
                      : getColor('success') 
                }
              ]} 
            />
            <Text 
              style={[
                styles.todoTitle, 
                { color: getColor('text') },
                item.completed && styles.completedText
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          
          {item.description ? (
            <Text 
              style={[styles.todoDescription, { color: getColor('textLight') }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
          
          <View style={styles.todoFooter}>
            {item.dueDate && (
              <View style={styles.dueDate}>
                <MaterialIcons 
                  name="schedule" 
                  size={14} 
                  color={getColor('textLight')} 
                />
                <Text style={[styles.dueDateText, { color: getColor('textLight') }]}>
                  {(() => {
                    try {
                      const dueDate = new Date(item.dueDate);
                      
                      // Проверка дали dueDate е валидна дата
                      if (isNaN(dueDate.getTime())) {
                        return 'Невалидна дата';
                      }
                      
                      return dueDate.toLocaleTimeString('bg-BG', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                    } catch (error) {
                      console.error('Грешка при форматиране на време:', error);
                      return 'Грешка';
                    }
                  })()}
                </Text>
              </View>
            )}
            
            {item.listId && (
              <View style={styles.listBadge}>
                <MaterialIcons 
                  name="list" 
                  size={14} 
                  color={getColor('textLight')} 
                />
                <Text style={[styles.listName, { color: getColor('textLight') }]}>
                  {item.listName || 'Списък'}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.checkbox,
            item.completed && { 
              backgroundColor: getColor('primary'),
              borderColor: getColor('primary')
            }
          ]}
        >
          {item.completed && (
            <MaterialIcons 
              name="check" 
              size={16} 
              color="#FFFFFF" 
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <RNSafeAreaView style={styles.safeArea}>
      <View style={[
        styles.container, 
        { backgroundColor: getColor('background') }
      ]}>
        <View style={styles.statusBarPadding} />
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            monthFormat={'MMMM yyyy'}
            markingType={'multi-dot'}
            markedDates={markedDates}
            theme={{
              calendarBackground: getColor('background'),
              textSectionTitleColor: getColor('text'),
              selectedDayBackgroundColor: getColor('primary'),
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: getColor('primary'),
              dayTextColor: getColor('text'),
              textDisabledColor: getColor('textLight'),
              monthTextColor: getColor('text'),
              arrowColor: getColor('primary'),
              // Оптимизации за responsive дизайн
              textDayFontSize: IS_SMALL_SCREEN ? 12 : 14,
              textMonthFontSize: IS_SMALL_SCREEN ? 14 : 16,
              textDayHeaderFontSize: IS_SMALL_SCREEN ? 10 : 12,
              'stylesheet.calendar.main': {
                container: {
                  width: '100%'
                },
                week: {
                  marginTop: 2,
                  marginBottom: 2,
                  flexDirection: 'row',
                  justifyContent: 'space-around'
                }
              }
            }}
          />
        </View>
        
        <View style={styles.dateHeader}>
          <Text style={[styles.dateHeaderText, { color: getColor('text') }]} numberOfLines={1} ellipsizeMode="tail">
            {formatSelectedDate()}
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: getColor('primary') }]}
            onPress={handleAddTodo}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          {todosForSelectedDate.length > 0 ? (
            <FlatList
              data={todosForSelectedDate}
              renderItem={renderTodoItem}
              keyExtractor={item => item.id}
              style={styles.todoList}
              contentContainerStyle={styles.todoListContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons 
                name="event-note" 
                size={IS_SMALL_SCREEN ? 48 : 64} 
                color={getColor('textLight')} 
              />
              <Text style={[styles.emptyStateText, { color: getColor('textLight') }]}>
                Няма задачи за тази дата
              </Text>
              <TouchableOpacity 
                style={[styles.emptyStateButton, { borderColor: getColor('primary') }]}
                onPress={handleAddTodo}
              >
                <Text style={[styles.emptyStateButtonText, { color: getColor('primary') }]}>
                  Добави задача
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </RNSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  statusBarPadding: {
    height: Platform.OS === 'ios' ? 30 : STATUSBAR_HEIGHT + 10, // Увеличаваме паддинга
  },
  calendarContainer: {
    width: '100%',
    paddingBottom: 5,
    marginHorizontal: 'auto',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    backgroundColor: '#fff',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: IS_SMALL_SCREEN ? 8 : 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    backgroundColor: '#fff',
  },
  dateHeaderText: {
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    width: IS_SMALL_SCREEN ? 36 : 40,
    height: IS_SMALL_SCREEN ? 36 : 40,
    borderRadius: IS_SMALL_SCREEN ? 18 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  todoList: {
    flex: 1,
  },
  todoListContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: IS_SMALL_SCREEN ? 10 : 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  todoContent: {
    flex: 1,
    marginRight: 8,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  todoTitle: {
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    fontWeight: '500',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  todoDescription: {
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
    marginBottom: 4,
  },
  todoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  dueDateText: {
    fontSize: IS_SMALL_SCREEN ? 10 : 12,
    marginLeft: 4,
  },
  listBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listName: {
    fontSize: IS_SMALL_SCREEN ? 10 : 12,
    marginLeft: 4,
  },
  checkbox: {
    width: IS_SMALL_SCREEN ? 20 : 24,
    height: IS_SMALL_SCREEN ? 20 : 24,
    borderRadius: IS_SMALL_SCREEN ? 10 : 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
    fontWeight: '500',
  },
});

export default CalendarScreen; 