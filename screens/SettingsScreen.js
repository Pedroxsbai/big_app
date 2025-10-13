import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert, Modal, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useDatabase } from '../services/DatabaseContext';

export default function SettingsScreen({ navigation }) {
  const { currentUser, userSettings, updateSettings, loading: dbLoading } = useDatabase();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('ar');
  const [location, setLocation] = useState('وجدة، المغرب');
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadSettings();
    return () => clearInterval(timer);
  }, [userSettings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      if (userSettings) {
        setDarkMode(userSettings.dark_mode || false);
        setNotifications(userSettings.notifications || true);
        setAutoPlay(userSettings.auto_play || false);
        setFontSize(userSettings.font_size || 'medium');
        setLanguage(userSettings.language || 'ar');
        setLocation(`${userSettings.prayer_city || 'وجدة'}، ${userSettings.prayer_country || 'المغرب'}`);
        setHapticFeedback(userSettings.haptic_feedback || true);
        setSoundEffects(userSettings.sound_effects || true);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting, value) => {
    try {
      const newSettings = { ...userSettings };
      switch (setting) {
        case 'darkMode':
          setDarkMode(value);
          newSettings.dark_mode = value;
          break;
        case 'notifications':
          setNotifications(value);
          newSettings.notifications = value;
          break;
        case 'autoPlay':
          setAutoPlay(value);
          newSettings.auto_play = value;
          break;
        case 'hapticFeedback':
          setHapticFeedback(value);
          newSettings.haptic_feedback = value;
          break;
        case 'soundEffects':
          setSoundEffects(value);
          newSettings.sound_effects = value;
          break;
      }
      await updateSettings(newSettings);
    } catch (error) {
      console.log('Error updating settings:', error);
    }
  };

  const handleFontSizeChange = async (size) => {
    try {
      setFontSize(size);
      const newSettings = { ...userSettings, font_size: size };
      await updateSettings(newSettings);
      setShowFontSizeModal(false);
    } catch (error) {
      console.log('Error updating font size:', error);
    }
  };

  const handleLanguageChange = async (lang) => {
    try {
      setLanguage(lang);
      const newSettings = { ...userSettings, language: lang };
      await updateSettings(newSettings);
      setShowLanguageModal(false);
    } catch (error) {
      console.log('Error updating language:', error);
    }
  };

  const resetSettings = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل تريد إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إعادة تعيين', 
          style: 'destructive',
          onPress: async () => {
            try {
              const defaultSettings = {
                dark_mode: false,
                notifications: true,
                auto_play: false,
                font_size: 'medium',
                language: 'ar',
                prayer_city: 'وجدة',
                prayer_country: 'المغرب',
                haptic_feedback: true,
                sound_effects: true,
              };
              await updateSettings(defaultSettings);
            } catch (error) {
              console.log('Error resetting settings:', error);
            }
          }
        }
      ]
    );
  };

  const getFontSizeText = () => {
    switch (fontSize) {
      case 'small': return 'صغير';
      case 'medium': return 'متوسط';
      case 'large': return 'كبير';
      case 'extraLarge': return 'كبير جداً';
      default: return 'متوسط';
    }
  };

  const getLanguageText = () => {
    switch (language) {
      case 'ar': return 'العربية';
      case 'en': return 'English';
      case 'fr': return 'Français';
      default: return 'العربية';
    }
  };

  const settingsItems = [
    { name: 'الوضع الليلي', icon: 'moon', type: 'switch', value: darkMode, onToggle: (value) => handleSettingChange('darkMode', value) },
    { name: 'الإشعارات', icon: 'notifications', type: 'switch', value: notifications, onToggle: (value) => handleSettingChange('notifications', value) },
    { name: 'التشغيل التلقائي', icon: 'play', type: 'switch', value: autoPlay, onToggle: (value) => handleSettingChange('autoPlay', value) },
    { name: 'الاهتزاز', icon: 'phone-portrait', type: 'switch', value: hapticFeedback, onToggle: (value) => handleSettingChange('hapticFeedback', value) },
    { name: 'الأصوات', icon: 'volume-high', type: 'switch', value: soundEffects, onToggle: (value) => handleSettingChange('soundEffects', value) },
  ];

  const displayItems = [
    { name: 'حجم الخط', icon: 'text', type: 'modal', value: getFontSizeText(), onPress: () => setShowFontSizeModal(true) },
    { name: 'اللغة', icon: 'language', type: 'modal', value: getLanguageText(), onPress: () => setShowLanguageModal(true) },
    { name: 'المكان', icon: 'location', type: 'arrow', value: location },
  ];

  const moreItems = [
    { name: 'الملف الشخصي', icon: 'person', type: 'arrow', onPress: () => navigation.navigate('UserProfile') },
    { name: 'حول التطبيق', icon: 'information-circle', type: 'arrow' },
    { name: 'سياسة الخصوصية', icon: 'shield-checkmark', type: 'arrow' },
    { name: 'الشروط والأحكام', icon: 'document-text', type: 'arrow' },
    { name: 'تقييم التطبيق', icon: 'star', type: 'arrow' },
    { name: 'مشاركة التطبيق', icon: 'share-social', type: 'arrow' },
    { name: 'إعادة تعيين الإعدادات', icon: 'refresh', type: 'action', onPress: resetSettings },
  ];

  const fontSizes = [
    { key: 'small', name: 'صغير', size: 12 },
    { key: 'medium', name: 'متوسط', size: 16 },
    { key: 'large', name: 'كبير', size: 20 },
    { key: 'extraLarge', name: 'كبير جداً', size: 24 },
  ];

  const languages = [
    { key: 'ar', name: 'العربية', flag: '🇸🇦' },
    { key: 'en', name: 'English', flag: '🇺🇸' },
    { key: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  if (loading || dbLoading) {
    return (
      <View style={[styles.container, darkMode && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>جاري تحميل الإعدادات...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, darkMode && styles.containerDark]} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={darkMode ? ["#1F2937", "#111827"] : ["#6B7280", "#4B5563"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.appName}>الإعدادات</Text>
        <Text style={styles.time}>{currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.location}>تخصيص التطبيق</Text>
        <Text style={styles.remaining}>اضبط التطبيق حسب احتياجاتك</Text>
      </LinearGradient>

      {/* General Settings */}
      <View style={[styles.settingsContainer, darkMode && styles.settingsContainerDark]}>
        <Text style={[styles.settingsTitle, darkMode && styles.settingsTitleDark]}>الإعدادات العامة</Text>
        {settingsItems.map((item, index) => (
          <View key={index} style={[styles.settingItem, darkMode && styles.settingItemDark]}>
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color={darkMode ? "#9CA3AF" : "#6B7280"} />
              <Text style={[styles.settingName, darkMode && styles.settingNameDark]}>{item.name}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: darkMode ? '#374151' : '#E5E7EB', true: darkMode ? '#3B82F6' : '#6B7280' }}
              thumbColor={item.value ? '#FFFFFF' : darkMode ? '#6B7280' : '#F3F4F6'}
            />
          </View>
        ))}
      </View>

      {/* Display Settings */}
      <View style={[styles.settingsContainer, darkMode && styles.settingsContainerDark]}>
        <Text style={[styles.settingsTitle, darkMode && styles.settingsTitleDark]}>إعدادات العرض</Text>
        {displayItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.settingItem, darkMode && styles.settingItemDark]}
            onPress={item.onPress}
          >
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color={darkMode ? "#9CA3AF" : "#6B7280"} />
              <Text style={[styles.settingName, darkMode && styles.settingNameDark]}>{item.name}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, darkMode && styles.settingValueDark]}>{item.value}</Text>
              <Ionicons name="chevron-forward" size={20} color={darkMode ? "#6B7280" : "#9CA3AF"} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* More Options */}
      <View style={[styles.moreContainer, darkMode && styles.moreContainerDark]}>
        <Text style={[styles.moreTitle, darkMode && styles.moreTitleDark]}>المزيد</Text>
        {moreItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.moreItem, darkMode && styles.moreItemDark]}
            onPress={item.onPress}
          >
            <View style={styles.moreLeft}>
              <Ionicons name={item.icon} size={24} color={darkMode ? "#9CA3AF" : "#6B7280"} />
              <Text style={[styles.moreName, darkMode && styles.moreNameDark]}>{item.name}</Text>
            </View>
            {item.type !== 'action' && (
              <Ionicons name="chevron-forward" size={20} color={darkMode ? "#6B7280" : "#9CA3AF"} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View style={[styles.infoContainer, darkMode && styles.infoContainerDark]}>
        <Text style={[styles.infoTitle, darkMode && styles.infoTitleDark]}>BS_Team</Text>
        <Text style={[styles.infoVersion, darkMode && styles.infoVersionDark]}>الإصدار 1.0.0</Text>
        <Text style={[styles.infoDescription, darkMode && styles.infoDescriptionDark]}>تطبيق إسلامي شامل لخدمة المسلمين</Text>
      </View>

      {/* Font Size Modal */}
      <Modal
        visible={showFontSizeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFontSizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>اختر حجم الخط</Text>
            {fontSizes.map((font) => (
              <TouchableOpacity
                key={font.key}
                style={[
                  styles.modalItem,
                  darkMode && styles.modalItemDark,
                  fontSize === font.key && styles.modalItemSelected
                ]}
                onPress={() => handleFontSizeChange(font.key)}
              >
                <Text style={[
                  styles.modalItemText,
                  darkMode && styles.modalItemTextDark,
                  { fontSize: font.size }
                ]}>
                  {font.name}
                </Text>
                {fontSize === font.key && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, darkMode && styles.modalButtonDark]}
              onPress={() => setShowFontSizeModal(false)}
            >
              <Text style={[styles.modalButtonText, darkMode && styles.modalButtonTextDark]}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>اختر اللغة</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.key}
                style={[
                  styles.modalItem,
                  darkMode && styles.modalItemDark,
                  language === lang.key && styles.modalItemSelected
                ]}
                onPress={() => handleLanguageChange(lang.key)}
              >
                <Text style={styles.modalItemFlag}>{lang.flag}</Text>
                <Text style={[styles.modalItemText, darkMode && styles.modalItemTextDark]}>
                  {lang.name}
                </Text>
                {language === lang.key && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, darkMode && styles.modalButtonDark]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.modalButtonText, darkMode && styles.modalButtonTextDark]}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "sans-serif-medium",
  },
  time: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginVertical: 4,
  },
  location: {
    color: "#D1D5DB",
    fontSize: 16,
    marginBottom: 4,
  },
  remaining: {
    color: "#E5E7EB",
    fontSize: 14,
  },
  settingsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingName: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
  moreContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  moreTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 16,
  },
  moreItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  moreLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreName: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
  infoContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B7280",
    marginBottom: 8,
  },
  infoVersion: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});