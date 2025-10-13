import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';

// مكون تحميل الخطوط
export const FontLoader = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Hafs': require('../assets/fonts/Hafs.ttf'),
        'Uthmani': require('../assets/fonts/kfgqpc_hafs_uthmanic_script.ttf.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error('خطأ في تحميل الخطوط:', error);
      setLoadingError(error.message);
      setFontsLoaded(true); // نستمر في التطبيق حتى لو فشل تحميل الخط
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>جاري تحميل الخطوط...</Text>
      </View>
    );
  }

  if (loadingError) {
    console.warn('تحذير: فشل تحميل الخط العثماني، سيتم استخدام الخط الافتراضي');
  }

  return children;
};

// مكون نص إسلامي مع الخط العثماني
export const IslamicText = ({ 
  children, 
  style, 
  useUthmani = true,
  ...props 
}) => {
  const textStyle = useUthmani 
    ? [styles.uthmaniText, style]
    : style;

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

// مكون نص القرآن مع الخط العثماني
export const QuranText = ({ 
  children, 
  style, 
  ...props 
}) => {
  return (
    <Text style={[styles.quranText, style]} {...props}>
      {children}
    </Text>
  );
};

// مكون نص القرآن مع خط حفص
export const HafsText = ({ 
  children, 
  style, 
  ...props 
}) => {
  return (
    <Text style={[styles.hafsText, style]} {...props}>
      {children}
    </Text>
  );
};

// مكون اسم السورة مع الخط العثماني
export const SurahNameText = ({ 
  children, 
  style, 
  ...props 
}) => {
  return (
    <Text style={[styles.surahNameText, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  uthmaniText: {
    fontFamily: 'Uthmani',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  quranText: {
    fontFamily: 'Uthmani',
    fontSize: 22,
    lineHeight: 45,
    color: '#1F2937',
    textAlign: 'justify',
    writingDirection: 'rtl',
    textAlignVertical: 'top',
  },
  hafsText: {
    fontFamily: 'Uthmani', // Use Uthmani for proper Unicode rendering
    fontSize: 20,
    lineHeight: 40,
    color: '#000000',
    textAlign: 'right',
    writingDirection: 'rtl',
    textAlignVertical: 'top',
  },
  surahNameText: {
    fontFamily: 'Uthmani',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
});

export default {
  FontLoader,
  IslamicText,
  QuranText,
  HafsText,
  SurahNameText,
}; 