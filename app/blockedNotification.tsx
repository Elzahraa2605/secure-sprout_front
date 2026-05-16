import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View, NativeModules, Platform } from 'react-native';

const { AppListModule } = NativeModules;

export default function BlockedNotification() {
  const router = useRouter();
  const { appName, initialMinutes } = useLocalSearchParams();
  
  // تحويل الدقائق لثواني للعد التنازلي
  const [secondsLeft, setSecondsLeft] = useState(Number(initialMinutes || 5) * 60);

  useEffect(() => {
    // 1. منع زر الرجوع تماماً
    // ده أهم سطر عشان يمنع الطفل إنه يهرب من الشاشة دي بالزرار
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    
    // 2. تأكيد بقاء التطبيق في المقدمة فقط
    // شيلنا أمر goToHomeScreen من هنا عشان ما يقفلش شاشة الحظر نفسها
    if (Platform.OS === 'android' && AppListModule) {
      const stayOnTop = setTimeout(() => {
        AppListModule.bringAppToFront();
        console.log("🛡️ Lockdown view confirmed and stable.");
      }, 500);

      return () => {
        backHandler.remove();
        clearTimeout(stayOnTop);
      };
    }

    // 3. مؤقت العد التنازلي
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      backHandler.remove();
      clearInterval(timer);
    };
  }, []);

  // تنسيق الوقت المتبقي (MM:SS)
  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <MaterialCommunityIcons name="shield-lock" size={80} color="#D32F2F" />
        <Text style={styles.title}>App Restricted</Text>
        <Text style={styles.appName}>{appName || "This Application"}</Text>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time until unlock:</Text>
          <Text style={styles.timerValue}>{formatTime()}</Text>
        </View>

        <Text style={styles.infoText}>
          Your parents have set a limit for this app to help you stay productive.
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.replace('/welcomeChild')}
        >
          <Text style={styles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  card: { 
    backgroundColor: '#FFF', 
    width: '100%', 
    borderRadius: 25, 
    padding: 30, 
    alignItems: 'center', 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 15 },
  appName: { fontSize: 18, color: '#D32F2F', fontWeight: '600', marginBottom: 20 },
  timerContainer: { 
    backgroundColor: '#FFEBEE', 
    padding: 20, 
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  timerLabel: { fontSize: 14, color: '#C62828' },
  timerValue: { fontSize: 36, fontWeight: 'bold', color: '#D32F2F' },
  infoText: { textAlign: 'center', color: '#757575', lineHeight: 22, marginBottom: 30 },
  button: { 
    backgroundColor: '#0288D1', 
    width: '100%', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});