import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { AboutScreenProps } from '../navigation/types';

const AboutScreen: React.FC<AboutScreenProps> = () => {
  const { getColor } = useAppTheme();

  // Отваряне на външен линк
  const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: getColor('text') }]}>
            ToDo Приложение
          </Text>
          <Text style={[styles.version, { color: getColor('textLight') }]}>
            Версия 1.0.0
          </Text>
          <Text style={[styles.tagline, { color: getColor('textLight') }]}>
            Организирайте задачите си ефективно
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: getColor('surface') }]}>
          <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
            Относно приложението
          </Text>
          <Text style={[styles.sectionContent, { color: getColor('textLight') }]}>
            Това приложение е разработено с цел да ви помогне да организирате вашите ежедневни задачи 
            и да повишите вашата продуктивност. Предлага възможности за създаване, организиране и 
            проследяване на задачи чрез интуитивен и приятен потребителски интерфейс.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: getColor('surface') }]}>
          <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
            Характеристики
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={getColor('success')} style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: getColor('text') }]}>
                Създаване и управление на задачи
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={getColor('success')} style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: getColor('text') }]}>
                Организиране на задачите в списъци
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={getColor('success')} style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: getColor('text') }]}>
                Задаване на приоритети и срокове
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={getColor('success')} style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: getColor('text') }]}>
                Известия и напомняния
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={getColor('success')} style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: getColor('text') }]}>
                Светла и тъмна тема
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: getColor('surface') }]}>
          <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
            Разработено с
          </Text>
          <View style={styles.techList}>
            <View style={styles.techItem}>
              <Text style={[styles.techName, { color: getColor('text') }]}>React Native</Text>
              <Text style={[styles.techDescription, { color: getColor('textLight') }]}>
                Фреймуърк за създаване на мобилни приложения
              </Text>
            </View>
            <View style={styles.techItem}>
              <Text style={[styles.techName, { color: getColor('text') }]}>TypeScript</Text>
              <Text style={[styles.techDescription, { color: getColor('textLight') }]}>
                За типобезопасен код и по-добра разработка
              </Text>
            </View>
            <View style={styles.techItem}>
              <Text style={[styles.techName, { color: getColor('text') }]}>Expo</Text>
              <Text style={[styles.techDescription, { color: getColor('textLight') }]}>
                Платформа за опростяване на разработката
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contactContainer}>
          <Text style={[styles.contactTitle, { color: getColor('textLight') }]}>
            Свържете се с нас
          </Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: getColor('primary') }]}
              onPress={() => openLink('https://example.com/contact')}
            >
              <MaterialIcons name="email" size={20} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
              onPress={() => openLink('https://facebook.com')}
            >
              <MaterialIcons name="share" size={20} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.copyright, { color: getColor('textLight') }]}>
            © 2023 ToDo App. Всички права запазени.
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SPACING.m,
  },
  appName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.xs,
  },
  version: {
    fontSize: FONT_SIZE.m,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZE.m,
    textAlign: 'center',
  },
  section: {
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.s,
  },
  sectionContent: {
    fontSize: FONT_SIZE.m,
    lineHeight: 22,
  },
  featureList: {
    marginTop: SPACING.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.s,
  },
  featureIcon: {
    marginRight: SPACING.s,
    marginTop: 2,
  },
  featureText: {
    fontSize: FONT_SIZE.m,
    flex: 1,
  },
  techList: {
    marginTop: SPACING.xs,
  },
  techItem: {
    marginBottom: SPACING.m,
  },
  techName: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.xs / 2,
  },
  techDescription: {
    fontSize: FONT_SIZE.s,
  },
  contactContainer: {
    marginBottom: SPACING.l,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.m,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginHorizontal: SPACING.s,
  },
  socialButtonText: {
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  footer: {
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  copyright: {
    fontSize: FONT_SIZE.s,
  },
});

export default AboutScreen; 