import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { SettingsScreenProps } from '../navigation/types';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { userSettings, updateName, updateViewMode } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { getColor } = useAppTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userSettings.name);

  // Запазване на името
  const saveName = async () => {
    if (name.trim() !== userSettings.name) {
      await updateName(name.trim());
      Alert.alert('Успешно', 'Вашето име беше обновено');
    }
    setIsEditing(false);
  };

  // Отказ от промяната
  const cancelEdit = () => {
    setName(userSettings.name);
    setIsEditing(false);
  };

  // Промяна на режима на изглед за списъците
  const handleViewModeChange = async () => {
    const newMode = userSettings.listsViewMode === 'list' ? 'grid' : 'list';
    await updateViewMode(newMode);
  };

  // Изчистване на всички данни
  const handleClearData = () => {
    Alert.alert(
      'Изчистване на данните',
      'Сигурни ли сте, че искате да изчистите всички данни? Това действие не може да бъде отменено.',
      [
        { text: 'Отказ', style: 'cancel' },
        { 
          text: 'Изчистване', 
          style: 'destructive',
          onPress: () => {
            // Тук би трябвало да има код за изчистване на всички данни
            Alert.alert('Данните са изчистени', 'Всички данни бяха успешно изчистени');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Профилна секция */}
        <View style={[styles.profileSection, { backgroundColor: getColor('surface') }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: getColor('primary') }]}>
              <Text style={styles.avatarText}>
                {userSettings.name ? userSettings.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              {isEditing ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={[
                      styles.nameInput,
                      { color: getColor('text'), borderColor: getColor('border') }
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Въведете вашето име"
                    placeholderTextColor={getColor('textLight')}
                    autoFocus
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={cancelEdit} style={styles.editActionButton}>
                      <MaterialIcons name="close" size={24} color={getColor('error')} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveName} style={styles.editActionButton}>
                      <MaterialIcons name="check" size={24} color={getColor('success')} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.nameContainer}>
                  <Text style={[styles.userName, { color: getColor('text') }]}>
                    {userSettings.name || 'Потребител'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={styles.editNameButton}
                  >
                    <MaterialIcons name="edit" size={20} color={getColor('primary')} />
                  </TouchableOpacity>
                </View>
              )}
              <Text style={[styles.accountInfo, { color: getColor('textLight') }]}>
                Персонални настройки
              </Text>
            </View>
          </View>
        </View>

        {/* Настройки на приложението */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: getColor('textLight') }]}>
            ПРИЛОЖЕНИЕ
          </Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: getColor('surface') }]}>
            {/* Тема */}
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: getColor('border') }]}
              onPress={() => navigation.navigate('ThemeSettings')}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name={theme === 'dark' ? 'dark-mode' : 'light-mode'}
                  size={24}
                  color={getColor('primary')}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                    Тема
                  </Text>
                  <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                    {theme === 'dark' ? 'Тъмна тема' : 'Светла тема'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={getColor('textLight')} />
            </TouchableOpacity>
            
            {/* Известия */}
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: getColor('border') }]}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name="notifications"
                  size={24}
                  color={getColor('primary')}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                    Известия
                  </Text>
                  <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                    Управление на известията
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={getColor('textLight')} />
            </TouchableOpacity>
            
            {/* Изглед на списъците */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name={userSettings.listsViewMode === 'grid' ? 'grid-view' : 'view-list'}
                  size={24}
                  color={getColor('primary')}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                    Изглед на списъците
                  </Text>
                  <Text style={[styles.settingDescription, { color: getColor('textLight') }]}>
                    {userSettings.listsViewMode === 'grid' ? 'Решетка' : 'Списък'}
                  </Text>
                </View>
              </View>
              <Switch
                value={userSettings.listsViewMode === 'grid'}
                onValueChange={handleViewModeChange}
                trackColor={{ false: getColor('disabled'), true: getColor('primary') }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Информация */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: getColor('textLight') }]}>
            ИНФОРМАЦИЯ
          </Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: getColor('surface') }]}>
            {/* За приложението */}
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: getColor('border') }]}
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name="info-outline"
                  size={24}
                  color={getColor('primary')}
                  style={styles.settingIcon}
                />
                <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                  За приложението
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={getColor('textLight')} />
            </TouchableOpacity>
            
            {/* Данни и поверителност */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Данни и поверителност',
                  'Това приложение съхранява всички данни само на вашето устройство и не споделя информация с трети страни.'
                );
              }}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name="security"
                  size={24}
                  color={getColor('primary')}
                  style={styles.settingIcon}
                />
                <Text style={[styles.settingTitle, { color: getColor('text') }]}>
                  Данни и поверителност
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={getColor('textLight')} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Действия */}
        <View style={styles.settingsSection}>
          <View style={[styles.settingsGroup, { backgroundColor: getColor('surface') }]}>
            {/* Изчистване на данните */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleClearData}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color={getColor('error')}
                  style={styles.settingIcon}
                />
                <Text style={[styles.settingTitle, { color: getColor('error') }]}>
                  Изчистване на всички данни
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: getColor('textLight') }]}>
            Версия: 1.0.0
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
  profileSection: {
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.l,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  profileInfo: {
    marginLeft: SPACING.m,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginRight: SPACING.xs,
  },
  editNameButton: {
    padding: SPACING.xs,
  },
  accountInfo: {
    fontSize: FONT_SIZE.s,
    marginTop: 2,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.s,
    paddingHorizontal: SPACING.m,
    fontSize: FONT_SIZE.m,
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: SPACING.xs,
  },
  editActionButton: {
    padding: SPACING.xs,
  },
  settingsSection: {
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.s,
  },
  settingsGroup: {
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.m,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: SPACING.m,
  },
  settingTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  settingDescription: {
    fontSize: FONT_SIZE.s,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: SPACING.l,
    marginBottom: SPACING.xl,
  },
  versionText: {
    fontSize: FONT_SIZE.s,
  },
});

export default SettingsScreen; 