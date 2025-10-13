import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPrayerAlarm, setNextPrayerAlarm] = useState(true);
  const [fajrAlarm, setFajrAlarm] = useState(true);
  const [dhuhrAlarm, setDhuhrAlarm] = useState(true);
  const [asrAlarm, setAsrAlarm] = useState(true);
  const [maghribAlarm, setMaghribAlarm] = useState(true);
  const [ishaAlarm, setIshaAlarm] = useState(true);

  useEffect(() => {
    loadAlarmSettings();
  }, []);

  const loadAlarmSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await AsyncStorage.getItem('alarmSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNextPrayerAlarm(settings.nextPrayerAlarm || true);
        setFajrAlarm(settings.fajrAlarm || true);
        setDhuhrAlarm(settings.dhuhrAlarm || true);
        setAsrAlarm(settings.asrAlarm || true);
        setMaghribAlarm(settings.maghribAlarm || true);
        setIshaAlarm(settings.ishaAlarm || true);
      }
    } catch (error) {
      console.log('Error loading alarm settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAlarmSettings = async () => {
    try {
      const settings = {
        nextPrayerAlarm,
        fajrAlarm,
        dhuhrAlarm,
        asrAlarm,
        maghribAlarm,
        ishaAlarm,
      };
      await AsyncStorage.setItem('alarmSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving alarm settings:', error);
    }
  };

  const toggleAlarm = (alarmType) => {
    switch (alarmType) {
      case 'nextPrayer':
        setNextPrayerAlarm(!nextPrayerAlarm);
        break;
      case 'fajr':
        setFajrAlarm(!fajrAlarm);
        break;
      case 'dhuhr':
        setDhuhrAlarm(!dhuhrAlarm);
        break;
      case 'asr':
        setAsrAlarm(!asrAlarm);
        break;
      case 'maghrib':
        setMaghribAlarm(!maghribAlarm);
        break;
      case 'isha':
        setIshaAlarm(!ishaAlarm);
        break;
    }
    saveAlarmSettings();
  };

  const testAlarm = (prayerName) => {
    Alert.alert(
      'اختبار المنبه',
      `تم تفعيل منبه ${prayerName} بنجاح!`,
      [{ text: 'موافق', style: 'default' }]
    );
  };

  const prayerAlarms = [
    {
      name: 'الفجر',
      icon: 'weather-sunset-up',
      enabled: fajrAlarm,
      type: 'fajr',
      time: '05:31',
      color: '#3B82F6'
    },
    {
      name: 'الظهر',
      icon: 'white-balance-sunny',
      enabled: dhuhrAlarm,
      type: 'dhuhr',
      time: '12:57',
      color: '#F59E0B'
    },
    {
      name: 'العصر',
      icon: 'weather-sunset-down',
      enabled: asrAlarm,
      type: 'asr',
      time: '16:20',
      color: '#EF4444'
    },
    {
      name: 'المغرب',
      icon: 'weather-night',
      enabled: maghribAlarm,
      type: 'maghrib',
      time: '18:52',
      color: '#8B5CF6'
    },
    {
      name: 'العشاء',
      icon: 'moon-waning-gibbous',
      enabled: ishaAlarm,
      type: 'isha',
      time: '20:13',
      color: '#6B46C1'
    }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>جاري تحميل إعدادات المنبه...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>منبه الصلاة</Text>
        <Text style={styles.headerSubtitle}>إعدادات التذكير للصلوات</Text>
      </LinearGradient>

      {/* Next Prayer Alarm */}
      <View style={styles.alarmCard}>
        <View style={styles.alarmHeader}>
          <MaterialCommunityIcons name="alarm" size={24} color="#3B82F6" />
          <Text style={styles.alarmTitle}>منبه الصلاة القادمة</Text>
        </View>
        <View style={styles.alarmContent}>
          <Text style={styles.alarmDescription}>
            تذكير قبل 10 دقائق من موعد الصلاة القادمة
          </Text>
          <View style={styles.alarmControls}>
            <Switch
              value={nextPrayerAlarm}
              onValueChange={() => toggleAlarm('nextPrayer')}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={nextPrayerAlarm ? '#FFFFFF' : '#9CA3AF'}
            />
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testAlarm('الصلاة القادمة')}
            >
              <Text style={styles.testButtonText}>اختبار</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Individual Prayer Alarms */}
      <View style={styles.prayerAlarmsContainer}>
        <Text style={styles.sectionTitle}>منبهات الصلوات الفردية</Text>
        {prayerAlarms.map((prayer, index) => (
          <View key={index} style={styles.prayerAlarmCard}>
            <View style={styles.prayerInfo}>
              <MaterialCommunityIcons name={prayer.icon} size={24} color={prayer.color} />
              <View style={styles.prayerDetails}>
                <Text style={styles.prayerName}>{prayer.name}</Text>
                <Text style={styles.prayerTime}>{prayer.time}</Text>
              </View>
            </View>
            <View style={styles.prayerControls}>
              <Switch
                value={prayer.enabled}
                onValueChange={() => toggleAlarm(prayer.type)}
                trackColor={{ false: '#E5E7EB', true: prayer.color }}
                thumbColor={prayer.enabled ? '#FFFFFF' : '#9CA3AF'}
              />
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: prayer.color }]}
                onPress={() => testAlarm(prayer.name)}
              >
                <Text style={styles.testButtonText}>اختبار</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Alarm Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>إعدادات المنبه</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={20} color="#3B82F6" />
            <Text style={styles.settingLabel}>صوت المنبه</Text>
          </View>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>أذان</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="vibrate" size={20} color="#3B82F6" />
            <Text style={styles.settingLabel}>الاهتزاز</Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="time" size={20} color="#3B82F6" />
            <Text style={styles.settingLabel}>وقت التذكير المبكر</Text>
          </View>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>10 دقائق</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />
        <Text style={styles.infoText}>
          يتم تحديث أوقات الصلاة تلقائياً حسب موقعك الجغرافي. تأكد من تفعيل الإشعارات للتطبيق.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#3B82F6',
    marginTop: 16,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    fontFamily: 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#DBEAFE',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  alarmCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  alarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alarmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginLeft: 12,
  },
  alarmContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmDescription: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 16,
  },
  alarmControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  prayerAlarmsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
  prayerAlarmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  prayerTime: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  prayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1E40AF',
    marginLeft: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
