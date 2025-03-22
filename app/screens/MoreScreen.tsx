import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '../utils/theme';
import { MoreScreenProps } from '../navigation/types';
import CustomListItem from '../components/CustomListItemComponent';
import { Ionicons } from '@expo/vector-icons';

const MoreScreen: React.FC<MoreScreenProps> = ({ navigation }) => {
  const { getColor } = useAppTheme();

  const menuItems = [
    {
      title: 'Моите идеи',
      icon: 'bulb-outline',
      onPress: () => navigation.navigate('Ideas'),
    },
    {
      title: 'Прогноза за времето',
      icon: 'partly-sunny-outline',
      onPress: () => navigation.navigate('Weather'),
    },
    {
      title: 'Цитати и мотивация',
      icon: 'book-outline',
      onPress: () => navigation.navigate('Quotes'),
    },
    {
      title: 'Приоритети',
      icon: 'options-outline',
      onPress: () => navigation.navigate('Priorities'),
    },
    {
      title: 'Експорт на данни',
      icon: 'download-outline',
      onPress: () => navigation.navigate('Export'),
    },
    {
      title: 'Помощ и съвети',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('Help'),
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: getColor('background') }]}>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => {
          // Изчисляваме стиловете според позицията
          const itemStyles = [
            styles.menuItem,
            { backgroundColor: getColor('surface') }
          ];
          
          // Добавяме допълнителни стилове за първия и последния елемент
          if (index === 0) {
            itemStyles.push({ marginTop: 8 });
          }
          
          if (index === menuItems.length - 1) {
            itemStyles.push({ marginBottom: 8 });
          }
          
          return (
            <CustomListItem
              key={index}
              title={item.title}
              onPress={item.onPress}
              leftIcon={<Ionicons name={item.icon as any} size={24} color={getColor('primary')} />}
              rightIcon={<Ionicons name="chevron-forward" size={24} color={getColor('textLight')} />}
              containerStyle={itemStyles}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    paddingVertical: 16,
  },
  menuItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  firstMenuItem: {
    marginTop: 8,
  },
  lastMenuItem: {
    marginBottom: 8,
  },
});

export default MoreScreen; 