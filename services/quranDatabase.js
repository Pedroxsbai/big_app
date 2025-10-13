import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

let database = null;
let isInitialized = false;

/**
 * تهيئة قاعدة البيانات
 */
const initDatabase = async () => {
  if (isInitialized) return database;

  try {
    console.log('جاري تهيئة قاعدة البيانات...');
    
    // نسخ ملف قاعدة البيانات من assets إلى مجلد المستندات
    await copyDatabaseFile();
    
    // فتح قاعدة البيانات باستخدام API الجديد
    database = await SQLite.openDatabaseAsync('quran.db');
    
    isInitialized = true;
    console.log('تم تهيئة قاعدة البيانات بنجاح');
    return database;
  } catch (error) {
    console.error('خطأ في تهيئة قاعدة البيانات:', error);
    throw error;
  }
};

/**
 * نسخ ملف قاعدة البيانات من assets إلى مجلد المستندات
 */
const copyDatabaseFile = async () => {
  try {
    const destinationUri = FileSystem.documentDirectory + 'quran.db';
    
    // التحقق من وجود الملف في الوجهة
    const fileInfo = await FileSystem.getInfoAsync(destinationUri);
    if (!fileInfo.exists) {
      console.log('جاري إنشاء قاعدة البيانات...');
      
      // إنشاء قاعدة بيانات جديدة
      const db = SQLite.openDatabase('quran.db');
      
      // إنشاء الجداول وإدخال البيانات
      await createTablesAndData(db);
      
      console.log('تم إنشاء قاعدة البيانات بنجاح');
    } else {
      console.log('ملف قاعدة البيانات موجود بالفعل');
    }
  } catch (error) {
    console.error('خطأ في إنشاء قاعدة البيانات:', error);
    throw error;
  }
};

/**
 * إنشاء الجداول وإدخال البيانات
 */
