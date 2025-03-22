import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  Animated,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodo } from '../context/TodoContext';
import { useAppTheme } from '../utils/theme';
import { Button } from '../components/Button';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { TodoDetailsScreenProps } from '../navigation/types';
import { Todo as BaseTodo } from '../types';
import { useWeather } from '../context/WeatherContext';
import Tooltip from '../components/Tooltip';

// Определяме типовете, които използваме локално
type Priority = 'high' | 'medium' | 'low';

interface WeatherRecommendation {
  timestamp: Date;
  recommended: boolean;
  message: string;
}

// Разширяваме типа Todo с допълнителни полета
interface Todo extends BaseTodo {
  tags: string[];
  notes?: string;
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

const TodoDetailsScreen: React.FC<TodoDetailsScreenProps> = ({ route, navigation }) => {
  const { todoId } = route.params;
  const { todos, updateTodo, deleteTodo, toggleTodoCompleted, lists } = useTodo();
  const { getColor } = useAppTheme();
  const { isOutdoorTaskRecommended } = useWeather();

  // Анимации
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  // Стартиране на анимацията при зареждане
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Намираме задачата по ID
  const todo = todos.find(t => t.id === todoId);

  // Ако задачата не е намерена, показваме съобщение
  if (!todo) {
    return (
      <View style={[styles.container, { backgroundColor: getColor('background') }]}>
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }],
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
        >
          <MaterialIcons name="error-outline" size={60} color={getColor('error')} />
          <Text style={[styles.errorText, { color: getColor('error') }]}>
            Задачата не е намерена
          </Text>
          <Button 
            title="Назад" 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: SPACING.l }}
          />
        </Animated.View>
      </View>
    );
  }

  // Намираме името на списъка
  const list = lists.find(l => l.id === todo.listId);
  const listName = list ? list.name : 'Неизвестен списък';

  // Получаване на цвят и име за приоритета
  const getPriorityInfo = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return { 
          color: getColor('priorityHigh'),
          name: 'Висок',
          icon: 'priority-high'
        };
      case 'medium':
        return { 
          color: getColor('priorityMedium'),
          name: 'Среден',
          icon: 'arrow-up-bold'
        };
      case 'low':
        return { 
          color: getColor('priorityLow'),
          name: 'Нисък',
          icon: 'arrow-down-bold'
        };
      default:
        return { 
          color: getColor('text'),
          name: 'Неизвестен',
          icon: 'help-circle'
        };
    }
  };

  // Форматиране на дата
  const formatDate = (date?: Date) => {
    if (!date) return 'Не е зададена';
    
    // Проверка дали date е валидна дата
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Невалидна дата';
    }
    
    try {
      // Формат на дата: DD.MM.YYYY HH:MM
      return date.toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Грешка при форматиране на дата:', error);
      return 'Грешка';
    }
  };

  // Проверка дали срокът е изтекъл
  const isOverdue = () => {
    if (!todo.dueDate) return false;
    return new Date() > new Date(todo.dueDate) && !todo.completed;
  };

  // Редактиране на задачата
  const handleEdit = () => {
    navigation.navigate('AddEditTodo', { todoId });
  };

  // Изтриване на задачата
  const handleDelete = () => {
    Alert.alert(
      'Изтриване на задача',
      'Сигурни ли сте, че искате да изтриете тази задача?',
      [
        { text: 'Отказ', style: 'cancel' },
        { 
          text: 'Изтрий', 
          style: 'destructive',
          onPress: async () => {
            await deleteTodo(todo.id);
            navigation.goBack();
          }
        },
      ]
    );
  };

  // Споделяне на задачата
  const handleShare = async () => {
    try {
      // Подготвяме текста за споделяне
      const shareText = `
Задача: ${todo.title}
${todo.description ? `Описание: ${todo.description}\n` : ''}
Приоритет: ${getPriorityInfo(todo.priority).name}
${todo.dueDate ? `Срок: ${formatDate(new Date(todo.dueDate))}\n` : ''}
${(todo as any).tags && (todo as any).tags.length > 0 ? `Етикети: ${(todo as any).tags.join(', ')}\n` : ''}
${(todo as any).notes ? `Бележки: ${(todo as any).notes}` : ''}
      `.trim();
      
      await Share.share({
        message: shareText,
        title: todo.title,
      });
    } catch (error) {
      Alert.alert('Грешка при споделяне', 'Не успяхме да споделим задачата.');
    }
  };

  // Превключване на статуса на задачата
  const handleToggleComplete = () => {
    toggleTodoCompleted(todo.id);
  };

  const priorityInfo = getPriorityInfo(todo.priority);

  // Добавяме стейт за прогнозата за времето
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<WeatherRecommendation | null>(
    (todo as any).weatherRecommendation ? { ...(todo as any).weatherRecommendation } : null
  );

  // Функция за проверка на времето
  const checkWeather = async () => {
    if (!todo || !(todo as any).location) {
      Alert.alert('Няма местоположение', 'Тази задача няма зададено местоположение.');
      return;
    }
    
    setWeatherLoading(true);
    
    try {
      const recommendation = await isOutdoorTaskRecommended(
        (todo as any).location.latitude,
        (todo as any).location.longitude
      );
      
      setWeatherInfo(recommendation);
      
      // Запазваме препоръката в todo обекта
      updateTodo(todo.id, {
        weatherChecked: new Date()
      } as any);
      
      // Обновяваме weatherRecommendation отделно (за типова съвместимост)
      setTimeout(() => {
        try {
          const todoUpdate = {
            ...todo,
            weatherRecommendation: recommendation
          };
          useTodo().updateTodo(todo.id, todoUpdate as any);
        } catch (error) {
          console.error('Грешка при запазване на препоръка за времето:', error);
        }
      }, 100);
      
    } catch (error) {
      console.error('Грешка при проверка на времето:', error);
      Alert.alert('Грешка', 'Не успяхме да проверим времето за тази локация.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Функция за рендериране на секцията за времето
  const renderWeatherSection = () => {
    if (!todo || !(todo as any).isOutdoor) return null;
    
    return (
      <Animated.View
        style={[
          styles.section,
          {
            backgroundColor: getColor('surface'),
            borderColor: getColor('border'),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <MaterialIcons name="wb-sunny" size={20} color={getColor('accent')} />
          <Text style={[styles.sectionHeaderTitle, { color: getColor('text') }]}>
            Задача на открито
          </Text>
        </View>
        
        <View style={styles.weatherContainer}>
          {weatherInfo ? (
            <View 
              style={[
                styles.weatherInfoContainer,
                { 
                  backgroundColor: weatherInfo.recommended 
                    ? getColor('success') + '20' 
                    : getColor('warning') + '20' 
                }
              ]}
            >
              <MaterialIcons 
                name={weatherInfo.recommended ? 'check-circle' : 'warning'} 
                size={24} 
                color={weatherInfo.recommended ? getColor('success') : getColor('warning')} 
                style={styles.weatherIcon}
              />
              <View style={styles.weatherTextContainer}>
                <Text style={[styles.weatherMessage, { color: getColor('text') }]}>
                  {weatherInfo.message}
                </Text>
                {weatherInfo.timestamp && (
                  <Text style={[styles.weatherTimestamp, { color: getColor('textLight') }]}>
                    Последна проверка: {new Date(weatherInfo.timestamp).toLocaleString('bg-BG')}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <Text style={[styles.noWeatherData, { color: getColor('textLight') }]}>
              Няма информация за времето. Проверете сега.
            </Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.weatherButton,
              { backgroundColor: getColor('info') }
            ]}
            onPress={checkWeather}
            disabled={weatherLoading}
          >
            {weatherLoading ? (
              <View style={styles.weatherButtonContent}>
                <Text style={styles.weatherButtonText}>Проверява се...</Text>
              </View>
            ) : (
              <View style={styles.weatherButtonContent}>
                <MaterialIcons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.weatherButtonText}>Провери времето</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Създавам помощна функция за рендериране на секция
  const renderSection = (content: React.ReactNode, iconName: string) => {
    return (
      <Animated.View
        style={[
          styles.section,
          {
            backgroundColor: getColor('surface'),
            borderColor: getColor('border'),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {content}
      </Animated.View>
    );
  };

  // Променям стиловете на секцията за описание, за да намаля празното пространство
  const renderDescriptionSection = () => {
    if (!todo.description || todo.description.trim() === '') {
      return null; // Не показваме секцията, ако няма описание
    }
    
    return renderSection(
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="description" size={20} color={getColor('primary')} />
          <Text style={[styles.sectionHeaderTitle, { color: getColor('text') }]}>
            Описание
          </Text>
        </View>
        <Text style={[styles.description, { color: getColor('text') }]}>
          {todo.description}
        </Text>
      </View>
    , 'description');
  };

  // Рендериране на карта за информация
  const renderCard = (title: string, children: React.ReactNode, icon?: string) => (
    <Animated.View 
      style={[
        styles.card, 
        { 
          backgroundColor: getColor('surface'),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          shadowColor: getColor('text'),
        }
      ]}
    >
      <View style={styles.cardHeader}>
        {icon && (
          <MaterialIcons name={icon as any} size={20} color={getColor('primary')} style={styles.cardIcon} />
        )}
        <Text style={[styles.sectionTitle, { color: getColor('text') }]}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );

  // Добавям състояние за tooltip-а
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState('');

  // Функция за показване на tooltip
  const showTooltip = (text: string, event: any) => {
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

  const formatDateForDisplay = (dateString?: Date | string) => {
    if (!dateString) return 'Не е зададена';
    
    try {
      const date = new Date(dateString);
      
      // Проверка дали date е валидна дата
      if (isNaN(date.getTime())) {
        return 'Невалидна дата';
      }
      
      // Формат на дата: DD.MM.YYYY
      return date.toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Грешка при форматиране на дата:', error);
      return 'Грешка';
    }
  };

  const formatDateToShow = (dateStr?: string | Date) => {
    if (!dateStr) return 'Не е избрана';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr.toString();
      }
      return date.toISOString().split('T')[0];
    } catch (e) {
      return String(dateStr);
    }
  };

  // Функция за рендериране на секцията с бележки
  const renderNotes = () => {
    return (
      <View style={styles.notesSection}>
        <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
          Бележки
        </Text>
        <Text style={[styles.notesText, { color: getColor('text') }]}>
          {(todo as any).notes || 'Няма добавени бележки'}
        </Text>
      </View>
    );
  };

  // Функция за рендериране на секцията с етикети
  const renderTags = () => {
    if (!(todo as any).tags || (todo as any).tags.length === 0) {
      return null;
    }

    return (
      <View style={styles.tagsContainer}>
        {(todo as any).tags.map((tag: string, index: number) => (
          <View key={index} style={[styles.tag, { backgroundColor: getColor('surface') }]}>
            <Text style={{ color: getColor('text') }}>{tag}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Функция за рендериране на секцията с местоположение
  const renderLocation = () => {
    if (!(todo as any).location) return null;

    return (
      <View style={styles.locationSection}>
        <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
          Местоположение
        </Text>
        <Text style={[styles.locationText, { color: getColor('text') }]}>
          {(todo as any).location.name}
        </Text>
      </View>
    );
  };

  const handleDateSelect = (date: string) => {
    try {
      const newDate = new Date(date);
      if (!isNaN(newDate.getTime())) {
        updateTodo(todo.id, { dueDate: newDate } as any);
      }
    } catch (error) {
      console.error('Грешка при задаване на дата:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Заглавие и статус */}
        <Animated.View 
          style={[
            styles.header, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.checkbox,
              { 
                borderColor: todo.completed ? getColor('primary') : getPriorityInfo(todo.priority).color,
                shadowColor: getColor('text')
              },
              todo.completed && { backgroundColor: getColor('primary') }
            ]} 
            onPress={handleToggleComplete}
            onLongPress={(e) => showTooltip('Маркирайте задачата като изпълнена/неизпълнена', e)}
            delayLongPress={500}
          >
            {todo.completed && (
              <MaterialIcons name="check" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          
          <Text style={[
            styles.title, 
            { color: getColor('text') },
            todo.completed && styles.completedText
          ]}>
            {todo.title}
          </Text>
        </Animated.View>

        {/* Основна информация */}
        {renderCard('Основна информация', (
          <>
            {/* Приоритет */}
            <View style={styles.infoRow}>
              <MaterialIcons name="flag" size={20} color={getColor('textLight')} style={styles.infoIcon} />
              <Text style={[styles.infoLabel, { color: getColor('textLight') }]}>Приоритет:</Text>
              <View style={styles.priorityContainer}>
                {todo.priority === 'high' ? (
                  <MaterialIcons name="priority-high" size={16} color={priorityInfo.color} />
                ) : (
                  todo.priority === 'medium' ? (
                    <MaterialCommunityIcons name="arrow-up-bold" size={16} color={priorityInfo.color} />
                  ) : (
                    <MaterialCommunityIcons name="arrow-down-bold" size={16} color={priorityInfo.color} />
                  )
                )}
                <Text style={[styles.priorityText, { color: priorityInfo.color }]}>
                  {priorityInfo.name}
                </Text>
              </View>
            </View>

            {/* Списък */}
            <View style={styles.infoRow}>
              <MaterialIcons name="list" size={20} color={getColor('textLight')} style={styles.infoIcon} />
              <Text style={[styles.infoLabel, { color: getColor('textLight') }]}>Списък:</Text>
              <Text style={[styles.infoValue, { color: getColor('text') }]}>{listName}</Text>
            </View>

            {/* Краен срок */}
            {todo.dueDate && (
              <View style={styles.infoRow}>
                <MaterialIcons 
                  name="access-time" 
                  size={20} 
                  color={isOverdue() ? getColor('error') : getColor('textLight')} 
                  style={styles.infoIcon} 
                />
                <Text style={[styles.infoLabel, { color: getColor('textLight') }]}>Краен срок:</Text>
                <Text style={[
                  styles.infoValue, 
                  { color: isOverdue() ? getColor('error') : getColor('text') },
                  todo.completed && styles.completedText
                ]}>
                  {formatDateToShow(todo.dueDate)}
                </Text>
              </View>
            )}

            {/* Дата на създаване */}
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color={getColor('textLight')} style={styles.infoIcon} />
              <Text style={[styles.infoLabel, { color: getColor('textLight') }]}>Създадена:</Text>
              <Text style={[styles.infoValue, { color: getColor('text') }]}>
                {formatDate(new Date(todo.createdAt))}
              </Text>
            </View>

            {/* Последна редакция */}
            <View style={styles.infoRow}>
              <MaterialIcons name="edit" size={20} color={getColor('textLight')} style={styles.infoIcon} />
              <Text style={[styles.infoLabel, { color: getColor('textLight') }]}>Редактирана:</Text>
              <Text style={[styles.infoValue, { color: getColor('text') }]}>
                {formatDate(new Date(todo.updatedAt))}
              </Text>
            </View>
          </>
        ), 'info')}

        {/* Описание */}
        {renderDescriptionSection()}

        {/* Бележки */}
        {renderNotes()}

        {/* Етикети */}
        {renderTags()}

        {/* След Location секцията */}
        {renderLocation()}
        
        {/* Добавяме секция за времето */}
        {renderWeatherSection()}
      </ScrollView>

      {/* Бутони с добавени tooltips */}
      <Animated.View 
        style={[
          styles.footer, 
          { 
            backgroundColor: getColor('background'),
            borderTopColor: getColor('border'),
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: getColor('primary') }]}
          onPress={handleEdit}
          onLongPress={(e) => showTooltip('Редактирайте детайлите на задачата', e)}
          delayLongPress={500}
        >
          <MaterialIcons name="edit" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Редакция</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: getColor('error') }]}
          onPress={handleDelete}
          onLongPress={(e) => showTooltip('Изтрийте тази задача', e)}
          delayLongPress={500}
        >
          <MaterialIcons name="delete" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Изтрий</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: getColor('accent') }]}
          onPress={handleShare}
          onLongPress={(e) => showTooltip('Споделете задачата с други', e)}
          delayLongPress={500}
        >
          <MaterialIcons name="share" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Сподели</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Добавям tooltip компонент */}
      <Tooltip 
        visible={tooltipVisible}
        onClose={hideTooltip}
        text={tooltipText}
        position={tooltipPosition}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.s,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as "700",
    flex: 1,
  },
  card: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.m,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: SPACING.xs,
  },
  cardIcon: {
    marginRight: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  infoIcon: {
    marginRight: SPACING.s,
  },
  infoLabel: {
    fontSize: FONT_SIZE.s,
    width: 100,
    fontWeight: FONT_WEIGHT.medium as "500",
  },
  infoValue: {
    fontSize: FONT_SIZE.s,
    flex: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as "500",
    marginLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as "500",
    marginLeft: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.m,
    lineHeight: 24,
  },
  notes: {
    fontSize: FONT_SIZE.m,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.s,
    marginRight: SPACING.s,
    marginBottom: SPACING.xs,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as "500",
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderTopWidth: 1,
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.l,
    flex: 1,
    marginHorizontal: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium as "500",
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.medium as "500",
    textAlign: 'center',
    marginTop: SPACING.m,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  // Стилове за секцията за времето
  weatherContainer: {
    marginTop: SPACING.xs,
  },
  weatherInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.s,
  },
  weatherIcon: {
    marginRight: SPACING.s,
    marginTop: 2,
  },
  weatherTextContainer: {
    flex: 1,
  },
  weatherMessage: {
    fontSize: FONT_SIZE.s,
    lineHeight: 20,
  },
  weatherTimestamp: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  noWeatherData: {
    fontSize: FONT_SIZE.s,
    textAlign: 'center',
    marginBottom: SPACING.s,
  },
  weatherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    alignSelf: 'center',
  },
  weatherButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.s,
    marginLeft: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionHeaderTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as "500",
    marginLeft: SPACING.xs,
  },
  notesSection: {
    marginBottom: SPACING.m,
  },
  notesText: {
    fontSize: FONT_SIZE.m,
    lineHeight: 24,
  },
  locationSection: {
    marginBottom: SPACING.m,
  },
  locationText: {
    fontSize: FONT_SIZE.m,
    lineHeight: 24,
  },
});

export default TodoDetailsScreen; 