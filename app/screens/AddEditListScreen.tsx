import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodo } from '../context/TodoContext';
import { Button } from '../components/Button';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { AddEditListScreenProps } from '../navigation/types';

const AddEditListScreen: React.FC<AddEditListScreenProps> = ({ route, navigation }) => {
  const { listId } = route.params || {};
  const { lists, addList, updateList } = useTodo();
  const { getColor } = useAppTheme();
  
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  
  const isEditMode = !!listId;
  
  // Зареждане на данни при режим на редактиране
  useEffect(() => {
    if (isEditMode) {
      const list = lists.find(list => list.id === listId);
      if (list) {
        setName(list.name);
      } else {
        Alert.alert('Грешка', 'Списъкът не е намерен');
        navigation.goBack();
      }
    }
  }, [isEditMode, listId, lists, navigation]);
  
  // Валидация на формата
  const validateForm = () => {
    let isValid = true;
    
    // Валидация на името
    if (!name.trim()) {
      setNameError('Моля, въведете име на списъка');
      isValid = false;
    } else {
      setNameError('');
    }
    
    return isValid;
  };
  
  // Запазване на списъка
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditMode) {
        await updateList(listId, name.trim());
        Alert.alert('Успешно', 'Списъкът е актуализиран успешно');
      } else {
        await addList(name.trim());
        Alert.alert('Успешно', 'Списъкът е създаден успешно');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Грешка', 'Възникна проблем при запазването на списъка');
      console.error('Error saving list:', error);
    }
  };
  
  // Отказ от операцията
  const handleCancel = () => {
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: getColor('text') }]}>
              {isEditMode ? 'Редактиране на списък' : 'Нов списък'}
            </Text>
          </View>
          
          <View style={[styles.formContainer, { backgroundColor: getColor('surface') }]}>
            {/* Поле за име */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: getColor('text') }]}>
                Име на списъка
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    borderColor: nameError ? getColor('error') : getColor('border'),
                    color: getColor('text'),
                    backgroundColor: getColor('background')
                  }
                ]}
                placeholder="Въведете име на списъка"
                placeholderTextColor={getColor('textLight')}
                value={name}
                onChangeText={setName}
                autoFocus
              />
              {nameError ? (
                <Text style={[styles.errorText, { color: getColor('error') }]}>
                  {nameError}
                </Text>
              ) : null}
            </View>
            
            {/* Бързи шаблони за списъци */}
            <View style={styles.templateContainer}>
              <Text style={[styles.templateTitle, { color: getColor('textLight') }]}>
                Бързи шаблони
              </Text>
              <View style={styles.templateButtons}>
                <TouchableOpacity
                  style={[styles.templateButton, { backgroundColor: getColor('primary') }]}
                  onPress={() => setName('Лични задачи')}
                >
                  <MaterialIcons name="person" size={18} color="#FFFFFF" />
                  <Text style={styles.templateButtonText}>Лични</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.templateButton, { backgroundColor: getColor('info') }]}
                  onPress={() => setName('Работа')}
                >
                  <MaterialIcons name="work" size={18} color="#FFFFFF" />
                  <Text style={styles.templateButtonText}>Работа</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.templateButton, { backgroundColor: getColor('success') }]}
                  onPress={() => setName('Покупки')}
                >
                  <MaterialIcons name="shopping-cart" size={18} color="#FFFFFF" />
                  <Text style={styles.templateButtonText}>Покупки</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.templateButton, { backgroundColor: getColor('warning') }]}
                  onPress={() => setName('Идеи')}
                >
                  <MaterialIcons name="lightbulb" size={18} color="#FFFFFF" />
                  <Text style={styles.templateButtonText}>Идеи</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { backgroundColor: getColor('background') }]}>
          <Button
            title="Отказ"
            onPress={handleCancel}
            style={{ flex: 1, marginRight: SPACING.m }}
            variant="outline"
          />
          <Button
            title={isEditMode ? 'Запази' : 'Създай'}
            onPress={handleSave}
            style={{ flex: 1 }}
            leftIcon={
              <MaterialIcons 
                name={isEditMode ? 'save' : 'add-circle'} 
                size={20} 
                color="#FFFFFF" 
              />
            }
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
  scrollContent: {
    padding: SPACING.m,
    flexGrow: 1,
  },
  header: {
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  formContainer: {
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: SPACING.m,
  },
  inputLabel: {
    fontSize: FONT_SIZE.m,
    marginBottom: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.s,
    paddingHorizontal: SPACING.m,
    fontSize: FONT_SIZE.m,
  },
  errorText: {
    fontSize: FONT_SIZE.s,
    marginTop: SPACING.xs,
  },
  templateContainer: {
    marginTop: SPACING.m,
  },
  templateTitle: {
    fontSize: FONT_SIZE.s,
    marginBottom: SPACING.s,
  },
  templateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.s,
    borderRadius: BORDER_RADIUS.s,
    margin: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  templateButtonText: {
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

export default AddEditListScreen; 