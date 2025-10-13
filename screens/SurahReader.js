import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import quranSurahService from '../services/quranSurahService';

const { width, height } = Dimensions.get('window');

export default function SurahReader({ route, navigation }) {
  const { suraNameEn, suraNameAr, suraNo } = route.params;
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const [dynamicFontSize, setDynamicFontSize] = useState(18); // Dynamic font size based on content

  useEffect(() => {
    loadSurah();
  }, [suraNameEn]);

  // Calculate dynamic font size based on content length
  useEffect(() => {
    if (surah?.verses?.length > 0) {
      calculateDynamicFontSize();
    }
  }, [surah, fontSize]);

  const calculateDynamicFontSize = () => {
    const baseFontSize = fontSize;
    const verseCount = surah?.verses?.length || 0;
    const totalTextLength = surah?.verses?.reduce((total, verse) => total + verse.aya_text.length, 0) || 0;
    
    // Adjust font size based on content density
    let adjustedFontSize = baseFontSize;
    
    if (verseCount > 15 || totalTextLength > 2000) {
      // High content - reduce font size
      adjustedFontSize = Math.max(baseFontSize - 4, 14);
    } else if (verseCount > 10 || totalTextLength > 1500) {
      // Medium-high content - slightly reduce font size
      adjustedFontSize = Math.max(baseFontSize - 2, 16);
    } else if (verseCount < 5 && totalTextLength < 800) {
      // Low content - can increase font size
      adjustedFontSize = Math.min(baseFontSize + 2, 28);
    }
    
    setDynamicFontSize(adjustedFontSize);
  };

  const loadSurah = async () => {
    try {
      setLoading(true);
      setError(null);
      const surahData = await quranSurahService.loadSurah(suraNameEn);
      setSurah(surahData);
    } catch (err) {
      console.error('خطأ في تحميل السورة:', err);
      setError('فشل تحميل السورة');
      Alert.alert('خطأ', 'حدث خطأ في تحميل السورة');
    } finally {
      setLoading(false);
    }
  };

  const renderBasmala = () => {
    if (suraNo === 1) return null; // Al-Fatiha doesn't have Basmala as separate verse
    if (suraNo === 9) return null; // Al-Tawbah doesn't have Basmala
    
    return (
      <Text style={[styles.basmala, { fontSize: dynamicFontSize + 4 }]}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </Text>
    );
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    setShowSettings(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>جاري تحميل السورة...</Text>
      </View>
    );
  }

  if (error || !surah) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'حدث خطأ غير متوقع'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSurah}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Mushaf Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2E8B57" />
        </TouchableOpacity>
        <Text style={styles.time}>
          {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <TouchableOpacity 
          onPress={() => setShowSettings(!showSettings)} 
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color="#2E8B57" />
        </TouchableOpacity>
      </View>

      {/* Surah Info */}
      <View style={styles.surahInfo}>
        <Text style={styles.surahName}>
          {suraNameAr}
        </Text>
        <Text style={styles.juz}>
          الجزء {Math.ceil(suraNo / 2)}
        </Text>
      </View>

      {/* Decorative Element */}
      <View style={styles.decorContainer}>
        <View style={styles.decorLine} />
        <View style={styles.decorCircle} />
        <View style={styles.decorLine} />
      </View>

      {/* Surah Title */}
      <Text style={styles.surahTitle}>
        سورة {suraNameAr}
      </Text>

      {/* Basmala */}
      {renderBasmala()}

      {/* Quran Text */}
      <View style={styles.quranTextContainer}>
        <Text style={[styles.quranText, { fontSize: dynamicFontSize }]}>
          {surah?.verses?.map((verse, index) => (
            <Text key={verse.id}>
              {verse.aya_text}
              <Text style={styles.ayahNumber}> ﴿{verse.aya_no}﴾</Text>
              {' '}
            </Text>
          ))}
        </Text>
      </View>

      {/* Font Size Settings */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>حجم الخط</Text>
          <View style={styles.fontSizeButtons}>
            {[20, 24, 28, 32, 36, 40].map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.fontSizeButton,
                  fontSize === size && styles.fontSizeButtonActive
                ]}
                onPress={() => handleFontSizeChange(size)}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  fontSize === size && styles.fontSizeButtonTextActive
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {surah?.verses?.length} آية
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F2E9', // light cream mushaf color
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F2E9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F2E9',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 5,
  },
  time: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'System',
  },
  settingsButton: {
    padding: 5,
  },
  surahInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  surahName: {
    fontSize: 18,
    color: '#2E8B57', // green for surah
    marginVertical: 4,
    fontFamily: 'Uthmani',
    textAlign: 'center',
  },
  juz: {
    fontSize: 16,
    color: '#2E8B57',
    fontFamily: 'Uthmani',
    textAlign: 'center',
  },
  decorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  decorLine: {
    width: 40,
    height: 2,
    backgroundColor: '#2E8B57',
  },
  decorCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E8B57',
    marginHorizontal: 8,
  },
  surahTitle: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Uthmani',
    color: '#2E8B57',
    marginVertical: 16,
  },
  basmala: {
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 16,
    fontFamily: 'Uthmani',
    color: '#000',
    lineHeight: 35,
  },
  quranTextContainer: {
    marginVertical: 20,
    paddingHorizontal: 20, // Equal margins on both sides
    alignItems: 'center', // Center the text container
  },
  quranText: {
    fontSize: 18, // Base font size, will be overridden by dynamicFontSize
    lineHeight: 45, // Adjusted line height
    textAlign: 'justify', // Justify text for better flow
    writingDirection: 'rtl',
    fontFamily: 'Uthmani',
    color: '#000',
    textAlignVertical: 'top',
    maxWidth: '100%', // Ensure text doesn't overflow
  },
  ayahNumber: {
    fontSize: 18,
    color: '#2E8B57',
    fontFamily: 'Uthmani',
  },
  settingsPanel: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 10,
    textAlign: 'center',
  },
  fontSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  fontSizeButton: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  fontSizeButtonActive: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  fontSizeButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 'bold',
  },
  fontSizeButtonTextActive: {
    color: '#FFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#2E8B57',
    fontFamily: 'Uthmani',
    textAlign: 'center',
  },
});
