import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useTodo } from '../context/TodoContext';
import { SPACING, FONT_SIZE } from '../constants/design';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IdeasStackParamList } from '../navigation/MainNavigator';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Диалог за превръщане на идея в задача
import ConvertIdeaDialog from '../components/ConvertIdeaDialog';
import { Idea, Priority } from '../types';

type Props = NativeStackScreenProps<IdeasStackParamList, 'IdeaDetails'>;

const IdeaDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { ideaId } = route.params;
  const { 
    ideas, 
    lists, 
    toggleIdeaFavorite, 
    deleteIdea,
    convertIdeaToTodo
  } = useTodo();
  
  const { colors, fonts } = useTheme();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConvertDialogVisible, setIsConvertDialogVisible] = useState(false);
  
  // Зареждаме данните за идеята
  useEffect(() => {
    const loadIdea = () => {
      const foundIdea = ideas.find(idea => idea.id === ideaId);
      
      if (foundIdea) {
        setIdea(foundIdea);
      } else {
        Alert.alert('Грешка', 'Не успяхме да намерим тази идея.');
        navigation.goBack();
      }
      setIsLoading(false);
    };
    
    loadIdea();
  }, [ideaId, ideas, navigation]);
  
  // Функция за превключване на "избрана" идея
  const handleToggleFavorite = async () => {
    try {
      await toggleIdeaFavorite(ideaId);
    } catch (error) {
      console.error('IdeaDetailsScreen: ГРЕШКА ПРИ ПРОМЯНА НА СТАТУС:', error);
      Alert.alert('Грешка', 'Възникна проблем при промяна на статуса на идеята.');
    }
  };
  
  // Функция за изтриване на идея
  const handleDelete = async () => {
    Alert.alert(
      'Потвърждение',
      'Сигурни ли сте, че искате да изтриете тази идея?',
      [
        {
          text: 'Отказ',
          style: 'cancel'
        },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIdea(ideaId);
              navigation.goBack();
            } catch (error) {
              console.error('IdeaDetailsScreen: ГРЕШКА ПРИ ИЗТРИВАНЕ:', error);
              Alert.alert('Грешка', 'Възникна проблем при изтриване на идеята.');
            }
          }
        }
      ]
    );
  };
  
  // Функция за споделяне на идея
  const handleShare = async () => {
    if (!idea) return;
    
    try {
      const message = `Идея: ${idea.title}${idea.description ? `\n\n${idea.description}` : ''}${
        idea.tags.length > 0 ? `\n\nТагове: ${idea.tags.join(', ')}` : ''
      }`;
      
      await Share.share({
        message,
        title: 'Споделяне на идея',
      });
    } catch (error) {
      console.error('IdeaDetailsScreen: ГРЕШКА ПРИ СПОДЕЛЯНЕ:', error);
      Alert.alert('Грешка', 'Възникна проблем при споделяне на идеята.');
    }
  };
  
  // Функция за превръщане на идея в задача
  const handleConvertToTask = (listId: string, priority: Priority) => {
    Alert.alert(
      'Потвърждение',
      'Идеята ще бъде превърната в задача и ще бъде изтрита от списъка с идеи.',
      [
        {
          text: 'Отказ',
          style: 'cancel'
        },
        {
          text: 'Продължи',
          onPress: async () => {
            try {
              await convertIdeaToTodo(ideaId, listId, priority);
              Alert.alert('Успешно', 'Идеята е успешно превърната в задача.');
              navigation.goBack();
            } catch (error) {
              console.error('IdeaDetailsScreen: ГРЕШКА ПРИ ПРЕВРЪЩАНЕ В ЗАДАЧА:', error);
              Alert.alert('Грешка', 'Възникна проблем при превръщане на идеята в задача.');
            }
          }
        }
      ]
    );
  };
  
  // Показваме индикатор за зареждане
  if (isLoading || !idea) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Заглавие и статус "избрана" */}
        <View style={styles.titleContainer}>
          <Animated.Text 
            style={[styles.title, { color: colors.text, ...fonts.heading }]}
            entering={FadeInDown.duration(300).delay(100)}
          >
            {idea.title}
          </Animated.Text>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Ionicons 
              name={idea.isFavorite ? 'star' : 'star-outline'} 
              size={28} 
              color={idea.isFavorite ? colors.warning : colors.text} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Дата на създаване */}
        <Animated.Text 
          style={[styles.date, { color: colors.textSecondary }]}
          entering={FadeInDown.duration(300).delay(150)}
        >
          Създадена на: {new Date(idea.createdAt).toLocaleDateString('bg-BG')}
        </Animated.Text>
        
        {/* Тагове */}
        {idea.tags && idea.tags.length > 0 && (
          <Animated.View 
            style={styles.tagsContainer}
            entering={FadeInDown.duration(300).delay(200)}
          >
            {idea.tags.map((tag, index) => (
              <View 
                key={index} 
                style={[styles.tag, { backgroundColor: colors.primaryLight }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}
        
        {/* Описание */}
        {idea.description && (
          <Animated.View 
            style={[styles.section, { backgroundColor: colors.card }]}
            entering={FadeInDown.duration(300).delay(250)}
          >
            <Text style={[styles.sectionTitle, { color: colors.text, ...fonts.subheading }]}>
              Описание
            </Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {idea.description}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Бутони за действия */}
      <Animated.View 
        style={[styles.actionButtons, { backgroundColor: colors.background }]}
        entering={FadeInDown.duration(300).delay(300)}
      >
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsConvertDialogVisible(true)}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.white} />
          <Text style={[styles.actionButtonText, { color: colors.white }]}>
            Превърни в задача
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.accent }]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={colors.white} />
          <Text style={[styles.actionButtonText, { color: colors.white }]}>
            Сподели
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color={colors.white} />
          <Text style={[styles.actionButtonText, { color: colors.white }]}>
            Изтрий
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Диалог за превръщане в задача */}
      <ConvertIdeaDialog
        visible={isConvertDialogVisible}
        onClose={() => setIsConvertDialogVisible(false)}
        onConvert={handleConvertToTask}
        lists={lists}
      />
    </View>
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
  scrollContent: {
    padding: SPACING.m,
    paddingBottom: 100, // За да има място за бутоните долу
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.s,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginRight: SPACING.s,
  },
  date: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.m,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.m,
    gap: SPACING.xs,
  },
  tag: {
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  section: {
    borderRadius: 10,
    padding: SPACING.m,
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: '600',
    marginBottom: SPACING.s,
  },
  description: {
    fontSize: FONT_SIZE.m,
    lineHeight: 24,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.m,
    marginHorizontal: SPACING.xs,
    borderRadius: 10,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
});

export default IdeaDetailsScreen; 