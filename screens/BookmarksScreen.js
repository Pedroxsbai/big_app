import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useDatabase } from '../services/DatabaseContext';
import { IslamicText } from '../components/FontLoader';

const BookmarksScreen = ({ navigation }) => {
  const { getUserBookmarks, removeBookmark } = useDatabase();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const bookmarksData = await getUserBookmarks();
      setBookmarks(bookmarksData);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    Alert.alert(
      'حذف المفضلة',
      'هل تريد حذف هذه الآية من المفضلة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const success = await removeBookmark(bookmarkId);
            if (success) {
              await loadBookmarks(); // إعادة تحميل القائمة
            }
          }
        }
      ]
    );
  };

  const navigateToVerse = (bookmark) => {
    navigation.navigate('QuranPageReader', { pageNumber: bookmark.page });
  };

  const renderBookmarkItem = (bookmark) => (
    <TouchableOpacity
      key={bookmark.id}
      style={styles.bookmarkItem}
      onPress={() => navigateToVerse(bookmark)}
    >
      <View style={styles.bookmarkHeader}>
        <View style={styles.bookmarkInfo}>
          <Text style={styles.surahName}>{bookmark.surah_name}</Text>
          <Text style={styles.verseNumber}>آية {bookmark.verse_number}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveBookmark(bookmark.id)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <IslamicText style={styles.verseText}>
        {bookmark.verse_text}
      </IslamicText>
      
      <Text style={styles.timestamp}>
        {new Date(bookmark.created_at).toLocaleDateString('ar-SA')}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📖</Text>
      <Text style={styles.emptyTitle}>لا توجد مفضلة</Text>
      <Text style={styles.emptySubtitle}>
        يمكنك إضافة آيات إلى المفضلة من شاشة القرآن
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>جاري تحميل المفضلة...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IslamicText style={styles.headerTitle}>المفضلة</IslamicText>
        <Text style={styles.headerSubtitle}>
          {bookmarks.length} آية محفوظة
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {bookmarks.length > 0 ? (
          bookmarks.map(renderBookmarkItem)
        ) : (
          renderEmptyState()
        )}
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
  header: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  bookmarkItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  verseNumber: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verseText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 28,
    textAlign: 'justify',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'left',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BookmarksScreen; 