import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '../context/UserContext';
import { Button } from '../components/Button';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';
import { useAppTheme } from '../utils/theme';
import { OnboardingScreenProps } from '../navigation/types';

const OnboardingScreen: React.FC<OnboardingScreenProps> = () => {
  const [name, setName] = useState('');
  const { updateName, setIsFirstLaunch } = useUser();
  const { getColor } = useAppTheme();

  const handleContinue = async () => {
    await updateName(name.trim());
    setIsFirstLaunch(false);
  };

  const handleSkip = () => {
    setIsFirstLaunch(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
        <StatusBar style="auto" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={[styles.title, { color: getColor('text') }]}>
                Добре дошли в ToDo
              </Text>
              <Text style={[styles.subtitle, { color: getColor('textLight') }]}>
                Организирайте задачите си ефективно
              </Text>
            </View>

            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <View style={styles.formContainer}>
              <Text style={[styles.label, { color: getColor('text') }]}>
                Как да ви наричаме?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: getColor('surface'),
                    color: getColor('text'),
                    borderColor: getColor('border'),
                  },
                ]}
                placeholder="Въведете вашето име"
                placeholderTextColor={getColor('textLight')}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <Text style={[styles.hint, { color: getColor('textLight') }]}>
                Ще използваме това име, за да персонализираме приложението за вас.
                Можете да го промените по-късно от настройките.
              </Text>
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                title="Продължи"
                onPress={handleContinue}
                style={styles.continueButton}
                disabled={name.trim().length === 0}
              />
              <Button
                title="Пропусни"
                onPress={handleSkip}
                variant="text"
                style={styles.skipButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.l,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.m,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  image: {
    width: 150,
    height: 150,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.s,
  },
  input: {
    fontSize: FONT_SIZE.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    marginBottom: SPACING.s,
  },
  hint: {
    fontSize: FONT_SIZE.s,
  },
  buttonsContainer: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    marginBottom: SPACING.m,
  },
  skipButton: {
    marginBottom: SPACING.m,
  },
});

export default OnboardingScreen; 