import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

// Тип за екрана
export type NotificationSoundScreenProps = NativeStackScreenProps<SettingsStackParamList, 'NotificationSound'>;

// Интерфейс за обект за звук
interface Sound {
  id: string;
  name: string;
  uri: string; // URL адрес към звуковия файл
  category: 'системни' | 'известия' | 'аларми' | 'мелодии';
  description?: string; // Описание на звука
  icon?: string; // Име на иконата
}

// Типове известия
export type NotificationType = 'default' | 'task' | 'urgent' | 'reminder' | 'dailySummary';

// Преводи на типовете известия на български
const notificationTypeLabels: Record<NotificationType, string> = {
  default: 'Стандартно известие',
  task: 'Задачи',
  urgent: 'Спешни задачи',
  reminder: 'Напомняния',
  dailySummary: 'Дневен отчет'
};

// Препоръчани звуци за различните типове известия
const recommendedSoundsForType: Record<NotificationType, string[]> = {
  default: ['system_notification', 'notification1'],
  task: ['notification2', 'system_success'],
  urgent: ['alarm1', 'system_alert'],
  reminder: ['notification3', 'melody1'],
  dailySummary: ['system_success', 'melody2']
};

// Икони за категории
const categoryIcons: Record<string, string> = {
  'основни': 'priority-high',
  'препоръчани': 'thumb-up',
  'системни': 'settings',
  'известия': 'notifications',
  'аларми': 'alarm',
  'мелодии': 'music-note'
};

// Масив със звуци с публични URL адреси
const sounds: Sound[] = [
  // Основни звуци
  { 
    id: 'default', 
    name: 'По подразбиране', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', 
    category: 'системни',
    description: 'Стандартен звуков сигнал за всички известия',
    icon: 'check-circle'
  },
  { 
    id: 'none', 
    name: 'Без звук', 
    uri: '', 
    category: 'системни',
    description: 'Известия без звуков сигнал',
    icon: 'volume-off'
  },
  
  // Системни звуци
  { 
    id: 'system_notification', 
    name: 'Стандартно известие', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    category: 'системни',
    description: 'Кратък системен звук за общи известия',
    icon: 'notifications'
  },
  { 
    id: 'system_alert', 
    name: 'Предупреждение', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',
    category: 'системни',
    description: 'Звук за важни съобщения и предупреждения',
    icon: 'warning'
  },
  { 
    id: 'system_success', 
    name: 'Успешно действие', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
    category: 'системни',
    description: 'Звук за успешно завършени задачи',
    icon: 'check'
  },
  
  // Известия
  { 
    id: 'notification1', 
    name: 'Кратко известие', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/1629/1629-preview.mp3',
    category: 'известия',
    description: 'Лек звук за ежедневни известия',
    icon: 'notifications-none'
  },
  { 
    id: 'notification2', 
    name: 'Ясен сигнал', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
    category: 'известия',
    description: 'Ясен звук за задачи и напомняния',
    icon: 'notifications-active'
  },
  { 
    id: 'notification3', 
    name: 'Информационен сигнал', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3', 
    category: 'известия',
    description: 'Приятен звук за информационни известия',
    icon: 'info'
  },
  
  // Аларми
  { 
    id: 'alarm1', 
    name: 'Звънец', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/2551/2551-preview.mp3',
    category: 'аларми',
    description: 'Отчетлив звук за спешни задачи',
    icon: 'alarm'
  },
  { 
    id: 'alarm2', 
    name: 'Аларма', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/2894/2894-preview.mp3',
    category: 'аларми',
    description: 'Силен звук за важни известия и крайни срокове',
    icon: 'access-alarm'
  },
  
  // Мелодии
  { 
    id: 'melody1', 
    name: 'Кратка мелодия', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3',
    category: 'мелодии',
    description: 'Приятна мелодия за напомняния',
    icon: 'music-note'
  },
  { 
    id: 'melody2', 
    name: 'Дълга мелодия', 
    uri: 'https://assets.mixkit.co/active_storage/sfx/135/135-preview.mp3',
    category: 'мелодии',
    description: 'Продължителна мелодия за важни събития',
    icon: 'queue-music'
  },
];

