import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import quranSurahService from '../services/quranSurahService';
import { addBookmark, removeBookmark, isBookmarked } from '../services/bookmarkService';
import { IslamicText } from '../components/FontLoader';

const VersesScreen = ({ route, navigation }) => {
  const { surahId, surahName, verseNumber } = route.params;
  const [verses, setVerses] = useState([]);
  const [surahInfo, setSurahInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState(new Set());

  useEffect(() => {
    loadSurahData();
  }, [surahId]);

  const loadSurahData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب معلومات السورة والآيات
      const surahData = await quranSurahService.loadSurah(surahId);
      
      setVerses(surahData.verses || []);
      setSurahInfo({
        sura_no: surahId,
        sura_name_ar: surahName,
        total_verses: surahData.verses?.length || 0
      });
      
      // تحديث عنوان الشاشة
      navigation.setOptions({
        title: surahName
      });
      
    } catch (err) {
      setError('حدث خطأ في تحميل الآيات');
      Alert.alert('خطأ', 'حدث خطأ في تحميل الآيات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const renderBasmala = () => {
    if (surahId === 1) return null; // سورة الفاتحة لا تحتاج البسملة
    
    return (
      <View style={styles.basmalaContainer}>
        <IslamicText style={styles.basmalaText}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </IslamicText>
      </View>
    );
  };

  const renderSurahTitle = () => (
    <View style={styles.surahTitleContainer}>
      <IslamicText style={styles.surahTitleText}>
        {surahName}
      </IslamicText>
    </View>
  );

  const handleBookmarkToggle = async (verse) => {
    const verseInfo = {
      surahNumber: surahId,
      surahName: surahName,
      verseNumber: verse.aya_no,
      verseText: verse.aya_text
    };

    if (bookmarkedVerses.has(verse.aya_no)) {
      // إزالة من المفضلة
      const success = await removeBookmark(`${surahId}_${verse.aya_no}`);
      if (success) {
        setBookmarkedVerses(prev => {
          const newSet = new Set(prev);
          newSet.delete(verse.aya_no);
          return newSet;
        });
      }
    } else {
      // إضافة إلى المفضلة
      const success = await addBookmark(verseInfo);
      if (success) {
        setBookmarkedVerses(prev => {
          const newSet = new Set(prev);
          newSet.add(verse.aya_no);
          return newSet;
        });
      }
    }
  };

  const renderVersesText = () => {
    if (!verses || verses.length === 0) {
      return (
        <Text style={styles.noVersesText}>لا توجد آيات متاحة</Text>
      );
    }

    return (
      <View style={styles.versesContainer}>
        {verses.map((verse, index) => (
          <View key={index} style={styles.verseContainer}>
            <View style={styles.verseNumberContainer}>
              <Text style={styles.verseNumber}>{verse.aya_no}</Text>
            </View>
            <View style={styles.verseContent}>
              <IslamicText style={styles.verseText}>
                {verse.aya_text}
              </IslamicText>
              <TouchableOpacity
                style={[
                  styles.bookmarkButton,
                  bookmarkedVerses.has(verse.aya_no) && styles.bookmarkButtonActive
                ]}
                onPress={() => handleBookmarkToggle(verse)}
              >
                <Text style={[
                  styles.bookmarkButtonText,
                  bookmarkedVerses.has(verse.aya_no) && styles.bookmarkButtonTextActive
                ]}>
                  {bookmarkedVerses.has(verse.aya_no) ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>جاري تحميل الآيات...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSurahData}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quranContainer}>
          {renderSurahTitle()}
          {renderBasmala()}
          {renderVersesText()}
        </View>
      </ScrollView>
    </View>
  );
};

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
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  quranContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  surahTitleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  surahTitleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  basmalaContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  basmalaText: {
    fontSize: 28,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 45,
    fontStyle: 'italic',
  },
  versesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  verseNumberContainer: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  verseNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  verseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookmarkButton: {
    backgroundColor: '#F3F4F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 4,
  },
  bookmarkButtonActive: {
    backgroundColor: '#FEF3C7',
  },
  bookmarkButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  bookmarkButtonTextActive: {
    color: '#F59E0B',
  },
  versesText: {
    fontSize: 22,
    color: '#1F2937',
    lineHeight: 45,
    textAlign: 'justify',
    textAlignVertical: 'top',
  },
  verseText: {
    flex: 1,
    fontSize: 22,
    color: '#1F2937',
    lineHeight: 45,
    textAlign: 'justify',
    textAlignVertical: 'top',
  },
  noVersesText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default VersesScreen; 