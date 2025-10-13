import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import quranSurahService from '../services/quranSurahService';
import QuranText from '../components/QuranText';

export default function QuranSearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال نص للبحث');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const results = await quranSurahService.searchVerses(searchText.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('خطأ في البحث:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  const navigateToVerse = (verse) => {
    navigation.navigate('QuranPageReader', { pageNumber: verse.page });
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderSearchResult = (verse, index) => (
    <TouchableOpacity
      key={`${verse.sura_no}-${verse.aya_no}-${index}`}
      style={styles.resultCard}
      onPress={() => navigateToVerse(verse)}
    >
      <View style={styles.resultHeader}>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{verse.sura_name_ar}</Text>
          <Text style={styles.verseInfo}>آية {verse.aya_no}</Text>
        </View>
        <View style={styles.pageInfo}>
          <Text style={styles.pageNumber}>ص {verse.page}</Text>
        </View>
      </View>
      
      <QuranText 
        fontSize={16}
        style={styles.verseText} 
        numberOfLines={3}
        useUthmani={true}
      >
        {verse.aya_text}
      </QuranText>
      
      <View style={styles.resultFooter}>
        <MaterialCommunityIcons name="book-open-page-variant" size={16} color="#6B7280" />
        <Text style={styles.footerText}>اضغط للانتقال للصفحة</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>البحث في القرآن</Text>
        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث في القرآن الكريم..."
            value={searchText}
            onChangeText={setSearchText}
            textAlign="right"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearInputButton}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={styles.loadingText}>جاري البحث...</Text>
          </View>
        )}

        {!loading && hasSearched && searchResults.length === 0 && (
          <View style={styles.noResultsContainer}>
            <MaterialCommunityIcons name="text-search" size={64} color="#D1D5DB" />
            <Text style={styles.noResultsTitle}>لم يتم العثور على نتائج</Text>
            <Text style={styles.noResultsText}>
              حاول البحث بكلمات مختلفة أو تحقق من الإملاء
            </Text>
          </View>
        )}

        {!loading && searchResults.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              تم العثور على {searchResults.length} نتيجة
            </Text>
          </View>
        )}

        {searchResults.map((verse, index) => renderSearchResult(verse, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  clearButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
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
  clearInputButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: '#166534',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  resultsHeader: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsCount: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  surahInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginRight: 10,
  },
  verseInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  pageInfo: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pageNumber: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  verseText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 10,
  },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 5,
  },
});