const createTablesAndData = async (db) => {
  try {
    // إنشاء الجدول
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS quran_verses (
        id INTEGER PRIMARY KEY,
        jozz INTEGER,
        sura_no INTEGER,
        sura_name_en TEXT,
        sura_name_ar TEXT,
        page INTEGER,
        line_start INTEGER,
        line_end INTEGER,
        aya_no INTEGER,
        aya_text TEXT,
        aya_text_emlaey TEXT
      )
    `);
    
    // إدخال بيانات القرآن الحقيقية
    await insertQuranData(db);
  } catch (error) {
    console.error('خطأ في إنشاء الجداول:', error);
    throw error;
  }
};

/**
 * إدخال بيانات القرآن
 */
const insertQuranData = async (db) => {
  try {
    // بيانات سورة الفاتحة
    const fatihaVerses = [
      { id: 1, jozz: 1, sura_no: 1, sura_name_en: 'Al-Fatiha', sura_name_ar: 'الفاتحة', page: 1, line_start: 2, line_end: 2, aya_no: 1, aya_text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', aya_text_emlaey: 'بسم الله الرحمن الرحيم' },
      { id: 2, jozz: 1, sura_no: 1, sura_name_en: 'Al-Fatiha', sura_name_ar: 'الفاتحة', page: 1, line_start: 3, line_end: 3, aya_no: 2, aya_text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', aya_text_emlaey: 'الحمد لله رب العالمين' },
      { id: 3, jozz: 1, sura_no: 1, sura_name_en: 'Al-Fatiha', sura_name_ar: 'الفاتحة', page: 1, line_start: 4, line_end: 4, aya_no: 3, aya_text: 'الرَّحْمَٰنِ الرَّحِيمِ', aya_text_emlaey: 'الرحمن الرحيم' },
      { id: 4, jozz: 1, sura_no: 1, sura_name_en: 'Al-Fatiha', sura_name_ar: 'الفاتحة', page: 1, line_start: 4, line_end: 4, aya_no: 4, aya_text: 'مَالِكِ يَوْمِ الدِّينِ', aya_text_emlaey: 'مالك يوم الدين' },
      { id: 5, jozz: 1, sura_no: 1, sura_name_en: 'Al-Fatiha', sura_name_ar: 'الفاتحة', page: 1, line_start: 5, line_end: 5, aya_no: 5, aya_text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', aya_text_emlaey: 'إياك نعبد وإياك نستعين' },
      { id: 6, jozz: 1, sura_no: 1, sura_name_en: 'Al-Fatiha', sura_name_ar: 'الفاتحة', page: 1, line_start: 5, line_end: 6, aya_no: 6, aya_text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', aya_text_emlaey: 'اهدنا الصراط المستقيم' },
      { id: 7, jozz: 1, sura_no: 1, sura_name_en: 'Al-Fatiha', sura_name_ar: 'الفاتحة', page: 1, line_start: 6, line_end: 6, aya_no: 7, aya_text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', aya_text_emlaey: 'صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين' }
    ];

    // إدخال آيات سورة الفاتحة
    for (const verse of fatihaVerses) {
      await db.runAsync(
        'INSERT INTO quran_verses (id, jozz, sura_no, sura_name_en, sura_name_ar, page, line_start, line_end, aya_no, aya_text, aya_text_emlaey) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [verse.id, verse.jozz, verse.sura_no, verse.sura_name_en, verse.sura_name_ar, verse.page, verse.line_start, verse.line_end, verse.aya_no, verse.aya_text, verse.aya_text_emlaey]
      );
    }

    // بيانات سورة البقرة (أول 10 آيات)
    const baqarahVerses = [
      { id: 8, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 1, line_end: 1, aya_no: 1, aya_text: 'الٓمٓ', aya_text_emlaey: 'الم' },
      { id: 9, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 2, line_end: 2, aya_no: 2, aya_text: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ', aya_text_emlaey: 'ذلك الكتاب لا ريب فيه هدى للمتقين' },
      { id: 10, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 3, line_end: 3, aya_no: 3, aya_text: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ', aya_text_emlaey: 'الذين يؤمنون بالغيب ويقيمون الصلاة ومما رزقناهم ينفقون' },
      { id: 11, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 4, line_end: 4, aya_no: 4, aya_text: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ', aya_text_emlaey: 'والذين يؤمنون بما أنزل إليك وما أنزل من قبلك وبالآخرة هم يوقنون' },
      { id: 12, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 5, line_end: 5, aya_no: 5, aya_text: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ', aya_text_emlaey: 'أولئك على هدى من ربهم وأولئك هم المفلحون' },
      { id: 13, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 6, line_end: 6, aya_no: 6, aya_text: 'إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ', aya_text_emlaey: 'إن الذين كفروا سواء عليهم أأنذرتهم أم لم تنذرهم لا يؤمنون' },
      { id: 14, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 7, line_end: 7, aya_no: 7, aya_text: 'خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰٓ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ', aya_text_emlaey: 'ختم الله على قلوبهم وعلى سمعهم وعلى أبصارهم غشاوة ولهم عذاب عظيم' },
      { id: 15, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 8, line_end: 8, aya_no: 8, aya_text: 'وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُم بِمُؤْمِنِينَ', aya_text_emlaey: 'ومن الناس من يقول آمنا بالله وباليوم الآخر وما هم بمؤمنين' },
      { id: 16, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 9, line_end: 9, aya_no: 9, aya_text: 'يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ', aya_text_emlaey: 'يخادعون الله والذين آمنوا وما يخدعون إلا أنفسهم وما يشعرون' },
      { id: 17, jozz: 1, sura_no: 2, sura_name_en: 'Al-Baqarah', sura_name_ar: 'البقرة', page: 2, line_start: 10, line_end: 10, aya_no: 10, aya_text: 'فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ', aya_text_emlaey: 'في قلوبهم مرض فزادهم الله مرضا ولهم عذاب أليم بما كانوا يكذبون' }
    ];

    // إدخال آيات سورة البقرة
    for (const verse of baqarahVerses) {
      await db.runAsync(
        'INSERT INTO quran_verses (id, jozz, sura_no, sura_name_en, sura_name_ar, page, line_start, line_end, aya_no, aya_text, aya_text_emlaey) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [verse.id, verse.jozz, verse.sura_no, verse.sura_name_en, verse.sura_name_ar, verse.page, verse.line_start, verse.line_end, verse.aya_no, verse.aya_text, verse.aya_text_emlaey]
      );
    }
  } catch (error) {
    console.error('خطأ في إدخال بيانات القرآن:', error);
    throw error;
  }
};

/**
 * الحصول على قائمة جميع السور
 * @returns {Promise<Array>} قائمة السور
 */
export const getSurahs = async () => {
  try {
    const db = await initDatabase();
    
    const result = await db.getAllAsync(`
      SELECT DISTINCT 
        sura_no as number,
        sura_name_ar as name,
        sura_name_en as english_name,
        COUNT(*) as verses_count
       FROM quran_verses 
       GROUP BY sura_no, sura_name_ar, sura_name_en
       ORDER BY sura_no
    `);
    
    const surahs = result.map(row => ({
      number: row.number,
      name: row.name,
      english_name: row.english_name,
      verses_count: row.verses_count
    }));
    
    console.log(`تم جلب ${surahs.length} سورة`);
    return surahs;
  } catch (error) {
    console.error('خطأ في جلب السور:', error);
    return [];
  }
};

/**
 * الحصول على آيات سورة محددة
 * @param {number} surahId - رقم السورة
 * @returns {Promise<Array>} مصفوفة الآيات مع أرقامها
 */
export const getSurahVerses = async (surahId) => {
  try {
    const db = await initDatabase();
    
    const result = await db.getAllAsync(
      `SELECT aya_text, aya_no 
       FROM quran_verses 
       WHERE sura_no = ? 
       ORDER BY aya_no`,
      [surahId]
    );
    
    console.log(`تم جلب ${result.length} آية من السورة ${surahId}`);
    return result;
  } catch (error) {
    console.error(`خطأ في جلب آيات السورة ${surahId}:`, error);
    return [];
  }
};

/**
 * الحصول على معلومات سورة محددة
 * @param {number} surahId - رقم السورة
 * @returns {Promise<Object|null>} معلومات السورة
 */
export const getSurahInfo = async (surahId) => {
  try {
    const surahs = await getSurahs();
    return surahs.find(surah => surah.number === parseInt(surahId)) || null;
  } catch (error) {
    console.error(`خطأ في جلب معلومات السورة ${surahId}:`, error);
    return null;
  }
};

/**
 * البحث في القرآن
 * @param {string} searchTerm - مصطلح البحث
 * @returns {Promise<Array>} نتائج البحث
 */
export const searchQuran = async (searchTerm) => {
  try {
    const db = await initDatabase();
    
    const result = await db.getAllAsync(
      `SELECT DISTINCT 
        sura_no,
        sura_name_ar,
        aya_no,
        aya_text
       FROM quran_verses 
       WHERE aya_text LIKE ?
       ORDER BY sura_no, aya_no`,
      [`%${searchTerm}%`]
    );
    
    const results = result.map(row => ({
      surahName: row.sura_name_ar,
      surahNumber: row.sura_no,
      verseNumber: row.aya_no,
      verseText: row.aya_text
    }));
    
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