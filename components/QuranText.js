import React from 'react';
import { Text, View } from 'react-native';

export default function QuranText({ 
  children, 
  fontSize = 28, 
  style = {}, 
  number = null, 
  showNumber = false,
  useUthmani = true 
}) {
  const fontFamily = useUthmani ? 'Uthmani' : 'Hafs';
  
  return (
    <Text
      style={[
        {
          fontFamily: fontFamily,
          fontSize: fontSize,
          lineHeight: Math.round(fontSize * 1.6),
          textAlign: 'right',
          writingDirection: 'rtl',
          color: '#000000',
        },
        style,
      ]}
      allowFontScaling={false}
    >
      {children}
      {showNumber && number != null && (
        <View style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: '#166534',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 8,
          display: 'inline-flex',
        }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 'bold',
          }}>
            {number}
          </Text>
        </View>
      )}
    </Text>
  );
}
