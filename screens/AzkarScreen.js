import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AzkarApi from '../services/azkarService';
import LocalAzkar from '../services/localAzkarService';

export default function AzkarScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [counters, setCounters] = useState({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadCategories();
    loadCounters();
    return () => clearInterval(timer);
  }, []);

  const loadCounters = async () => {
    try {
      const saved = await AsyncStorage.getItem('azkar_counters');
      if (saved) setCounters(JSON.parse(saved));
    } catch {}
  };

  const saveCounters = async (next) => {
    try {
      await AsyncStorage.setItem('azkar_counters', JSON.stringify(next));
    } catch {}
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      // Try local first
      let list = await LocalAzkar.getCategories();
      if (!list || !list.length) {
        list = await AzkarApi.getCategories();
      }
      setCategories(list);
      if (list.length) {
        setSelected(list[0]);
        await loadAzkar(list[0]);
      }
    } catch (e) {
      setError('تعذر تحميل الأقسام');
    } finally {
      setLoading(false);
    }
  };

  const loadAzkar = async (cat) => {
    try {
      setLoading(true);
      setError('');
      // Try local by slug first
      let data = await LocalAzkar.getAzkarByCategory(cat.slug || cat.id);
      if (!data || !data.length) {
        data = await AzkarApi.getAzkarByCategory(cat.slug || cat.id);
      }
      setItems(data);
    } catch (e) {
      setError('تعذر تحميل الأذكار');
    } finally {
      setLoading(false);
    }
  };

  const onSelectCategory = async (cat) => {
    setSelected(cat);
    await loadAzkar(cat);
  };

  const onSearch = async () => {
    if (!search.trim()) return;
    try {
      setLoading(true);
      setError('');
      // Try local search first then remote
      let results = await LocalAzkar.searchAzkar(search.trim());
      if (!results.length) {
        results = await AzkarApi.searchAzkar(search.trim());
      }
      if (!results.length) Alert.alert('نتيجة البحث', 'لا توجد نتائج لهذا البحث');
      setItems(results);
    } catch {
      setError('تعذر تنفيذ البحث');
    } finally {
      setLoading(false);
    }
  };

  const incCounter = (id, max = 0) => {
    const next = { ...counters, [id]: (counters[id] || 0) + 1 };
    if (max && next[id] > max) next[id] = max;
    setCounters(next);
    saveCounters(next);
  };

  const decCounter = (id) => {
    const current = counters[id] || 0;
    const next = { ...counters, [id]: Math.max(0, current - 1) };
    setCounters(next);
    saveCounters(next);
  };

  const resetCounter = (id) => {
    const next = { ...counters, [id]: 0 };
    setCounters(next);
    saveCounters(next);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#8B5CF6", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.appName}>الأذكار</Text>
        <Text style={styles.time}>{currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.location}>الأذكار الإسلامية</Text>
        <Text style={styles.remaining}>اذكر الله كثيراً</Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن ذكر..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
          <Text style={styles.searchBtnText}>بحث</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selected?.id === cat.id && styles.catChipActive]}
            onPress={() => onSelectCategory(cat)}
          >
            <Ionicons name={cat.icon || 'bookmark-outline'} size={16} color={selected?.id === cat.id ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.catText, selected?.id === cat.id && styles.catTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>جاري تحميل الأذكار...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>{selected?.name || 'الأذكار'}</Text>
          {items.map((z) => (
            <View key={z.id} style={styles.dhikrItem}>
              <View style={styles.dhikrItemInfo}>
                <Text style={styles.dhikrItemText}>{z.text}</Text>
                <Text style={styles.dhikrItemCount}>{(z.repeat || 1)} مرة</Text>
                {!!z.reference && (
                  <Text style={styles.dhikrRef}>{z.reference}</Text>
                )}
              </View>
              <View style={styles.counterCol}>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => incCounter(z.id, z.repeat)}>
                  <Ionicons name="add" size={18} color="#8B5CF6" />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{counters[z.id] || 0}</Text>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => decCounter(z.id)}>
                  <Ionicons name="remove" size={18} color="#8B5CF6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetBtn} onPress={() => resetCounter(z.id)}>
                  <Text style={styles.resetText}>تصفير</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF7" },
  header: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingVertical: 40, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } },
  appName: { fontSize: 26, fontWeight: "700", color: "#FFFFFF", fontFamily: "sans-serif-medium" },
  time: { fontSize: 48, color: "#FFFFFF", fontWeight: "bold", marginVertical: 4 },
  location: { color: "#DDD6FE", fontSize: 16, marginBottom: 4 },
  remaining: { color: "#C4B5FD", fontSize: 14 },

  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 16 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', marginHorizontal: 8 },
  searchBtn: { backgroundColor: '#8B5CF6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  searchBtnText: { color: '#FFFFFF', fontWeight: '700' },

  catsRow: { paddingHorizontal: 16, marginTop: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginHorizontal: 6 },
  catChipActive: { backgroundColor: '#8B5CF6' },
  catText: { color: '#6B7280', marginLeft: 6, fontWeight: '600' },
  catTextActive: { color: '#FFFFFF' },

  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  errorContainer: { alignItems: 'center', paddingVertical: 20 },
  errorText: { fontSize: 16, color: '#EF4444', marginBottom: 12 },
  retryButton: { backgroundColor: '#8B5CF6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: '700' },

  listContainer: { paddingHorizontal: 20, marginBottom: 30, marginTop: 8 },
  listTitle: { fontSize: 20, fontWeight: "bold", color: "#6B7280", marginBottom: 16 },
  dhikrItem: { backgroundColor: "#F3F4F6", flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 12, borderRadius: 16, elevation: 2 },
  dhikrItemInfo: { flex: 1 },
  dhikrItemText: { fontSize: 16, color: "#374151", marginBottom: 6, lineHeight: 24 },
  dhikrItemCount: { fontSize: 12, color: "#6B7280" },
  dhikrRef: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },

  counterCol: { alignItems: 'center' },
  counterBtnSmall: { width: 36, height: 36, backgroundColor: '#EDE9FE', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  counterValue: { fontSize: 16, fontWeight: '700', color: '#6B21A8', marginBottom: 6 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#8B5CF6', borderRadius: 8 },
  resetText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});