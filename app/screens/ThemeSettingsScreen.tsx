import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { ThemeSettingsScreenProps } from '../navigation/types';

const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = () => {
  const { theme, toggleTheme } = useTheme();
  const { getColor } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
            Настройка на темата
          </Text>
          <Text style={[styles.sectionDescription, { color: getColor('textLight') }]}>
            Изберете как искате да изглежда приложението
          </Text>
        </View>

        <View style={[styles.optionsContainer, { backgroundColor: getColor('surface') }]}>
          {/* Опция за светла тема */}
          <TouchableOpacity
            style={[
              styles.optionItem,
              { borderBottomColor: getColor('border') }
            ]}
            onPress={() => theme !== 'light' && toggleTheme()}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.themePreview,
                { backgroundColor: '#FFFFFF', borderColor: getColor('border') }
              ]}>
                <View style={styles.themePreviewHeader}>
                  <View style={[styles.previewCircle, { backgroundColor: '#FF4081' }]} />
                </View>
                <View style={styles.themePreviewBody}>
                  <View style={[styles.previewLine, { backgroundColor: '#212121', width: '70%' }]} />
                  <View style={[styles.previewLine, { backgroundColor: '#757575', width: '90%' }]} />
                  <View style={[styles.previewLine, { backgroundColor: '#BDBDBD', width: '60%' }]} />
                </View>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: getColor('text') }]}>
                  Светла тема
                </Text>
                <Text style={[styles.optionDescription, { color: getColor('textLight') }]}>
                  Стандартен светъл режим
                </Text>
              </View>
            </View>
            {theme === 'light' && (
              <MaterialIcons name="check-circle" size={24} color={getColor('primary')} />
            )}
          </TouchableOpacity>

          {/* Опция за тъмна тема */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => theme !== 'dark' && toggleTheme()}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.themePreview,
                { backgroundColor: '#121212', borderColor: getColor('border') }
              ]}>
                <View style={styles.themePreviewHeader}>
                  <View style={[styles.previewCircle, { backgroundColor: '#FF4081' }]} />
                </View>
                <View style={styles.themePreviewBody}>
                  <View style={[styles.previewLine, { backgroundColor: '#FFFFFF', width: '70%' }]} />
                  <View style={[styles.previewLine, { backgroundColor: '#B0B0B0', width: '90%' }]} />
                  <View style={[styles.previewLine, { backgroundColor: '#757575', width: '60%' }]} />
                </View>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: getColor('text') }]}>
                  Тъмна тема
                </Text>
                <Text style={[styles.optionDescription, { color: getColor('textLight') }]}>
                  Комфортен тъмен режим
                </Text>
              </View>
            </View>
            {theme === 'dark' && (
              <MaterialIcons name="check-circle" size={24} color={getColor('primary')} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <MaterialIcons name="info-outline" size={20} color={getColor('textLight')} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: getColor('textLight') }]}>
            Тъмната тема намалява натоварването на очите при използване на 
            приложението в среда с ниска осветеност и помага за удължаване на живота на батерията.
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
  sectionContainer: {
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: FONT_SIZE.m,
    marginBottom: SPACING.m,
  },
  optionsContainer: {
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.m,
    borderBottomWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themePreview: {
    width: 80,
    height: 50,
    borderRadius: BORDER_RADIUS.s,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: SPACING.m,
  },
  themePreviewHeader: {
    height: 15,
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  themePreviewBody: {
    flex: 1,
    padding: 5,
    justifyContent: 'space-around',
  },
  previewCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewLine: {
    height: 3,
    borderRadius: 1.5,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: FONT_SIZE.s,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: SPACING.m,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: BORDER_RADIUS.m,
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

export default ThemeSettingsScreen; 