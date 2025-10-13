import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      console.log('جاري تهيئة التطبيق...');
      
      // جلب بيانات المستخدم من AsyncStorage
      const userData = await AsyncStorage.getItem('currentUser');
      const settingsData = await AsyncStorage.getItem('userSettings');
      
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
      
      if (settingsData) {
        setUserSettings(JSON.parse(settingsData));
      }
      
      setIsInitialized(true);
      console.log('تم تهيئة التطبيق بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
      Alert.alert('خطأ', 'حدث خطأ في تهيئة التطبيق');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const userId = Date.now().toString(); // Simple ID generation
      const user = { id: userId, ...userData, createdAt: new Date().toISOString() };
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      
      // إنشاء إعدادات افتراضية
      const defaultSettings = {
        darkMode: false,
        fontSize: 18,
        language: 'ar',
        notifications: true,
        autoPlay: false,
        hapticFeedback: true,
        soundEffects: true
      };
      
      await AsyncStorage.setItem('userSettings', JSON.stringify(defaultSettings));
      setUserSettings(defaultSettings);
      
      return userId;
    } catch (error) {
      console.error('خطأ في إنشاء المستخدم:', error);
      throw error;
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = { ...currentUser, ...userData };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      throw error;
    }
  };

  const updateSettings = async (settings) => {
    try {
      const updatedSettings = { ...userSettings, ...settings };
      await AsyncStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      setUserSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث الإعدادات:', error);
      throw error;
    }
  };

  const addBookmark = async (bookmarkData) => {
    try {
      const bookmarks = await AsyncStorage.getItem('bookmarks');
      const bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
      const bookmarkId = Date.now().toString();
      
      const newBookmark = {
        id: bookmarkId,
        userId: currentUser.id,
        ...bookmarkData,
        createdAt: new Date().toISOString()
      };
      
      bookmarkList.push(newBookmark);
      await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarkList));
      return bookmarkId;
    } catch (error) {
      console.error('خطأ في إضافة المفضلة:', error);
      throw error;
    }
  };

  const getUserBookmarks = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem('bookmarks');
      const bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
      return bookmarkList.filter(bookmark => bookmark.userId === currentUser.id);
    } catch (error) {
      console.error('خطأ في جلب المفضلة:', error);
      return [];
    }
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      const bookmarks = await AsyncStorage.getItem('bookmarks');
      const bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
      const filteredBookmarks = bookmarkList.filter(bookmark => bookmark.id !== bookmarkId);
      await AsyncStorage.setItem('bookmarks', JSON.stringify(filteredBookmarks));
      return true;
    } catch (error) {
      console.error('خطأ في حذف المفضلة:', error);
      throw error;
    }
  };

  const savePrayerTimes = async (prayerTimes) => {
    try {
      const prayerId = Date.now().toString();
      const prayerData = {
        id: prayerId,
        userId: currentUser.id,
        ...prayerTimes,
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`prayerTimes_${prayerId}`, JSON.stringify(prayerData));
      return prayerId;
    } catch (error) {
      console.error('خطأ في حفظ أوقات الصلاة:', error);
      throw error;
    }
  };

  const getPrayerTimes = async (date) => {
    try {
      // This would need to be implemented based on your prayer times API
      return null;
    } catch (error) {
      console.error('خطأ في جلب أوقات الصلاة:', error);
      return null;
    }
  };

  const addPrayerAlarm = async (alarmData) => {
    try {
      const alarms = await AsyncStorage.getItem('prayerAlarms');
      const alarmList = alarms ? JSON.parse(alarms) : [];
      const alarmId = Date.now().toString();
      
      const newAlarm = {
        id: alarmId,
        userId: currentUser.id,
        ...alarmData,
        createdAt: new Date().toISOString()
      };
      
      alarmList.push(newAlarm);
      await AsyncStorage.setItem('prayerAlarms', JSON.stringify(alarmList));
      return alarmId;
    } catch (error) {
      console.error('خطأ في إضافة تنبيه الصلاة:', error);
      throw error;
    }
  };

  const getPrayerAlarms = async () => {
    try {
      const alarms = await AsyncStorage.getItem('prayerAlarms');
      const alarmList = alarms ? JSON.parse(alarms) : [];
      return alarmList.filter(alarm => alarm.userId === currentUser.id);
    } catch (error) {
      console.error('خطأ في جلب تنبيهات الصلاة:', error);
      return [];
    }
  };

  const updatePrayerAlarm = async (alarmId, alarmData) => {
    try {
      const alarms = await AsyncStorage.getItem('prayerAlarms');
      const alarmList = alarms ? JSON.parse(alarms) : [];
      const alarmIndex = alarmList.findIndex(alarm => alarm.id === alarmId);
      
      if (alarmIndex !== -1) {
        alarmList[alarmIndex] = { ...alarmList[alarmIndex], ...alarmData };
        await AsyncStorage.setItem('prayerAlarms', JSON.stringify(alarmList));
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطأ في تحديث تنبيه الصلاة:', error);
      throw error;
    }
  };

  const removePrayerAlarm = async (alarmId) => {
    try {
      const alarms = await AsyncStorage.getItem('prayerAlarms');
      const alarmList = alarms ? JSON.parse(alarms) : [];
      const filteredAlarms = alarmList.filter(alarm => alarm.id !== alarmId);
      await AsyncStorage.setItem('prayerAlarms', JSON.stringify(filteredAlarms));
      return true;
    } catch (error) {
      console.error('خطأ في حذف تنبيه الصلاة:', error);
      throw error;
    }
  };

  const saveReadingProgress = async (progressData) => {
    try {
      const progressId = Date.now().toString();
      const progress = {
        id: progressId,
        userId: currentUser.id,
        ...progressData,
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`readingProgress_${progressId}`, JSON.stringify(progress));
      return progressId;
    } catch (error) {
      console.error('خطأ في حفظ تقدم القراءة:', error);
      throw error;
    }
  };

  const getReadingProgress = async () => {
    try {
      // This would need to be implemented to get all reading progress entries
      return [];
    } catch (error) {
      console.error('خطأ في جلب تقدم القراءة:', error);
      return [];
    }
  };

  const saveZikr = async (zikrData) => {
    try {
      const zikrId = Date.now().toString();
      const zikr = {
        id: zikrId,
        userId: currentUser.id,
        ...zikrData,
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`zikr_${zikrId}`, JSON.stringify(zikr));
      return zikrId;
    } catch (error) {
      console.error('خطأ في حفظ الذكر:', error);
      throw error;
    }
  };

  const updateZikr = async (zikrId, zikrData) => {
    try {
      const zikr = await AsyncStorage.getItem(`zikr_${zikrId}`);
      if (zikr) {
        const updatedZikr = { ...JSON.parse(zikr), ...zikrData };
        await AsyncStorage.setItem(`zikr_${zikrId}`, JSON.stringify(updatedZikr));
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطأ في تحديث الذكر:', error);
      throw error;
    }
  };

  const getUserAzkar = async () => {
    try {
      // This would need to be implemented to get all user azkar
      return [];
    } catch (error) {
      console.error('خطأ في جلب الأذكار:', error);
      return [];
    }
  };

  const saveSunnah = async (sunnahData) => {
    try {
      const sunnahId = Date.now().toString();
      const sunnah = {
        id: sunnahId,
        userId: currentUser.id,
        ...sunnahData,
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`sunnah_${sunnahId}`, JSON.stringify(sunnah));
      return sunnahId;
    } catch (error) {
      console.error('خطأ في حفظ السنة:', error);
      throw error;
    }
  };

  const updateSunnah = async (sunnahId, sunnahData) => {
    try {
      const sunnah = await AsyncStorage.getItem(`sunnah_${sunnahId}`);
      if (sunnah) {
        const updatedSunnah = { ...JSON.parse(sunnah), ...sunnahData };
        await AsyncStorage.setItem(`sunnah_${sunnahId}`, JSON.stringify(updatedSunnah));
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطأ في تحديث السنة:', error);
      throw error;
    }
  };

  const getUserSunnah = async () => {
    try {
      // This would need to be implemented to get all user sunnah
      return [];
    } catch (error) {
      console.error('خطأ في جلب السنن:', error);
      return [];
    }
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('userSettings');
      await AsyncStorage.removeItem('bookmarks');
      await AsyncStorage.removeItem('prayerAlarms');
      setCurrentUser(null);
      setUserSettings(null);
      return true;
    } catch (error) {
      console.error('خطأ في مسح بيانات المستخدم:', error);
      throw error;
    }
  };

  const exportUserData = async () => {
    try {
      const userData = {
        user: currentUser,
        settings: userSettings,
        bookmarks: await getUserBookmarks(),
        alarms: await getPrayerAlarms(),
        progress: await getReadingProgress(),
        azkar: await getUserAzkar(),
        sunnah: await getUserSunnah()
      };
      return userData;
    } catch (error) {
      console.error('خطأ في تصدير بيانات المستخدم:', error);
      throw error;
    }
  };

  const value = {
    isInitialized,
    currentUser,
    userSettings,
    loading,
    createUser,
    updateUser,
    updateSettings,
    addBookmark,
    getUserBookmarks,
    removeBookmark,
    savePrayerTimes,
    getPrayerTimes,
    addPrayerAlarm,
    getPrayerAlarms,
    updatePrayerAlarm,
    removePrayerAlarm,
    saveReadingProgress,
    getReadingProgress,
    saveZikr,
    updateZikr,
    getUserAzkar,
    saveSunnah,
    updateSunnah,
    getUserSunnah,
    clearUserData,
    exportUserData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
