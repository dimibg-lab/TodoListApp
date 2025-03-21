import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodo } from '../context/TodoContext';
import { useAppTheme } from '../utils/theme';
import { Button } from '../components/Button';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { TodoDetailsScreenProps } from '../navigation/types';
import { Priority } from '../types';

const TodoDetailsScreen: React.FC<TodoDetailsScreenProps> = ({ route, navigation }) => {
  const { todoId } = route.params;
  const { todos, updateTodo, deleteTodo, toggleTodoCompleted, lists } = useTodo();
  const { getColor } = useAppTheme();

  // Намираме задачата по ID
  const todo = todos.find(t => t.id === todoId);

  // Ако задачата не е намерена, показваме съобщение
  if (!todo) {
    return (
      <View style={[styles.container, { backgroundColor: getColor('background') }]}>
        <Text style={[styles.errorText, { color: getColor('error') }]}>
          Задачата не е намерена
        </Text>
        <Button 
          title="Назад" 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: SPACING.l }}
        />
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
    
    // Формат на дата: DD.MM.YYYY HH:MM
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Проверка дали срокът е изтекъл
  const isOverdue = () => {
    if (!todo.dueDate) return false;
    return new Date() > todo.dueDate && !todo.completed;
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
${todo.dueDate ? `Срок: ${formatDate(todo.dueDate)}\n` : ''}
${todo.tags.length > 0 ? `Етикети: ${todo.tags.join(', ')}\n` : ''}
${todo.notes ? `Бележки: ${todo.notes}` : ''}
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Заглавие и статус */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[
              styles.checkbox,
              { borderColor: getColor('primary') },
              todo.completed && { backgroundColor: getColor('primary') }
            ]} 
            onPress={handleToggleComplete}
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
        </View>

        {/* Карта с детайли */}
        <View style={[styles.card, { backgroundColor: getColor('surface') }]}>
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
                {formatDate(todo.dueDate)}
              </Text>
            </View>
          )}

          {/* Дата на създаване */}
          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color={getColor('textLight')} style={styles.infoIcon} />
            <Text style={[styles.infoLabel, { color: getColor('textLight') }]}>Създадена:</Text>
            <Text style={[styles.infoValue, { color: getColor('text') }]}>
              {formatDate(todo.createdAt)}
            </Text>
          </View>

          {/* Последна редакция */}
          <View style={styles.infoRow}>
            <MaterialIcons name="edit" size={20} color={getColor('textLight')} style={styles.infoIcon} />
            <Text style={[styles.infoLabel, { color: getColor('textLight') }]}>Редактирана:</Text>
            <Text style={[styles.infoValue, { color: getColor('text') }]}>
              {formatDate(todo.updatedAt)}
            </Text>
          </View>
        </View>

        {/* Описание */}
        {todo.description && (
          <View style={[styles.card, { backgroundColor: getColor('surface') }]}>
            <Text style={[styles.sectionTitle, { color: getColor('text') }]}>Описание</Text>
            <Text style={[
              styles.description, 
              { color: getColor('text') },
              todo.completed && styles.completedText
            ]}>
              {todo.description}
            </Text>
          </View>
        )}

        {/* Бележки */}
        {todo.notes && (
          <View style={[styles.card, { backgroundColor: getColor('surface') }]}>
            <Text style={[styles.sectionTitle, { color: getColor('text') }]}>Бележки</Text>
            <Text style={[
              styles.notes, 
              { color: getColor('text') },
              todo.completed && styles.completedText
            ]}>
              {todo.notes}
            </Text>
          </View>
        )}

        {/* Етикети */}
        {todo.tags.length > 0 && (
          <View style={[styles.card, { backgroundColor: getColor('surface') }]}>
            <Text style={[styles.sectionTitle, { color: getColor('text') }]}>Етикети</Text>
            <View style={styles.tagsContainer}>
              {todo.tags.map((tag, index) => (
                <View 
                  key={index} 
                  style={[styles.tag, { backgroundColor: getColor('primary') }]}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Бутони */}
      <View style={[styles.footer, { backgroundColor: getColor('background') }]}>
        <Button
          title="Редактирай"
          style={[styles.footerButton, { flex: 1 }]}
          leftIcon={<MaterialIcons name="edit" size={20} color="#FFFFFF" />}
          onPress={handleEdit}
        />
        <Button
          title="Изтрий"
          style={[styles.footerButton, { flex: 1 }]}
          leftIcon={<MaterialIcons name="delete" size={20} color="#FFFFFF" />}
          onPress={handleDelete}
          variant="secondary"
        />
        <Button
          title="Сподели"
          style={[styles.footerButton, { flex: 1 }]}
          leftIcon={<MaterialIcons name="share" size={20} color="#FFFFFF" />}
          onPress={handleShare}
          variant="secondary"
        />
      </View>
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
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
    flex: 1,
  },
  card: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.m,
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
    fontWeight: FONT_WEIGHT.medium as any,
    marginLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.s,
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
    fontWeight: FONT_WEIGHT.medium as any,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerButton: {
    marginHorizontal: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.medium as any,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
});

export default TodoDetailsScreen; 