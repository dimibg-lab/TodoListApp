import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';
import { TodoList, Priority } from '../types';

interface ConvertIdeaDialogProps {
  visible: boolean;
  onClose: () => void;
  onConvert: (listId: string, priority: Priority) => void;
  lists: TodoList[];
}

const ConvertIdeaDialog: React.FC<ConvertIdeaDialogProps> = ({
  visible,
  onClose,
  onConvert,
  lists
}) => {
  const { getColor } = useAppTheme();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  
  // Функция за затваряне с нулиране на избраното
  const handleClose = () => {
    setSelectedListId(null);
    setSelectedPriority('medium');
    onClose();
  };
  
  // Функция за финализиране на избора
  const handleConvert = () => {
    if (selectedListId) {
      onConvert(selectedListId, selectedPriority);
      handleClose();
    }
  };
  
  // Получаване на текст за приоритета
  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'Висок';
      case 'medium':
        return 'Среден';
      case 'low':
        return 'Нисък';
      default:
        return 'Неизвестен';
    }
  };
  
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
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: getColor('surface') }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: getColor('text') }]}>
                  Превръщане в задача
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={getColor('textLight')} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
                Изберете списък
              </Text>
              <ScrollView style={styles.listsContainer}>
                {lists.map(list => (
                  <TouchableOpacity
                    key={list.id}
                    style={[
                      styles.listItem,
                      selectedListId === list.id && { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
                    ]}
                    onPress={() => setSelectedListId(list.id)}
                  >
                    <View style={styles.listItemContent}>
                      <Ionicons
                        name="list"
                        size={20}
                        color={selectedListId === list.id ? getColor('primary') : getColor('textLight')}
                        style={styles.listIcon}
                      />
                      <Text
                        style={[
                          styles.listName,
                          { color: getColor('text') },
                          selectedListId === list.id && { color: getColor('primary') }
                        ]}
                      >
                        {list.name}
                      </Text>
                    </View>
                    {selectedListId === list.id && (
                      <Ionicons name="checkmark" size={20} color={getColor('primary')} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
                Изберете приоритет
              </Text>
              <View style={styles.priorityContainer}>
                {(['high', 'medium', 'low'] as Priority[]).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      {
                        borderColor: getPriorityColor(priority),
                        backgroundColor:
                          selectedPriority === priority
                            ? `${getPriorityColor(priority)}20`
                            : 'transparent'
                      }
                    ]}
                    onPress={() => setSelectedPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(priority) }
                      ]}
                    >
                      {getPriorityLabel(priority)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: getColor('border') }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.cancelButtonText, { color: getColor('text') }]}>
                    Отказ
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.convertButton,
                    { backgroundColor: getColor('primary') },
                    !selectedListId && { opacity: 0.5 }
                  ]}
                  onPress={handleConvert}
                  disabled={!selectedListId}
                >
                  <Text style={styles.convertButtonText}>
                    Превърни
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: SPACING.m,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as "700",
  },
  closeButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as "500",
    marginBottom: SPACING.s,
  },
  listsContainer: {
    maxHeight: 200,
    marginBottom: SPACING.m,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    marginRight: SPACING.s,
  },
  listName: {
    fontSize: FONT_SIZE.m,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.l,
  },
  priorityOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  priorityText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as "500",
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    marginRight: SPACING.s,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.m,
  },
  convertButton: {
    borderRadius: 8,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
  },
  convertButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as "500",
  }
});

export default ConvertIdeaDialog; 