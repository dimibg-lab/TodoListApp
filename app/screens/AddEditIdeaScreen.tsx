import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../utils/theme';
import { useTodo } from '../context/TodoContext';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/theme';
import TagsInput from '../components/TagsInput';
import { Idea } from '../types';
import { IdeasStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<IdeasStackParamList, 'AddEditIdea'>;

const AddEditIdeaScreen: React.FC<Props> = ({ navigation, route }) => {
  const { ideaId } = route.params || {};
  const { ideas, addIdea, updateIdea } = useTodo();
  const { getColor } = useAppTheme();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Заглавие на екрана
  useEffect(() => {
    navigation.setOptions({
      title: ideaId ? 'Редактиране на идея' : 'Нова идея',
    });
  }, [navigation, ideaId]);
  
  // Зареждане на идеята за редактиране, ако има такава
  useEffect(() => {
    if (ideaId) {
      setIsLoading(true);
      const idea = ideas.find(idea => idea.id === ideaId);
      if (idea) {
        setTitle(idea.title);
        setDescription(idea.description || '');
        setTags(idea.tags || []);
        setIsFavorite(idea.isFavorite || false);
      } else {
        Alert.alert('Грешка', 'Идеята не е намерена.');
        navigation.goBack();
      }
      setIsLoading(false);
    }
  }, [ideaId, ideas, navigation]);
  
  // Функция за запазване на идеята
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Грешка', 'Моля, въведете заглавие.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (ideaId) {
        await updateIdea(ideaId, {
          title: title.trim(),
          description: description.trim(),
          tags,
        });
        Alert.alert('Успешно', 'Идеята беше обновена успешно.');
      } else {
        await addIdea({
          title: title.trim(),
          description: description.trim(),
          tags,
        });
        Alert.alert('Успешно', 'Идеята беше добавена успешно.');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Грешка при запазване на идея:', error);
      Alert.alert('Грешка', 'Възникна проблем при запазването на идеята.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Функция за превключване на любима/не любима
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  // Показваме индикатор за зареждане докато данните се зареждат
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: getColor('background') }]}>
        <ActivityIndicator size="large" color={getColor('primary')} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: getColor('background') }]}>
        <View style={styles.formContainer}>
          {/* Поле за заглавие */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: getColor('text') }]}>
              Заглавие*
            </Text>
            <View style={[
              styles.inputContainer, 
              { 
                borderColor: getColor('border'),
                backgroundColor: getColor('surface') 
              }
            ]}>
              <TextInput
                style={[styles.input, { color: getColor('text') }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Въведете заглавие..."
                placeholderTextColor={getColor('textLight')}
                maxLength={100}
              />
            </View>
          </View>
          
          {/* Поле за описание */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: getColor('text') }]}>
              Описание
            </Text>
            <View style={[
              styles.textAreaContainer, 
              { 
                borderColor: getColor('border'),
                backgroundColor: getColor('surface') 
              }
            ]}>
              <TextInput
                style={[styles.textArea, { color: getColor('text') }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Въведете описание..."
                placeholderTextColor={getColor('textLight')}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Поле за тагове */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: getColor('text') }]}>
              Етикети
            </Text>
            <TagsInput
              tags={tags}
              setTags={setTags}
              placeholder="Добавете етикети..."
            />
            <Text style={[styles.helperText, { color: getColor('textLight') }]}>
              Добавете етикети, за да организирате идеите си по-лесно.
            </Text>
          </View>
          
          {/* Бутон за любими */}
          <TouchableOpacity 
            style={[
              styles.favoriteButton, 
              { 
                backgroundColor: getColor('surface'),
                borderColor: getColor('border'),
              }
            ]} 
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? 'star' : 'star-outline'} 
              size={24} 
              color={isFavorite ? getColor('warning') : getColor('textLight')} 
              style={styles.favoriteIcon} 
            />
            <Text style={[styles.favoriteText, { color: getColor('text') }]}>
              {isFavorite ? 'Премахване от любими' : 'Добавяне към любими'}
            </Text>
          </TouchableOpacity>
          
          {/* Бутони */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: getColor('surface') }]}
              onPress={() => navigation.goBack()}
              disabled={isSaving}
            >
              <Text style={[styles.cancelButtonText, { color: getColor('text') }]}>
                Отказ
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: getColor('primary') }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.saveButtonText, { color: "#FFFFFF" }]}>
                  Запази
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: SPACING.m,
  },
  inputGroup: {
    marginBottom: SPACING.m,
  },
  label: {
    marginBottom: SPACING.xs,
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as "500",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.s,
  },
  input: {
    paddingVertical: SPACING.s,
    fontSize: FONT_SIZE.m,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.s,
  },
  textArea: {
    paddingVertical: SPACING.s,
    fontSize: FONT_SIZE.m,
    minHeight: 100,
  },
  helperText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    fontStyle: 'italic',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    marginTop: SPACING.s,
  },
  favoriteIcon: {
    marginRight: SPACING.s,
  },
  favoriteText: {
    fontSize: FONT_SIZE.m,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.l,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.s,
    paddingVertical: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.m,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as "500",
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.m,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as "500",
  },
});

export default AddEditIdeaScreen; 