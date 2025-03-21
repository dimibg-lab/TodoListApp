import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface RepeatOptions {
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number[];
  endDate?: Date;
}

interface TodoAdvancedFeaturesProps {
  subTasks: SubTask[];
  attachments: Attachment[];
  repeatOptions: RepeatOptions;
  onSubTasksChange: (subTasks: SubTask[]) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onRepeatOptionsChange: (repeatOptions: RepeatOptions) => void;
}

const TodoAdvancedFeatures: React.FC<TodoAdvancedFeaturesProps> = ({
  subTasks,
  attachments,
  repeatOptions,
  onSubTasksChange,
  onAttachmentsChange,
  onRepeatOptionsChange,
}) => {
  const { getColor } = useAppTheme();
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  // Функция за добавяне на нова под-задача
  const addSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    
    const newSubTask: SubTask = {
      id: Date.now().toString(),
      title: newSubTaskTitle.trim(),
      completed: false,
    };
    
    onSubTasksChange([...subTasks, newSubTask]);
    setNewSubTaskTitle('');
  };

  // Функция за превключване на състоянието на под-задача
  const toggleSubTask = (id: string) => {
    const updatedSubTasks = subTasks.map(subTask => {
      if (subTask.id === id) {
        return { ...subTask, completed: !subTask.completed };
      }
      return subTask;
    });
    
    onSubTasksChange(updatedSubTasks);
  };

  // Функция за изтриване на под-задача
  const deleteSubTask = (id: string) => {
    const updatedSubTasks = subTasks.filter(subTask => subTask.id !== id);
    onSubTasksChange(updatedSubTasks);
  };

  // Функция за избор на прикачен файл
  const selectAttachment = () => {
    Alert.alert(
      'Прикачване на файл',
      'Тази функционалност ще ви позволи да прикачите файл към задачата',
      [{ text: 'OK' }]
    );
    
    // Тук би трябвало да има код за избор на файл от устройството
    // и добавянето му към attachments
  };

  // Функция за изтриване на прикачен файл
  const deleteAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(attachment => attachment.id !== id);
    onAttachmentsChange(updatedAttachments);
  };

  // Функция за превключване на повтарящата се задача
  const toggleRepeat = () => {
    onRepeatOptionsChange({
      ...repeatOptions,
      isEnabled: !repeatOptions.isEnabled,
    });
  };

  // Функция за промяна на честотата на повторение
  const changeRepeatFrequency = (frequency: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    onRepeatOptionsChange({
      ...repeatOptions,
      frequency,
    });
  };

  return (
    <View style={styles.container}>
      {/* Секция за под-задачи */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
          Под-задачи
        </Text>
        <View style={styles.subTasksContainer}>
          {subTasks.map(subTask => (
            <View 
              key={subTask.id} 
              style={[
                styles.subTaskItem, 
                { borderBottomColor: getColor('border') }
              ]}
            >
              <TouchableOpacity
                style={styles.subTaskCheckbox}
                onPress={() => toggleSubTask(subTask.id)}
              >
                <View style={[
                  styles.checkbox,
                  { borderColor: getColor('primary') },
                  subTask.completed && { backgroundColor: getColor('primary') }
                ]}>
                  {subTask.completed && (
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
              <Text 
                style={[
                  styles.subTaskTitle, 
                  { color: getColor('text') },
                  subTask.completed && styles.completedText
                ]}
              >
                {subTask.title}
              </Text>
              <TouchableOpacity
                style={styles.deleteSubTaskButton}
                onPress={() => deleteSubTask(subTask.id)}
              >
                <MaterialIcons name="close" size={20} color={getColor('error')} />
              </TouchableOpacity>
            </View>
          ))}
          
          <View style={styles.addSubTaskContainer}>
            <TextInput
              style={[
                styles.addSubTaskInput, 
                { 
                  color: getColor('text'),
                  borderColor: getColor('border'),
                  backgroundColor: getColor('background')
                }
              ]}
              placeholder="Добавете под-задача"
              placeholderTextColor={getColor('textLight')}
              value={newSubTaskTitle}
              onChangeText={setNewSubTaskTitle}
              onSubmitEditing={addSubTask}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.addSubTaskButton,
                { backgroundColor: getColor('primary') }
              ]}
              onPress={addSubTask}
              disabled={!newSubTaskTitle.trim()}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Секция за прикачени файлове */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
          Прикачени файлове
        </Text>
        <View style={styles.attachmentsContainer}>
          {attachments.length > 0 ? (
            attachments.map(attachment => (
              <View 
                key={attachment.id} 
                style={[
                  styles.attachmentItem, 
                  { 
                    backgroundColor: getColor('surface'),
                    borderColor: getColor('border')
                  }
                ]}
              >
                <MaterialIcons
                  name={attachment.type === 'image' ? 'image' : 'insert-drive-file'}
                  size={24}
                  color={getColor('primary')}
                  style={styles.attachmentIcon}
                />
                <Text style={[styles.attachmentName, { color: getColor('text') }]}>
                  {attachment.name}
                </Text>
                <TouchableOpacity
                  style={styles.deleteAttachmentButton}
                  onPress={() => deleteAttachment(attachment.id)}
                >
                  <MaterialIcons name="close" size={20} color={getColor('textLight')} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: getColor('textLight') }]}>
              Няма прикачени файлове
            </Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.attachButton, 
              { 
                borderColor: getColor('primary'),
              }
            ]}
            onPress={selectAttachment}
          >
            <MaterialIcons name="attach-file" size={20} color={getColor('primary')} />
            <Text style={[styles.attachButtonText, { color: getColor('primary') }]}>
              Прикачи файл
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Секция за повтаряне на задачата */}
      <View style={styles.sectionContainer}>
        <View style={styles.repeatHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
            Повтаряща се задача
          </Text>
          <Switch
            value={repeatOptions.isEnabled}
            onValueChange={toggleRepeat}
            trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        {repeatOptions.isEnabled && (
          <View style={styles.repeatOptionsContainer}>
            <Text style={[styles.repeatLabel, { color: getColor('textLight') }]}>
              Повтаряй:
            </Text>
            <View style={styles.repeatFrequencyContainer}>
              <TouchableOpacity
                style={[
                  styles.repeatFrequencyButton,
                  repeatOptions.frequency === 'daily' && { 
                    backgroundColor: getColor('primary'),
                  }
                ]}
                onPress={() => changeRepeatFrequency('daily')}
              >
                <Text style={[
                  styles.repeatFrequencyText,
                  { color: repeatOptions.frequency === 'daily' ? '#FFFFFF' : getColor('text') }
                ]}>
                  Ежедневно
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.repeatFrequencyButton,
                  repeatOptions.frequency === 'weekly' && { 
                    backgroundColor: getColor('primary'),
                  }
                ]}
                onPress={() => changeRepeatFrequency('weekly')}
              >
                <Text style={[
                  styles.repeatFrequencyText,
                  { color: repeatOptions.frequency === 'weekly' ? '#FFFFFF' : getColor('text') }
                ]}>
                  Седмично
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.repeatFrequencyButton,
                  repeatOptions.frequency === 'monthly' && { 
                    backgroundColor: getColor('primary'),
                  }
                ]}
                onPress={() => changeRepeatFrequency('monthly')}
              >
                <Text style={[
                  styles.repeatFrequencyText,
                  { color: repeatOptions.frequency === 'monthly' ? '#FFFFFF' : getColor('text') }
                ]}>
                  Месечно
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.repeatFrequencyButton,
                  repeatOptions.frequency === 'custom' && { 
                    backgroundColor: getColor('primary'),
                  }
                ]}
                onPress={() => changeRepeatFrequency('custom')}
              >
                <Text style={[
                  styles.repeatFrequencyText,
                  { color: repeatOptions.frequency === 'custom' ? '#FFFFFF' : getColor('text') }
                ]}>
                  По избор
                </Text>
              </TouchableOpacity>
            </View>
            
            {repeatOptions.frequency === 'custom' && (
              <Text style={[styles.customRepeatText, { color: getColor('textLight') }]}>
                Натиснете, за да настроите персонализирано повторение
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.m,
  },
  sectionContainer: {
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.s,
  },
  subTasksContainer: {
    marginTop: SPACING.xs,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
  },
  subTaskCheckbox: {
    marginRight: SPACING.s,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.s / 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTaskTitle: {
    flex: 1,
    fontSize: FONT_SIZE.m,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  deleteSubTaskButton: {
    padding: SPACING.xs,
  },
  addSubTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.s,
  },
  addSubTaskInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.s,
    paddingHorizontal: SPACING.m,
    marginRight: SPACING.s,
  },
  addSubTaskButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentsContainer: {
    marginTop: SPACING.xs,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.s,
    marginBottom: SPACING.s,
    borderWidth: 1,
  },
  attachmentIcon: {
    marginRight: SPACING.s,
  },
  attachmentName: {
    flex: 1,
    fontSize: FONT_SIZE.m,
  },
  deleteAttachmentButton: {
    padding: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.m,
    fontStyle: 'italic',
    marginBottom: SPACING.s,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.s,
    borderWidth: 1,
    marginTop: SPACING.xs,
  },
  attachButtonText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  repeatHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  repeatOptionsContainer: {
    marginTop: SPACING.s,
  },
  repeatLabel: {
    fontSize: FONT_SIZE.m,
    marginBottom: SPACING.s,
  },
  repeatFrequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  repeatFrequencyButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.s,
    borderRadius: BORDER_RADIUS.s,
    marginRight: SPACING.s,
    marginBottom: SPACING.s,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  repeatFrequencyText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  customRepeatText: {
    fontSize: FONT_SIZE.s,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
});

export default TodoAdvancedFeatures; 