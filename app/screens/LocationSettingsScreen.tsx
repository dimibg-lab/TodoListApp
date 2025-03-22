import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAppTheme } from '../utils/theme';
import { useLocationReminder } from '../context/LocationReminderContext';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { LocationSettingsScreenProps } from '../navigation/types';

const LocationSettingsScreen: React.FC<LocationSettingsScreenProps> = () => {
  const { getColor } = useAppTheme();
  const {
    settings,
    hasLocationPermission,
    isTracking: isTrackingLocation,
    requestLocationPermission,
    enableReminders: enableLocationReminders,
    updateSettings,
  } = useLocationReminder();

  const [localSettings, setLocalSettings] = useState({
    ...settings,
  });

  // Обновяване на локалните настройки при промяна на настройките в контекста
  useEffect(() => {
    setLocalSettings({
      ...settings,
    });
  }, [settings]);

  // Обработка на промяна на настройка
  const handleToggleSetting = async (key: keyof typeof localSettings) => {
    try {
      if (key === 'enabled') {
        // Специална обработка за включване/изключване
        const newValue = !localSettings.enabled;
        setLocalSettings(prev => ({ ...prev, [key]: newValue }));
        
        if (newValue && !hasLocationPermission) {
          // Ако включваме, но нямаме разрешение, трябва да го поискаме
          await requestLocationPermission();
        }
        
        await enableLocationReminders(newValue);
      } else if (key === 'backgroundTracking' && !localSettings.backgroundTracking) {
        // Ако включваме фоновото проследяване, покажи предупреждение
        Alert.alert(
          'Фоново проследяване',
          'Фоновото проследяване на местоположението може да повлияе на батерията на устройството. Сигурни ли сте, че искате да го активирате?',
          [
            {
              text: 'Отказ',
              style: 'cancel',
            },
            {
              text: 'Активирай',
              onPress: async () => {
                const newSettings = { ...localSettings, [key]: true };
                setLocalSettings(newSettings);
                await updateSettings({ [key]: true });
              },
            },
          ],
        );
      } else {
        // Обикновена промяна на настройка
        const newSettings = { ...localSettings, [key]: !localSettings[key as keyof typeof localSettings] };
        setLocalSettings(newSettings);
        await updateSettings({ [key]: !localSettings[key as keyof typeof localSettings] });
      }
    } catch (error) {
      Alert.alert('Грешка', 'Възникна проблем при промяна на настройките.');
      console.error('Грешка при промяна на настройките:', error);
    }
  };

  // Обработка на промяна на плъзгача
  const handleSliderChange = (key: 'checkFrequency' | 'minDistance', value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // Приложи настройките на плъзгача, когато пръстът се вдигне
  const handleSliderComplete = async (key: 'checkFrequency' | 'minDistance', value: number) => {
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      Alert.alert('Грешка', 'Възникна проблем при промяна на настройките.');
      console.error('Грешка при промяна на настройките:', error);
    }
  };

  // Отвори настройките на приложението (за разрешения)
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Заглавна секция */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: getColor('text') }]}>
            Локационни напомняния
          </Text>
          <Text style={[styles.subtitle, { color: getColor('textLight') }]}>
            Получавайте напомняния, когато сте близо до място, свързано със задача
          </Text>
        </View>

        {/* Информация за разрешенията */}
        {!hasLocationPermission && (
          <View 
            style={[
              styles.infoContainer, 
              { 
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderColor: getColor('warning')
              }
            ]}
          >
            <MaterialIcons 
              name="warning" 
              size={24} 
              color={getColor('warning')} 
              style={styles.infoIcon} 
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: getColor('warning') }]}>
                Липсва разрешение за местоположение
              </Text>
              <Text style={[styles.infoText, { color: getColor('text') }]}>
                За да използвате локационни напомняния, трябва да разрешите достъпа до местоположението на устройството.
              </Text>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  { backgroundColor: getColor('warning') }
                ]}
                onPress={requestLocationPermission}
              >
                <Text style={styles.actionButtonText}>
                  Разреши достъп
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Разрешенията са налични, но функцията не е активирана */}
        {hasLocationPermission && !localSettings.enabled && (
          <View 
            style={[
              styles.infoContainer, 
              { 
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderColor: getColor('info')
              }
            ]}
          >
            <MaterialIcons 
              name="info" 
              size={24} 
              color={getColor('info')} 
              style={styles.infoIcon} 
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: getColor('info') }]}>
                Локационните напомняния не са активирани
              </Text>
              <Text style={[styles.infoText, { color: getColor('text') }]}>
                Активирайте функцията, за да получавате напомняния когато сте близо до място, свързано със задача.
              </Text>
            </View>
          </View>
        )}

        {/* Основна настройка - включване/изключване */}
        <View 
          style={[
            styles.section, 
            { backgroundColor: getColor('surface') }
          ]}
        >
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Локационни напомняния
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                {localSettings.enabled 
                  ? 'Локационните напомняния са активирани' 
                  : 'Активирайте, за да получавате напомняния базирани на местоположение'}
              </Text>
            </View>
            <Switch
              value={localSettings.enabled}
              onValueChange={() => handleToggleSetting('enabled')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Допълнителни настройки - видими само ако функцията е активирана */}
        <View 
          style={[
            styles.section, 
            { 
              backgroundColor: getColor('surface'),
              opacity: localSettings.enabled ? 1 : 0.5 
            }
          ]}
        >
          <Text style={[styles.sectionHeader, { color: getColor('textLight') }]}>
            НАСТРОЙКИ НА ЛОКАЦИОННИТЕ НАПОМНЯНИЯ
          </Text>

          {/* Честота на проверка */}
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Честота на проверка
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                {localSettings.checkFrequency === 1 
                  ? '1 минута' 
                  : `${Math.round(localSettings.checkFrequency)} минути`}
              </Text>
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={30}
              step={1}
              value={localSettings.checkFrequency}
              onValueChange={(value) => handleSliderChange('checkFrequency', value)}
              onSlidingComplete={(value) => handleSliderComplete('checkFrequency', value)}
              minimumTrackTintColor={getColor('primary')}
              maximumTrackTintColor={getColor('disabled')}
              thumbTintColor={getColor('primary')}
              disabled={!localSettings.enabled}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: getColor('textLight') }]}>1 мин</Text>
              <Text style={[styles.sliderLabel, { color: getColor('textLight') }]}>30 мин</Text>
            </View>
          </View>

          {/* Минимално разстояние */}
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Минимално разстояние
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                {`${Math.round(localSettings.minDistance)} метра`}
              </Text>
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={500}
              step={10}
              value={localSettings.minDistance}
              onValueChange={(value) => handleSliderChange('minDistance', value)}
              onSlidingComplete={(value) => handleSliderComplete('minDistance', value)}
              minimumTrackTintColor={getColor('primary')}
              maximumTrackTintColor={getColor('disabled')}
              thumbTintColor={getColor('primary')}
              disabled={!localSettings.enabled}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: getColor('textLight') }]}>50 м</Text>
              <Text style={[styles.sliderLabel, { color: getColor('textLight') }]}>500 м</Text>
            </View>
          </View>

          {/* Фоново проследяване */}
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Фоново проследяване
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Проследяване на местоположението дори когато приложението е затворено
              </Text>
            </View>
            <Switch
              value={localSettings.backgroundTracking}
              onValueChange={() => handleToggleSetting('backgroundTracking')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
              disabled={!localSettings.enabled}
            />
          </View>
        </View>

        {/* Действия */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[
              styles.actionBtn, 
              { 
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderColor: getColor('info')
              }
            ]}
            onPress={openAppSettings}
          >
            <MaterialIcons name="settings" size={20} color={getColor('info')} />
            <Text style={[styles.actionBtnText, { color: getColor('info') }]}>
              Настройки на устройството
            </Text>
          </TouchableOpacity>
        </View>

        {/* Информационна секция */}
        <View 
          style={[
            styles.helpContainer, 
            { backgroundColor: getColor('surface') }
          ]}
        >
          <Text style={[styles.helpTitle, { color: getColor('text') }]}>
            Как работят локационните напомняния?
          </Text>
          <Text style={[styles.helpText, { color: getColor('textLight') }]}>
            Локационните напомняния ви позволяват да получавате известия когато сте близо до 
            място, свързано със задача. Например, ако имате задача "Купи мляко" и зададете 
            местоположение на супермаркета, ще получите известие когато сте близо до него.
          </Text>
          <Text style={[styles.helpText, { color: getColor('textLight') }]}>
            За да използвате локационни напомняния, трябва да добавите местоположение 
            към задачата от екрана за редактиране на задача.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.m,
  },
  header: {
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.m,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.l,
    borderLeftWidth: 4,
  },
  infoIcon: {
    marginRight: SPACING.s,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.s,
    lineHeight: 20,
    marginBottom: SPACING.s,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.s,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.medium as any,
  },
  section: {
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
    marginBottom: SPACING.l,
  },
  sectionHeader: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium as any,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.m,
  },
  settingTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: FONT_SIZE.s,
  },
  sliderContainer: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.m,
  },
  slider: {
    height: 40,
    width: '100%',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
  },
  sliderLabel: {
    fontSize: FONT_SIZE.xs,
  },
  actions: {
    marginBottom: SPACING.l,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
  },
  actionBtnText: {
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  helpContainer: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.l,
  },
  helpTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.s,
  },
  helpText: {
    fontSize: FONT_SIZE.s,
    lineHeight: 20,
    marginBottom: SPACING.s,
  },
});

export default LocationSettingsScreen; 