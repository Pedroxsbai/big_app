import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrayerTimesService from '../services/prayerTimesService';

export default function LastThirdScreen() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [lastThirdInfo, setLastThirdInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLastThird, setIsLastThird] = useState(false);
  const [timeUntilLastThird, setTimeUntilLastThird] = useState(null);
  const [timeInLastThird, setTimeInLastThird] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadPrayerTimes();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      calculateLastThird();
    }
  }, [prayerTimes, currentTime]);

  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      const prayerData = await PrayerTimesService.getTodayPrayerTimes();
      setPrayerTimes(prayerData);
    } catch (error) {
      console.log('Error loading prayer times:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLastThird = () => {
    if (!prayerTimes) return;

    try {
      // Parse prayer times
      const fajrTime = parseTime(prayerTimes.Fajr);
      const maghribTime = parseTime(prayerTimes.Maghrib);

      // Calculate night duration in minutes
      let nightDuration;
      if (fajrTime > maghribTime) {
        // Same day (Fajr is after Maghrib)
        nightDuration = fajrTime - maghribTime;
      } else {
        // Next day (Fajr is next day)
        nightDuration = (24 * 60) - maghribTime + fajrTime;
      }

      // Calculate one third of the night
      const oneThird = Math.round(nightDuration / 3);

      // Calculate last third start time
      let lastThirdStart = fajrTime - oneThird;
      if (lastThirdStart < 0) {
        lastThirdStart += 24 * 60; // Add 24 hours if negative
      }

      // Calculate last third end time (Fajr)
      const lastThirdEnd = fajrTime;

      // Format times
      const lastThirdStartFormatted = formatTime(lastThirdStart);
      const lastThirdEndFormatted = formatTime(lastThirdEnd);
      const nightDurationFormatted = formatDuration(nightDuration);
      const oneThirdFormatted = formatDuration(oneThird);

      const info = {
        nightDuration: nightDurationFormatted,
        oneThird: oneThirdFormatted,
        lastThirdStart: lastThirdStartFormatted,
        lastThirdEnd: lastThirdEndFormatted,
        lastThirdStartMinutes: lastThirdStart,
        lastThirdEndMinutes: lastThirdEnd,
        nightDurationMinutes: nightDuration,
        oneThirdMinutes: oneThird,
      };

      setLastThirdInfo(info);

      // Check if current time is in last third
      const currentMinutes = getCurrentMinutes();
      const isInLastThird = isTimeInRange(currentMinutes, lastThirdStart, lastThirdEnd);
      setIsLastThird(isInLastThird);

      // Calculate time until last third or time in last third
      if (isInLastThird) {
        const timeIn = currentMinutes - lastThirdStart;
        setTimeInLastThird(formatDuration(timeIn));
        setTimeUntilLastThird(null);
      } else {
        let timeUntil;
        if (currentMinutes < lastThirdStart) {
          timeUntil = lastThirdStart - currentMinutes;
        } else {
          // Last third already passed today, calculate for tomorrow
          timeUntil = (24 * 60) - currentMinutes + lastThirdStart;
        }
        setTimeUntilLastThird(formatDuration(timeUntil));
        setTimeInLastThird(null);
      }
    } catch (error) {
      console.log('Error calculating last third:', error);
    }
  };

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعة ${mins} دقيقة`;
    }
    return `${mins} دقيقة`;
  };

  const getCurrentMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const isTimeInRange = (current, start, end) => {
    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Range crosses midnight
      return current >= start || current <= end;
    }
  };

  const getStatusMessage = () => {
    if (isLastThird) {
      return {
        text: 'أنت الآن في ثلث الليل الأخير',
        color: '#10B981',
        icon: 'moon-waning-crescent',
      };
    } else if (timeUntilLastThird) {
      return {
        text: `متبقي ${timeUntilLastThird} لثلث الليل الأخير`,
        color: '#F59E0B',
        icon: 'clock-outline',
      };
    } else {
      return {
        text: 'ثلث الليل الأخير انتهى لهذا اليوم',
        color: '#6B7280',
        icon: 'moon-waning-gibbous',
      };
    }
  };

  const getRecommendations = () => {
    return [
      {
        title: 'الاستغفار',
        description: 'أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه',
        icon: 'heart',
        color: '#EF4444',
      },
      {
        title: 'الدعاء',
        description: 'ادع الله في هذا الوقت المبارك، فهو وقت إجابة الدعاء',
        icon: 'hands-pray',
        color: '#3B82F6',
      },
      {
        title: 'قراءة القرآن',
        description: 'اقرأ القرآن الكريم في هذا الوقت المبارك',
        icon: 'book-open',
        color: '#10B981',
      },
      {
        title: 'الصلاة',
        description: 'صل ركعتين أو أكثر في هذا الوقت المبارك',
        icon: 'mosque',
        color: '#8B5CF6',
      },
      {
        title: 'التسبيح',
        description: 'سبح الله واذكره كثيراً في هذا الوقت',
        icon: 'star',
        color: '#F59E0B',
      },
    ];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>جاري حساب ثلث الليل الأخير...</Text>
      </View>
    );
  }

  const status = getStatusMessage();
  const recommendations = getRecommendations();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#8B5CF6", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>ثلث الليل الأخير</Text>
        <Text style={styles.headerSubtitle}>الوقت المبارك للدعاء والاستغفار</Text>
      </LinearGradient>

      {/* Current Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <MaterialCommunityIcons name={status.icon} size={32} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        </View>
        {timeInLastThird && (
          <Text style={styles.timeInLastThird}>مضى: {timeInLastThird}</Text>
        )}
      </View>

      {/* Calculation Details */}
      {lastThirdInfo && (
        <View style={styles.calculationCard}>
          <View style={styles.calculationHeader}>
            <MaterialCommunityIcons name="calculator" size={24} color="#8B5CF6" />
            <Text style={styles.calculationTitle}>حساب ثلث الليل الأخير</Text>
          </View>
          
          <View style={styles.calculationGrid}>
            <View style={styles.calculationItem}>
              <View style={styles.calculationIconContainer}>
                <MaterialCommunityIcons name="weather-night" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.calculationContent}>
                <Text style={styles.calculationLabel}>مدة الليل</Text>
                <Text style={styles.calculationValue}>{lastThirdInfo.nightDuration}</Text>
              </View>
            </View>
            
            <View style={styles.calculationItem}>
              <View style={styles.calculationIconContainer}>
                <MaterialCommunityIcons name="division" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.calculationContent}>
                <Text style={styles.calculationLabel}>الثلث الواحد</Text>
                <Text style={styles.calculationValue}>{lastThirdInfo.oneThird}</Text>
              </View>
            </View>
            
            <View style={styles.calculationItem}>
              <View style={styles.calculationIconContainer}>
                <MaterialCommunityIcons name="play-circle" size={20} color="#10B981" />
              </View>
              <View style={styles.calculationContent}>
                <Text style={styles.calculationLabel}>بداية الثلث الأخير</Text>
                <Text style={styles.calculationValue}>{lastThirdInfo.lastThirdStart}</Text>
              </View>
            </View>
            
            <View style={styles.calculationItem}>
              <View style={styles.calculationIconContainer}>
                <MaterialCommunityIcons name="stop-circle" size={20} color="#EF4444" />
              </View>
              <View style={styles.calculationContent}>
                <Text style={styles.calculationLabel}>نهاية الثلث الأخير</Text>
                <Text style={styles.calculationValue}>{lastThirdInfo.lastThirdEnd}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Prayer Times Reference */}
      {prayerTimes && (
        <View style={styles.prayerTimesCard}>
          <View style={styles.prayerTimesHeader}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#8B5CF6" />
            <Text style={styles.prayerTimesTitle}>أوقات الصلاة المرجعية</Text>
          </View>
          <View style={styles.prayerTimesRow}>
            <View style={styles.prayerTimeItem}>
              <View style={styles.prayerTimeIconContainer}>
                <MaterialCommunityIcons name="weather-night" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.prayerTimeContent}>
                <Text style={styles.prayerTimeLabel}>المغرب</Text>
                <Text style={styles.prayerTimeValue}>{prayerTimes.Maghrib}</Text>
              </View>
            </View>
            <View style={styles.prayerTimeItem}>
              <View style={styles.prayerTimeIconContainer}>
                <MaterialCommunityIcons name="weather-sunset-up" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.prayerTimeContent}>
                <Text style={styles.prayerTimeLabel}>الفجر</Text>
                <Text style={styles.prayerTimeValue}>{prayerTimes.Fajr}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>أعمال مستحبة في ثلث الليل الأخير</Text>
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <MaterialCommunityIcons name={rec.icon} size={24} color={rec.color} />
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
            </View>
            <Text style={styles.recommendationDescription}>{rec.description}</Text>
          </View>
        ))}
      </View>

      {/* Hadith */}
      <View style={styles.hadithCard}>
        <MaterialCommunityIcons name="format-quote-open" size={24} color="#8B5CF6" />
        <Text style={styles.hadithText}>
          "ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الأخير، فيقول: من يدعوني فأستجيب له؟ من يسألني فأعطيه؟ من يستغفرني فأغفر له؟"
        </Text>
        <Text style={styles.hadithSource}>- رواه البخاري ومسلم</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color="#8B5CF6" />
        <Text style={styles.infoText}>
          ثلث الليل الأخير هو الوقت المبارك الذي ينزل فيه الله تعالى إلى السماء الدنيا، وهو أفضل وقت للدعاء والاستغفار والعبادة.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#8B5CF6',
    marginTop: 16,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    fontFamily: 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    textAlign: 'center',
  },
  timeInLastThird: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  calculationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  calculationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginLeft: 12,
  },
  calculationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calculationItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  calculationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  calculationContent: {
    flex: 1,
  },
  calculationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  prayerTimesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  prayerTimesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  prayerTimesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginLeft: 12,
  },
  prayerTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prayerTimeItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prayerTimeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prayerTimeContent: {
    flex: 1,
  },
  prayerTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  prayerTimeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  recommendationsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 12,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  hadithCard: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  hadithText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginVertical: 12,
  },
  hadithSource: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#E0E7FF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
