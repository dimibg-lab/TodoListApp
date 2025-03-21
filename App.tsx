import React from 'react';
import { View, Text } from 'react-native';
import { ThemeProvider } from './app/context/ThemeContext';
import { UserProvider } from './app/context/UserContext';
import { TodoProvider } from './app/context/TodoContext';
import { Navigation } from './app/navigation/Navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <ThemeProvider>
            <TodoProvider>
              <Navigation />
            </TodoProvider>
          </ThemeProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
