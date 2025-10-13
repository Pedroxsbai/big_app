import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import QuranStack from './QuranStack';
import SalatStack from './SalatStack';
import AzkarScreen from '../screens/AzkarScreen';
import SunanScreen from '../screens/SunnahScreen';
import FatwaScreen from '../screens/FatwaScreen';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#166534',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { 
          backgroundColor: '#FFFDF5', 
          borderTopColor: '#F1E7C6', 
          height: 70,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 12 }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: 'الرئيسية', 
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          )
        }} 
      />
      <Tab.Screen
        name="Quran"
        component={QuranStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'QuranMain';
          return {
            tabBarLabel: 'القرآن',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size} />
            ),
            tabBarStyle: routeName === 'QuranPageReader' ? { display: 'none' } : {
              backgroundColor: '#FFFDF5', 
              borderTopColor: '#F1E7C6', 
              height: 70,
              paddingBottom: 10,
            }
          };
        }}
      />
      <Tab.Screen 
        name="Salat" 
        component={SalatStack} 
        options={{ 
          tabBarLabel: 'الصلاة', 
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="mosque" color={color} size={size} />
          )
        }} 
      />
      <Tab.Screen 
        name="Azkar" 
        component={AzkarScreen} 
        options={{ 
          tabBarLabel: 'الأذكار', 
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hand-heart" color={color} size={size} />
          )
        }} 
      />
      <Tab.Screen 
        name="Sunan" 
        component={SunanScreen} 
        options={{ 
          tabBarLabel: 'السنن', 
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="star" color={color} size={size} />
          )
        }} 
      />
      <Tab.Screen 
        name="Fatwa" 
        component={FatwaScreen} 
        options={{ 
          tabBarLabel: 'الفتوى', 
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat-question" color={color} size={size} />
          )
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack} 
        options={{ 
          tabBarLabel: 'الإعدادات', 
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          )
        }} 
      />
    </Tab.Navigator>
  );
}