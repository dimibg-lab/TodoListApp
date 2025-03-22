import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Share
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Моделиране на типовете данни
interface Quote {
  id: string;
  text: string;
  author: string;
  category?: string;
}

// Примерни цитати
const initialQuotes: Quote[] = [
  {
    id: '1',
    text: 'Успехът е сбор от малки усилия, повтаряни ден след ден.',
    author: 'Робърт Колиър',
    category: 'успех'
  },
  {
    id: '2',
    text: 'Всеки момент е шанс да започнеш отначало.',
    author: 'Камий Пейджо',
    category: 'мотивация'
  },
  {
    id: '3',
    text: 'Най-доброто време да посадиш дърво беше преди 20 години. Второто най-добро време е сега.',
    author: 'Китайска поговорка',
    category: 'време'
  },
  {
    id: '4',
    text: 'Поставяй високи цели, но не се обвързвай с конкретен път към тях.',
    author: 'Брайън Трейси',
    category: 'цели'
  },
  {
    id: '5',
    text: 'Нямаш задължение да си същия човек, който беше преди 5 минути.',
    author: 'Алън Уотс',
    category: 'промяна'
  },
  {
    id: '6',
    text: 'Мотивацията те подтиква да започнеш. Навикът те поддържа да продължиш.',
    author: 'Джим Рон',
    category: 'навици'
  },
  {
    id: '7',
    text: 'Живей днес. Нито миналото, нито бъдещето. Днес.',
    author: 'Стив Мараболи',
    category: 'настояще'
  },
  {
    id: '8',
    text: 'Не се страхувай да се откажеш от доброто, за да преследваш великото.',
    author: 'Джон Рокфелер',
    category: 'решения'
  },
  {
    id: '9',
    text: 'Истинската мярка за успеха е колко пъти можеш да се изправиш, след като паднеш.',
    author: 'Винс Ломбарди',
    category: 'устойчивост'
  },
  {
    id: '10',
    text: 'Ако искаш да стигнеш бързо, върви сам. Ако искаш да стигнеш далече, върви с другите.',
    author: 'Африканска поговорка',
    category: 'сътрудничество'
  },
  {
    id: '11',
    text: 'Отричането на реалността не променя реалността.',
    author: 'Айн Ранд',
    category: 'реалност'
  },
  {
    id: '12',
    text: 'Не чакай. Никога няма да е точният момент.',
    author: 'Наполеон Хил',
    category: 'действие'
  }
];

