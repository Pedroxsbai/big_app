import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import QuranScreen from '../screens/QuranScreen';
import QuranPageReader from '../screens/QuranPageReader';
import SurahListScreen from '../screens/SurahListScreen';
import SurahReader from '../screens/SurahReader';
import QuranSearchScreen from '../screens/QuranSearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';

const Stack = createNativeStackNavigator();

export default function QuranStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuranMain" component={QuranScreen} />
      <Stack.Screen 
        name="QuranPageReader" 
        component={QuranPageReader}
      />
      <Stack.Screen name="SurahList" component={SurahListScreen} />
      <Stack.Screen name="SurahReader" component={SurahReader} />
      <Stack.Screen name="QuranSearch" component={QuranSearchScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
    </Stack.Navigator>
  );
}
