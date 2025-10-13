import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SunnahScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dailySunnahs, setDailySunnahs] = useState([]);
  const [hadithOfDay, setHadithOfDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadSunnahData();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    calculateProgress();
  }, [dailySunnahs]);

  const loadSunnahData = async () => {
    try {
      setLoading(true);
      await loadDailySunnahs();
      await loadHadithOfDay();
    } catch (error) {
      console.log('Error loading sunnah data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailySunnahs = async () => {
    try {
      const today = new Date().toDateString();
      const savedSunnahs = await AsyncStorage.getItem(`dailySunnahs_${today}`);
      
      if (savedSunnahs) {
        setDailySunnahs(JSON.parse(savedSunnahs));
      } else {
        // Initialize with default sunnahs
        const defaultSunnahs = getDefaultSunnahs();
        setDailySunnahs(defaultSunnahs);
        await saveDailySunnahs(defaultSunnahs);
      }
    } catch (error) {
      console.log('Error loading daily sunnahs:', error);
      setDailySunnahs(getDefaultSunnahs());
    }
  };

  const loadHadithOfDay = async () => {
    try {
      const today = new Date().toDateString();
      const savedHadith = await AsyncStorage.getItem(`hadithOfDay_${today}`);
      
      if (savedHadith) {
        setHadithOfDay(JSON.parse(savedHadith));
      } else {
        const hadith = getRandomHadith();
        setHadithOfDay(hadith);
        await AsyncStorage.setItem(`hadithOfDay_${today}`, JSON.stringify(hadith));
      }
    } catch (error) {
      console.log('Error loading hadith:', error);
      setHadithOfDay(getRandomHadith());
    }
  };

  const getDefaultSunnahs = () => [
    { 
      id: 1,
      title: 'سنن الوضوء', 
      description: 'السواك قبل الوضوء',
      completed: false,
      time: 'قبل كل صلاة',
      category: 'الوضوء',
      icon: 'water',
      color: '#3B82F6'
    },
    { 
      id: 2,
      title: 'سنن الصلاة', 
      description: 'الدعاء بعد التشهد الأخير',
      completed: false,
      time: 'بعد كل صلاة',
      category: 'الصلاة',
      icon: 'praying',
      color: '#10B981'
    },
    { 
      id: 3,
      title: 'سنن النوم', 
      description: 'قراءة آية الكرسي قبل النوم',
      completed: false,
      time: 'قبل النوم',
      category: 'النوم',
      icon: 'bed',
      color: '#8B5CF6'
    },
    { 
      id: 4,
      title: 'سنن الاستيقاظ', 
      description: 'الدعاء عند الاستيقاظ',
      completed: false,
      time: 'عند الاستيقاظ',
      category: 'الاستيقاظ',
      icon: 'sunny',
      color: '#F59E0B'
    },
    { 
      id: 5,
      title: 'سنن الطعام', 
      description: 'التسمية قبل الأكل',
      completed: false,
      time: 'قبل الأكل',
      category: 'الطعام',
      icon: 'restaurant',
      color: '#F59E0B'
    },
    { 
      id: 6,
      title: 'سنن اللباس', 
      description: 'الدعاء عند لبس الثوب',
      completed: false,
      time: 'عند اللبس',
      category: 'اللباس',
      icon: 'shirt',
      color: '#EF4444'
    },
  ];

  const getRandomHadith = () => {
    const hadiths = [
      {
        text: "مَن سَنَّ فِي الْإِسْلَامِ سُنَّةً حَسَنَةً، فَلَهُ أَجْرُهَا، وَأَجْرُ مَنْ عَمِلَ بِهَا",
        narrator: "رواه مسلم",
        meaning: "من سن في الإسلام سنة حسنة، فله أجرها وأجر من عمل بها إلى يوم القيامة"
      },
      {
        text: "إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ",
        narrator: "رواه البخاري",
        meaning: "إنما بعثت لأتمم مكارم الأخلاق"
      },
      {
        text: "مَنْ لَمْ يَرْحَمْ النَّاسَ لَمْ يَرْحَمْهُ اللَّهُ",
        narrator: "رواه البخاري ومسلم",
        meaning: "من لم يرحم الناس لم يرحمه الله"
      },
      {
        text: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا",
        narrator: "رواه البخاري ومسلم",
        meaning: "المؤمن للمؤمن كالبنيان يشد بعضه بعضاً"
      }
    ];
    return hadiths[Math.floor(Math.random() * hadiths.length)];
  };

  const saveDailySunnahs = async (sunnahs) => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`dailySunnahs_${today}`, JSON.stringify(sunnahs));
    } catch (error) {
      console.log('Error saving daily sunnahs:', error);
    }
  };

  const toggleSunnah = async (id) => {
    const updatedSunnahs = dailySunnahs.map(sunnah => 
      sunnah.id === id ? { ...sunnah, completed: !sunnah.completed } : sunnah
    );
    setDailySunnahs(updatedSunnahs);
    await saveDailySunnahs(updatedSunnahs);
  };

  const calculateProgress = () => {
    const completed = dailySunnahs.filter(sunnah => sunnah.completed).length;
    const total = dailySunnahs.length;
    setProgress({ completed, total });
  };

  const resetDailySunnahs = () => {
    Alert.alert(
      'إعادة تعيين السنن',
      'هل تريد إعادة تعيين جميع السنن اليومية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إعادة تعيين', 
          style: 'destructive',
          onPress: async () => {
            const resetSunnahs = dailySunnahs.map(sunnah => ({ ...sunnah, completed: false }));
            setDailySunnahs(resetSunnahs);
            await saveDailySunnahs(resetSunnahs);
          }
        }
      ]
    );
  };

  const sunnahCategories = [
    { name: 'الكل', icon: 'apps', color: '#6B7280', category: null },
    { name: 'الوضوء', icon: 'water', color: '#3B82F6', category: 'الوضوء' },
    { name: 'الصلاة', icon: 'praying', color: '#10B981', category: 'الصلاة' },
    { name: 'الطعام', icon: 'restaurant', color: '#F59E0B', category: 'الطعام' },
    { name: 'النوم', icon: 'bed', color: '#8B5CF6', category: 'النوم' },
    { name: 'اللباس', icon: 'shirt', color: '#EF4444', category: 'اللباس' },
  ];

  const filteredSunnahs = selectedCategory 
    ? dailySunnahs.filter(sunnah => sunnah.category === selectedCategory)
    : dailySunnahs;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>جاري تحميل السنن...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#F59E0B", "#D97706"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.appName}>السنة النبوية</Text>
        <Text style={styles.time}>{currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.location}>سنن النبي صلى الله عليه وسلم</Text>
        <Text style={styles.remaining}>اتبع سنة النبي وكن من المفلحين</Text>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.quickContainer}>
        {sunnahCategories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.quickItem,
              selectedCategory === category.category && styles.quickItemSelected
            ]}
            onPress={() => setSelectedCategory(category.category)}
          >
            <Ionicons name={category.icon} size={28} color={category.color} />
            <Text style={styles.quickText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Hadith of the Day */}
      {hadithOfDay && (
        <View style={styles.hadithContainer}>
          <View style={styles.hadithHeader}>
            <MaterialCommunityIcons name="book-open" size={24} color="#F59E0B" />
            <Text style={styles.hadithTitle}>حديث اليوم</Text>
          </View>
          <View style={styles.hadithCard}>
            <Text style={styles.hadithText}>{hadithOfDay.text}</Text>
            <Text style={styles.hadithNarrator}>{hadithOfDay.narrator}</Text>
            <View style={styles.hadithMeaning}>
              <Text style={styles.hadithMeaningLabel}>المعنى:</Text>
              <Text style={styles.hadithMeaningText}>{hadithOfDay.meaning}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Daily Sunnahs */}
      <View style={styles.sunnahsContainer}>
        <View style={styles.sunnahsHeader}>
          <Text style={styles.sunnahsTitle}>السنن اليومية</Text>
          <TouchableOpacity onPress={resetDailySunnahs} style={styles.resetButton}>
            <Ionicons name="refresh" size={20} color="#F59E0B" />
            <Text style={styles.resetButtonText}>إعادة تعيين</Text>
          </TouchableOpacity>
        </View>
        {filteredSunnahs.map((sunnah, index) => (
          <TouchableOpacity 
            key={sunnah.id} 
            style={[
              styles.sunnahCard,
              sunnah.completed && styles.sunnahCardCompleted
            ]}
            onPress={() => toggleSunnah(sunnah.id)}
          >
            <View style={styles.sunnahHeader}>
              <View style={styles.sunnahInfo}>
                <View style={styles.sunnahTitleRow}>
                  <MaterialCommunityIcons name={sunnah.icon} size={20} color={sunnah.color} />
                  <Text style={styles.sunnahTitle}>{sunnah.title}</Text>
                </View>
                <Text style={styles.sunnahDescription}>{sunnah.description}</Text>
                <Text style={styles.sunnahTime}>{sunnah.time}</Text>
              </View>
              <View style={[
                styles.sunnahCheckbox,
                sunnah.completed && styles.sunnahCheckboxCompleted
              ]}>
                {sunnah.completed && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>تقدم اليوم</Text>
          <Text style={styles.progressPercentage}>
            {Math.round((progress.completed / progress.total) * 100) || 0}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill, 
            { width: `${(progress.completed / progress.total) * 100 || 0}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {progress.completed} من {progress.total} سنن مكتملة
        </Text>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
  },
  loadingText: {
    fontSize: 16,
    color: '#F59E0B',
    marginTop: 16,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "sans-serif-medium",
  },
  time: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginVertical: 4,
  },
  location: {
    color: "#FEF3C7",
    fontSize: 16,
    marginBottom: 4,
  },
  remaining: {
    color: "#FDE68A",
    fontSize: 14,
  },
  quickContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  quickItem: {
    width: "28%",
    backgroundColor: "#FFFBEB",
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickItemSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  quickText: {
    marginTop: 8,
    color: "#D97706",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  hadithContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  hadithHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hadithTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D97706",
    marginLeft: 12,
  },
  hadithCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  hadithText: {
    fontSize: 18,
    color: "#92400E",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 12,
  },
  hadithNarrator: {
    fontSize: 14,
    color: "#B45309",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 16,
  },
  hadithMeaning: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 12,
    padding: 12,
  },
  hadithMeaningLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 4,
  },
  hadithMeaningText: {
    fontSize: 14,
    color: "#B45309",
    lineHeight: 20,
  },
  sunnahsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sunnahsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sunnahsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D97706",
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 4,
    fontWeight: '600',
  },
  sunnahCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sunnahCardCompleted: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  sunnahHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sunnahInfo: {
    flex: 1,
  },
  sunnahTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sunnahTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400E",
    marginLeft: 8,
  },
  sunnahDescription: {
    fontSize: 14,
    color: "#B45309",
    marginBottom: 4,
  },
  sunnahTime: {
    fontSize: 12,
    color: "#D97706",
  },
  sunnahCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#D97706",
    justifyContent: "center",
    alignItems: "center",
  },
  sunnahCheckboxCompleted: {
    backgroundColor: "#D97706",
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D97706",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F59E0B",
  },
  progressBar: {
    backgroundColor: "#FEF3C7",
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    backgroundColor: "#D97706",
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#B45309",
    textAlign: "center",
  },
});