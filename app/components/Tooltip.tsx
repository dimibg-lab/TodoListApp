import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback,
  Animated 
} from 'react-native';
import { useAppTheme } from '../utils/theme';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../constants/theme';

interface TooltipProps {
  visible: boolean;
  onClose: () => void;
  text: string;
  position: { x: number; y: number };
  isAbove?: boolean; // Дали да се показва над или под целевия елемент
}

/**
 * Компонент за показване на tooltip с текст над или под елемент
 */
const Tooltip: React.FC<TooltipProps> = ({ 
  visible, 
  onClose, 
  text, 
  position,
  isAbove = true 
}) => {
  const { getColor } = useAppTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);
  
  if (!visible) return null;
  
  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.container,
              { 
                backgroundColor: getColor('surface'),
                borderColor: getColor('border'),
                top: isAbove ? position.y - 50 : position.y + 20,
                left: Math.max(10, Math.min(position.x - 100, position.x)), // Предотвратяваме излизане извън екрана
                opacity: fadeAnim
              }
            ]}
          >
            <Text style={[styles.text, { color: getColor('text') }]}>
              {text}
            </Text>
            <View 
              style={[
                isAbove ? styles.arrowDown : styles.arrowUp, 
                { 
                  borderTopColor: isAbove ? getColor('surface') : 'transparent',
                  borderBottomColor: isAbove ? 'transparent' : getColor('surface')
                }
              ]} 
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    position: 'absolute',
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    maxWidth: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  text: {
    fontSize: FONT_SIZE.s,
    textAlign: 'center',
  },
  arrowDown: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowUp: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  }
});

export default Tooltip; 