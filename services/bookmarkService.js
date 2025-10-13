import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@quran_bookmarks';

/**
 * حفظ آية في المفضلة
 * @param {Object} verse - معلومات الآية
 * @returns {Promise<boolean>} نجح الحفظ أم لا
 */
export const addBookmark = async (verse) => {
  try {
    const bookmarks = await getBookmarks();
    const newBookmark = {
      id: `${verse.surahNumber}_${verse.verseNumber}`,
      surahNumber: verse.surahNumber,
      surahName: verse.surahName,
      verseNumber: verse.verseNumber,
      verseText: verse.verseText,
      timestamp: new Date().toISOString()
    };
    
    // التحقق من عدم وجود الآية مسبقاً
    const exists = bookmarks.find(b => b.id === newBookmark.id);
    if (exists) {
      return false; // الآية موجودة مسبقاً
    }
    
    bookmarks.push(newBookmark);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ المفضلة:', error);
    return false;
  }
};

/**
 * إزالة آية من المفضلة
 * @param {string} bookmarkId - معرف المفضلة
 * @returns {Promise<boolean>} نجح الحذف أم لا
 */
export const removeBookmark = async (bookmarkId) => {
  try {
    const bookmarks = await getBookmarks();
    const filteredBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filteredBookmarks));
    return true;
  } catch (error) {
    console.error('خطأ في حذف المفضلة:', error);
    return false;
  }
};

/**
 * الحصول على جميع المفضلة
 * @returns {Promise<Array>} قائمة المفضلة
 */
export const getBookmarks = async () => {
  try {
    const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('خطأ في جلب المفضلة:', error);
    return [];
  }
};

/**
 * التحقق من وجود آية في المفضلة
 * @param {number} surahNumber - رقم السورة
 * @param {number} verseNumber - رقم الآية
 * @returns {Promise<boolean>} موجودة في المفضلة أم لا
 */
export const isBookmarked = async (surahNumber, verseNumber) => {
  try {
    const bookmarks = await getBookmarks();
    const bookmarkId = `${surahNumber}_${verseNumber}`;
    return bookmarks.some(b => b.id === bookmarkId);
  } catch (error) {
    console.error('خطأ في التحقق من المفضلة:', error);
    return false;
  }
};

/**
 * مسح جميع المفضلة
 * @returns {Promise<boolean>} نجح المسح أم لا
 */
export const clearBookmarks = async () => {
  try {
    await AsyncStorage.removeItem(BOOKMARKS_KEY);
    return true;
  } catch (error) {
    console.error('خطأ في مسح المفضلة:', error);
    return false;
  }
};

export default {
  addBookmark,
  removeBookmark,
  getBookmarks,
  isBookmarked,
  clearBookmarks
}; 