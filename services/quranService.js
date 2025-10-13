// Quran Service - تحميل البيانات بشكل كفء من ملف JSON المحلي
let quranData = null;

/**
 * تحميل بيانات القرآن عند الحاجة فقط
 */
const loadQuranData = () => {
  if (!quranData) {
    try {
      quranData = require('../assets/data/quran.json');
      console.log('تم تحميل بيانات القرآن بنجاح');
      console.log('نوع البيانات:', typeof quranData);
      console.log('هل البيانات مصفوفة؟', Array.isArray(quranData));
    } catch (error) {
      console.error('خطأ في تحميل ملف القرآن:', error);
      quranData = {};
    }
  }
  return quranData;
};

/**
 * الحصول على قائمة جميع السور (بدون تحميل الآيات)
 * @returns {Array} مصفوفة تحتوي على معلومات السور فقط
 */
export const getSurahs = () => {
  try {
    console.log('تحميل بيانات السور...');
    const data = loadQuranData();
    
    // إذا كان الملف يحتوي على مصفوفة من السور مباشرة
    if (Array.isArray(data)) {
      console.log('عدد السور في المصفوفة:', data.length);
      return data.map(surah => ({
        number: surah.number || surah.id,
        name: surah.name || surah.arabic_name || surah.english_name,
        verses_count: surah.verses_count || surah.versesCount || surah.numberOfAyahs,
        revelation_type: surah.revelation_type || surah.revelationPlace
      }));
    }
    
    // إذا كان الملف يحتوي على كائن مع خاصية surahs
    if (data.surahs && Array.isArray(data.surahs)) {
      console.log('عدد السور في surahs:', data.surahs.length);
      return data.surahs.map(surah => ({
        number: surah.number || surah.id,
        name: surah.name || surah.arabic_name || surah.english_name,
        verses_count: surah.verses_count || surah.versesCount || surah.numberOfAyahs,
        revelation_type: surah.revelation_type || surah.revelationPlace
      }));
    }
    
    // إذا كان الملف يحتوي على كائن مع أسماء السور كخصائص
    if (typeof data === 'object' && !Array.isArray(data)) {
      console.log('مفاتيح البيانات:', Object.keys(data));
      const surahs = [];
      Object.keys(data).forEach(key => {
        if (data[key] && typeof data[key] === 'object') {
          const surah = data[key];
          surahs.push({
            number: parseInt(key) || key,
            name: surah.name || surah.arabic_name || surah.english_name,
            verses_count: surah.verses_count || surah.versesCount || surah.numberOfAyahs,
            revelation_type: surah.revelation_type || surah.revelationPlace
          });
        }
      });
      console.log('عدد السور المُستخرجة:', surahs.length);
      return surahs.sort((a, b) => (a.number || 0) - (b.number || 0));
    }
    
    console.log('لم يتم العثور على تنسيق صحيح للبيانات');
    return [];
  } catch (error) {
    console.error('خطأ في قراءة بيانات السور:', error);
    return [];
  }
};

/**
 * الحصول على آيات سورة محددة (Lazy Loading)
 * @param {number|string} surahNumber - رقم السورة أو معرفها
 * @returns {string} نص الآيات ككتلة واحدة
 */
export const getSurahVerses = (surahNumber) => {
  try {
    console.log(`جاري تحميل آيات السورة رقم: ${surahNumber}`);
    const data = loadQuranData();
    let surah = null;
    
    // البحث عن السورة في البيانات
    if (Array.isArray(data)) {
      surah = data.find(s => 
        s.number === parseInt(surahNumber) || 
        s.number === surahNumber ||
        s.id === surahNumber
      );
    } else if (data.surahs && Array.isArray(data.surahs)) {
      surah = data.surahs.find(s => 
        s.number === parseInt(surahNumber) || 
        s.number === surahNumber ||
        s.id === surahNumber
      );
    } else if (data[surahNumber]) {
      surah = data[surahNumber];
    }
    
    if (!surah) {
      console.warn(`لم يتم العثور على السورة رقم: ${surahNumber}`);
      return '';
    }
    
    console.log('تم العثور على السورة:', surah.name || surah.arabic_name);
    console.log('مفاتيح السورة:', Object.keys(surah));
    
    // استخراج النص من السورة
    let fullText = '';
    
    // إذا كانت الآيات في مصفوفة
    if (surah.verses && Array.isArray(surah.verses)) {
      console.log('عدد الآيات في verses:', surah.verses.length);
      const sortedVerses = surah.verses.sort((a, b) => (a.number || 0) - (b.number || 0));
      sortedVerses.forEach(verse => {
        const verseText = verse.text || verse.text_arabic || verse.arabic || '';
        fullText += verseText + ' ';
      });
    } else if (surah.ayahs && Array.isArray(surah.ayahs)) {
      console.log('عدد الآيات في ayahs:', surah.ayahs.length);
      const sortedAyahs = surah.ayahs.sort((a, b) => (a.number || 0) - (b.number || 0));
      sortedAyahs.forEach(ayah => {
        const ayahText = ayah.text || ayah.text_arabic || ayah.arabic || '';
        fullText += ayahText + ' ';
      });
    } else if (surah.text) {
      // إذا كان النص كاملاً في حقل واحد
      console.log('النص موجود في حقل text');
      fullText = surah.text;
    } else {
      // البحث في خصائص السورة عن الآيات
      console.log('البحث في خصائص السورة عن الآيات...');
      Object.keys(surah).forEach(key => {
        if (key !== 'number' && key !== 'name' && key !== 'arabic_name' && 
            key !== 'english_name' && key !== 'revelation_type' && 
            key !== 'verses' && key !== 'ayahs' && key !== 'text' &&
            key !== 'verses_count' && key !== 'versesCount' && key !== 'numberOfAyahs') {
          if (surah[key] && typeof surah[key] === 'object') {
            const verseText = surah[key].text || surah[key].text_arabic || surah[key].arabic || '';
            if (verseText) {
              fullText += verseText + ' ';
            }
          }
        }
      });
    }
    
    console.log('طول النص المُستخرج:', fullText.length);
    return fullText.trim();
    
  } catch (error) {
    console.error(`خطأ في قراءة آيات السورة ${surahNumber}:`, error);
    return '';
  }
};

/**
 * الحصول على معلومات سورة محددة
 * @param {number|string} surahNumber - رقم السورة أو معرفها
 * @returns {Object|null} معلومات السورة أو null إذا لم يتم العثور عليها
 */
export const getSurahInfo = (surahNumber) => {
  try {
    const surahs = getSurahs();
    
    const surah = surahs.find(s => 
      s.number === parseInt(surahNumber) || 
      s.number === surahNumber ||
      s.id === surahNumber
    );
    
    return surah || null;
  } catch (error) {
    console.error(`خطأ في قراءة معلومات السورة ${surahNumber}:`, error);
    return null;
  }
};

/**
 * البحث في القرآن
 * @param {string} searchTerm - مصطلح البحث
 * @returns {Array} مصفوفة تحتوي على النتائج المطابقة
 */
export const searchQuran = (searchTerm) => {
  try {
    const surahs = getSurahs();
    const results = [];
    
    surahs.forEach(surah => {
      const versesText = getSurahVerses(surah.number);
      
      if (versesText.includes(searchTerm)) {
        results.push({
          surah: surah,
          surahNumber: surah.number,
          matchedText: versesText
        });
      }
    });
    
    return results;
  } catch (error) {
    console.error('خطأ في البحث في القرآن:', error);
    return [];
  }
};

export default {
  getSurahs,
  getSurahVerses,
  getSurahInfo,
  searchQuran
}; 