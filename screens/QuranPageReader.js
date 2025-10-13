import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import quranSurahService from '../services/quranSurahService';

const { width, height } = Dimensions.get('window');

export default function QuranPageReader({ route, navigation }) {
  const { pageNumber: initialPageNumber } = route.params || { pageNumber: 1 };
  const [pageNumber, setPageNumber] = useState(initialPageNumber);
  const [verses, setVerses] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(32);
  const [dynamicFontSize, setDynamicFontSize] = useState(32);

  useEffect(() => {
    loadPageData(pageNumber);
  }, [pageNumber]);

  // Calculate dynamic font size based on content length
  useEffect(() => {
    if (verses.length > 0) {
      calculateDynamicFontSize();
    }
  }, [verses, fontSize]);

  const toArabic = (num) => {
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, (d) => arabic[d]);
  };

  const calculateDynamicFontSize = () => {
    const verseCount = verses.length;
    const totalTextLength = verses.reduce((total, verse) => total + verse.aya_text.length, 0);
    
    // Calculate actual lines needed based on JSON data
    const actualLines = calculateActualLines();
    
    // Calculate available height for text content (accounting for header, navigation, footer)
    // Increased margins to ensure navigation and footer are always visible
    const availableHeight = height - (Platform.OS === 'ios' ? 280 : 260);
    
    // Calculate line height based on actual lines needed
    const lineHeight = availableHeight / actualLines;
    
    // Conservative font calculation: font size should be 70% of line height to ensure all verses fit
    let baseFontSize = Math.floor(lineHeight * 0.7);
    
    // Account for multiple surahs on page (titles and basmalah take extra space)
    const surahsOnPage = getSurahsOnPage();
    const extraSpaceNeeded = surahsOnPage.length > 1 ? (surahsOnPage.length - 1) * 2 : 0; // 2 lines per extra surah
    
    // Adjust font size based on content density - more conservative for Mushaf layout
    const contentDensity = totalTextLength / (verseCount * 50);
    
    if (contentDensity > 2) {
      // High density content - reduce font size significantly
      baseFontSize = Math.max(12, baseFontSize * 0.6);
    } else if (contentDensity > 1.5) {
      // Medium-high density
      baseFontSize = Math.max(14, baseFontSize * 0.65);
    } else if (contentDensity > 1) {
      // Medium density
      baseFontSize = Math.max(16, baseFontSize * 0.7);
    } else {
      // Low density - still reduce to ensure fit
      baseFontSize = Math.max(18, baseFontSize * 0.75);
    }
    
    // Additional adjustments based on verse count - more conservative
    if (verseCount > 25) {
      baseFontSize = Math.max(10, baseFontSize * 0.7);
    } else if (verseCount > 20) {
      baseFontSize = Math.max(12, baseFontSize * 0.75);
    } else if (verseCount > 15) {
      baseFontSize = Math.max(14, baseFontSize * 0.8);
    } else if (verseCount < 5) {
      baseFontSize = Math.min(25, baseFontSize * 1.02);
    }
    
    // Account for multiple surahs taking extra space
    if (surahsOnPage.length > 1) {
      baseFontSize = Math.max(12, baseFontSize * 0.9);
    }
    
    // Ensure font size is readable but fits without scrolling - more conservative bounds
    const finalFontSize = Math.max(10, Math.min(25, baseFontSize));
    
    console.log(`📊 Page ${pageNumber}: ${verseCount} verses, ${totalTextLength} chars, actual lines: ${actualLines}, surahs: ${surahsOnPage.length}, density: ${contentDensity.toFixed(2)}, font: ${finalFontSize}px, lineHeight: ${lineHeight}px`);
    setDynamicFontSize(finalFontSize);
  };

  const calculateActualLines = () => {
    if (verses.length === 0) return 15; // Default fallback
    
    // Find the maximum line_end to determine total lines needed
    const maxLine = Math.max(...verses.map(verse => verse.line_end));
    return maxLine;
  };

  const getSurahsOnPage = () => {
    if (verses.length === 0) return [];
    
    const surahs = [];
    let currentSurah = null;
    
    verses.forEach((verse, index) => {
      if (!currentSurah || currentSurah.sura_no !== verse.sura_no) {
        // New surah found
        currentSurah = {
          sura_no: verse.sura_no,
          sura_name_ar: verse.sura_name_ar,
          sura_name_en: verse.sura_name_en,
          start_verse_index: index,
          is_first_verse_of_surah: verse.aya_no === 1
        };
        surahs.push(currentSurah);
      }
    });
    
    return surahs;
  };

  const loadPageData = async (pageNum) => {
    setLoading(true);
    try {
      const fetched = await quranSurahService.getVersesByPage(pageNum);
      setVerses(fetched);
      if (fetched.length > 0) {
        const first = fetched[0];
        const last = fetched[fetched.length - 1];
        setPageInfo({
          page: pageNum,
          jozz: first.jozz,
          hizb: first.hizb || 1,
          sura_name_ar: first.sura_name_ar,
          sura_no: first.sura_no,
          aya_no: first.aya_no,
          total_verses: fetched.length,
          start_sura: first.sura_no,
          end_sura: last.sura_no,
        });
      }
    } catch (err) {
      setError('فشل تحميل الصفحة');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>جاري تحميل الصفحة...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadPageData(pageNumber)}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Exit Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
        <Text style={{ fontSize: 22, color: '#166534' }}>×</Text>
      </TouchableOpacity>

       {/* Header */}
       <View style={styles.header}>
         {pageInfo && <Text style={styles.juzText}>الجزء {toArabic(pageInfo.jozz)}</Text>}
         {pageInfo && <Text style={styles.surahText}>{pageInfo.sura_name_ar}</Text>}
       </View>

       {/* Decorative Surah title bar - Only show on first page of Surah */}
       {pageInfo && pageInfo.aya_no === 1 && (
         <View style={styles.titleBox}>
           <Text style={styles.titleText}>{pageInfo.sura_name_ar}</Text>
         </View>
       )}

       {/* Basmala - Only show on first page of Surah (except Al-Tawbah) */}
       {pageInfo && pageInfo.aya_no === 1 && pageInfo.sura_no !== 9 && (
         <Text style={styles.basmala}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</Text>
       )}

       {/* Quran Text - Fixed height, no scrolling */}
       <View style={styles.quranTextContainer}>
         {/* Render verses with surah names and basmalah */}
         {getSurahsOnPage().map((surah, surahIndex) => (
           <View key={surah.sura_no}>
             {/* Show surah name if it's not the first surah on page */}
             {surahIndex > 0 && (
               <View style={styles.titleBox}>
                 <Text style={styles.titleText}>{surah.sura_name_ar}</Text>
               </View>
             )}
             
             {/* Show basmalah for new surahs (except Al-Tawbah) */}
             {surahIndex > 0 && surah.sura_no !== 9 && (
               <Text style={styles.basmala}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</Text>
             )}
             
             {/* Render verses for this surah */}
             <Text style={[
               styles.quranText,
               { 
                 fontSize: dynamicFontSize,
                 lineHeight: (height - (Platform.OS === 'ios' ? 280 : 260)) / calculateActualLines()
               }
             ]}>
               {verses.slice(surah.start_verse_index, 
                 surahIndex < getSurahsOnPage().length - 1 
                   ? getSurahsOnPage()[surahIndex + 1].start_verse_index 
                   : verses.length
               ).map((v, i) => (
                 <Text key={surah.start_verse_index + i}>
                   {v.aya_text.trim()}{" "}
                 </Text>
               ))}
             </Text>
           </View>
         ))}
       </View>

       {/* Navigation Icons */}
       <View style={styles.navigationContainer}>
         <TouchableOpacity 
           style={[styles.navButton, pageNumber <= 1 && styles.navButtonDisabled]} 
           onPress={() => pageNumber > 1 && setPageNumber(pageNumber - 1)}
           disabled={pageNumber <= 1}
         >
           <Ionicons 
             name="chevron-back" 
             size={24} 
             color={pageNumber <= 1 ? "#ccc" : "#166534"} 
           />
         </TouchableOpacity>

         <TouchableOpacity 
           style={[styles.navButton, pageNumber >= 604 && styles.navButtonDisabled]} 
           onPress={() => pageNumber < 604 && setPageNumber(pageNumber + 1)}
           disabled={pageNumber >= 604}
         >
           <Ionicons 
             name="chevron-forward" 
             size={24} 
             color={pageNumber >= 604 ? "#ccc" : "#166534"} 
           />
         </TouchableOpacity>
       </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.hizbText}>الحزب {toArabic(pageInfo?.hizb || 16)}</Text>
        <Text style={styles.pageText}>{toArabic(pageNumber)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7E5',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  exitButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 20,
    right: 20,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15, // Reduced padding to match text container
    marginBottom: 10,
  },
  surahText: {
    fontSize: 16,
    color: '#166534',
    fontFamily: 'Uthmani',
  },
  juzText: {
    fontSize: 16,
    color: '#166534',
    fontFamily: 'Uthmani',
  },
  titleBox: {
    backgroundColor: '#D9F1D5',
    borderColor: '#A7DFA3',
    borderWidth: 1,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  titleText: {
    color: '#166534',
    fontSize: 20,
    fontFamily: 'Uthmani',
  },
  basmala: {
    textAlign: 'center',
    color: '#000',
    fontFamily: 'Uthmani',
    fontSize: 22,
    marginBottom: 15,
  },
  quranTextContainer: {
    height: height - (Platform.OS === 'ios' ? 280 : 260), // Fixed height - leave space for navigation and footer
    paddingHorizontal: 15, // Reduced padding to prevent text cutoff
    justifyContent: 'flex-start',
    overflow: 'hidden', // Prevent content from overflowing
  },
   quranText: {
     fontFamily: 'Uthmani',
     color: '#000',
     textAlign: 'justify',
     writingDirection: 'rtl',
     // Remove flex: 1 to prevent collapse
   },
   navigationContainer: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     paddingHorizontal: 15, // Reduced padding to match text container
     paddingVertical: 15,
   },
   navButton: {
     width: 50,
     height: 50,
     borderRadius: 25,
     backgroundColor: '#F0F9F0',
     borderWidth: 1,
     borderColor: '#166534',
     justifyContent: 'center',
     alignItems: 'center',
     shadowColor: '#166534',
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   navButtonDisabled: {
     backgroundColor: '#F5F5F5',
     borderColor: '#ccc',
     shadowOpacity: 0,
     elevation: 0,
   },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15, // Reduced padding to match text container
    paddingVertical: 8,
  },
  pageText: {
    color: '#166534',
    fontFamily: 'Uthmani',
  },
  hizbText: {
    color: '#166534',
    fontFamily: 'Uthmani',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF7E5',
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
    backgroundColor: '#FBF7E5',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#166534',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
