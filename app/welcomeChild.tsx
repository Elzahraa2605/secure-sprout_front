import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import {
  BackHandler,
  Dimensions,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// استيراد المكونات التي سيتم عرضها داخل الصفحة
import SafeBrowser from './childBrowser';
import DownloadScanner from './DownloadScanner';

// استدعاء الموديول الأصلي من الأندرويد
const { AppListModule } = NativeModules;
const { width, height } = Dimensions.get('window');

// ============================================================
// 🔒 Component شاشة القفل الخاصة بالـ Downtime
// ============================================================
function LockScreen() {
  useEffect(() => {
    const backAction = () => { return true; };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={lockStyles.container}>
      <StatusBar hidden={true} />
      <View style={lockStyles.content}>
        <Ionicons name="moon" size={120} color="#fff" />
        <Text style={lockStyles.title}>Downtime Active</Text>
        <Text style={lockStyles.subtitle}>
          It's time to rest your eyes. {"\n"}
          Go and play away from the screen!
        </Text>
      </View>
      <View style={lockStyles.footer}>
        <Text style={lockStyles.footerText}>SecureSprout Protection</Text>
      </View>
    </View>
  );
}

// ============================================================
export default function welcomeChild() {
  const router = useRouter();

  // 1. حالات التحكم في الواجهة
  const [activeTab, setActiveTab] = useState<'menu' | 'browser' | 'scanner'>('menu');
  const [isBlockedUI, setIsBlockedUI] = useState(false);
  const [blockedAppName, setBlockedAppName] = useState('');
  const [isDowntimeActive, setIsDowntimeActive] = useState(false);

  // 2. المراجع (Refs) لإدارة الحماية
  const isBlockingActive = useRef(false);
  const stopMonitoringTemporarily = useRef(false);
  const localBlockedListRef = useRef([]);
  const downtimeIntervalRef = useRef(null);
  const localDowntimeRef = useRef(false);

  // إعدادات الرابط
  const BASE_URL = "http://192.168.1.9:8000/api/child";

  // --- وظيفة إرسال الموقع الجغرافي ---
  const sendLocationUpdate = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const childData = await AsyncStorage.getItem('childInfo');
      const childId = childData ? JSON.parse(childData).id : 100;

      const locationData = {
        child_id: childId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: "Device Live Location",
      };

      await axios.post(`${BASE_URL}/locations/store`, locationData);
      console.log("📍 Location synced to server successfully");
    } catch (error) {
      console.log("⚠️ Location Sync Error:", error.message);
    }
  };

  // --- منع زر الرجوع وإدارة التبديل بين التبويبات ---
  useEffect(() => {
    const backAction = () => {
      if (activeTab !== 'menu') {
        setActiveTab('menu');
        return true;
      }
      if (isBlockedUI || isDowntimeActive) return true;
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeTab, isBlockedUI, isDowntimeActive]);

  // --- وظيفة الخروج لواجهة الهاتف (المعدلة لحل مشكلة الـ Loop والـ Crash) ---
  const handleExitToLauncher = async () => {
    if (Platform.OS === 'android' && AppListModule) {
      console.log("🚀 جاري الانتقال لواجهة الهاتف وإيقاف المراقبة مؤقتاً...");
      stopMonitoringTemporarily.current = true;

      try {
        // نكتفي باستدعاء موديول الـ Native لفتح قائمة الهاتف الافتراضية
        // تم حذف الاستدعاء المباشر لباكيج الـ nexuslauncher لعدم تعليق الـ Activity
        AppListModule.goToHomeScreen();
      } catch (err) {
        console.log("Fallback to normal home screen", err);
        AppListModule.goToHomeScreen();
      }

      // مهلة الـ 10 ثوانٍ لتعود المراقبة للعمل بالخلفية مستقرة
      setTimeout(() => {
        stopMonitoringTemporarily.current = false;
        console.log("🔄 تم إعادة تفعيل مراقبة التطبيقات.");
      }, 10000);

    } else {
      BackHandler.exitApp();
    }
  };

  // --- جلب قواعد حظر التطبيقات من السيرفر ---
  const fetchConfig = async () => {
    try {
      const childData = await AsyncStorage.getItem('childInfo');
      const childId = childData ? JSON.parse(childData).id : 100;

      const resConfig = await axios.get(`${BASE_URL}/config?child_id=${childId}`, { timeout: 5000 });
      if (resConfig.data && resConfig.data.data) {
        localBlockedListRef.current = resConfig.data.data;
        console.log("✅ Rules Synced:", localBlockedListRef.current.length, "apps");
      }
    } catch (error) {
      console.log("⚠️ Rules Sync Error:", error.message);
    }
  };

  // --- مراقبة التطبيقات وحظر المحتوى غير المسموح ---
  const checkAndBlockApps = async () => {
    if (localDowntimeRef.current) {
      stopMonitoringTemporarily.current = false;
    }

    if (Platform.OS !== 'android' || !AppListModule || isBlockingActive.current || stopMonitoringTemporarily.current) return;

    try {
      const currentApp = await AppListModule.getCurrentApp();
      const myPackage = "com.securesprout.app";

      if (!currentApp || currentApp === "none") return;
      const formattedApp = currentApp.toLowerCase().trim();

      let shouldBlock = false;
      let reason = "";

      if (localDowntimeRef.current) {
        if (!isDowntimeActive) {
          shouldBlock = true;
          reason = "Device Downtime Active";
        }
      } else {
        if (
          formattedApp.includes(myPackage) ||
          formattedApp.includes("launcher") ||
          formattedApp.includes("nexuslauncher") ||
          formattedApp.includes("trebuchet") ||
          formattedApp.includes("systemui") ||
          formattedApp.includes("settings")
        ) {
          if (isBlockedUI) {
            setIsBlockedUI(false);
          }
          return;
        }

        const appRule = localBlockedListRef.current.find(app =>
          app.package_name && app.package_name.toLowerCase().trim() === formattedApp
        );

        if (appRule) {
          if (parseInt(appRule?.is_blocked) === 1) {
            shouldBlock = true;
            reason = `🚫 ${appRule.app_name || 'App'} is Blocked`;
          } else if (appRule?.time_limit && parseInt(appRule.time_limit) > 0) {
            const usageToday = await AppListModule.getTodayUsageForApp(formattedApp);
            const limit = parseInt(appRule.time_limit);

            if (usageToday >= limit) {
              shouldBlock = true;
              reason = `⏳ Time Limit Reached (${limit} min)`;
            }
          }
        }
      }

      if (shouldBlock) {
        if (localDowntimeRef.current) {
          setIsDowntimeActive(true);
        } else if (!isBlockedUI) {
          isBlockingActive.current = true;
          setBlockedAppName(reason);
          setIsBlockedUI(true);
          AppListModule.forceLockScreen();
          setTimeout(() => { isBlockingActive.current = false; }, 1200);
        }
      }

    } catch (error) {
      console.log("⚠️ Monitor Error:", error);
    }
  };

  // --- تشغيل الخدمات عند التحميل ---
  useEffect(() => {
    if (Platform.OS === 'android' && AppListModule?.startMonitorService) {
      AppListModule.startMonitorService();
    }

    const monitorInterval = setInterval(checkAndBlockApps, 1000);

    const downtimeInterval = setInterval(async () => {
      try {
        const childData = await AsyncStorage.getItem('childInfo');
        const childId = childData ? JSON.parse(childData).id : 100;

        const resDowntime = await axios.get(
          `${BASE_URL}/downtime/check/${childId}`,
          { timeout: 1500 }
        );

        let locked = false;
        if (resDowntime.data) {
          if (resDowntime.data.is_locked === true || resDowntime.data.is_locked === 1) {
            locked = true;
          } else if (
            resDowntime.data.is_enabled === true &&
            resDowntime.data.start_time &&
            resDowntime.data.end_time
          ) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const [startH, startM] = resDowntime.data.start_time.split(':').map(Number);
            const [endH, endM] = resDowntime.data.end_time.split(':').map(Number);

            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;

            if (startMinutes <= endMinutes) {
              locked = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
            } else {
              locked = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
            }
          }
        }

        if (locked) {
          stopMonitoringTemporarily.current = false;
        }

        if (localDowntimeRef.current !== locked) {
          console.log("⚡ لقطة فورية لحالة الـ Downtime:", locked);
          localDowntimeRef.current = locked;
          setIsDowntimeActive(locked);
        }
      } catch (e) {
        // تجاهل الأخطاء المؤقتة
      }
    }, 2500);

    const syncInterval = setInterval(fetchConfig, 30000);
    const locationInterval = setInterval(sendLocationUpdate, 60000);

    fetchConfig();
    sendLocationUpdate();

    return () => {
      clearInterval(monitorInterval);
      clearInterval(downtimeInterval);
      clearInterval(syncInterval);
      clearInterval(locationInterval);
    };
  }, []);

  const renderContent = () => {
    if (activeTab === 'browser') {
      return (
        <View style={{ flex: 1 }}>
          <SafeBrowser />
          <TouchableOpacity style={styles.homeFab} onPress={() => setActiveTab('menu')}>
            <Ionicons name="home" size={26} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'scanner') {
      return (
        <View style={{ flex: 1 }}>
          <DownloadScanner />
          <TouchableOpacity style={styles.homeFab} onPress={() => setActiveTab('menu')}>
            <Ionicons name="home" size={26} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Hello, Champ!</Text>
          <Text style={styles.subtitleText}>Your device is protected 🛡️</Text>
        </View>

        <View style={styles.buttonGap}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('browser')}>
            <Text style={styles.buttonText}>Safe Browser</Text>
            <MaterialCommunityIcons name="web" size={24} color="#01579B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]}
            onPress={() => setActiveTab('scanner')}
          >
            <Text style={[styles.buttonText, { color: '#2E7D32' }]}>Downloads Scanner</Text>
            <MaterialCommunityIcons name="folder-search-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#C8E6C9', marginTop: 10 }]}
            onPress={handleExitToLauncher}
          >
            <Text style={[styles.buttonText, { color: '#2E7D32' }]}>Exit to Phone</Text>
            <Ionicons name="exit-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={isDowntimeActive} />

      {isDowntimeActive ? (
        <LockScreen />
      ) : isBlockedUI ? (
        <View style={styles.blockedAppOverlay}>
          <MaterialCommunityIcons name="shield-lock" size={100} color="#D32F2F" />
          <Text style={styles.lockTitle}>Access Restricted</Text>
          <Text style={styles.lockAppName}>{blockedAppName}</Text>
          <TouchableOpacity style={styles.unlockButton} onPress={() => {
            setIsBlockedUI(false);
            handleExitToLauncher();
          }}>
            <Text style={styles.unlockButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderContent()
      )}
    </SafeAreaView>
  );
}

const lockStyles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1A237E', zIndex: 99999 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 25, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#BBDEFB', textAlign: 'center', marginTop: 15, lineHeight: 26 },
  footer: { paddingBottom: 40, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 1.2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  mainContent: { flex: 1, padding: 25, justifyContent: 'space-between', alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 50 },
  titleText: { fontSize: 34, fontWeight: 'bold', color: '#01579B' },
  subtitleText: { fontSize: 18, color: '#0288D1', marginTop: 10 },
  buttonGap: { width: '100%', gap: 15, marginBottom: 50 },
  actionButton: { flexDirection: 'row', backgroundColor: '#B3E5FC', padding: 20, borderRadius: 15, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  buttonText: { color: '#01579B', fontWeight: 'bold', fontSize: 18, marginRight: 15 },
  homeFab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#01579B', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  blockedAppOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  lockTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 20 },
  lockAppName: { fontSize: 18, color: '#D32F2F', fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  unlockButton: { backgroundColor: '#0288D1', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginTop: 20 },
  unlockButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});