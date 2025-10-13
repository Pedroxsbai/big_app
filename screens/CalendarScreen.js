import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [islamicDate, setIslamicDate] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayData, setSelectedDayData] = useState(null);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  useEffect(() => {
    if (calendarData.length > 0) {
      updateSelectedDayData();
    }
  }, [selectedDate, calendarData]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Try to load from cache first
      const cacheKey = `calendar_${year}_${month}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setCalendarData(parsedData);
        setLoading(false);
        return;
      }

      // Fetch from API
      const response = await fetch(
        `https://api.aladhan.com/v1/calendarByCity?city=Oujda&country=MA&method=5&month=${month}&year=${year}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data) {
          setCalendarData(data.data);
          // Cache the data for 1 hour
          await AsyncStorage.setItem(cacheKey, JSON.stringify(data.data));
        }
      }
    } catch (error) {
      console.log('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedDayData = () => {
    const selectedDay = selectedDate.getDate();
    const dayData = calendarData.find(day => 
      parseInt(day.date.gregorian.day) === selectedDay
    );
    
    if (dayData) {
      setSelectedDayData(dayData);
      
      // Set Islamic date
      setIslamicDate({
        day: parseInt(dayData.date.hijri.day),
        month: dayData.date.hijri.month.ar,
        year: parseInt(dayData.date.hijri.year),
        weekday: dayData.date.hijri.weekday.ar
      });
      
      // Set prayer times
      const timings = dayData.timings;
      setPrayerTimes({
        fajr: timings.Fajr.replace(' (+01)', ''),
        sunrise: timings.Sunrise.replace(' (+01)', ''),
        dhuhr: timings.Dhuhr.replace(' (+01)', ''),
        asr: timings.Asr.replace(' (+01)', ''),
        maghrib: timings.Maghrib.replace(' (+01)', ''),
        isha: timings.Isha.replace(' (+01)', '')
      });
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date) => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[date.getMonth()];
  };

  const getWeekDays = () => {
    return ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  };

  const renderHijriCalendar = () => {
    if (calendarData.length === 0) return [];
    
    const days = [];
    const hijriDays = calendarData.map(day => ({
      hijriDay: parseInt(day.date.hijri.day),
      gregorianDay: parseInt(day.date.gregorian.day),
      gregorianDate: new Date(day.date.gregorian.year, day.date.gregorian.month.number - 1, day.date.gregorian.day),
      hijriMonth: day.date.hijri.month.ar,
      hijriYear: parseInt(day.date.hijri.year),
      weekday: day.date.hijri.weekday.ar
    }));
    
    // Group by Hijri month
    const hijriMonth = hijriDays[0].hijriMonth;
    const hijriYear = hijriDays[0].hijriYear;
    
    // Find the first day of the Hijri month
    const firstHijriDay = hijriDays[0];
    const firstGregorianDate = firstHijriDay.gregorianDate;
    const firstDayOfWeek = firstGregorianDate.getDay();
    
    // Add empty cells for days before the first day of the Hijri month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }
    
    // Add Hijri days
    hijriDays.forEach((dayData, index) => {
      const isSelected = selectedDate.getDate() === dayData.gregorianDay && 
                        selectedDate.getMonth() === dayData.gregorianDate.getMonth() &&
                        selectedDate.getFullYear() === dayData.gregorianDate.getFullYear();
      const isToday = new Date().getDate() === dayData.gregorianDay && 
                     new Date().getMonth() === dayData.gregorianDate.getMonth() &&
                     new Date().getFullYear() === dayData.gregorianDate.getFullYear();
      
      days.push(
        <TouchableOpacity
          key={index}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDay,
            isToday && styles.todayDay
          ]}
          onPress={() => setSelectedDate(dayData.gregorianDate)}
        >
          <Text style={[
            styles.hijriDayText,
            isSelected && styles.selectedHijriDayText,
            isToday && styles.todayHijriDayText
          ]}>
            {dayData.hijriDay}
          </Text>
          <Text style={[
            styles.gregorianDayText,
            isSelected && styles.selectedGregorianDayText,
            isToday && styles.todayGregorianDayText
          ]}>
            {dayData.gregorianDay}
          </Text>
        </TouchableOpacity>
      );
    });
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getSelectedDateInfo = () => {
    if (!islamicDate) return { dayName: '', monthName: '', year: '' };
    
    return {
      dayName: islamicDate.weekday || '',
      monthName: islamicDate.month || '',
      year: islamicDate.year || ''
    };
  };

  const { dayName, monthName, year } = getSelectedDateInfo();

  const getIslamicEvents = () => {
    if (!selectedDayData) return [];
    
    const events = [];
    const hijriMonth = selectedDayData.date.hijri.month.number;
    const hijriDay = parseInt(selectedDayData.date.hijri.day);
    
    // Add Islamic holidays and events
    if (hijriMonth === 1 && hijriDay === 1) {
      events.push({ name: 'رأس السنة الهجرية', icon: 'star' });
    }
    if (hijriMonth === 1 && hijriDay === 10) {
      events.push({ name: 'عاشوراء', icon: 'heart' });
    }
    if (hijriMonth === 3 && hijriDay === 12) {
      events.push({ name: 'المولد النبوي', icon: 'mosque' });
    }
    if (hijriMonth === 9) {
      events.push({ name: 'شهر رمضان المبارك', icon: 'moon' });
    }
    if (hijriMonth === 10 && hijriDay === 1) {
      events.push({ name: 'عيد الفطر المبارك', icon: 'gift' });
    }
    if (hijriMonth === 12 && hijriDay === 9) {
      events.push({ name: 'يوم عرفة', icon: 'hand-heart' });
    }
    if (hijriMonth === 12 && hijriDay === 10) {
      events.push({ name: 'عيد الأضحى المبارك', icon: 'gift' });
    }
    
    // Add any holidays from the API
    if (selectedDayData.date.hijri.holidays && selectedDayData.date.hijri.holidays.length > 0) {
      selectedDayData.date.hijri.holidays.forEach(holiday => {
        events.push({ name: holiday, icon: 'star' });
      });
    }
    
    return events;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#D97706", "#B45309"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>التقويم الإسلامي</Text>
        <Text style={styles.headerSubtitle}>تقويم هجري وميلادي</Text>
      </LinearGradient>

      {/* Current Date Display */}
      <View style={styles.currentDateCard}>
        <View style={styles.dateInfo}>
          <Text style={styles.islamicDate}>
            {dayName}، {islamicDate?.day} {monthName} {year} هـ
          </Text>
          <Text style={styles.gregorianDate}>
            {selectedDate.getDate()} {getMonthName(selectedDate)} {selectedDate.getFullYear()}
          </Text>
        </View>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>اليوم</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Navigation */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color="#D97706" />
        </TouchableOpacity>
        
        <View style={styles.monthYearContainer}>
          {calendarData.length > 0 && (
            <Text style={styles.monthYearText}>
              {calendarData[0].date.hijri.month.ar} {calendarData[0].date.hijri.year} هـ
            </Text>
          )}
          <Text style={styles.islamicMonthText}>
            {getMonthName(currentDate)} {currentDate.getFullYear()}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color="#D97706" />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D97706" />
            <Text style={styles.loadingText}>جاري تحميل التقويم...</Text>
          </View>
        ) : (
          <>
            {/* Week Days Header */}
            <View style={styles.weekDaysHeader}>
              {getWeekDays().map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>
            
            {/* Calendar Days */}
            <View style={styles.calendarGrid}>
              {renderHijriCalendar()}
            </View>
          </>
        )}
      </View>

      {/* Prayer Times for Selected Date */}
      {prayerTimes && (
        <View style={styles.prayerTimesCard}>
          <Text style={styles.prayerTimesTitle}>أوقات الصلاة</Text>
          <View style={styles.prayerTimesGrid}>
            {Object.entries(prayerTimes).map(([prayer, time], index) => (
              <View key={index} style={styles.prayerTimeItem}>
                <Text style={styles.prayerName}>
                  {prayer === 'fajr' ? 'الفجر' :
                   prayer === 'sunrise' ? 'الشروق' :
                   prayer === 'dhuhr' ? 'الظهر' :
                   prayer === 'asr' ? 'العصر' :
                   prayer === 'maghrib' ? 'المغرب' : 'العشاء'}
                </Text>
                <Text style={styles.prayerTime}>{time}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Islamic Events */}
      <View style={styles.eventsCard}>
        <Text style={styles.eventsTitle}>المناسبات الإسلامية</Text>
        {getIslamicEvents().length > 0 ? (
          getIslamicEvents().map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <MaterialCommunityIcons name={event.icon} size={20} color="#D97706" />
              <Text style={styles.eventText}>{event.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>لا توجد مناسبات خاصة في هذا اليوم</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3C7',
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FEF3C7',
    marginTop: 8,
  },
  currentDateCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dateInfo: {
    flex: 1,
  },
  gregorianDate: {
    fontSize: 14,
    color: '#92400E',
    marginTop: 4,
  },
  islamicDate: {
    fontSize: 18,
    color: '#D97706',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  todayButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D97706',
  },
  islamicMonthText: {
    fontSize: 14,
    color: '#92400E',
    marginTop: 2,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D97706',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: (width - 72) / 7,
    height: 40,
  },
  dayCell: {
    width: (width - 72) / 7,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: '#D97706',
  },
  todayDay: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  dayText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  todayDayText: {
    color: '#D97706',
    fontWeight: 'bold',
  },
  prayerTimesCard: {
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
  prayerTimesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
    textAlign: 'center',
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerTimeItem: {
    width: '48%',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 16,
    color: '#D97706',
    fontWeight: 'bold',
  },
  eventsCard: {
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
  eventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eventText: {
    fontSize: 16,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
  },
  hijriDayText: {
    fontSize: 16,
    color: '#D97706',
    fontWeight: 'bold',
  },
  selectedHijriDayText: {
    color: '#FFFFFF',
  },
  todayHijriDayText: {
    color: '#D97706',
  },
  gregorianDayText: {
    fontSize: 10,
    color: '#92400E',
    marginTop: 2,
  },
  selectedGregorianDayText: {
    color: '#FEF3C7',
  },
  todayGregorianDayText: {
    color: '#92400E',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#D97706',
    marginTop: 16,
  },
  noEventsText: {
    fontSize: 16,
    color: '#92400E',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});
