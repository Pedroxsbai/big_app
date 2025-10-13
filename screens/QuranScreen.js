import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

export default function QuranScreen({ navigation }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    { 
      name: 'البحث', 
      icon: 'search', 
      color: '#8B5CF6',
      onPress: () => navigation.navigate('QuranSearch')
    },
    { 
      name: 'المفضلة', 
      icon: 'bookmark', 
      color: '#FBBF24',
      onPress: () => navigation.navigate('Bookmarks')
    },
    { 
      name: 'السور', 
      icon: 'book-open-page-variant', 
      color: '#10B981',
      onPress: () => navigation.navigate('SurahList')
    },
    { 
      name: 'الاستماع', 
      icon: 'play', 
      color: '#3B82F6',
      onPress: () => console.log('الاستماع')
    },
    { 
      name: 'الخط', 
      icon: 'font', 
      color: '#EF4444',
      onPress: () => console.log('الخط')
    },
    { 
      name: 'مشاركة', 
      icon: 'share', 
      color: '#22D3EE',
      onPress: () => console.log('مشاركة')
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#10B981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.appName}>القرآن الكريم</Text>
        <Text style={styles.time}>{currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.location}>114 سورة • 6236 آية</Text>
        <Text style={styles.remaining}>اقرأ القرآن الكريم بتدبر وخشوع</Text>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickContainer}>
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickItem}
            onPress={action.onPress}
          >
            {action.icon === 'font' ? (
              <FontAwesome5 name={action.icon} size={28} color={action.color} />
            ) : action.icon === 'bookmark' || action.icon === 'play' || action.icon === 'share' || action.icon === 'book-open-page-variant' ? (
              <MaterialCommunityIcons name={action.icon} size={28} color={action.color} />
            ) : (
              <Ionicons name={action.icon} size={28} color={action.color} />
            )}
            <Text style={styles.quickText}>{action.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

        {/* Recent Reading */}
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>القراءة الأخيرة</Text>
          <TouchableOpacity
            style={styles.recentCard}
            onPress={() => navigation.navigate('QuranPageReader', { pageNumber: 1 })}
          >
            <View style={styles.recentInfo}>
              <Text style={styles.recentSurah}>سورة الفاتحة</Text>
              <Text style={styles.recentPage}>الصفحة 1</Text>
            </View>
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#166534" />
          </TouchableOpacity>
        </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>إحصائيات القراءة</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>صفحة مقروءة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>سورة مكتملة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>يوم متتالي</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
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
    color: "#D1FAE5",
    fontSize: 16,
    marginBottom: 4,
  },
  remaining: {
    color: "#A7F3D0",
    fontSize: 14,
  },
  quickContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  quickItem: {
    width: "28%",
    backgroundColor: "#F0FDF4",
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickText: {
    marginTop: 8,
    color: "#065F46",
    fontWeight: "600",
    fontSize: 14,
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 16,
  },
  recentCard: {
    backgroundColor: "#F0FDF4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentInfo: {
    flex: 1,
  },
  recentSurah: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 4,
  },
  recentPage: {
    fontSize: 14,
    color: "#059669",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#F0FDF4",
    flex: 1,
    alignItems: "center",
    padding: 16,
    marginHorizontal: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#059669",
    textAlign: "center",
  },
});