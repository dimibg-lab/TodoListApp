import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  ...rest
}) => {
  const { getColor, getShadow } = useAppTheme();

  // Определяне на стилове според вариант
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: getColor('primary'),
          ...getShadow('small'),
        };
      case 'secondary':
        return {
          backgroundColor: getColor('accent'),
          ...getShadow('small'),
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: getColor('primary'),
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {};
    }
  };

  // Определяне на стила на текста
  const getTextStyles = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: FONT_WEIGHT.medium as TextStyle['fontWeight'],
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          ...baseTextStyle,
          color: '#FFFFFF',
        };
      case 'outline':
      case 'text':
        return {
          ...baseTextStyle,
          color: getColor('primary'),
        };
      default:
        return baseTextStyle;
    }
  };

  // Определяне на размера
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: SPACING.xs,
            paddingHorizontal: SPACING.m,
            borderRadius: BORDER_RADIUS.s,
          },
          text: {
            fontSize: FONT_SIZE.s,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: SPACING.m,
            paddingHorizontal: SPACING.xl,
            borderRadius: BORDER_RADIUS.l,
          },
          text: {
            fontSize: FONT_SIZE.l,
          },
        };
      default: // medium
        return {
          container: {
            paddingVertical: SPACING.s,
            paddingHorizontal: SPACING.l,
            borderRadius: BORDER_RADIUS.m,
          },
          text: {
            fontSize: FONT_SIZE.m,
          },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  // Подготвяме допълнителни стилове за текста
  const textStylesArray: StyleProp<TextStyle>[] = [
    styles.buttonText,
    getTextStyles(),
    sizeStyles.text,
    isDisabled && styles.disabledText,
    textStyle
  ];

  // Добавяме маргини, ако има икони
  if (leftIcon) {
    textStylesArray.push({ marginLeft: SPACING.s } as TextStyle);
  }
  if (rightIcon) {
    textStylesArray.push({ marginRight: SPACING.s } as TextStyle);
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        getVariantStyles(),
        sizeStyles.container,
        isDisabled && styles.disabled,
        isDisabled && { backgroundColor: getColor('disabled') },
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={textStylesArray}>
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  disabledText: {
    color: '#FFFFFF',
  },
}); 