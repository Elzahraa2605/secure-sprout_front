import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const BACKGROUND_TASK_NAME = 'baby-monitor-cry-check';
const API = "http://192.168.1.9:8000/api";

// ===== تعريف مهمة الخلفية (لازم تكون برا الكومبوننت) =====
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const res = await fetch(API + "/light-status");
    const data = await res.json();
    if (data.is_crying && data.is_online) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "👶 Baby Monitor",
          body: "طفلك يبكي الآن!",
          sound: true,
        },
        trigger: null,
      });
    }
  } catch (err) {
    console.log("Background task error:", err);
  }
});

// ===== إعداد الإشعارات =====
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // السطر ده ناقص
    shouldShowList: true,   // والسطر ده كمان
  }),
});

// ===== تسجيل المهمة =====
async function registerBackgroundTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    if (!isRegistered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 15, // كل 15 ثانية (Android بيضبطها حسب البطارية)
      });
      console.log("✅ Background task registered");
    }
  } catch (err) {
    console.log("❌ Background task registration failed:", err);
  }
}

export default function App() {
  const [cry, setCry] = useState(false);
  const [online, setOnline] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [lightMessage, setLightMessage] = useState('');
const [alerts, setAlerts] = useState<any[]>([]); // ضيفي <any[]> عشان يفهم إنها مصفوفة كائنات
  const lastCryRef = useRef(false);
  const glowValue = useRef(new Animated.Value(0)).current;
  const screenGlow = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const setup = async () => {
      // طلب إذن الإشعارات
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        // تسجيل مهمة الخلفية بعد الإذن
        await registerBackgroundTask();
      } else {
        console.log("Notification permission denied");
      }
    };
    setup();

    getStatus();
    const interval = setInterval(getStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendCryNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "👶 Baby Monitor",
        body: "طفلك يبكي الآن!",
        sound: true,
      },
      trigger: null,
    });
  };

  const getStatus = () => {
    axios.get(API + "/light-status")
      .then(res => {
        const newCry = res.data.is_crying;
        const newOnline = res.data.is_online;

        if (newCry && newOnline && !lastCryRef.current) {
          sendCryNotification();
        }
        lastCryRef.current = newCry;

        setCry(newCry);
        setOnline(newOnline);
        setLightOn(res.data.is_light_on);
      })
      .catch(() => setOnline(false));

    axios.get(API + "/alerts")
      .then(res => setAlerts(res.data.alerts || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (cry && online) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [cry, online]);

  const showMessage = (msg: string) => {
    setLightMessage(msg);
    messageOpacity.setValue(1);
    Animated.timing(messageOpacity, {
      toValue: 0,
      duration: 1800,
      delay: 1000,
      useNativeDriver: true,
    }).start();
  };

  const toggleLight = () => {
    const newStatus = lightOn ? 0 : 1;
    setLightOn(!lightOn);
    showMessage(newStatus === 1 ? '💡 Lamp turned ON' : '🌙 Lamp turned OFF');
    axios.post(API + "/update-light", { status: newStatus })
      .catch(() => setLightOn(!!lightOn));
  };

  useEffect(() => {
    Animated.spring(glowValue, { toValue: lightOn ? 1 : 0, useNativeDriver: false, friction: 4 }).start();
    Animated.spring(screenGlow, { toValue: lightOn ? 1 : 0, useNativeDriver: false, friction: 6 }).start();
  }, [lightOn]);

  const connection = online
    ? { text: "ONLINE", color: "#2E86C1", bg: "#D6EAF8" }
    : { text: "OFFLINE", color: "#E74C3C", bg: "#FADBD8" };

  const bgColor = screenGlow.interpolate({ inputRange: [0, 1], outputRange: ['#DDEEF8', '#EAF4FF'] });

  return (
    <SafeAreaProvider>
      <Animated.View style={[styles.outerContainer, { backgroundColor: bgColor }]}>
        <SafeAreaView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }} style={{ width: '100%' }}>

            {/* Header */}
            <View style={styles.headerRow}>
              <MaterialCommunityIcons name="baby-face-outline" size={28} color="#2E86C1" />
              <Text style={styles.headerTitle}> Infant Room</Text>
            </View>

            {/* Cry Sensor Card */}
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <MaterialCommunityIcons
                    name="waveform"
                    size={50}
                    color={online ? (cry ? '#FF6B35' : '#2E86C1') : '#A0B4C8'}
                  />
                </Animated.View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Cry Sensor</Text>

                <View style={[styles.statusBadge, { backgroundColor: connection.bg, marginBottom: (online && cry) ? 8 : 0 }]}>
                  <View style={[styles.statusDot, { backgroundColor: connection.color }]} />
                  <Text style={[styles.statusText, { color: connection.color }]}>
                    {connection.text}
                  </Text>
                </View>

                {online && cry && (
                  <View style={[styles.statusBadge, { backgroundColor: '#FEF5E7', borderColor: '#FAD7A0', borderWidth: 1 }]}>
                    <MaterialCommunityIcons name="alert" size={14} color="#FF6B35" style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: '#FF6B35' }]}>
                      CRY DETECTED!
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Lamp Card */}
            <TouchableOpacity activeOpacity={0.85} onPress={toggleLight} style={[styles.lightCard, { backgroundColor: lightOn ? '#D6EAF8' : '#EBF5FB' }]}>
              <Animated.View style={[styles.glowOverlay, { opacity: glowValue.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }) }]} />
              <View style={styles.lightInfo}>
                <Text style={styles.lightLabel}>Cute Lamp</Text>
                <Text style={styles.lightSubLabel}>{lightOn ? "Tap to turn OFF" : "Tap to turn ON"}</Text>
                <Animated.Text style={[styles.lightToast, { opacity: messageOpacity }]}>{lightMessage}</Animated.Text>
              </View>
              <View style={styles.svgWrapper}>
                <Svg height="150" width="120" viewBox="0 0 100 120">
                  <AnimatedCircle cx="50" cy="35" r="48" fill="#AED6F1" fillOpacity={glowValue.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] })} />
                  <AnimatedCircle cx="50" cy="35" r="30" fill="#D6EAF8" fillOpacity={glowValue.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] })} />
                  <AnimatedPath d="M25,60 L75,60 L65,15 L35,15 Z" fill={lightOn ? "#5DADE2" : "#A0B4C8"} />

                  {lightOn ? (
                    <>
                      <Circle cx="44" cy="38" r="2.5" fill="#1A5276" />
                      <Circle cx="56" cy="38" r="2.5" fill="#1A5276" />
                    </>
                  ) : (
                    <>
                      <Path d="M41.5,37 Q44,41 46.5,37" stroke="#5D6D7E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                      <Path d="M53.5,37 Q56,41 58.5,37" stroke="#5D6D7E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    </>
                  )}

                  <Path d="M47,48 Q50,52 53,48" stroke={lightOn ? "#1A5276" : "#5D6D7E"} strokeWidth="1.5" fill="none" />
                  <Rect x="48" y="60" width="4" height="35" fill="#AED6F1" />
                  <Rect x="35" y="95" width="30" height="6" rx="3" fill="#AED6F1" />
                </Svg>
              </View>
            </TouchableOpacity>

            {/* Recent Alerts */}
            <Text style={styles.recentAlerts}>Recent Alerts</Text>
            {alerts.length === 0 ? (
              <View style={styles.alertCard}>
                <MaterialCommunityIcons name="bell-outline" size={24} color="#3A6E8A" />
                <Text style={styles.alertText}>No alerts yet. Baby is sleeping well! 😴</Text>
              </View>
            ) : (
              alerts.map((alert, index) => (
                <View key={index} style={styles.alertCard}>
                  <MaterialCommunityIcons name="bell" size={24} color="#FF6B35" />
                  <Text style={styles.alertText}>{alert.message || 'Baby is crying'}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1 },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A5276' },
  card: { width: '95%', backgroundColor: '#FFFFFF', borderRadius: 25, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 22, marginBottom: 18, elevation: 6, shadowColor: '#AED6F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, borderWidth: 1.5, borderColor: '#D6EAF8' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBF5FB', justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  cardContent: { flex: 1 },
  cardLabel: { color: '#1A5276', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontWeight: 'bold', fontSize: 13 },
  lightCard: { width: '95%', borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, height: 160, elevation: 6, shadowColor: '#AED6F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, overflow: 'hidden', borderWidth: 1.5, borderColor: '#AED6F1' },
  glowOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#AED6F1', borderRadius: 25 },
  lightInfo: { zIndex: 1 },
  lightLabel: { color: '#1A5276', fontSize: 20, fontWeight: 'bold' },
  lightSubLabel: { color: '#5DADE2', fontSize: 13, marginTop: 5 },
  lightToast: { color: '#2E86C1', fontSize: 13, fontWeight: 'bold', marginTop: 8 },
  svgWrapper: { width: 120, height: 150, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  recentAlerts: { alignSelf: 'flex-end', marginRight: '5%', marginTop: 25, color: '#1A5276', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  alertCard: { width: '95%', backgroundColor: '#F0F8FF', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, marginBottom: 12, elevation: 3 },
  alertText: { flex: 1, color: '#1A5276', fontWeight: '600', fontSize: 14, marginLeft: 12 },
  alertTime: { color: '#1A9FFF', fontSize: 11, fontWeight: '600', marginLeft: 8 },
});