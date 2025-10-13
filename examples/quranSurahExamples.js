import quranSurahService from '../services/quranSurahService';

// Example usage of the Quran Surah Service

export const QuranExamples = {
  
  // Example 1: Load Al-Fatiha
  async loadAlFatiha() {
    try {
      const surah = await quranSurahService.loadSurah('Al-Fātiḥah');
      console.log('Al-Fatiha loaded:', surah.metadata);
      console.log('First verse:', surah.verses[0]);
      return surah;
    } catch (error) {
      console.error('Error loading Al-Fatiha:', error);
    }
  },

  // Example 2: Load surah by number
  async loadSurahByNumber() {
    try {
      const surah = await quranSurahService.loadSurahByNumber(2); // Al-Baqarah
      console.log('Al-Baqarah loaded:', surah.metadata);
      return surah;
    } catch (error) {
      console.error('Error loading surah by number:', error);
    }
  },

  // Example 3: Get all surahs metadata
  async getAllSurahs() {
    try {
      const surahs = await quranSurahService.getAllSurahs();
      console.log('Total surahs:', surahs.length);
      console.log('First 5 surahs:', surahs.slice(0, 5));
      return surahs;
    } catch (error) {
      console.error('Error loading all surahs:', error);
    }
  },

  // Example 4: Search verses
  async searchVerses() {
    try {
      const results = await quranSurahService.searchVerses('الله');
      console.log('Search results for "الله":', results.length, 'verses');
      console.log('First result:', results[0]);
      return results;
    } catch (error) {
      console.error('Error searching verses:', error);
    }
  },

  // Example 5: Load page 1
  async loadPage1() {
    try {
      const verses = await quranSurahService.getVersesByPage(1);
      console.log('Page 1 verses:', verses.length);
      console.log('First verse on page 1:', verses[0]);
      return verses;
    } catch (error) {
      console.error('Error loading page 1:', error);
    }
  },

  // Example 6: Cache management
  async cacheExample() {
    try {
      // Load a surah (will be cached)
      await quranSurahService.loadSurah('Al-Fātiḥah');
      
      // Check cache stats
      const stats = quranSurahService.getCacheStats();
      console.log('Cache stats:', stats);
      
      // Clear cache
      quranSurahService.clearCache();
      console.log('Cache cleared');
      
    } catch (error) {
      console.error('Error in cache example:', error);
    }
  }
};

// Usage in a React component
export const useQuranSurah = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSurah = async (suraNameEn) => {
    setLoading(true);
    setError(null);
    try {
      const surah = await quranSurahService.loadSurah(suraNameEn);
      return surah;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchVerses = async (searchText) => {
    setLoading(true);
    setError(null);
    try {
      const results = await quranSurahService.searchVerses(searchText);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loadSurah,
    searchVerses,
    loading,
    error
  };
};
