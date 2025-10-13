import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Vibration } from 'react-native';
import * as Location from 'expo-location';
import PrayerTimesService from '../services/prayerTimesService';

// Try to import Haptics, fallback to Vibration if not available
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (error) {
  console.log('expo-haptics not available, using Vibration fallback');
}

function normalizeAngle(angle) {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

export default function QiblaCompass() {
  const [heading, setHeading] = useState(0); // device heading (0..360), 0 is north
  const [bearing, setBearing] = useState(null); // qibla bearing
  const [isAligned, setIsAligned] = useState(false); // whether pointing to qibla
  const [lastVibrationTime, setLastVibrationTime] = useState(0);
  
  // Animation values
  const pulseAnim = new Animated.Value(1);
  const glowAnim = new Animated.Value(0);
  const successAnim = new Animated.Value(0);

  // Check if aligned with Qibla (within 5 degrees)
  const checkAlignment = (currentHeading, qiblaBearing) => {
    if (qiblaBearing == null) return false;
    const diff = Math.abs(normalizeAngle(qiblaBearing - currentHeading));
    return diff <= 5 || diff >= 355; // 5 degrees tolerance
  };

  // Trigger vibration and animations when aligned
  const triggerAlignmentFeedback = () => {
    const now = Date.now();
    if (now - lastVibrationTime > 2000) { // Prevent too frequent vibrations
      // Try Haptics first, fallback to Vibration
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        // Fallback to basic vibration
        Vibration.vibrate(200);
      }
      setLastVibrationTime(now);
      
      // Success animation
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Pulse animation for alignment
  useEffect(() => {
    if (isAligned) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulse.start();
      glow.start();
      
      return () => {
        pulse.stop();
        glow.stop();
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isAligned]);

  useEffect(() => {
    let headingSub = null;

    const subscribe = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // still try to compute bearing (will fallback to default location inside service)
        }
        const q = await PrayerTimesService.getQiblaDirection();
        setBearing(q.bearing);
      } catch {}

      try {
        headingSub = await Location.watchHeadingAsync((h) => {
          // Prefer trueHeading if available, else magHeading
          const deg = typeof h.trueHeading === 'number' && h.trueHeading >= 0 ? h.trueHeading : (h.magHeading || 0);
          const normalizedHeading = normalizeAngle(deg);
          setHeading(normalizedHeading);
          
          // Check alignment
          const aligned = checkAlignment(normalizedHeading, bearing);
          if (aligned && !isAligned) {
            triggerAlignmentFeedback();
          }
          setIsAligned(aligned);
        });
      } catch {}
    };

    subscribe();
    return () => {
      if (headingSub && typeof headingSub.remove === 'function') headingSub.remove();
    };
  }, [bearing]);

  const needleRotation = (() => {
    if (bearing == null) return '0deg';
    const diff = normalizeAngle(bearing - heading);
    return `${diff}deg`;
  })();

  return (
    <View style={styles.container}>
      {/* Success Message Overlay */}
      {isAligned && (
        <Animated.View 
          style={[
            styles.successOverlay,
            {
              opacity: successAnim,
              transform: [{
                scale: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                })
              }]
            }
          ]}
        >
          <Text style={styles.successText}>🎯 تم العثور على القبلة!</Text>
        </Animated.View>
      )}
      
      {/* Islamic Compass Circle */}
      <Animated.View 
        style={[
          styles.compassCircle,
          {
            transform: [{ scale: pulseAnim }],
            shadowOpacity: isAligned ? 0.4 : 0.2,
            shadowColor: isAligned ? '#D97706' : '#92400E',
            borderColor: isAligned ? '#D97706' : '#92400E',
          }
        ]}
      >
        {/* Glow Effect */}
        {isAligned && (
          <Animated.View 
            style={[
              styles.glowEffect,
              {
                opacity: glowAnim,
                transform: [{
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  })
                }]
              }
            ]}
          />
        )}
        
        {/* Islamic Geometric Pattern Background */}
        <View style={styles.islamicPattern}>
          {/* Outer Ring */}
          <View style={styles.outerRing} />
          
          {/* Islamic Star Pattern */}
          <View style={styles.starPattern}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
              <View
                key={index}
                style={[
                  styles.starPoint,
                  { transform: [{ rotate: `${angle}deg` }] }
                ]}
              />
            ))}
          </View>
          
          {/* Inner Decorative Ring */}
          <View style={styles.innerRing} />
        </View>
        
        {/* Arabic Direction Markers */}
        <View style={styles.directionMarkers}>
          <Text style={[styles.directionText, styles.northText]}>ش</Text>
          <Text style={[styles.directionText, styles.southText]}>ج</Text>
        </View>
        
        {/* Islamic Needle Design */}
        <View style={[styles.needleContainer, { transform: [{ rotate: needleRotation }] }]}>
          <View style={styles.needle}>
            {/* Crescent Moon Head */}
            <View style={[
              styles.needleHead,
              isAligned && styles.needleHeadAligned
            ]}>
              <View style={styles.crescentMoon} />
              <View style={styles.star} />
            </View>
            {/* Islamic Pattern Tail */}
            <View style={styles.needleTail}>
              <View style={styles.tailPattern} />
            </View>
          </View>
        </View>
        
        {/* Center Islamic Design */}
        <View style={[
          styles.centerDot,
          isAligned && styles.centerDotAligned
        ]}>
          <View style={styles.centerPattern}>
            <View style={styles.centerStar} />
            <View style={styles.centerCircle} />
          </View>
        </View>
        
        {/* Islamic Degree Markers */}
        <View style={styles.degreeMarkers}>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree, index) => (
            <View
              key={index}
              style={[
                styles.degreeMarker,
                { transform: [{ rotate: `${degree}deg` }] }
              ]}
            />
          ))}
        </View>
        
        {/* Qibla Indicator Text */}
   
      </Animated.View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>اتجاه القبلة:</Text>
          <Text style={styles.infoValue}>{bearing != null ? `${Math.round(bearing)}°` : '...'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>زاوية الجهاز:</Text>
          <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
        </View>
      </View>
      
      {/* Alignment Status */}
      <View style={styles.statusContainer}>
        {isAligned ? (
          <View style={styles.alignedStatus}>
            <Text style={styles.alignedText}>✅ متجه نحو القبلة</Text>
          </View>
        ) : (
          <Text style={styles.hint}>وجّه أعلى الهاتف نحو الهلال الأحمر</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    paddingVertical: 20,
    position: 'relative',
  },
  
  // Success Overlay
  successOverlay: {
    position: 'absolute',
    top: -20,
    zIndex: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  compassCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 4,
    borderColor: '#92400E',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    position: 'relative',
    shadowColor: '#92400E',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Glow Effect
  glowEffect: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#D97706',
    opacity: 0.3,
    zIndex: -1,
  },
  
  // Islamic Pattern Background
  islamicPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: '#D97706',
    borderStyle: 'dashed',
  },
  starPattern: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starPoint: {
    position: 'absolute',
    width: 4,
    height: 20,
    backgroundColor: '#D97706',
    borderRadius: 2,
    top: 0,
  },
  innerRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderStyle: 'dotted',
  },
  
  // Direction Markers
  directionMarkers: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  directionText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    fontFamily: 'sans-serif-medium',
  },
  northText: {
    top: 8,
    alignSelf: 'center',
  },
  eastText: {
    right: 8,
    top: '50%',
    marginTop: -9,
  },
  southText: {
    bottom: 8,
    alignSelf: 'center',
  },
  westText: {
    left: 8,
    top: '50%',
    marginTop: -9,
  },
  
  // Needle
  needleContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needle: {
    width: 4,
    height: 100,
    position: 'relative',
  },
  needleHead: {
    position: 'absolute',
    top: -10,
    left: -12,
    width: 24,
    height: 24,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needleHeadAligned: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 7,
  },
  crescentMoon: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    top: 2,
    left: 2,
  },
  star: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 3,
    top: 6,
    right: 2,
  },
  needleTail: {
    position: 'absolute',
    bottom: -5,
    left: -8,
    width: 20,
    height: 20,
    backgroundColor: '#92400E',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tailPattern: {
    width: 8,
    height: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  
  // Center Dot
  centerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#92400E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  centerDotAligned: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 7,
  },
  centerPattern: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerStar: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
  },
  centerCircle: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 3,
  },
  
  // Degree Markers
  degreeMarkers: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  degreeMarker: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: '#D97706',
    top: 4,
    left: '50%',
    marginLeft: -1,
  },
  
  // Qibla Indicator
  qiblaIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  qiblaText: {
    color: '#FEF3C7',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  
  // Info Row
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20,
    justifyContent: 'space-around',
    width: '100%',
  },
  infoItem: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: { 
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: { 
    color: '#1E293B', 
    fontWeight: '700', 
    fontSize: 16,
  },
  
  hint: { 
    color: '#64748B', 
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Status Container
  statusContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  alignedStatus: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  alignedText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