const NotificationSoundScreen: React.FC<NotificationSoundScreenProps> = ({ route, navigation }) => {
  const { getColor } = useAppTheme();
  const [selectedSound, setSelectedSound] = useState<string>('default');
  const [loading, setLoading] = useState<boolean>(true);
  const [playing, setPlaying] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [groupedSounds, setGroupedSounds] = useState<{ title: string; data: Sound[] }[]>([]);
  
  // Получаваме типа известие от параметрите на навигацията
  const notificationType: NotificationType = route.params?.type || 'default';
  
  useEffect(() => {
    // Взимаме основните звуци (По подразбиране, Без звук)
    const basics = sounds.filter(s => s.id === 'default' || s.id === 'none');
    
    // Първо извеждаме препоръчаните звуци за този тип известие
    const recommended = sounds.filter(s => 
      recommendedSoundsForType[notificationType].includes(s.id) &&
      s.id !== 'default' && s.id !== 'none'
    );
    
    // След това групираме останалите звуци по категория
    const otherSounds = sounds.filter(s => 
      !recommendedSoundsForType[notificationType].includes(s.id) && 
      s.id !== 'default' && 
      s.id !== 'none'
    );
    
    // Подреждаме звуците в категориите по азбучен ред
    const sortedOtherSounds = [...otherSounds].sort((a, b) => a.name.localeCompare(b.name));
    
    // Групиране на другите звуци по категория
    const categorizedSounds = Object.entries(
      sortedOtherSounds.reduce<Record<string, Sound[]>>((acc, sound) => {
        if (!acc[sound.category]) {
          acc[sound.category] = [];
        }
        acc[sound.category].push(sound);
        return acc;
      }, {})
    ).map(([title, data]) => ({ title, data }));
    
    // Подреждаме и категориите по азбучен ред
    const sortedCategorizedSounds = [...categorizedSounds].sort((a, b) => {
      // Специален ред на категории
      const categoryOrder = ['системни', 'известия', 'аларми', 'мелодии'];
      return categoryOrder.indexOf(a.title) - categoryOrder.indexOf(b.title);
    });
    
    // Подреждаме групите звуци: основни, препоръчани, категоризирани
    const grouped = [
      { title: 'основни', data: basics },
      ...(recommended.length > 0 ? [{ title: 'препоръчани', data: recommended }] : []),
      ...sortedCategorizedSounds
    ];
    
    setGroupedSounds(grouped);
    
    // Зареждаме запазения звук за този тип известие
    loadSavedSound();
    
    // Конфигуриране на аудио сесията
    configureAudio();
    
    // Почистване при unmount
    return () => {
      // Спираме всички звуци при излизане от екрана
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [notificationType]); // Добавяме notificationType като зависимост

  // Конфигуриране на аудио настройки
  const configureAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Грешка при конфигуриране на аудио:', error);
    }
  };

  // Зареждаме запазения звук за този тип известие
  const loadSavedSound = async () => {
    try {
      setLoading(true);
      const savedSounds = await AsyncStorage.getItem('notificationSounds');
      
      if (savedSounds) {
        const sounds = JSON.parse(savedSounds);
        if (sounds[notificationType]) {
          setSelectedSound(sounds[notificationType]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Грешка при зареждане на звуци:', error);
      setLoading(false);
    }
  };

  // Запазване на избрания звук
  const saveSelectedSound = async (soundId: string) => {
    try {
      const savedSounds = await AsyncStorage.getItem('notificationSounds');
      let sounds = savedSounds ? JSON.parse(savedSounds) : {};
      
      sounds = {
        ...sounds,
        [notificationType]: soundId
      };
      
      await AsyncStorage.setItem('notificationSounds', JSON.stringify(sounds));
    } catch (error) {
      console.error('Грешка при запазване на звук:', error);
      Alert.alert('Грешка', 'Не можахме да запазим избрания звук.');
    }
  };

  // Избор на звук
  const handleSelectSound = async (soundId: string) => {
    // Спираме текущия звук, ако се възпроизвежда
    if (playing && sound) {
      await sound.stopAsync();
      setPlaying(false);
    }
    
    setSelectedSound(soundId);
    saveSelectedSound(soundId);
  };

  // Възпроизвеждане на звук за преглед
  const playSound = async (soundId: string) => {
    // Ако е избрано "Без звук", не правим нищо
    if (soundId === 'none') {
      return;
    }
    
    // Ако вече се възпроизвежда, спри звука
    if (playing && sound) {
      await sound.stopAsync();
      setPlaying(false);
      return;
    }
    
    try {
      // Намираме избрания звук
      const selectedSoundObj = sounds.find(s => s.id === soundId);
      
      if (!selectedSoundObj || !selectedSoundObj.uri) {
        return;
      }
      
      setPlaying(true);
      
      // Спираме предишния звук, ако има такъв
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Създаваме нов звуков обект
      const soundObj = new Audio.Sound();
      await soundObj.loadAsync({ uri: selectedSoundObj.uri });
      setSound(soundObj);
      
      // Добавяме слушател за край на възпроизвеждането
      soundObj.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });
      
      // Възпроизвеждаме звука
      await soundObj.playAsync();
    } catch (error) {
      console.error('Грешка при възпроизвеждане на звук:', error);
      setPlaying(false);
      
      Alert.alert(
        'Грешка при възпроизвеждане', 
        'Възникна проблем при възпроизвеждане на звука. Проверете интернет връзката си.',
        [{ text: 'Разбрах' }]
      );
    }
  };

  // Превод на категориите
  const translateCategory = (category: string): string => {
    switch (category) {
      case 'основни': return 'ОСНОВНИ';
      case 'препоръчани': return 'ПРЕПОРЪЧАНИ';
      case 'системни': return 'СИСТЕМНИ';
      case 'известия': return 'ИЗВЕСТИЯ';
      case 'аларми': return 'АЛАРМИ';
      case 'мелодии': return 'МЕЛОДИИ';
      default: return category.toUpperCase();
    }
  };

  // Дали звукът е препоръчан за текущия тип известие
  const isRecommended = (soundId: string): boolean => {
    return recommendedSoundsForType[notificationType].includes(soundId);
  };

  // Рендериране на заглавие на група
  const renderSectionHeader = (title: string) => {
    const icon = categoryIcons[title];
    
    return (
      <View style={[styles.sectionHeaderContainer, { borderBottomColor: `${getColor('textLight')}30` }]}>
        <MaterialIcons name={icon} size={16} color={getColor('textLight')} style={styles.sectionIcon} />
        <Text style={[styles.sectionHeader, { color: getColor('textLight') }]}>
          {translateCategory(title)}
        </Text>
      </View>
    );
  };

  // Рендериране на елемент за звук
  const renderSoundItem = ({ item }: { item: Sound }) => {
    const isSelected = selectedSound === item.id;
    const isPlaying = playing && selectedSound === item.id;
    const soundIsRecommended = isRecommended(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.soundItem,
          { backgroundColor: getColor('surface') },
          isSelected && { 
            borderColor: getColor('primary'), 
            borderWidth: 1,
            backgroundColor: `${getColor('primary')}10`
          }
        ]}
        onPress={() => handleSelectSound(item.id)}
      >
        {/* Икона на звука */}
        <View style={[styles.soundIcon, { backgroundColor: `${getColor('primary')}20` }]}>
          <MaterialIcons 
            name={item.icon || 'music-note'} 
            size={20} 
            color={getColor('primary')}
          />
        </View>
        
        <View style={styles.soundInfo}>
          <View>
            <Text style={[styles.soundName, { color: getColor('text') }]}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={[styles.soundDescription, { color: getColor('textLight') }]}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.soundActions}>
          {/* Индикатор за препоръчан звук */}
          {soundIsRecommended && (
            <View style={[styles.recommendedBadge, { backgroundColor: `${getColor('success')}30` }]}>
              <Text style={[styles.recommendedText, { color: getColor('success') }]}>
                Препоръчано
              </Text>
            </View>
          )}
          
          {/* Икона за избрания звук */}
          {isSelected && (
            <MaterialIcons
              name="check-circle"
              size={24}
              color={getColor('primary')}
              style={styles.selectedIcon}
            />
          )}
          
          {/* Бутон за преглед, ако не е "Без звук" */}
          {item.id !== 'none' && (
            <TouchableOpacity
              style={[
                styles.playButton, 
                { 
                  backgroundColor: isPlaying ? getColor('error') : getColor('primary') 
                }
              ]}
              onPress={() => playSound(item.id)}
            >
              <MaterialIcons
                name={isPlaying ? "stop" : "play-arrow"}
                size={16}
                color={getColor('text')}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: getColor('background') }]}>
        <ActivityIndicator size="large" color={getColor('primary')} />
        <Text style={[styles.loadingText, { color: getColor('textLight') }]}>
          Зареждане на звуци...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: getColor('text') }]}>
          Звук за {notificationTypeLabels[notificationType]}
        </Text>
        <Text style={[styles.subtitle, { color: getColor('textLight') }]}>
          Изберете звук за този тип известия
        </Text>
      </View>

      <FlatList
        data={groupedSounds}
        renderItem={({ item }) => (
          <View style={styles.section}>
            {renderSectionHeader(item.title)}
            <View style={[
              styles.soundsContainer,
              item.title === 'препоръчани' && styles.recommendedContainer
            ]}>
              {item.data.map(sound => renderSoundItem({ item: sound }))}
            </View>
          </View>
        )}
        keyExtractor={item => item.title}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={true}
        ListFooterComponent={
          <View style={[styles.infoContainer, { backgroundColor: `${getColor('info')}20` }]}>
            <MaterialIcons 
              name="info" 
              size={20} 
              color={getColor('info')} 
              style={styles.infoIcon}
            />
            <Text style={[styles.infoText, { color: getColor('text') }]}>
              Звуковите файлове се изтеглят от интернет само при преглед. 
              Изберете звук, подходящ за типа известие и предназначението му.
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: getColor('primary') }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: getColor('text') }]}>
            Готово
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  loadingText: {
    marginTop: SPACING.m,
    fontSize: FONT_SIZE.m,
  },
  header: {
    padding: SPACING.m,
    marginBottom: SPACING.s,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.m,
  },
  list: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.l,
  },
  section: {
    marginBottom: SPACING.l,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    marginBottom: SPACING.s,
  },
  sectionIcon: {
    marginRight: SPACING.xs,
  },
  sectionHeader: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  soundsContainer: {
    marginTop: SPACING.xs,
  },
  recommendedContainer: {
    backgroundColor: `rgba(46, 204, 113, 0.05)`,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.xs,
    marginTop: 0,
  },
  soundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.s,
    minHeight: 64,
  },
  soundIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.s,
  },
  soundInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: SPACING.m,
  },
  soundName: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: 4,
    flexShrink: 1,
  },
  soundDescription: {
    fontSize: FONT_SIZE.xs,
    flexShrink: 1,
  },
  soundActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  selectedIcon: {
    marginRight: SPACING.s,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.s,
    marginRight: SPACING.s,
  },
  recommendedText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  footer: {
    padding: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginTop: SPACING.m,
    marginBottom: SPACING.l,
  },
  infoIcon: {
    marginRight: SPACING.s,
    marginTop: 2,
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.s,
    lineHeight: 20,
  },
});

export default NotificationSoundScreen; 