import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AddDeviceScreen() {
  const router = useRouter();

  // 1. States
  const [seconds, setSeconds] = useState(600); 
  const [pairingCode, setPairingCode] = useState('');

  // 2. الدالة المعدلة (بترجع العداد من الأول وتغير الكود)
  const generateRandomCode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setPairingCode(result); // تحديث الكود
    setSeconds(600);        // إعادة العداد لـ 10 دقائق فوراً
  };

  // 3. توليد الكود أول ما الشاشة تفتح
  useEffect(() => {
    generateRandomCode();
  }, []);

  // 4. كود العداد (بيشتغل أوتوماتيك أول ما الـ seconds تتغير)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (seconds > 0) {
      timer = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000); 
    } else if (seconds === 0) {
      Alert.alert("Expired", "Code has expired. Please generate a new one.");
    }
    return () => clearInterval(timer); 
  }, [seconds]);

  // 5. دالة تنسيق الوقت
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your pairing code</Text>
      
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{pairingCode}</Text>
      </View>

      <Text style={styles.timerText}>
        Expires after {formatTime(seconds)} ⏱️
      </Text>

      {/* زرار الـ Resend اللي بيصفر العداد */}
      <TouchableOpacity 
        style={styles.resendBtn} 
        onPress={generateRandomCode}
      >
        <Text style={styles.resendText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' },
  title: { fontSize: 18, color: '#0288D1', marginBottom: 20, fontWeight: '600' },
  codeBox: { 
    backgroundColor: '#BBDEFB', 
    paddingHorizontal: 30, 
    paddingVertical: 20, 
    borderRadius: 20, 
    marginBottom: 20,
    elevation: 8, // زيادة الظل عشان يبان "كارت" زي اللي في الصورة
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  codeText: { fontSize: 40, fontWeight: 'bold', color: '#01579B', letterSpacing: 8 },
  timerText: { fontSize: 16, color: '#FBC02D', fontWeight: 'bold' },
  resendBtn: { marginTop: 30 },
  resendText: { color: '#0288D1', textDecorationLine: 'underline', fontWeight: '500' }
});