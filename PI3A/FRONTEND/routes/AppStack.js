// P13A/FRONTEND/routes/AppStack.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ConfigStack from '../routes/ConfigStack'; // Assegure-se que este caminho está correto

const Tab = createBottomTabNavigator();

// Note: O nome desta função é AppStack, mas ela cria um BottomTabNavigator.
// Isso é o que será usado no App.js quando isAuthenticated for true.
export default function AppStack() {
  return (
    // 'screenOptions' aplica a todas as telas dentro deste navegador.
    // 'headerShown: false' remove o cabeçalho padrão do navegador para TODAS as abas.
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        // NENHUMA OPÇÃO DE HEADER AQUI para HomeScreen, pois headerShown: false já está global.
        // Se você tivesse um cabeçalho customizado específico para a Home, ele DUPLICARIA.
      />
      <Tab.Screen
        name="Settings"
        component={ConfigStack}
        // Se ConfigStack tiver seu próprio StackNavigator, ele pode ter headers internos.
        // Mas o header deste TabNavigator para 'Settings' será false.
      />
    </Tab.Navigator>
  );
}