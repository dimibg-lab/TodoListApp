import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { NotificationSettingsScreenProps } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Тип за настройки на известията
interface NotificationSettings {
  enabled: boolean;
  reminders: boolean;
  dueDateAlert: boolean;
  overdueAlert: boolean;
  dailySummary: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = () => {
  const { getColor } = useAppTheme();
  
  // Настройки за известията (тук са със стойности по подразбиране)
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reminders: true,
    dueDateAlert: true,
    overdueAlert: true,
    dailySummary: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  });

  // Функция за промяна на настройка
  const toggleSetting = (setting: keyof NotificationSettings) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    
    // Ако главната настройка е изключена, всички други са неактивни
    if (setting === 'enabled' && !newSettings.enabled) {
      Object.keys(newSettings).forEach(key => {
        if (key !== 'enabled' && key in newSettings) {
          (newSettings as Record<string, any>)[key] = false;
        }
      });
    }
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Запазване на настройките в AsyncStorage
  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Грешка при запазване на настройките:', error);
    }
  };

  // Възстановяване на настройки по подразбиране
  const resetToDefaults = () => {
    Alert.alert(
      'Възстановяване на настройки',
      'Сигурни ли сте, че искате да възстановите настройките по подразбиране?',
      [
        { text: 'Отказ', style: 'cancel' },
        { 
          text: 'Възстановяване', 
          style: 'destructive',
          onPress: () => {
            const defaultSettings: NotificationSettings = {
              enabled: true,
              reminders: true,
              dueDateAlert: true,
              overdueAlert: true,
              dailySummary: false,
              soundEnabled: true,
              vibrationEnabled: true,
              quietHoursEnabled: false,
              quietHoursStart: '22:00',
              quietHoursEnd: '07:00',
            };
            setSettings(defaultSettings);
            saveSettings(defaultSettings);
          }
        }
      ]
    );
  };

  // Тестване на известията
  const testNotification = () => {
    if (!settings.enabled) {
      Alert.alert(
        'Известията са изключени',
        'За да тествате известията, моля първо ги включете.'
      );
      return;
    }

    Alert.alert(
      'Тестово известие',
      'Това е тестово известие. При реално използване ще получите известие на устройството си.',
      [{ text: 'OK' }]
    );
    
    // Тук би трябвало да има код за изпращане на тестово известие чрез
    // Expo Notifications или друга библиотека за известия
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: getColor('text') }]}>
            Известия
          </Text>
          <Text style={[styles.subtitle, { color: getColor('textLight') }]}>
            Управлявайте как и кога получавате известия
          </Text>
        </View>

        {/* Главен превключвател за всички известия */}
        <View style={[styles.section, { backgroundColor: getColor('surface') }]}>
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Включи известия
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Основна настройка за всички известия
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={() => toggleSetting('enabled')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Типове известия */}
        <View style={[styles.section, { backgroundColor: getColor('surface'), opacity: settings.enabled ? 1 : 0.5 }]}>
          <Text style={[styles.sectionHeader, { color: getColor('textLight') }]}>
            ТИПОВЕ ИЗВЕСТИЯ
          </Text>
          
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Напомняния за задачи
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Получавайте напомняния за предстоящи задачи
              </Text>
            </View>
            <Switch
              value={settings.reminders && settings.enabled}
              onValueChange={() => toggleSetting('reminders')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
              disabled={!settings.enabled}
            />
          </View>
          
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Известия за срок
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Получавайте известия за наближаващи срокове
              </Text>
            </View>
            <Switch
              value={settings.dueDateAlert && settings.enabled}
              onValueChange={() => toggleSetting('dueDateAlert')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
              disabled={!settings.enabled}
            />
          </View>
          
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Известия за просрочване
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Получавайте известия за просрочени задачи
              </Text>
            </View>
            <Switch
              value={settings.overdueAlert && settings.enabled}
              onValueChange={() => toggleSetting('overdueAlert')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
              disabled={!settings.enabled}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Дневна сводка
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Получавайте дневна сводка с предстоящите ви задачи
              </Text>
            </View>
            <Switch
              value={settings.dailySummary && settings.enabled}
              onValueChange={() => toggleSetting('dailySummary')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
              disabled={!settings.enabled}
            />
          </View>
        </View>

        {/* Настройки за звук и вибрация */}
        <View style={[styles.section, { backgroundColor: getColor('surface'), opacity: settings.enabled ? 1 : 0.5 }]}>
          <Text style={[styles.sectionHeader, { color: getColor('textLight') }]}>
            ЗВУК И ВИБРАЦИЯ
          </Text>
          
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Звук
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Включване на звук при известия
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled && settings.enabled}
              onValueChange={() => toggleSetting('soundEnabled')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
              disabled={!settings.enabled}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Вибрация
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Включване на вибрация при известия
              </Text>
            </View>
            <Switch
              value={settings.vibrationEnabled && settings.enabled}
              onValueChange={() => toggleSetting('vibrationEnabled')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
              disabled={!settings.enabled}
            />
          </View>
        </View>

        {/* Спокойни часове */}
        <View style={[styles.section, { backgroundColor: getColor('surface'), opacity: settings.enabled ? 1 : 0.5 }]}>
          <Text style={[styles.sectionHeader, { color: getColor('textLight') }]}>
            СПОКОЙНИ ЧАСОВЕ
          </Text>
          
          <View style={[styles.settingRow, { borderBottomColor: getColor('border') }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Спокойни часове
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                Без известия през определен период
              </Text>
            </View>
            <Switch
              value={settings.quietHoursEnabled && settings.enabled}
              onValueChange={() => toggleSetting('quietHoursEnabled')}
              trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
              thumbColor="#FFFFFF"
              disabled={!settings.enabled}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                Период
              </Text>
              <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                {`${settings.quietHoursStart} - ${settings.quietHoursEnd}`}
              </Text>
            </View>
            <MaterialIcons 
              name="access-time" 
              size={24} 
              color={settings.enabled && settings.quietHoursEnabled ? getColor('primary') : getColor('disabled')} 
            />
          </View>
        </View>

        {/* Бутони за действия */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: getColor('primary'), marginRight: SPACING.m }
            ]}
            onPress={testNotification}
          >
            <MaterialIcons name="notifications-active" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Тест на известие</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getColor('error') }]}
            onPress={resetToDefaults}
          >
            <MaterialIcons name="settings-backup-restore" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Възстанови</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <MaterialIcons name="info-outline" size={20} color={getColor('textLight')} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: getColor('textLight') }]}>
            Уверете се, че сте предоставили разрешения за известия в системните настройки на устройството.
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
  actions: {
    flexDirection: 'row',
    marginBottom: SPACING.l,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: SPACING.m,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.l,
  },
  infoIcon: {
    marginRight: SPACING.s,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.s,
    lineHeight: 20,
  },
});

export default NotificationSettingsScreen; 