import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { IdeasScreenProps } from '../navigation/types';
import CustomListItem from '../components/CustomListItemComponent';
import { useIdeas } from '../context/IdeasContext';
import { Idea } from '../types';
import NoData from '../components/NoDataComponent';

const IdeaListScreen: React.FC<IdeasScreenProps> = ({ navigation }) => {
  const { getColor } = useAppTheme();
  const { ideas, loadIdeas } = useIdeas();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    loadIdeas();
  }, []);

  const filteredIdeas = ideas.filter(idea => {
    if (selectedTags.length === 0) return true;
    return idea.tags?.some(tag => selectedTags.includes(tag));
  });

  const allTags = Array.from(
    new Set(ideas.flatMap(idea => idea.tags || []))
  );

  const renderItem = ({ item }: { item: Idea }) => (
    <CustomListItem
      title={item.title}
      onPress={() => navigation.navigate('IdeaDetails', { ideaId: item.id })}
      leftIcon={<Ionicons name="bulb-outline" size={24} color={getColor('primary')} />}
      rightIcon={<Ionicons name="chevron-forward" size={24} color={getColor('textLight')} />}
      containerStyle={[
        styles.ideaItem,
        { backgroundColor: getColor('surface') }
      ]}
    />
  );

  const renderTag = (tag: string, index: number) => {
    const isSelected = selectedTags.includes(tag);
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.tag,
          { backgroundColor: isSelected ? getColor('primary') : getColor('surface') }
        ]}
        onPress={() => {
          if (isSelected) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
          } else {
            setSelectedTags([...selectedTags, tag]);
          }
        }}
      >
        <Text style={[
          styles.tagText,
          { color: isSelected ? '#FFFFFF' : getColor('text') }
        ]}>
          {tag}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: getColor('background') }]}>
      {allTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
          contentContainerStyle={styles.tagsContent}
        >
          {allTags.map((tag, index) => renderTag(tag, index))}
        </ScrollView>
      )}
      
      <FlatList
        data={filteredIdeas}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <NoData
            message="Все още нямате записани идеи"
            icon="bulb-outline"
          />
        }
      />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: getColor('primary') }]}
        onPress={() => navigation.navigate('AddEditIdea', {})}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  ideaItem: {
    marginBottom: 8,
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tagsContainer: {
    maxHeight: 48,
  },
  tagsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
  },
});

export default IdeaListScreen; 