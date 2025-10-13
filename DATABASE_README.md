# Islamic App Database System

## Overview
This Islamic app now includes a comprehensive database system built with SQLite and React Context API. The database manages all user data, settings, bookmarks, prayer times, and more.

## Database Structure

### Tables Created

1. **users** - User profile information
   - id (PRIMARY KEY)
   - name
   - email
   - phone
   - location
   - created_at
   - updated_at

2. **settings** - User preferences and app settings
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - dark_mode
   - font_size
   - language
   - notifications
   - auto_play
   - haptic_feedback
   - sound_effects
   - prayer_method
   - prayer_city
   - prayer_country
   - created_at
   - updated_at

3. **bookmarks** - Quran verse bookmarks
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - surah_number
   - surah_name
   - verse_number
   - verse_text
   - created_at

4. **azkar** - User's dhikr/remembrance tracking
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - category
   - text
   - count
   - target_count
   - completed
   - created_at
   - updated_at

5. **prayer_times** - Cached prayer times
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - date
   - fajr
   - sunrise
   - dhuhr
   - asr
   - maghrib
   - isha
   - created_at

6. **alarms** - Prayer time alarms
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - prayer_name
   - time
   - enabled
   - sound
   - vibration
   - created_at
   - updated_at

7. **reading_progress** - Quran reading progress
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - surah_number
   - surah_name
   - last_verse_read
   - total_verses
   - completed
   - created_at
   - updated_at

8. **sunnah** - Sunnah tracking
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - title
   - description
   - category
   - completed
   - completed_at
   - created_at

## Key Features

### 1. Database Service (`databaseService.js`)
- Centralized database operations
- SQLite integration with Expo
- CRUD operations for all entities
- Error handling and logging

### 2. Database Context (`DatabaseContext.js`)
- React Context for state management
- Automatic database initialization
- User session management
- Real-time data synchronization

### 3. User Profile Management
- Create and update user profiles
- Settings persistence
- Data export functionality
- Account deletion

### 4. Settings Integration
- Dark mode support
- Font size customization
- Language selection
- Location settings
- Notification preferences

## Usage Examples

### Using the Database Context

```javascript
import { useDatabase } from '../services/DatabaseContext';

function MyComponent() {
  const { 
    currentUser, 
    userSettings, 
    addBookmark, 
    getUserBookmarks,
    updateSettings 
  } = useDatabase();

  // Add a bookmark
  const handleAddBookmark = async () => {
    await addBookmark({
      surah_number: 1,
      surah_name: 'الفاتحة',
      verse_number: 1,
      verse_text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
    });
  };

  // Update settings
  const handleUpdateSettings = async () => {
    await updateSettings({
      dark_mode: true,
      font_size: 'large'
    });
  };
}
```

### Direct Database Operations

```javascript
import databaseService from '../services/databaseService';

// Create a new user
const userId = await databaseService.createUser({
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  location: 'القاهرة، مصر'
});

// Get user settings
const settings = await databaseService.getUserSettings(userId);

// Save prayer times
await databaseService.savePrayerTimes(userId, {
  date: '2024-01-01',
  fajr: '05:30',
  sunrise: '06:45',
  dhuhr: '12:15',
  asr: '15:30',
  maghrib: '18:00',
  isha: '19:30'
});
```

## App Flow

1. **App Launch**: Database initialization screen appears
2. **User Creation**: If no user exists, a default user is created
3. **Main App**: User can access all features with persistent data
4. **Settings**: All preferences are saved to database
5. **Data Persistence**: All user actions are stored locally

## Benefits

- **Data Persistence**: All user data survives app restarts
- **Performance**: Local SQLite database for fast access
- **Privacy**: Data stays on device
- **Scalability**: Easy to add new features and data types
- **User Experience**: Seamless data management across app

## Future Enhancements

- Data synchronization with cloud services
- Backup and restore functionality
- Data analytics and insights
- Multi-user support
- Advanced search capabilities

## Technical Notes

- Uses Expo SQLite for cross-platform compatibility
- React Context for state management
- Async/await pattern for database operations
- Error handling with user-friendly messages
- RTL support maintained throughout

This database system provides a solid foundation for the Islamic app's data management needs while maintaining simplicity and performance.
