import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';

interface NoDataProps {
  message: string;
  icon?: string;
}

const NoData: React.FC<NoDataProps> = ({ message, icon = 'alert-circle-outline' }) => {
  const { getColor } = useAppTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={60} color={getColor('textLight')} />
      <Text style={[styles.message, { color: getColor('textLight') }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default NoData; 