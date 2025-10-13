class QuranSurahService {
  constructor() {
    this.cache = new Map(); // Cache loaded surahs
    this.mainQuranData = null; // Cache for main Quran data
  }

  /**
   * Load the main Quran JSON file as fallback
   * @returns {Promise<Array>} - All Quran verses
   */
  async loadMainQuranData() {
    if (this.mainQuranData) {
      return this.mainQuranData;
    }

    try {
      console.log('📖 Loading main Quran data as fallback...');
      
      // Import the JSON data directly
      const quranData = require('../assets/quran_json/quran.json');
      
      this.mainQuranData = quranData;
      
      console.log(`✅ Loaded main Quran data: ${this.mainQuranData.length} verses`);
      return this.mainQuranData;
    } catch (error) {
      console.error('❌ Error loading main Quran data:', error);
      throw error;
    }
  }

  /**
   * Get all surahs metadata from main data
   * @returns {Promise<Array>} - Array of surah metadata
   */
  async getAllSurahs() {
    try {
      const quranData = await this.loadMainQuranData();
      
      // Group verses by surah and create metadata
      const surahsMap = new Map();
      
      quranData.forEach(verse => {
        const suraNo = verse.sura_no;
        if (!surahsMap.has(suraNo)) {
          surahsMap.set(suraNo, {
            sura_no: suraNo,
            sura_name_en: verse.sura_name_en,
            sura_name_ar: verse.sura_name_ar,
            total_verses: 0,
            verses: []
          });
        }
        
        const surah = surahsMap.get(suraNo);
        surah.total_verses++;
        surah.verses.push(verse);
      });

      // Convert to array and sort by sura_no
      const surahs = Array.from(surahsMap.values()).sort((a, b) => a.sura_no - b.sura_no);
      
      console.log(`✅ Generated ${surahs.length} surahs metadata`);
      return surahs;

    } catch (error) {
      console.error('❌ Error loading all surahs:', error);
      throw error;
    }
  }

  /**
   * Load a specific surah by its English name
   * @param {string} suraNameEn - English name of the surah (e.g., "Al-Fātiḥah")
   * @returns {Promise<Object>} - Surah data with metadata and verses
   */
  async loadSurah(suraNameEn) {
    try {
      // Check cache first
      if (this.cache.has(suraNameEn)) {
        console.log(`📖 Loading ${suraNameEn} from cache`);
        return this.cache.get(suraNameEn);
      }

      console.log(`📖 Loading ${suraNameEn} from main data...`);

      const quranData = await this.loadMainQuranData();
      
      // Find verses for this surah
      const surahVerses = quranData.filter(verse => verse.sura_name_en === suraNameEn);
      
      if (surahVerses.length === 0) {
        throw new Error(`Surah ${suraNameEn} not found`);
      }

      // Create surah data structure
      const surahData = {
        metadata: {
          sura_no: surahVerses[0].sura_no,
          sura_name_en: surahVerses[0].sura_name_en,
          sura_name_ar: surahVerses[0].sura_name_ar,
          total_verses: surahVerses.length,
          created_at: new Date().toISOString()
        },
        verses: surahVerses.map(verse => ({
          id: verse.id,
          jozz: verse.jozz,
          page: verse.page,
          line_start: verse.line_start,
          line_end: verse.line_end,
          aya_no: verse.aya_no,
          aya_text: verse.aya_text,
          aya_text_emlaey: verse.aya_text_emlaey
        }))
      };

      // Cache the data
      this.cache.set(suraNameEn, surahData);

      console.log(`✅ Loaded ${suraNameEn}: ${surahData.verses.length} verses`);
      return surahData;

    } catch (error) {
      console.error(`❌ Error loading surah ${suraNameEn}:`, error);
      throw error;
    }
  }

  /**
   * Load a surah by its number
   * @param {number} suraNo - Surah number (1-114)
   * @returns {Promise<Object>} - Surah data
   */
  async loadSurahByNumber(suraNo) {
    try {
      const quranData = await this.loadMainQuranData();
      
      // Find verses for this surah number
      const surahVerses = quranData.filter(verse => verse.sura_no === suraNo);
      
      if (surahVerses.length === 0) {
        throw new Error(`Surah number ${suraNo} not found`);
      }

      const suraNameEn = surahVerses[0].sura_name_en;
      return await this.loadSurah(suraNameEn);

    } catch (error) {
      console.error(`❌ Error loading surah by number ${suraNo}:`, error);
      throw error;
    }
  }

  /**
   * Search verses across multiple surahs
   * @param {string} searchText - Text to search for
   * @param {Array} surahNumbers - Optional array of surah numbers to search in
   * @returns {Promise<Array>} - Array of matching verses
   */
  async searchVerses(searchText, surahNumbers = null) {
    try {
      const results = [];
      const quranData = await this.loadMainQuranData();
      
      console.log(`🔍 Searching "${searchText}" in Quran data...`);

      // Filter data if specific surah numbers provided
      let searchData = quranData;
      if (surahNumbers && surahNumbers.length > 0) {
        searchData = quranData.filter(verse => surahNumbers.includes(verse.sura_no));
      }

      // Search in verses
      const matchingVerses = searchData.filter(verse => 
        verse.aya_text_emlaey.toLowerCase().includes(searchText.toLowerCase()) ||
        verse.aya_text.toLowerCase().includes(searchText.toLowerCase())
      );

      console.log(`✅ Found ${matchingVerses.length} matching verses`);
      return matchingVerses;

    } catch (error) {
      console.error('❌ Error searching verses:', error);
      throw error;
    }
  }

  /**
   * Get verses for a specific page
   * @param {number} pageNumber - Page number (1-604)
   * @returns {Promise<Array>} - Array of verses on that page
   */
  async getVersesByPage(pageNumber) {
    try {
      const quranData = await this.loadMainQuranData();

      console.log(`📄 Loading page ${pageNumber}...`);

      // Find verses on this page
      const pageVerses = quranData.filter(verse => verse.page === pageNumber);

      // Sort by line_start and aya_no
      pageVerses.sort((a, b) => {
        if (a.line_start !== b.line_start) {
          return a.line_start - b.line_start;
        }
        return a.aya_no - b.aya_no;
      });

      console.log(`✅ Found ${pageVerses.length} verses on page ${pageNumber}`);
      return pageVerses;

    } catch (error) {
      console.error(`❌ Error loading page ${pageNumber}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache to free memory
   */
  clearCache() {
    console.log('🗑️ Clearing Quran cache...');
    this.cache.clear();
    this.mainQuranData = null;
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hasMainData: this.mainQuranData !== null
    };
  }
}

// Create singleton instance
const quranSurahService = new QuranSurahService();

export default quranSurahService;
