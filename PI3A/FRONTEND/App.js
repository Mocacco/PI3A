import 'react-native-get-random-values'; // CRUCIAL para o uuid
import 'react-native-gesture-handler'; // Necessário para react-navigation

import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
// import AuthStack from './routes/AuthSrack'; // Cuidado com o typo 'AuthSrack'
import AuthStack from './routes/AuthSrack'; // Caminho correto
import AppStack from './routes/AppStack'; // Caminho correto

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Para testar diretamente o AppStack (seu app de mapas), descomente a linha abaixo:
  // setIsAuthenticated(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {isAuthenticated ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}