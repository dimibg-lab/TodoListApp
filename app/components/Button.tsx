import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'error';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconPlacement?: 'left' | 'top';
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
  iconPlacement = 'left',
  ...rest
}) => {
  const { getColor, getShadow } = useAppTheme();

  // Определяне на стилове според вариант
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: getColor('primary'),
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        };
      case 'secondary':
        return {
          backgroundColor: getColor('accent'),
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        };
      case 'error':
        return {
          backgroundColor: getColor('error'),
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
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
      case 'error':
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
            paddingHorizontal: SPACING.s,
            borderRadius: BORDER_RADIUS.l,
          },
          text: {
            fontSize: FONT_SIZE.xs,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: SPACING.m,
            paddingHorizontal: SPACING.l,
            borderRadius: BORDER_RADIUS.l,
          },
          text: {
            fontSize: FONT_SIZE.m,
          },
        };
      default: // medium
        return {
          container: {
            paddingVertical: SPACING.s,
            paddingHorizontal: SPACING.m,
            borderRadius: BORDER_RADIUS.l,
          },
          text: {
            fontSize: FONT_SIZE.s,
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

  // Добавяме маргини ако е в колонен режим
  if (iconPlacement === 'top' && leftIcon) {
    textStylesArray.push({ marginTop: 4 } as TextStyle);
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        getVariantStyles(),
        sizeStyles.container,
        iconPlacement === 'top' && styles.buttonColumn,
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
          {leftIcon && iconPlacement === 'left' && <View style={styles.iconLeft}>{leftIcon}</View>}
          {leftIcon && iconPlacement === 'top' && <View>{leftIcon}</View>}
          
          <Text style={textStylesArray}>
            {title}
          </Text>
          
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
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
  buttonColumn: {
    flexDirection: 'column',
    paddingHorizontal: SPACING.s,
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
  iconLeft: {
    marginRight: SPACING.xs,
  },
  iconRight: {
    marginLeft: SPACING.xs,
  },
}); 