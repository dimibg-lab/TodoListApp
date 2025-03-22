import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../utils/theme';
import { SPACING, FONT_SIZE } from '../constants/theme';

interface CustomListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle | ViewStyle[];
  titleStyle?: TextStyle | TextStyle[];
  subtitleStyle?: TextStyle | TextStyle[];
}

const CustomListItem: React.FC<CustomListItemProps> = ({
  title,
  subtitle,
  onPress,
  leftIcon,
  rightIcon,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  const { getColor } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getColor('surface') },
        containerStyle,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      
      <View style={styles.content}>
        <Text style={[
          styles.title,
          { color: getColor('text') },
          titleStyle
        ]}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[
            styles.subtitle,
            { color: getColor('textLight') },
            subtitleStyle
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    borderRadius: 8,
  },
  leftIcon: {
    marginRight: SPACING.s,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.m,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: FONT_SIZE.s,
    marginTop: 2,
  },
  rightIcon: {
    marginLeft: SPACING.s,
  },
});

export default CustomListItem; 