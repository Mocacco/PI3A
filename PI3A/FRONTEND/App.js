import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './routes/AuthSrack';
import AppStack from './routes/AppStack';
import { useState } from 'react';
import 'react-native-get-random-values'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}