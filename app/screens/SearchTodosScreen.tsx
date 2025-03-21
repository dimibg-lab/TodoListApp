import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodo } from '../context/TodoContext';
import { TodoItem } from '../components/TodoItem';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { SearchTodosScreenProps } from '../navigation/types';
import { Todo } from '../types';

const SearchTodosScreen: React.FC<SearchTodosScreenProps> = ({ navigation }) => {
  const { searchTodos } = useTodo();
  const { getColor } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Todo[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Извършване на търсене при промяна на заявката
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      // Изпълняваме търсенето само ако има поне 2 знака
      const searchResults = searchTodos(searchQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchQuery, searchTodos]);

  // Зареждане на последни търсения от localStorage
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        // Тук може да добавите логика за зареждане на последни търсения от AsyncStorage
        // Пример: примерни последни търсения
        setRecentSearches(['важно', 'спешно', 'работа', 'среща']);
      } catch (error) {
        console.error('Error loading recent searches', error);
      }
    };

    loadRecentSearches();
  }, []);

  // Извършване на търсене
  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      // Запазване на търсенето в историята
      if (!recentSearches.includes(searchQuery) && searchQuery.trim() !== '') {
        const newRecentSearches = [
          searchQuery,
          ...recentSearches.slice(0, 4), // Запазваме само последните 5 търсения
        ];
        setRecentSearches(newRecentSearches);
        // Тук може да запазите в AsyncStorage новите последни търсения
      }
      Keyboard.dismiss();
    }
  };

  // Избиране на последно търсене
  const handleSelectRecentSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Изчистване на полето за търсене
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Обработка на клик върху задача
  const handleTodoPress = (todo: Todo) => {
    navigation.navigate('TodoDetails', { todoId: todo.id });
  };

  // Обработка на превключване на задача като завършена
  const handleToggleComplete = (id: string) => {
    // Тук може да извикате функцията за превключване на статуса на задачата
    // toggleTodoCompleted(id);
    
    // Обновяваме резултатите от търсенето
    if (searchQuery.trim().length >= 2) {
      const searchResults = searchTodos(searchQuery);
      setResults(searchResults);
    }
  };

  // Рендериране на секцията за последни търсения
  const renderRecentSearches = () => {
    if (recentSearches.length === 0 || searchQuery.trim().length > 0) {
      return null;
    }

    return (
      <View style={styles.recentSearchesContainer}>
        <Text style={[styles.recentSearchesTitle, { color: getColor('textLight') }]}>
          Последни търсения
        </Text>
        {recentSearches.map((query, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.recentSearchItem, { borderBottomColor: getColor('border') }]}
            onPress={() => handleSelectRecentSearch(query)}
          >
            <MaterialIcons name="history" size={18} color={getColor('textLight')} />
            <Text style={[styles.recentSearchText, { color: getColor('text') }]}>{query}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Рендериране на съобщение при липса на резултати
  const renderEmptyResults = () => {
    if (searchQuery.trim().length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search" size={64} color={getColor('disabled')} />
          <Text style={[styles.emptyTitle, { color: getColor('textLight') }]}>
            Търсене на задачи
          </Text>
          <Text style={[styles.emptySubtitle, { color: getColor('textLight') }]}>
            Въведете ключова дума за търсене на задачи
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="search-off" size={64} color={getColor('disabled')} />
        <Text style={[styles.emptyTitle, { color: getColor('textLight') }]}>
          Няма намерени резултати
        </Text>
        <Text style={[styles.emptySubtitle, { color: getColor('textLight') }]}>
          Опитайте с друга ключова дума
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      {/* Поле за търсене */}
      <View style={[styles.searchContainer, { backgroundColor: getColor('surface') }]}>
        <MaterialIcons name="search" size={24} color={getColor('textLight')} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: getColor('text') }]}
          placeholder="Търсене на задачи..."
          placeholderTextColor={getColor('textLight')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <MaterialIcons name="close" size={20} color={getColor('textLight')} />
          </TouchableOpacity>
        )}
      </View>

      {/* Последни търсения или резултати */}
      {renderRecentSearches()}

      {/* Списък с резултати */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onPress={handleTodoPress}
            onToggleComplete={handleToggleComplete}
            style={styles.todoItem}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyResults()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    margin: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginHorizontal: SPACING.s,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: FONT_SIZE.m,
    marginRight: SPACING.xs,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  recentSearchesContainer: {
    margin: SPACING.m,
    marginTop: 0,
  },
  recentSearchesTitle: {
    fontSize: FONT_SIZE.s,
    marginBottom: SPACING.s,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
  },
  recentSearchText: {
    fontSize: FONT_SIZE.m,
    marginLeft: SPACING.s,
  },
  listContent: {
    padding: SPACING.m,
    paddingTop: 0,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginTop: SPACING.m,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.m,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  todoItem: {
    marginBottom: SPACING.s,
  },
});

export default SearchTodosScreen; 