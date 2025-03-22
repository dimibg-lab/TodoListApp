import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  StyleProp,
  GestureResponderEvent
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';

interface FloatingButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  text?: string;
  onPress: () => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  delayLongPress?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Компонент за плаващ бутон с икона и опционален текст
 */
const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  text,
  onPress,
  onLongPress,
  delayLongPress = 500,
  style
}) => {
  const { getColor } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getColor('primary') },
        style
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      activeOpacity={0.8}
    >
      <MaterialIcons name={icon} size={24} color="#FFFFFF" />
      {text && <Text style={styles.text}>{text}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    flexDirection: 'row',
    paddingHorizontal: SPACING.m,
  },
  text: {
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.s,
    fontWeight: FONT_WEIGHT.medium as "500",
  }
});

export { FloatingButton }; 