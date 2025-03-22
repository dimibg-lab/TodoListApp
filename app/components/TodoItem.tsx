import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StyleProp,
  ViewStyle,
  Platform
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Todo, Priority } from '../types';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { useTodo } from '../context/TodoContext';
import Tooltip from './Tooltip';

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
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
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
    
    // Проверка дали date е валидна дата
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Невалидна дата';
    }
    
    try {
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
    } catch (error) {
      console.error('Грешка при форматиране на дата:', error);
      return 'Грешка';
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

  // Променям функцията getPriorityInfo за да връща конкретни типове за icon и color
  const getPriorityInfo = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return { 
          color: 'priorityHigh' as const, 
          icon: 'priority-high' as const 
        };
      case 'medium':
        return { 
          color: 'priorityMedium' as const, 
          icon: 'trending-up' as const 
        };
      case 'low':
        return { 
          color: 'priorityLow' as const, 
          icon: 'trending-down' as const 
        };
      default:
        return { 
          color: 'priorityLow' as const, 
          icon: 'trending-down' as const 
        };
    }
  };

  // Показваме tooltip
  const showTooltip = (event: any) => {
    setTooltipPosition({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY
    });
    setTooltipVisible(true);
  };

  // Скриваме tooltip
  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  // Вземам информация за приоритета
  const priorityInfo = getPriorityInfo(todo.priority);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getColor('surface'),
          borderColor: getColor('border'),
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
        onLongPress={showTooltip}
        delayLongPress={500}
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
          
          <MaterialIcons
            name={priorityInfo.icon}
            size={16}
            color={getColor(priorityInfo.color)}
            style={styles.priorityIcon}
          />
        </View>
        
        {todo.description && (
          <Text
            style={[
              styles.description, 
              { color: getColor('textLight') },
              todo.completed && styles.completedText
            ]}
            numberOfLines={1}
          >
            {todo.description}
          </Text>
        )}

        {/* Показваме информация за задачи на открито */}
        {todo.isOutdoor && !todo.description && (
          <Text
            style={[
              styles.description, 
              { color: getColor('accent') },
              todo.completed && styles.completedText
            ]}
            numberOfLines={1}
          >
            Задача на открито
          </Text>
        )}
      </View>

      {/* Tooltip за чекбокса */}
      <Tooltip 
        visible={tooltipVisible}
        onClose={hideTooltip}
        text="Натиснете, за да маркирате задачата като изпълнена"
        position={tooltipPosition}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.m,
    marginBottom: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
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
    fontWeight: FONT_WEIGHT.medium as "500",
    flex: 1,
    marginRight: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.s,
    marginBottom: SPACING.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  priorityIcon: {
    marginLeft: SPACING.s,
  },
}); 