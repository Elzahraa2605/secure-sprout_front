import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ParentPairingScreen() {
  const router = useRouter();
  const { childId, childName } = useLocalSearchParams(); 
  
  const [pairingCode, setPairingCode] = useState('--- ---'); 
  const [timeLeft, setTimeLeft] = useState(600); 
  const [loading, setLoading] = useState(true);

  const fetchPairingDetails = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setLoading(true);

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`http://192.168.1.9:8000/api/parent/childs/show-pairing/${childId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // 1. حالة النجاح والربط تم
      if (response.data.is_paired === true) {
        // نوقف أي محاولات تانية ونحول الصفحة فوراً
        router.replace({
          pathname: '/childProfile',
          params: { id: childId }
        });
        return;
      }

      // 2. حالة وجود كود جديد (Pending)
      if (response.data.success && response.data.code) {
        const rawCode = response.data.code.toString();
        setPairingCode(`${rawCode.slice(0, 3)}-${rawCode.slice(3)}`);
      }

    } catch (error: any) {
      // لو الربط تم، السيرفر ممكن يرجع 404 أو رسالة إن الكود مابقاش موجود
      // في حالة الـ Polling التلقائي، مش هنطلع Alerts عشان متبوظش التجربة
      if (isManualRefresh) {
        const msg = error.response?.data?.message || "Could not fetch code.";
        Alert.alert("Notice", msg);
      }
      console.log("Polling check: Code might be completed or expired.");
    } finally {
      setLoading(false);
    }
  };

  // مراقبة الاتصال كل 5 ثواني
  useEffect(() => {
    if (childId) {
      fetchPairingDetails();
      const interval = setInterval(() => fetchPairingDetails(false), 5000);
      return () => clearInterval(interval);
    }
  }, [childId]);

  // تايمر العد التنازلي
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0277BD" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add {childName || "Child"}'s Device</Text>
        </View>

        <Text style={styles.mainSubtitle}>Follow these steps on your child's phone.</Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepItem}>
             <Ionicons name="download-outline" size={24} color="#0277BD" style={styles.stepIcon} />
             <View>
                <Text style={styles.stepTitle}>Download App on Child's phone</Text>
                <Text style={styles.stepSub}>Step 1</Text>
             </View>
          </View>
          
          <View style={styles.stepItem}>
             <Ionicons name="log-in-outline" size={24} color="#0277BD" style={styles.stepIcon} />
             <View>
                <Text style={styles.stepTitle}>Login with Child's account</Text>
                <Text style={styles.stepSub}>Step 2</Text>
             </View>
          </View>

          <View style={styles.stepItem}>
             <Ionicons name="keypad-outline" size={24} color="#0277BD" style={styles.stepIcon} />
             <View>
                <Text style={styles.stepTitle}>Enter the code below</Text>
                <Text style={styles.stepSub}>Step 3</Text>
             </View>
          </View>
        </View>

        <View style={styles.pairingBox}>
          <Text style={styles.pairingLabel}>Your pairing code</Text>
          
          {loading ? (
            <ActivityIndicator color="#01579B" size="large" />
          ) : (
            <Text style={styles.codeText}>{pairingCode}</Text>
          )}

          <View style={styles.timerRow}>
             <Ionicons name="stopwatch-outline" size={18} color="#FFB300" />
             <Text style={styles.timerText}>
               {timeLeft > 0 ? `Expires after ${formatTime(timeLeft)}` : "Code Expired"}
             </Text>
          </View>

          <TouchableOpacity onPress={() => fetchPairingDetails(true)} style={styles.resendBtn}>
            <Text style={styles.resendText}>Refresh Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.waitingBtn}>
          <ActivityIndicator color="#01579B" size="small" style={{marginRight: 10}} />
          <Text style={styles.waitingBtnText}>Waiting for connection...</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  scrollContent: { padding: 20, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 20, width: '100%' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#01579B', marginLeft: 15 },
  mainSubtitle: { fontSize: 16, color: '#0288D1', textAlign: 'center', marginBottom: 25, fontWeight: '500' },
  stepContainer: { width: '100%', alignItems: 'center' },
  stepItem: { flexDirection: 'row', backgroundColor: '#BBDEFB', width: width * 0.9, padding: 15, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  stepIcon: { marginRight: 15 },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#01579B' },
  stepSub: { fontSize: 12, color: '#0288D1', marginTop: 2, opacity: 0.7 },
  pairingBox: { backgroundColor: '#BBDEFB', width: width * 0.9, padding: 30, borderRadius: 25, alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  pairingLabel: { color: '#0288D1', fontSize: 16, marginBottom: 15, fontWeight: '500' },
  codeText: { fontSize: 42, fontWeight: 'bold', color: '#01579B', letterSpacing: 5 },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  timerText: { color: '#FFB300', marginLeft: 8, fontSize: 14, fontWeight: 'bold' },
  resendBtn: { marginTop: 20 },
  resendText: { color: '#0288D1', fontWeight: 'bold', textDecorationLine: 'underline' },
  waitingBtn: { backgroundColor: '#90CAF9', width: width * 0.9, padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center', marginBottom: 20, flexDirection: 'row', justifyContent: 'center' },
  waitingBtnText: { color: '#01579B', fontWeight: 'bold', fontSize: 16 }
});