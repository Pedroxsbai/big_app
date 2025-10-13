import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDatabase } from '../services/DatabaseContext';

const DatabaseInitScreen = ({ navigation }) => {
  const { isInitialized, currentUser, createUser } = useDatabase();
  const [initStep, setInitStep] = useState('initializing');

  useEffect(() => {
    if (isInitialized) {
      if (currentUser) {
        // المستخدم موجود، الانتقال للشاشة الرئيسية
        navigation.replace('Main');
      } else {
        // لا يوجد مستخدم، إنشاء مستخدم افتراضي
        createDefaultUser();
      }
    }
  }, [isInitialized, currentUser]);

  const createDefaultUser = async () => {
    try {
      setInitStep('creating_user');
      await createUser({
        name: 'مستخدم جديد',
        email: '',
        phone: '',
        location: 'وجدة، المغرب'
      });
      setInitStep('completed');
      // الانتقال للشاشة الرئيسية بعد إنشاء المستخدم
      setTimeout(() => {
        navigation.replace('Main');
      }, 1000);
    } catch (error) {
      console.error('خطأ في إنشاء المستخدم الافتراضي:', error);
      setInitStep('error');
    }
  };

  const getStepText = () => {
    switch (initStep) {
      case 'initializing':
        return 'جاري تهيئة قاعدة البيانات...';
      case 'creating_user':
        return 'جاري إنشاء الملف الشخصي...';
      case 'completed':
        return 'تم التهيئة بنجاح!';
      case 'error':
        return 'حدث خطأ في التهيئة';
      default:
        return 'جاري التحميل...';
    }
  };

  const getStepIcon = () => {
    switch (initStep) {
      case 'initializing':
        return 'database';
      case 'creating_user':
        return 'account-plus';
      case 'completed':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'loading';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name={getStepIcon()} 
          size={80} 
          color="#166534" 
          style={styles.icon}
        />
        
        <Text style={styles.title}>BS_Team</Text>
        <Text style={styles.subtitle}>تطبيق إسلامي شامل</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166534" />
          <Text style={styles.loadingText}>{getStepText()}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 BS_Team. جميع الحقوق محفوظة.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF5',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    fontFamily: 'Cairo-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 48,
    textAlign: 'center',
    fontFamily: 'Cairo-Regular',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#166534',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Cairo-Regular',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Cairo-Regular',
  },
});

export default DatabaseInitScreen;
