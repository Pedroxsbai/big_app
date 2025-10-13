import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

class PrayerTimesService {
  constructor() {
    this.baseUrl = 'https://api.aladhan.com/v1';
    this.currentLocation = null;
    this.prayerTimes = null;
    this.timezone = null; // IANA timezone from API meta
  }

  // Get user's current location
  async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let city = 'موقعك الحالي';
      let country = '';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          city = geocode[0]?.city || geocode[0]?.subregion || geocode[0]?.region || city;
          country = geocode[0]?.country || '';
        }
      } catch {}

      this.currentLocation = { latitude, longitude, city, country };
      return this.currentLocation;
    } catch (error) {
      // Fallback to Oujda, Morocco
      this.currentLocation = {
        latitude: 34.681,
        longitude: -1.908,
        city: 'وجدة',
        country: 'المغرب',
      };
      return this.currentLocation;
    }
  }

  // Get prayer times for today
  async getTodayPrayerTimes() {
    try {
      const location = await this.getCurrentLocation();
      
      // Get current date
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // Use calendar API for more accurate times (same as CalendarScreen)
      const url = `${this.baseUrl}/calendarByCity?city=${location.city}&country=${location.country}&method=5&month=${month}&year=${year}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 200 && data.data) {
        // Find today's data
        const todayData = data.data.find(dayData => 
          parseInt(dayData.date.gregorian.day) === day
        );
        
        if (todayData) {
          const timings = todayData.timings;
          const meta = todayData.meta || {};
          this.timezone = meta.timezone || 'Africa/Casablanca';

          // Clean timings (remove timezone info)
          const cleaned = {
            Fajr: timings.Fajr.replace(' (+01)', ''),
            Sunrise: timings.Sunrise.replace(' (+01)', ''),
            Dhuhr: timings.Dhuhr.replace(' (+01)', ''),
            Asr: timings.Asr.replace(' (+01)', ''),
            Maghrib: timings.Maghrib.replace(' (+01)', ''),
            Isha: timings.Isha.replace(' (+01)', ''),
          };

          this.prayerTimes = {
            ...cleaned,
            location: location.city,
            date: todayData.date.gregorian.date || new Date().toLocaleDateString('ar-SA'),
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: this.timezone,
          };

          await this.savePrayerTimes();
          return this.prayerTimes;
        }
      }
      throw new Error('Failed to fetch prayer times');
    } catch (error) {
      console.log('Error fetching prayer times:', error);
      return this.getDefaultPrayerTimes();
    }
  }

  // Get prayer times for a specific date (YYYY-MM-DD)
  async getPrayerTimesByDate(date) {
      try {
        const location = await this.getCurrentLocation();
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        // Use calendar API for consistency
        const url = `${this.baseUrl}/calendarByCity?city=${location.city}&country=${location.country}&method=5&month=${month}&year=${year}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
          // Find the specific day
          const dayData = data.data.find(dayData => 
            parseInt(dayData.date.gregorian.day) === day
          );
          
          if (dayData) {
            const timings = dayData.timings;
            const meta = dayData.meta || {};
            
            // Clean timings (remove timezone info)
            const cleaned = {
              Fajr: timings.Fajr.replace(' (+01)', ''),
              Sunrise: timings.Sunrise.replace(' (+01)', ''),
              Dhuhr: timings.Dhuhr.replace(' (+01)', ''),
              Asr: timings.Asr.replace(' (+01)', ''),
              Maghrib: timings.Maghrib.replace(' (+01)', ''),
              Isha: timings.Isha.replace(' (+01)', ''),
            };
            
            return {
              timings: cleaned,
              location: location.city,
              date: dayData.date.gregorian.date || date,
              timezone: meta.timezone || 'Africa/Casablanca',
            };
          }
        }
      } catch (error) {
        console.log('Error fetching prayer times for date:', error);
      }
      return null;
  }

  // Clean time strings like "05:30 (EST)" or "05:30 (+03)" to "05:30"
  cleanTimings(timings) {
    const clean = (t) => (t || '').toString().replace(/[^0-9:]/g, '').trim();
    return {
      Fajr: clean(timings.Fajr),
      Sunrise: clean(timings.Sunrise),
      Dhuhr: clean(timings.Dhuhr),
      Asr: clean(timings.Asr),
      Maghrib: clean(timings.Maghrib),
      Isha: clean(timings.Isha),
    };
  }

  // Get next prayer time
  getNextPrayer() {
    if (!this.prayerTimes) return null;

    const currentMinutes = this.getNowInTimezoneMinutes(this.timezone);

    const schedule = [
      { name: 'الفجر', time: this.parseTime(this.prayerTimes.Fajr) },
      { name: 'الظهر', time: this.parseTime(this.prayerTimes.Dhuhr) },
      { name: 'العصر', time: this.parseTime(this.prayerTimes.Asr) },
      { name: 'المغرب', time: this.parseTime(this.prayerTimes.Maghrib) },
      { name: 'العشاء', time: this.parseTime(this.prayerTimes.Isha) },
    ];

    for (const p of schedule) {
      if (p.time > currentMinutes) {
        const remaining = p.time - currentMinutes;
        const h = Math.floor(remaining / 60);
        const m = remaining % 60;
        return {
          name: p.name,
          time: this.formatTime(p.time),
          remaining: `${h}:${m.toString().padStart(2, '0')}`,
        };
      }
    }

    // No remaining prayers today
    return { name: 'الفجر', time: this.prayerTimes.Fajr, remaining: 'غداً' };
  }

  // Helpers for time parsing/formatting
  parseTime(timeString) {
    const cleaned = (timeString || '').toString().replace(/[^0-9:]/g, '');
    const [hoursS, minutesS] = cleaned.split(':');
    const hours = Number(hoursS || 0);
    const minutes = Number(minutesS || 0);
    return hours * 60 + minutes;
  }

  formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  getNowInTimezoneMinutes(timeZone) {
    try {
      const fmt = new Intl.DateTimeFormat('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timeZone || 'Africa/Casablanca',
      });
      const parts = fmt.formatToParts(new Date());
      const hh = Number(parts.find(p => p.type === 'hour')?.value || '0');
      const mm = Number(parts.find(p => p.type === 'minute')?.value || '0');
      return hh * 60 + mm;
    } catch {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    }
  }

  // Get formatted prayer times for display
  getFormattedPrayerTimes() {
    if (!this.prayerTimes) return [];
    return [
      { name: 'الفجر', time: this.prayerTimes.Fajr, icon: 'weather-sunset-up' },
      { name: 'الشروق', time: this.prayerTimes.Sunrise, icon: 'weather-sunny' },
      { name: 'الظهر', time: this.prayerTimes.Dhuhr, icon: 'white-balance-sunny' },
      { name: 'العصر', time: this.prayerTimes.Asr, icon: 'weather-sunset-down' },
      { name: 'المغرب', time: this.prayerTimes.Maghrib, icon: 'weather-night' },
      { name: 'العشاء', time: this.prayerTimes.Isha, icon: 'moon-waning-gibbous' },
    ];
  }

  // Save prayer times to AsyncStorage
  async savePrayerTimes() {
    try {
      const today = new Date().toDateString();
      const payload = { ...this.prayerTimes, timezone: this.timezone };
      await AsyncStorage.setItem(`prayerTimes_${today}`, JSON.stringify(payload));
    } catch {}
  }

  // Load prayer times from AsyncStorage
  async loadSavedPrayerTimes() {
    try {
      const today = new Date().toDateString();
      const saved = await AsyncStorage.getItem(`prayerTimes_${today}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.prayerTimes = parsed;
        this.timezone = parsed.timezone || 'Africa/Casablanca';
        return this.prayerTimes;
      }
    } catch {}
    return null;
  }

  // Clear cached prayer times
  async clearCachedPrayerTimes() {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.removeItem(`prayerTimes_${today}`);
    } catch {}
  }

  // Default prayer times (Oujda, Morocco) - Updated with more accurate times
  getDefaultPrayerTimes() {
    this.timezone = 'Africa/Casablanca';
    return {
      Fajr: '05:31',
      Sunrise: '07:02',
      Dhuhr: '12:57',
      Asr: '16:20',
      Maghrib: '18:52',
      Isha: '20:13',
      location: 'وجدة',
      date: new Date().toLocaleDateString('ar-SA'),
      timezone: this.timezone,
    };
  }

  // Qibla helpers
  async getQiblaDirection() {
    if (!this.currentLocation) {
      await this.getCurrentLocation();
    }
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    const lat1 = (this.currentLocation.latitude * Math.PI) / 180;
    const lat2 = (meccaLat * Math.PI) / 180;
    const deltaLng = ((meccaLng - this.currentLocation.longitude) * Math.PI) / 180;
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    bearing = (bearing + 360) % 360;
    return {
      bearing,
      distance: this.calculateDistance(
        this.currentLocation.latitude,
        this.currentLocation.longitude,
        meccaLat,
        meccaLng
      ),
    };
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default new PrayerTimesService();
