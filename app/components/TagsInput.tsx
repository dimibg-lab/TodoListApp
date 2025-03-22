import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { SPACING, FONT_SIZE } from '../constants/theme';

interface TagsInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}

const TagsInput: React.FC<TagsInputProps> = ({ tags, setTags, placeholder }) => {
  const { getColor } = useAppTheme();
  const [currentTag, setCurrentTag] = useState('');
  
  // Функция за добавяне на етикет
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  // Функция за премахване на етикет
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Хендлър за натискане на Enter
  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (nativeEvent.key === 'Enter' || nativeEvent.key === ',') {
      addTag();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer, 
        { 
          borderColor: getColor('border'),
          backgroundColor: getColor('surface') 
        }
      ]}>
        <TextInput
          style={[styles.input, { color: getColor('text') }]}
          value={currentTag}
          onChangeText={setCurrentTag}
          onKeyPress={handleKeyPress}
          onSubmitEditing={addTag}
          placeholder={placeholder || 'Добавете етикет...'}
          placeholderTextColor={getColor('textLight')}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: getColor('primary') }]} 
          onPress={addTag}
        >
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {tags.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
          contentContainerStyle={styles.tagsContent}
        >
          {tags.map((tag, index) => (
            <View 
              key={index} 
              style={[styles.tag, { backgroundColor: getColor('primary') }]}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity
                style={styles.removeTag}
                onPress={() => removeTag(tag)}
              >
                <MaterialIcons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      
      {tags.length === 0 && (
        <Text style={[styles.noTags, { color: getColor('textLight') }]}>
          Няма добавени етикети
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.m,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.s,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  addButton: {
    padding: SPACING.s,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  tagsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingLeft: SPACING.s,
    paddingRight: 4,
    paddingVertical: 4,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.s,
    marginRight: 4,
  },
  removeTag: {
    padding: 2,
  },
  noTags: {
    fontSize: FONT_SIZE.s,
    marginTop: SPACING.xs,
  }
});

export default TagsInput; 