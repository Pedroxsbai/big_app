import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Font from 'expo-font';
import BottomTabs from './navigation/BottomTabs';
import DatabaseInitScreen from './screens/DatabaseInitScreen';
import { configureRTL } from './config/rtl';
import { I18nManager, Platform } from 'react-native';
import { DatabaseProvider, useDatabase } from './services/DatabaseContext';

// تأكد من تفعيل RTL قبل أي شيء
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

// أو تستخدم الدالة اللي عملتها في config/rtl
configureRTL(true);

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isInitialized, currentUser } = useDatabase();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isInitialized || !currentUser ? (
          <Stack.Screen name="DatabaseInit" component={DatabaseInitScreen} />
        ) : (
          <Stack.Screen name="Main" component={BottomTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(null);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      console.log('🔄 Loading fonts...');
      await Font.loadAsync({
        'Hafs': require('./assets/fonts/Hafs.ttf'),
        'Uthmani': require('./assets/fonts/kfgqpc_hafs_uthmanic_script.ttf.ttf'),
      });
      console.log('✅ Fonts loaded successfully');
      setFontsLoaded(true);
    } catch (error) {
      console.error('❌ Error loading fonts:', error);
      setFontError(error.message);
      setFontsLoaded(true); // Continue app even if fonts fail
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#FEF9EF' 
      }}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={{ 
          marginTop: 10, 
          fontSize: 16, 
          color: '#166534',
          textAlign: 'center'
        }}>
          جاري تحميل الخطوط...
        </Text>
      </View>
    );
  }

  if (fontError) {
    console.warn('⚠️ Font loading failed, using system fonts:', fontError);
  }

  return (
    <DatabaseProvider>
      <AppNavigator />
    </DatabaseProvider>
  );
}
