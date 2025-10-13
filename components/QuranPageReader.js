import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import quranSurahService from '../services/quranSurahService';

const { width, height } = Dimensions.get('window');

export default function QuranPageReader({ navigation, route }) {
  const { pageNumber = 1 } = route?.params || {};
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [verses, setVerses] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(604);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadPageData();
  }, [currentPage]);

  const loadPageData = async () => {
    try {
      setLoading(true);
      const versesData = await quranSurahService.getVersesByPage(currentPage);
      
      setVerses(versesData);
      setPageInfo({
        page: currentPage,
        totalPages: 604 // Total pages in Quran
      });
      setTotalPages(604);
    } catch (error) {
      console.error('خطأ في تحميل بيانات الصفحة:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الصفحة');
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getBatteryLevel = () => {
    // Mock battery level - in real app, you'd get this from device
    return Math.floor(Math.random() * 40) + 60; // 60-100%
  };

  const renderVerse = (verse, index) => {
    const isFirstVerse = index === 0;
    const isLastVerse = index === verses.length - 1;
    
    return (
      <View key={verse.id} style={styles.verseContainer}>
        {isFirstVerse && (
          <View style={styles.basmalaContainer}>
            <Text style={styles.basmala}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          </View>
        )}
        
        <View style={styles.verseTextContainer}>
          <Text style={styles.verseText}>{verse.aya_text}</Text>
          <View style={styles.verseNumberContainer}>
            <Text style={styles.verseNumber}>{verse.aya_no}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>جاري تحميل الصفحة...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F4E6" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          {pageInfo && (
            <Text style={styles.surahName}>{pageInfo.sura_name_ar}</Text>
          )}
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={16} color="#000" />
            <Ionicons name="wifi" size={16} color="#000" />
            <View style={styles.batteryContainer}>
              <Ionicons name="battery-half" size={16} color="#166534" />
              <Text style={styles.batteryText}>{getBatteryLevel()}%</Text>
            </View>
          </View>
          {pageInfo && (
            <Text style={styles.juzText}>الجزء {pageInfo.jozz}</Text>
          )}
        </View>
      </View>

      {/* Surah Title Banner */}
      {pageInfo && (
        <View style={styles.surahBanner}>
          <View style={styles.bannerDecoration} />
          <Text style={styles.surahBannerText}>سورة {pageInfo.sura_name_ar}</Text>
          <View style={styles.bannerDecoration} />
        </View>
      )}

      {/* Quran Content */}
      <View style={styles.contentContainer}>
        <View style={styles.quranContent}>
          {verses.map((verse, index) => renderVerse(verse, index))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.pageNumber}>{currentPage}</Text>
        <View style={styles.hizbContainer}>
          <View style={styles.hizbDecoration} />
          <Text style={styles.hizbText}>الحزب {Math.ceil(currentPage / 4)}</Text>
          <View style={styles.hizbDecoration} />
        </View>
      </View>

      {/* Navigation Controls */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage <= 1 && styles.navButtonDisabled]}
          onPress={goToPreviousPage}
          disabled={currentPage <= 1}
        >
          <Ionicons name="chevron-back" size={24} color={currentPage <= 1 ? "#CCC" : "#166534"} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.pageButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#166534" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, currentPage >= totalPages && styles.navButtonDisabled]}
          onPress={goToNextPage}
          disabled={currentPage >= totalPages}
        >
          <Ionicons name="chevron-forward" size={24} color={currentPage >= totalPages ? "#CCC" : "#166534"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4E6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F4E6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  surahName: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  batteryText: {
    fontSize: 12,
    color: '#166534',
    marginLeft: 2,
  },
  juzText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  surahBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
    paddingVertical: 8,
    position: 'relative',
  },
  bannerDecoration: {
    width: 20,
    height: 20,
    backgroundColor: '#22C55E',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  surahBannerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quranContent: {
    flex: 1,
    justifyContent: 'center',
  },
  basmalaContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  basmala: {
    fontSize: 20,
    color: '#166534',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Amiri-Regular',
  },
  verseContainer: {
    marginBottom: 15,
  },
  verseTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  verseText: {
    fontSize: 18,
    color: '#000',
    lineHeight: 32,
    textAlign: 'right',
    flex: 1,
    fontFamily: 'Amiri-Regular',
    marginRight: 10,
  },
  verseNumberContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#166534',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  verseNumber: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  pageNumber: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  hizbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#166534',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  hizbDecoration: {
    width: 8,
    height: 8,
    backgroundColor: '#22C55E',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  hizbText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  navButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  pageButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#166534',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
