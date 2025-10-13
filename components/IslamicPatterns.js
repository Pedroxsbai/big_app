import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

// مكون الزخارف الإسلامية للهيدر
export const HeaderPattern = ({ width = 400, height = 120 }) => (
  <Svg width={width} height={height} style={styles.pattern}>
    <G>
      {/* زخارف هندسية إسلامية */}
      <Path
        d="M0 60 Q50 30 100 60 T200 60 T300 60 T400 60"
        stroke="#BFDBFE"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <Path
        d="M0 40 Q50 70 100 40 T200 40 T300 40 T400 40"
        stroke="#BFDBFE"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      
      {/* دوائر مزخرفة */}
      <Circle cx="50" cy="30" r="8" fill="#BFDBFE" opacity="0.4" />
      <Circle cx="350" cy="30" r="8" fill="#BFDBFE" opacity="0.4" />
      <Circle cx="50" cy="90" r="8" fill="#BFDBFE" opacity="0.4" />
      <Circle cx="350" cy="90" r="8" fill="#BFDBFE" opacity="0.4" />
      
      {/* زخارف جانبية */}
      <Path
        d="M20 20 L30 20 L25 30 Z"
        fill="#BFDBFE"
        opacity="0.5"
      />
      <Path
        d="M380 20 L390 20 L385 30 Z"
        fill="#BFDBFE"
        opacity="0.5"
      />
      <Path
        d="M20 100 L30 100 L25 90 Z"
        fill="#BFDBFE"
        opacity="0.5"
      />
      <Path
        d="M380 100 L390 100 L385 90 Z"
        fill="#BFDBFE"
        opacity="0.5"
      />
    </G>
  </Svg>
);

// مكون التزيين الجانبي للنص
export const TextDecoration = ({ size = 40 }) => (
  <Svg width={size} height={size} style={styles.decoration}>
    <G>
      {/* زخرفة إسلامية بسيطة */}
      <Path
        d="M20 10 L30 20 L20 30 L10 20 Z"
        fill="#1E3A8A"
        opacity="0.6"
      />
      <Circle cx="20" cy="20" r="3" fill="#1E3A8A" opacity="0.8" />
      <Path
        d="M15 15 L25 15 M15 25 L25 25"
        stroke="#1E3A8A"
        strokeWidth="1"
        opacity="0.6"
      />
    </G>
  </Svg>
);

// مكون الزخارف للخلفية
export const BackgroundPattern = ({ width = 400, height = 200 }) => (
  <Svg width={width} height={height} style={styles.backgroundPattern}>
    <G>
      {/* نمط إسلامي متكرر */}
      <Path
        d="M0 0 L20 0 L10 10 Z"
        fill="#E0E7FF"
        opacity="0.1"
      />
      <Path
        d="M380 0 L400 0 L390 10 Z"
        fill="#E0E7FF"
        opacity="0.1"
      />
      <Path
        d="M0 190 L20 200 L10 190 Z"
        fill="#E0E7FF"
        opacity="0.1"
      />
      <Path
        d="M380 190 L400 200 L390 190 Z"
        fill="#E0E7FF"
        opacity="0.1"
      />
      
      {/* دوائر صغيرة متفرقة */}
      <Circle cx="60" cy="40" r="2" fill="#E0E7FF" opacity="0.2" />
      <Circle cx="340" cy="40" r="2" fill="#E0E7FF" opacity="0.2" />
      <Circle cx="60" cy="160" r="2" fill="#E0E7FF" opacity="0.2" />
      <Circle cx="340" cy="160" r="2" fill="#E0E7FF" opacity="0.2" />
    </G>
  </Svg>
);

const styles = StyleSheet.create({
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  decoration: {
    marginHorizontal: 8,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
});

export default {
  HeaderPattern,
  TextDecoration,
  BackgroundPattern,
}; 