const QuotesScreen: React.FC = () => {
  const { getColor } = useAppTheme();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteQuotes, setFavoriteQuotes] = useState<string[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  useEffect(() => {
    loadQuotes();
    loadFavorites();
  }, []);

  const loadQuotes = async () => {
    try {
      // В реалното приложение тук бихме извършили API заявка
      // За примера използваме фиктивни данни
      // Симулираме забавяне от API
      setTimeout(() => {
        setQuotes(initialQuotes);
        if (!currentQuote && initialQuotes.length > 0) {
          setCurrentQuote(getRandomQuote(initialQuotes));
        }
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Грешка при зареждане на цитати:', error);
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteQuotes');
      if (storedFavorites) {
        setFavoriteQuotes(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Грешка при зареждане на любими цитати:', error);
    }
  };

  const saveFavorites = async (favorites: string[]) => {
    try {
      await AsyncStorage.setItem('favoriteQuotes', JSON.stringify(favorites));
    } catch (error) {
      console.error('Грешка при запазване на любими цитати:', error);
    }
  };

  const getRandomQuote = (quotesArray: Quote[]): Quote => {
    const randomIndex = Math.floor(Math.random() * quotesArray.length);
    return quotesArray[randomIndex];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Показваме нов случаен цитат
    if (quotes.length > 0) {
      setCurrentQuote(getRandomQuote(quotes));
    }
    setRefreshing(false);
  };

  const toggleFavorite = (quoteId: string) => {
    let newFavorites;
    if (favoriteQuotes.includes(quoteId)) {
      newFavorites = favoriteQuotes.filter(id => id !== quoteId);
    } else {
      newFavorites = [...favoriteQuotes, quoteId];
    }
    setFavoriteQuotes(newFavorites);
    saveFavorites(newFavorites);
  };

  const shareQuote = async (quote: Quote) => {
    try {
      await Share.share({
        message: `"${quote.text}" - ${quote.author}`,
      });
    } catch (error) {
      console.error('Грешка при споделяне:', error);
    }
  };

  const renderQuoteItem = ({ item }: { item: Quote }) => {
    const isFavorite = favoriteQuotes.includes(item.id);
    
    return (
      <View 
        style={[
          styles.quoteCard, 
          { backgroundColor: getColor('surface') }
        ]}
      >
        <Text style={[styles.quoteText, { color: getColor('text') }]}>
          "{item.text}"
        </Text>
        <Text style={[styles.quoteAuthor, { color: getColor('textLight') }]}>
          — {item.author}
        </Text>
        {item.category && (
          <View style={[styles.categoryTag, { backgroundColor: getColor('primary') }]}>
            <Text style={[styles.categoryText, { color: getColor('text') }]}>
              {item.category}
            </Text>
          </View>
        )}
        <View style={styles.quoteActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => toggleFavorite(item.id)}
          >
            <MaterialIcons 
              name={isFavorite ? "favorite" : "favorite-border"} 
              size={24} 
              color={isFavorite ? getColor('error') : getColor('textLight')}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => shareQuote(item)}
          >
            <MaterialIcons 
              name="share" 
              size={24} 
              color={getColor('textLight')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: getColor('background') }]}>
        <ActivityIndicator size="large" color={getColor('primary')} />
        <Text style={[styles.loadingText, { color: getColor('textLight') }]}>
          Зареждане на вдъхновяващи цитати...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: getColor('background') }]}>
      {/* Цитат на деня */}
      {currentQuote && (
        <View style={[styles.dailyQuoteContainer, { backgroundColor: getColor('primary') }]}>
          <Text style={[styles.dailyQuoteLabel, { color: getColor('text') }]}>
            Цитат на деня
          </Text>
          <Text style={[styles.dailyQuoteText, { color: getColor('text') }]}>
            "{currentQuote.text}"
          </Text>
          <Text style={[styles.dailyQuoteAuthor, { color: getColor('text') }]}>
            — {currentQuote.author}
          </Text>
          <View style={styles.dailyQuoteActions}>
            <TouchableOpacity 
              style={styles.dailyQuoteButton} 
              onPress={() => toggleFavorite(currentQuote.id)}
            >
              <MaterialIcons 
                name={favoriteQuotes.includes(currentQuote.id) ? "favorite" : "favorite-border"} 
                size={22} 
                color={getColor('text')}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dailyQuoteButton} 
              onPress={() => shareQuote(currentQuote)}
            >
              <MaterialIcons 
                name="share" 
                size={22} 
                color={getColor('text')}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dailyQuoteButton} 
              onPress={handleRefresh}
            >
              <MaterialIcons 
                name="refresh" 
                size={22} 
                color={getColor('text')}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
        Колекция от цитати
      </Text>
      
      <FlatList
        data={quotes}
        renderItem={renderQuoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.quotesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[getColor('primary')]}
            tintColor={getColor('primary')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.m,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: FONT_SIZE.m,
  },
  dailyQuoteContainer: {
    borderRadius: 12,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyQuoteLabel: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.s,
  },
  dailyQuoteText: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.s,
    lineHeight: 24,
  },
  dailyQuoteAuthor: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.normal as any,
    fontStyle: 'italic',
    marginBottom: SPACING.s,
  },
  dailyQuoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.s,
  },
  dailyQuoteButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.s,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.m,
  },
  quotesList: {
    paddingBottom: SPACING.l,
  },
  quoteCard: {
    borderRadius: 12,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quoteText: {
    fontSize: FONT_SIZE.m,
    lineHeight: 22,
    marginBottom: SPACING.s,
  },
  quoteAuthor: {
    fontSize: FONT_SIZE.s,
    fontStyle: 'italic',
    marginBottom: SPACING.s,
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.s,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingVertical: SPACING.xs/2,
    paddingHorizontal: SPACING.s,
    borderRadius: 12,
    marginBottom: SPACING.s,
  },
  categoryText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium as any,
  }
});

export default QuotesScreen; 