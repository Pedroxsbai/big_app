import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function FatwaScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fatwaCategories = [
    { name: 'العبادات', icon: 'praying', color: '#10B981' },
    { name: 'المعاملات', icon: 'handshake', color: '#3B82F6' },
    { name: 'الأسرة', icon: 'home-heart', color: '#EF4444' },
    { name: 'الطعام', icon: 'food', color: '#F59E0B' },
    { name: 'اللباس', icon: 'tshirt-crew', color: '#8B5CF6' },
    { name: 'السفر', icon: 'airplane', color: '#22D3EE' },
  ];

  const recentFatwas = [
    { 
      question: 'ما حكم تأخير صلاة الجمعة؟', 
      answer: 'لا يجوز تأخير صلاة الجمعة عن وقتها المحدد...',
      category: 'العبادات',
      date: 'اليوم'
    },
    { 
      question: 'هل يجوز العمل في البنوك الربوية؟', 
      answer: 'العمل في البنوك الربوية محرم شرعاً...',
      category: 'المعاملات',
      date: 'أمس'
    },
    { 
      question: 'ما حكم استخدام وسائل منع الحمل؟', 
      answer: 'يختلف الحكم حسب الحالة والظروف...',
      category: 'الأسرة',
      date: 'منذ يومين'
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#EF4444", "#DC2626"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.appName}>الفتاوى</Text>
        <Text style={styles.time}>{currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.location}>فتاوى إسلامية معتمدة</Text>
        <Text style={styles.remaining}>اسأل وأجد الإجابة الشرعية</Text>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickContainer}>
        {fatwaCategories.map((category, index) => (
          <TouchableOpacity key={index} style={styles.quickItem}>
            <MaterialCommunityIcons name={category.icon} size={28} color={category.color} />
            <Text style={styles.quickText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={styles.searchPlaceholder}>ابحث في الفتاوى...</Text>
        </View>
        <TouchableOpacity style={styles.askButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.askButtonText}>اسأل سؤالاً</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Fatwas */}
      <View style={styles.fatwasContainer}>
        <Text style={styles.fatwasTitle}>الفتاوى الحديثة</Text>
        {recentFatwas.map((fatwa, index) => (
          <View key={index} style={styles.fatwaCard}>
            <View style={styles.fatwaHeader}>
              <View style={styles.fatwaCategory}>
                <Text style={styles.fatwaCategoryText}>{fatwa.category}</Text>
              </View>
              <Text style={styles.fatwaDate}>{fatwa.date}</Text>
            </View>
            <Text style={styles.fatwaQuestion}>{fatwa.question}</Text>
            <Text style={styles.fatwaAnswer} numberOfLines={2}>{fatwa.answer}</Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>اقرأ المزيد</Text>
              <Ionicons name="arrow-forward" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
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
    color: "#FECACA",
    fontSize: 16,
    marginBottom: 4,
  },
  remaining: {
    color: "#FEE2E2",
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
    backgroundColor: "#FEF2F2",
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  quickText: {
    marginTop: 8,
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: "#6B7280",
    fontSize: 16,
  },
  askButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
  },
  askButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  fatwasContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  fatwasTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 16,
  },
  fatwaCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  fatwaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fatwaCategory: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fatwaCategoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  fatwaDate: {
    color: "#6B7280",
    fontSize: 12,
  },
  fatwaQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  fatwaAnswer: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMoreText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
}); 