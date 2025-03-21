import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useTodo } from '../context/TodoContext';
import { Button } from '../components/Button';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { AddEditTodoScreenProps } from '../navigation/types';
import { Priority } from '../types';

const AddEditTodoScreen: React.FC<AddEditTodoScreenProps> = ({ route, navigation }) => {
  const { todoId, listId } = route.params || {};
  const { todos, lists, addTodo, updateTodo } = useTodo();
  const { getColor } = useAppTheme();
  
  // Състояние на формата
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedListId, setSelectedListId] = useState(listId || lists[0]?.id || '');
  
  // Зареждане на данни, ако е редактиране
  useEffect(() => {
    if (todoId) {
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
        setTitle(todo.title);
        setDescription(todo.description || '');
        setPriority(todo.priority);
        setHasDueDate(!!todo.dueDate);
        setDueDate(todo.dueDate ? new Date(todo.dueDate) : new Date());
        setTags(todo.tags || []);
        setNotes(todo.notes || '');
        setSelectedListId(todo.listId);
      }
    }
  }, [todoId, todos]);
  
  // Помощни функции
  const isEditMode = !!todoId;
  
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Грешка', 'Моля, въведете заглавие на задачата');
      return;
    }

    if (!selectedListId) {
      Alert.alert('Грешка', 'Моля, изберете списък');
      return;
    }
    
    const todoData = {
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      dueDate: hasDueDate ? dueDate : undefined,
      tags,
      notes: notes.trim() || undefined,
      listId: selectedListId,
    };
    
    if (isEditMode) {
      updateTodo(todoId, todoData);
    } else {
      addTodo(todoData);
    }
    
    navigation.goBack();
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(dueDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDueDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'high':
        return getColor('priorityHigh');
      case 'medium':
        return getColor('priorityMedium');
      case 'low':
        return getColor('priorityLow');
      default:
        return getColor('primary');
    }
  };

  const handleSelectList = () => {
    if (lists.length <= 1) {
      Alert.alert('Информация', 'Няма други списъци. Създайте нов списък от раздела Списъци.');
      return;
    }

    Alert.alert(
      'Избиране на списък',
      'Изберете списък за тази задача:',
      [
        ...lists.map(list => ({
          text: list.name,
          onPress: () => setSelectedListId(list.id),
        })),
        {
          text: 'Отказ',
          style: 'cancel',
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {/* Заглавие */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: getColor('text') }]}>Заглавие *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: getColor('surface'),
                    borderColor: getColor('border'),
                    color: getColor('text')
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Въведете заглавие на задачата"
                placeholderTextColor={getColor('textLight')}
              />
            </View>

            {/* Описание */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: getColor('text') }]}>Описание</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  { 
                    backgroundColor: getColor('surface'),
                    borderColor: getColor('border'),
                    color: getColor('text')
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Въведете описание (по избор)"
                placeholderTextColor={getColor('textLight')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Приоритет */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: getColor('text') }]}>Приоритет</Text>
              <View style={styles.priorityContainer}>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'high' && { 
                      backgroundColor: getPriorityColor('high'),
                      borderColor: getPriorityColor('high')
                    },
                    { borderColor: getColor('border') }
                  ]}
                  onPress={() => setPriority('high')}
                >
                  <Text style={[
                    styles.priorityText,
                    { color: priority === 'high' ? '#FFFFFF' : getPriorityColor('high') }
                  ]}>
                    Висок
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'medium' && { 
                      backgroundColor: getPriorityColor('medium'),
                      borderColor: getPriorityColor('medium')
                    },
                    { borderColor: getColor('border') }
                  ]}
                  onPress={() => setPriority('medium')}
                >
                  <Text style={[
                    styles.priorityText,
                    { color: priority === 'medium' ? '#FFFFFF' : getPriorityColor('medium') }
                  ]}>
                    Среден
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'low' && { 
                      backgroundColor: getPriorityColor('low'),
                      borderColor: getPriorityColor('low')
                    },
                    { borderColor: getColor('border') }
                  ]}
                  onPress={() => setPriority('low')}
                >
                  <Text style={[
                    styles.priorityText,
                    { color: priority === 'low' ? '#FFFFFF' : getPriorityColor('low') }
                  ]}>
                    Нисък
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Краен срок */}
            <View style={styles.formGroup}>
              <View style={styles.dueDateHeader}>
                <Text style={[styles.label, { color: getColor('text') }]}>Краен срок</Text>
                <Switch
                  trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
                  thumbColor="#FFFFFF"
                  onValueChange={setHasDueDate}
                  value={hasDueDate}
                />
              </View>
              
              {hasDueDate && (
                <View style={styles.dateTimeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.datePickerButton,
                      { 
                        backgroundColor: getColor('surface'),
                        borderColor: getColor('border')
                      }
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialIcons name="calendar-today" size={20} color={getColor('primary')} />
                    <Text style={[styles.dateTimeText, { color: getColor('text') }]}>
                      {formatDateForDisplay(dueDate)}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.datePickerButton,
                      { 
                        backgroundColor: getColor('surface'),
                        borderColor: getColor('border')
                      }
                    ]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <MaterialIcons name="access-time" size={20} color={getColor('primary')} />
                    <Text style={[styles.dateTimeText, { color: getColor('text') }]}>
                      {formatTimeForDisplay(dueDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
              
              {showTimePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            {/* Етикети */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: getColor('text') }]}>Етикети</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.tagInput,
                    { 
                      backgroundColor: getColor('surface'),
                      borderColor: getColor('border'),
                      color: getColor('text')
                    }
                  ]}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Добавете етикет"
                  placeholderTextColor={getColor('textLight')}
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity
                  style={[styles.addTagButton, { backgroundColor: getColor('primary') }]}
                  onPress={handleAddTag}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View 
                      key={index} 
                      style={[styles.tag, { backgroundColor: getColor('primary') }]}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                        <MaterialIcons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Бележки */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: getColor('text') }]}>Бележки</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  { 
                    backgroundColor: getColor('surface'),
                    borderColor: getColor('border'),
                    color: getColor('text')
                  }
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Добавете допълнителни бележки"
                placeholderTextColor={getColor('textLight')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Избор на списък */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: getColor('text') }]}>Списък</Text>
              <TouchableOpacity
                style={[
                  styles.listSelector,
                  { 
                    backgroundColor: getColor('surface'),
                    borderColor: getColor('border')
                  }
                ]}
                onPress={handleSelectList}
              >
                <Text style={[styles.listSelectorText, { color: getColor('text') }]}>
                  {lists.find(list => list.id === selectedListId)?.name || 'Избери списък'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={getColor('text')} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Отказ"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={isEditMode ? "Запази" : "Добави"}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.m,
  },
  formContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: SPACING.l,
  },
  label: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.xs,
  },
  input: {
    fontSize: FONT_SIZE.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
  },
  multilineInput: {
    minHeight: 100,
    padding: SPACING.m,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  dueDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    flex: 0.48,
  },
  dateTimeText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.m,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: SPACING.s,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.s,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.s,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagText: {
    color: '#FFFFFF',
    marginRight: SPACING.xs,
    fontSize: FONT_SIZE.s,
  },
  listSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
  },
  listSelectorText: {
    fontSize: FONT_SIZE.m,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.s,
  },
  saveButton: {
    flex: 1,
    marginLeft: SPACING.s,
  },
});

export default AddEditTodoScreen; 