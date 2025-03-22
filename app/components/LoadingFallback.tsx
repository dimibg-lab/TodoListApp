import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../utils/theme';

const LoadingFallback = () => {
  const { getColor } = useAppTheme();
  
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: getColor('background') 
    }}>
      <ActivityIndicator size="large" color={getColor('primary')} />
    </View>
  );
};

export default LoadingFallback; 