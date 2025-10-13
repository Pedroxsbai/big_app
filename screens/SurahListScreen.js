import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import quranSurahService from '../services/quranSurahService';

export default function SurahListScreen({ navigation }) {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadSurahs();
  }, []);

  useEffect(() => {
    filterSurahs();
  }, [searchText, surahs]);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      const surahsData = await quranSurahService.getAllSurahs();
      setSurahs(surahsData);
    } catch (error) {
      console.error('خطأ في تحميل السور:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل قائمة السور');
    } finally {
      setLoading(false);
    }
  };

  const filterSurahs = () => {
    if (!searchText.trim()) {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter(surah =>
        surah.sura_name_ar.toLowerCase().includes(searchText.toLowerCase()) ||
        surah.sura_name_en.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSurahs(filtered);
    }
  };

  const navigateToSurah = (surah) => {
    // Find the first page of this surah
    const firstPage = surah.verses && surah.verses.length > 0 ? surah.verses[0].page : 1;
    navigation.navigate('QuranPageReader', { pageNumber: firstPage });
  };

  const getSurahType = (surahNumber) => {
    const makkiSurahs = [1, 6, 7, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 55, 56, 67, 68, 69, 70, 71, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
    return makkiSurahs.includes(surahNumber) ? 'مكية' : 'مدنية';
  };

  const getSurahTypeColor = (surahNumber) => {
    const makkiSurahs = [1, 6, 7, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 55, 56, 67, 68, 69, 70, 71, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
    return makkiSurahs.includes(surahNumber) ? '#059669' : '#DC2626';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>جاري تحميل السور...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>السور</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="البحث في السور..."
          value={searchText}
          onChangeText={setSearchText}
          textAlign="right"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Surahs List */}
      <ScrollView style={styles.surahsList} showsVerticalScrollIndicator={false}>
        {filteredSurahs.map((surah, index) => (
          <TouchableOpacity
            key={surah.sura_no}
            style={styles.surahCard}
            onPress={() => navigateToSurah(surah)}
          >
            <View style={styles.surahNumberContainer}>
              <Text style={styles.surahNumber}>{surah.sura_no}</Text>
            </View>
            
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>{surah.sura_name_ar}</Text>
              <Text style={styles.surahNameEn}>{surah.sura_name_en}</Text>
              <View style={styles.surahDetails}>
                <Text style={styles.verseCount}>{surah.total_verses} آية</Text>
                <View style={styles.separator} />
                <Text style={[styles.surahType, { color: getSurahTypeColor(surah.sura_no) }]}>
                  {getSurahType(surah.sura_no)}
                </Text>
                <View style={styles.separator} />
                <Text style={styles.pageRange}>
                  سورة {surah.sura_no}
                </Text>
              </View>
            </View>
            
            <View style={styles.surahActions}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons name="play" size={20} color="#166534" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons name="bookmark-outline" size={20} color="#166534" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#166534',
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  searchButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 5,
  },
  surahsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  surahCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  surahNumberContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#166534',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  surahNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  surahNameEn: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  surahDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verseCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  surahType: {
    fontSize: 12,
    fontWeight: '600',
  },
  pageRange: {
    fontSize: 12,
    color: '#6B7280',
  },
  surahActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
});
