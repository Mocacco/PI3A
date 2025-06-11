import { createStackNavigator } from '@react-navigation/stack';
import ConfigScreen from '../screens/ConfigScreen';
import GeneralSettingsScreen from '../screens/GeneralSettingsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import ChangePassScreen from '../screens/ChangePassScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import RouteSettingsScreen from '../screens/RouteSettingsScreen'

const Stack = createStackNavigator();

export default function ConfigStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Config" component={ConfigScreen} options={{ headerShown: false}}/>
      <Stack.Screen name="Configurações Gerais" component={GeneralSettingsScreen} />
      <Stack.Screen name="Prvacidade e Segurança" component={PrivacySecurityScreen} />
      <Stack.Screen name="ChangePassScreen" component={ChangePassScreen} options={{ title: 'Alterar Senha' }} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen}options={{ title: 'Selecionar Idioma' }}/>
      <Stack.Screen 
        name="RoutesSettings" 
        component={RouteSettingsScreen}
        options={{ title: 'Configurações de Percurso' }}
      />
    </Stack.Navigator>
  );
}
