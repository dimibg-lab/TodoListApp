import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { useTodo } from '../context/TodoContext';
import { Button } from '../components/Button';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { AddEditTodoScreenProps } from '../navigation/types';
import { Priority } from '../types';
import * as Location from 'expo-location';
import { LocationReminderContextType, useLocationReminder } from '../context/LocationReminderContext';
import { useWeather } from '../context/WeatherContext';

const AddEditTodoScreen: React.FC<AddEditTodoScreenProps> = ({ route, navigation }) => {
  const { todoId, listId } = route.params || {};
  const { todos, lists, addTodo, updateTodo } = useTodo();
  const { getColor } = useAppTheme();
  const { hasLocationPermission, requestLocationPermission } = useLocationReminder();
  const { isOutdoorTaskRecommended } = useWeather();
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Референции към input полетата за по-лесна навигация
  const descriptionInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);
  const tagInputRef = useRef<TextInput>(null);
  
  // Нови стейт променливи за местоположение
  const [hasLocation, setHasLocation] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationRadius, setLocationRadius] = useState(100); // 100м по подразбиране
  
  // Добавяме новите състояния
  const [isOutdoor, setIsOutdoor] = useState<boolean>(false);
  const [weatherCheckLoading, setWeatherCheckLoading] = useState<boolean>(false);
  const [weatherMessage, setWeatherMessage] = useState<string | null>(null);
  
  // Стартиране на анимациите
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
    
    return () => {
      Keyboard.dismiss();
    };
  }, [fadeAnim, slideAnim]);
  
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
        setIsOutdoor(todo.isOutdoor || false);
        
        // Добавяме зареждане на данни за местоположение
        if (todo.location) {
          setHasLocation(true);
          setLocationName(todo.location.name);
          setLocationCoords({
            latitude: todo.location.latitude,
            longitude: todo.location.longitude
          });
          setLocationRadius(todo.location.radius);
        }
        
        // Ако имаме предупреждение за времето, показваме го
        if (todo.weatherRecommendation) {
          setWeatherMessage(todo.weatherRecommendation.message);
        }
      }
    }
  }, [todoId, todos]);
  
  // Помощни функции
  const isEditMode = !!todoId;
  
  const handleSave = async () => {
    console.log('AddEditTodoScreen: ЗАПОЧНА ОБРАБОТКА НА ЗАПАЗВАНЕ');
    
    try {
      if (!title.trim()) {
        // Анимация на грешката
        const shakeAnimation = Animated.sequence([
          Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]);
        
        shakeAnimation.start();
        Alert.alert('Грешка', 'Моля, въведете заглавие на задачата');
        console.log('AddEditTodoScreen: ГРЕШКА - ЛИПСВА ЗАГЛАВИЕ');
        return;
      }

      if (!selectedListId) {
        Alert.alert('Грешка', 'Моля, изберете списък');
        console.log('AddEditTodoScreen: ГРЕШКА - ЛИПСВА ИЗБРАН СПИСЪК');
        return;
      }
      
      // Подготвяме базисни и задължителни данни
      const baseTodoData = {
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        listId: selectedListId,
        priority: priority || 'medium',
        tags: tags || []
      };
      
      // Добавяме опционални данни
      const todoData = {
        ...baseTodoData,
        dueDate: hasDueDate ? dueDate : undefined,
        notes: notes?.trim() || undefined,
        isOutdoor,
        location: hasLocation && locationCoords ? {
          name: locationName?.trim() || 'Без име',
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
          radius: locationRadius,
          triggered: false
        } : undefined,
        weatherRecommendation: weatherMessage ? {
          message: weatherMessage,
          recommended: !weatherMessage.includes('Внимание:'),
          timestamp: new Date()
        } : undefined
      };
      
      console.log('AddEditTodoScreen: ПОДГОТВЕНА ЗАДАЧА ЗА ЗАПАЗВАНЕ:', JSON.stringify(todoData));
      
      // Показваме индикатор, че запазваме
      setIsLoading(true);
      
      try {
        // Анимация на запазване
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
        
        // ИЗЧАКВАМЕ асинхронната операция да завърши
        if (isEditMode && todoId) {
          console.log('AddEditTodoScreen: РЕЖИМ НА РЕДАКТИРАНЕ, ID:', todoId);
          await updateTodo(todoId, todoData);
          console.log('AddEditTodoScreen: УСПЕШНО РЕДАКТИРАНА ЗАДАЧА');
        } else {
          console.log('AddEditTodoScreen: РЕЖИМ НА ДОБАВЯНЕ');
          await addTodo(todoData);
          console.log('AddEditTodoScreen: ЗАДАЧАТА Е ДОБАВЕНА УСПЕШНО');
        }
        
        console.log('AddEditTodoScreen: ЗАПАЗВАНЕТО ПРИКЛЮЧИ УСПЕШНО');
        
        // Забавяме навигацията с малко, за да има време AsyncStorage операцията да приключи
        console.log('AddEditTodoScreen: ИЗЧАКВАНЕ ПРЕДИ ВРЪЩАНЕ...');
        setTimeout(() => {
          console.log('AddEditTodoScreen: ВРЪЩАНЕ КЪМ ПРЕДИШНИЯ ЕКРАН');
          navigation.goBack();
        }, 800); // Увеличаваме времето за изчакване
      } catch (innerError: any) {
        console.error('AddEditTodoScreen: ГРЕШКА ПРИ ЗАПАЗВАНЕ (детайли):', typeof innerError, JSON.stringify(innerError, Object.getOwnPropertyNames(innerError)));
        if (innerError instanceof Error) {
          console.error('AddEditTodoScreen: СЪОБЩЕНИЕ:', innerError.message);
          console.error('AddEditTodoScreen: STACK:', innerError.stack);
        }
        Alert.alert('Грешка', `Възникна проблем при запазването на задачата: ${innerError?.message || 'Неизвестна грешка'}`);
        setIsLoading(false);
      }
    } catch (outerError: any) {
      console.error('AddEditTodoScreen: ОБЩА ГРЕШКА:', typeof outerError, JSON.stringify(outerError, Object.getOwnPropertyNames(outerError)));
      if (outerError instanceof Error) {
        console.error('AddEditTodoScreen: СЪОБЩЕНИЕ:', outerError.message);
        console.error('AddEditTodoScreen: STACK:', outerError.stack);
      }
      Alert.alert('Грешка', `Възникна общ проблем: ${outerError?.message || 'Неизвестна грешка'}`);
      setIsLoading(false);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      // Анимация за добавяне на таг
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
    }
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

  const renderPriorityButton = (p: Priority, label: string, icon: string) => {
    const isSelected = priority === p;
    const color = getPriorityColor(p);
    
    return (
      <TouchableOpacity
        style={[
          styles.priorityButton,
          isSelected ? { 
            backgroundColor: color, 
            shadowColor: color,
            shadowOpacity: 0.3,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          } : { 
            borderColor: color,
            borderWidth: 1,
          }
        ]}
        onPress={() => setPriority(p)}
      >
        <MaterialIcons 
          name={icon as any} 
          size={20} 
          color={isSelected ? '#FFFFFF' : color} 
        />
        <Text 
          style={[
            styles.priorityButtonText, 
            { color: isSelected ? '#FFFFFF' : color }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
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

  // Анимирано рендериране на секция
  const renderSection = (children: React.ReactNode, index: number = 0) => {
    const delay = index * 50; // Забавяне за каскадна анимация
    
    return (
      <Animated.View
        style={[{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}
      >
        {children}
      </Animated.View>
    );
  };

  // Добавям нова функция за получаване на текущото местоположение
  const getCurrentLocation = async () => {
    try {
      if (!hasLocationPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Няма разрешение', 
            'За да използвате тази функция, трябва да дадете разрешение за достъп до местоположението.'
          );
          return;
        }
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      setLocationCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // Опит за получаване на адреса
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        if (address) {
          let locationText = '';
          if (address.name) locationText += address.name;
          if (address.street) {
            if (locationText) locationText += ', ';
            locationText += address.street;
          }
          if (address.city) {
            if (locationText) locationText += ', ';
            locationText += address.city;
          }
          
          setLocationName(locationText || 'Моята локация');
        } else {
          setLocationName('Моята локация');
        }
      } catch (error) {
        console.error('Грешка при reverse geocoding:', error);
        setLocationName('Моята локация');
      }
      
      setHasLocation(true);
    } catch (error) {
      console.error('Грешка при получаване на местоположение:', error);
      Alert.alert('Грешка', 'Не успяхме да определим вашето местоположение. Моля, опитайте отново.');
    }
  };
  
  // Функция за изчистване на местоположението
  const clearLocation = () => {
    setHasLocation(false);
    setLocationName('');
    setLocationCoords(null);
    setLocationRadius(100);
  };

  // Добавяме нова функция за проверка на времето за задача на открито
  const checkWeatherForOutdoorTask = async () => {
    if (!isOutdoor || !locationCoords) {
      Alert.alert('Няма достатъчно информация', 'За да проверите времето, задачата трябва да е маркирана като "на открито" и да имате добавено местоположение.');
      return;
    }
    
    setWeatherCheckLoading(true);
    
    try {
      const recommendation = await isOutdoorTaskRecommended(locationCoords.latitude, locationCoords.longitude);
      setWeatherMessage(recommendation.message);
      
      if (!recommendation.recommended) {
        Alert.alert('Предупреждение за времето', recommendation.message);
      } else {
        Alert.alert('Информация за времето', recommendation.message);
      }
    } catch (error) {
      console.error('Грешка при проверка на времето:', error);
      Alert.alert('Грешка', 'Не успяхме да проверим времето. Моля, опитайте отново по-късно.');
    } finally {
      setWeatherCheckLoading(false);
    }
  };

  // Добавяме нова секция за задача на открито
  const renderOutdoorTaskSection = () => (
    <View style={styles.formGroup}>
      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: getColor('text') }]}>Задача на открито</Text>
        <Switch
          value={isOutdoor}
          onValueChange={setIsOutdoor}
          trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
          thumbColor={Platform.OS === 'android' ? getColor('primary') : ''}
        />
      </View>
      
      {isOutdoor && (
        <View style={styles.outdoorInfoContainer}>
          <Text style={[styles.outdoorInfoText, { color: getColor('textLight') }]}>
            Задачи на открито зависят от метеорологичните условия. Добавете местоположение и проверете времето преди да планирате задачата.
          </Text>
          
          {hasLocation && locationCoords ? (
            <TouchableOpacity
              style={[
                styles.weatherCheckButton,
                { 
                  backgroundColor: getColor('info'),
                  opacity: weatherCheckLoading ? 0.7 : 1
                }
              ]}
              onPress={checkWeatherForOutdoorTask}
              disabled={weatherCheckLoading}
            >
              {weatherCheckLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="cloud" size={20} color="#FFFFFF" />
                  <Text style={styles.weatherCheckButtonText}>
                    Провери времето
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={[styles.outdoorWarningText, { color: getColor('warning') }]}>
              За да проверите времето, добавете местоположение в секцията по-долу.
            </Text>
          )}
          
          {weatherMessage && (
            <View 
              style={[
                styles.weatherMessageContainer, 
                { 
                  backgroundColor: weatherMessage.includes('Внимание:') 
                    ? getColor('warning') + '30' 
                    : getColor('success') + '30',
                  borderColor: weatherMessage.includes('Внимание:') 
                    ? getColor('warning') 
                    : getColor('success')
                }
              ]}
            >
              <MaterialIcons 
                name={weatherMessage.includes('Внимание:') ? 'warning' : 'check-circle'} 
                size={20} 
                color={weatherMessage.includes('Внимание:') ? getColor('warning') : getColor('success')} 
              />
              <Text 
                style={[
                  styles.weatherMessageText, 
                  { 
                    color: weatherMessage.includes('Внимание:') 
                      ? getColor('warning') 
                      : getColor('success') 
                  }
                ]}
              >
                {weatherMessage}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {/* Заглавие */}
            {renderSection(
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
                  returnKeyType="next"
                  onSubmitEditing={() => descriptionInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            )}

            {/* Описание */}
            {renderSection(
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: getColor('text') }]}>Описание</Text>
                <TextInput
                  ref={descriptionInputRef}
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
                  placeholder="Въведете описание"
                  placeholderTextColor={getColor('textLight')}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            , 1)}

            {/* Приоритет */}
            {renderSection(
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: getColor('text') }]}>Приоритет</Text>
                <View style={styles.priorityContainer}>
                  {renderPriorityButton('high', 'Висок', 'priority-high')}
                  {renderPriorityButton('medium', 'Среден', 'trending-up')}
                  {renderPriorityButton('low', 'Нисък', 'trending-down')}
                </View>
              </View>
            , 2)}

            {/* Задача на открито */}
            {renderSection(renderOutdoorTaskSection(), 3)}

            {/* Краен срок */}
            {renderSection(
              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: getColor('text') }]}>Краен срок</Text>
                  <Switch
                    value={hasDueDate}
                    onValueChange={setHasDueDate}
                    trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
                    thumbColor={Platform.OS === 'android' ? getColor('primary') : ''}
                  />
                </View>
                
                {hasDueDate && (
                  <View style={styles.dateTimeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        { 
                          backgroundColor: getColor('surface'),
                          borderColor: getColor('border')
                        }
                      ]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <MaterialIcons name="calendar-today" size={20} color={getColor('primary')} />
                      <Text style={[styles.dateButtonText, { color: getColor('text') }]}>
                        {formatDateForDisplay(dueDate)}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        { 
                          backgroundColor: getColor('surface'),
                          borderColor: getColor('border')
                        }
                      ]}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <MaterialIcons name="access-time" size={20} color={getColor('primary')} />
                      <Text style={[styles.dateButtonText, { color: getColor('text') }]}>
                        {formatTimeForDisplay(dueDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Дата и време пикери */}
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
                
                {showTimePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            , 4)}

            {/* Списък */}
            {renderSection(
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: getColor('text') }]}>Списък</Text>
                <TouchableOpacity
                  style={[
                    styles.listButton,
                    { 
                      backgroundColor: getColor('surface'),
                      borderColor: getColor('border')
                    }
                  ]}
                  onPress={handleSelectList}
                >
                  <Text style={[styles.listButtonText, { color: getColor('text') }]}>
                    {lists.find(l => l.id === selectedListId)?.name || 'Избери списък'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={getColor('text')} />
                </TouchableOpacity>
              </View>
            , 5)}

            {/* Етикети */}
            {renderSection(
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: getColor('text') }]}>Етикети</Text>
                <View style={styles.tagsInputContainer}>
                  <TextInput
                    ref={tagInputRef}
                    style={[
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
                    returnKeyType="done"
                    onSubmitEditing={handleAddTag}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addTagButton,
                      { backgroundColor: getColor('primary') }
                    ]}
                    onPress={handleAddTag}
                  >
                    <MaterialIcons name="add" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                
                {tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.tag, 
                          { backgroundColor: getColor('primary') }
                        ]}
                      >
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity
                          style={styles.removeTagButton}
                          onPress={() => handleRemoveTag(tag)}
                        >
                          <MaterialIcons name="close" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            , 6)}

            {/* Бележки */}
            {renderSection(
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: getColor('text') }]}>Бележки</Text>
                <TextInput
                  ref={notesInputRef}
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
                  placeholder="Въведете допълнителни бележки"
                  placeholderTextColor={getColor('textLight')}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            , 7)}
            
            {/* Местоположение */}
            {renderSection(
              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: getColor('text') }]}>Местоположение</Text>
                  <Switch
                    value={hasLocation}
                    onValueChange={setHasLocation}
                    trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
                    thumbColor={Platform.OS === 'android' ? getColor('primary') : ''}
                  />
                </View>
                
                {hasLocation && (
                  <View style={styles.locationContainer}>
                    <View style={styles.locationInputRow}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.locationNameInput,
                          { 
                            backgroundColor: getColor('surface'),
                            borderColor: getColor('border'),
                            color: getColor('text')
                          }
                        ]}
                        value={locationName}
                        onChangeText={setLocationName}
                        placeholder="Име на местоположението"
                        placeholderTextColor={getColor('textLight')}
                      />
                      <TouchableOpacity
                        style={[
                          styles.locationButton,
                          { backgroundColor: getColor('primary') }
                        ]}
                        onPress={getCurrentLocation}
                      >
                        <MaterialIcons name="my-location" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    {locationCoords ? (
                      <View style={styles.locationDetailsContainer}>
                        <View style={styles.locationCoordinates}>
                          <Text style={[styles.locationText, { color: getColor('textLight') }]}>
                            Ширина: {locationCoords.latitude.toFixed(6)}
                          </Text>
                          <Text style={[styles.locationText, { color: getColor('textLight') }]}>
                            Дължина: {locationCoords.longitude.toFixed(6)}
                          </Text>
                        </View>
                        
                        <View style={styles.radiusContainer}>
                          <Text style={[styles.locationText, { color: getColor('text') }]}>
                            Радиус: {locationRadius} м
                          </Text>
                          <Slider
                            style={styles.slider}
                            minimumValue={50}
                            maximumValue={500}
                            step={10}
                            value={locationRadius}
                            onValueChange={setLocationRadius}
                            minimumTrackTintColor={getColor('primary')}
                            maximumTrackTintColor={getColor('disabled')}
                            thumbTintColor={getColor('primary')}
                          />
                          <View style={styles.radiusLabels}>
                            <Text style={[styles.radiusLabel, { color: getColor('textLight') }]}>50м</Text>
                            <Text style={[styles.radiusLabel, { color: getColor('textLight') }]}>500м</Text>
                          </View>
                        </View>
                        
                        <TouchableOpacity
                          style={[
                            styles.clearLocationButton,
                            { borderColor: getColor('error') }
                          ]}
                          onPress={clearLocation}
                        >
                          <MaterialIcons name="delete-outline" size={20} color={getColor('error')} />
                          <Text style={[styles.clearLocationText, { color: getColor('error') }]}>
                            Премахни местоположението
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.noLocationContainer}>
                        <Text style={[styles.noLocationText, { color: getColor('textLight') }]}>
                          Натиснете бутона за да добавите вашето текущо местоположение или въведете ръчно.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            , 8)}
          </View>
        </ScrollView>
        
        {/* Бутони */}
        <View 
          style={[
            styles.footer, 
            { 
              borderTopColor: getColor('border'),
              backgroundColor: getColor('background') 
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getColor('error') }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="close" size={22} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Отказ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getColor('primary') }]}
            onPress={handleSave}
          >
            <MaterialIcons name={isEditMode ? "save" : "check"} size={22} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>{isEditMode ? 'Запази' : 'Добави'}</Text>
          </TouchableOpacity>
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
    padding: SPACING.m,
  },
  formContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: SPACING.m,
  },
  label: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    fontSize: FONT_SIZE.m,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: SPACING.m,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    marginHorizontal: SPACING.xs,
  },
  priorityButtonText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
    marginLeft: SPACING.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    flex: 0.48,
  },
  dateButtonText: {
    marginLeft: SPACING.s,
    fontSize: FONT_SIZE.s,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
  },
  listButtonText: {
    fontSize: FONT_SIZE.m,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    fontSize: FONT_SIZE.m,
    marginRight: SPACING.s,
  },
  addTagButton: {
    width: 48,
    height: 48,
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
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    margin: SPACING.xs,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.s,
    marginRight: SPACING.xs,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.m,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
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
    fontWeight: FONT_WEIGHT.medium as any,
    marginTop: 4,
    textAlign: 'center',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  
  // Нови стилове за местоположението
  locationContainer: {
    marginTop: SPACING.s,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationNameInput: {
    flex: 1,
    marginRight: SPACING.s,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDetailsContainer: {
    marginTop: SPACING.s,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  locationCoordinates: {
    marginBottom: SPACING.s,
  },
  locationText: {
    fontSize: FONT_SIZE.s,
    marginBottom: 2,
  },
  radiusContainer: {
    marginVertical: SPACING.s,
  },
  slider: {
    height: 40,
    width: '100%',
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
  },
  radiusLabel: {
    fontSize: FONT_SIZE.xs,
  },
  clearLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.s,
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
  },
  clearLocationText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.s,
  },
  noLocationContainer: {
    padding: SPACING.m,
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: FONT_SIZE.s,
    textAlign: 'center',
  },
  
  // Стилове за секцията "Задача на открито"
  outdoorInfoContainer: {
    marginTop: SPACING.s,
  },
  outdoorInfoText: {
    fontSize: FONT_SIZE.s,
    marginBottom: SPACING.s,
  },
  outdoorWarningText: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  weatherCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.s,
  },
  weatherCheckButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.s,
    marginLeft: SPACING.xs,
  },
  weatherMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    marginTop: SPACING.s,
  },
  weatherMessageText: {
    fontSize: FONT_SIZE.s,
    marginLeft: SPACING.xs,
    flex: 1,
  },
});

export default AddEditTodoScreen; 