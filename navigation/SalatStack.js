import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SalatScreen from '../screens/SalatScreen';
import QiblaScreen from '../screens/QiblaScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AlarmScreen from '../screens/AlarmScreen';
import LastThirdScreen from '../screens/LastThirdScreen';

const Stack = createNativeStackNavigator();

export default function SalatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SalatMain" component={SalatScreen} />
      <Stack.Screen name="Qibla" component={QiblaScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Alarm" component={AlarmScreen} />
      <Stack.Screen name="LastThird" component={LastThirdScreen} />
    </Stack.Navigator>
  );
}
