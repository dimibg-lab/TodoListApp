import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StyleProp,
  ViewStyle
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Todo, Priority } from '../types';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';

interface TodoItemProps {
  todo: Todo;
  onPress: (todo: Todo) => void;
  onToggleComplete: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onPress,
  onToggleComplete,
  style
}) => {
  const { getColor } = useAppTheme();

  // Получаване на цвят за приоритета
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return getColor('priorityHigh');
      case 'medium':
        return getColor('priorityMedium');
      case 'low':
        return getColor('priorityLow');
      default:
        return getColor('text');
    }
  };

  // Форматиране на краен срок
  const formatDueDate = (date?: Date) => {
    if (!date) return null;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear();
      
    const isTomorrow = date.getDate() === tomorrow.getDate() && 
      date.getMonth() === tomorrow.getMonth() && 
      date.getFullYear() === tomorrow.getFullYear();
    
    // Време във формат HH:MM
    const timeString = date.toLocaleTimeString('bg-BG', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    if (isToday) {
      return `Днес, ${timeString}`;
    } else if (isTomorrow) {
      return `Утре, ${timeString}`;
    } else {
      // Форматиране на дата във формат DD.MM.YYYY
      const dateString = date.toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return `${dateString}, ${timeString}`;
    }
  };

  // Определяне дали срокът е изтекъл
  const isOverdue = () => {
    if (!todo.dueDate) return false;
    return new Date() > todo.dueDate && !todo.completed;
  };

  // Иконата за приоритет
  const PriorityIcon = () => {
    if (todo.priority === 'high') {
      return <MaterialIcons name="priority-high" size={16} color={getPriorityColor(todo.priority)} />;
    } else if (todo.priority === 'medium') {
      return <MaterialCommunityIcons name="arrow-up-bold" size={16} color={getPriorityColor(todo.priority)} />;
    } else {
      return <MaterialCommunityIcons name="arrow-down-bold" size={16} color={getPriorityColor(todo.priority)} />;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: getColor('surface'),
          shadowColor: getColor('text'),
        },
        todo.completed && { 
          backgroundColor: getColor('completed'),
          opacity: 0.85
        },
        style
      ]}
      onPress={() => onPress(todo)}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={() => onToggleComplete(todo.id)}
      >
        <View style={[
          styles.checkbox,
          { 
            borderColor: todo.completed ? getColor('primary') : getPriorityColor(todo.priority)
          },
          todo.completed && { backgroundColor: getColor('primary') }
        ]}>
          {todo.completed && (
            <MaterialIcons name="check" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text 
            style={[
              styles.title, 
              { color: getColor('text') }, 
              todo.completed && styles.completedText
            ]}
            numberOfLines={1}
          >
            {todo.title}
          </Text>
          <PriorityIcon />
        </View>

        {todo.description && (
          <Text 
            style={[
              styles.description, 
              { color: getColor('textLight') },
              todo.completed && styles.completedText
            ]}
            numberOfLines={2}
          >
            {todo.description}
          </Text>
        )}

        <View style={styles.footerContainer}>
          {todo.dueDate && (
            <View style={styles.dueDateContainer}>
              <MaterialIcons
                name="access-time"
                size={14}
                color={isOverdue() ? getColor('error') : getColor('textLight')}
                style={styles.dueDateIcon}
              />
              <Text
                style={[
                  styles.dueDate,
                  { color: getColor('textLight') },
                  isOverdue() && { color: getColor('error') },
                  todo.completed && styles.completedText
                ]}
              >
                {formatDueDate(todo.dueDate)}
              </Text>
            </View>
          )}

          {todo.tags && todo.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {todo.tags.slice(0, 2).map((tag, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tag, 
                    { backgroundColor: getColor('primary') }
                  ]}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {todo.tags.length > 2 && (
                <Text style={[styles.moreTagsText, { color: getColor('textLight') }]}>
                  +{todo.tags.length - 2}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: SPACING.m,
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.s,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.bold as any,
    flex: 1,
    marginRight: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.s,
    marginBottom: SPACING.s,
    lineHeight: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateIcon: {
    marginRight: SPACING.xs,
  },
  dueDate: {
    fontSize: FONT_SIZE.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.s,
    marginLeft: SPACING.xs,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  moreTagsText: {
    fontSize: FONT_SIZE.xs,
    marginLeft: SPACING.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
}); 