import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// استيراد المكونات التي سيتم عرضها داخل الصفحة
import SafeBrowser from './childBrowser'; 
import DownloadScanner from './DownloadScanner';

// استدعاء الموديول الأصلي من الأندرويد
const { AppListModule } = NativeModules;
const { width, height } = Dimensions.get('window');

export default function welcomeChild() {
  // 1. حالات التحكم في الواجهة
  const [activeTab, setActiveTab] = useState<'menu' | 'browser' | 'scanner'>('menu');
  const [isBlockedUI, setIsBlockedUI] = useState(false);
  const [blockedAppName, setBlockedAppName] = useState('');
  const [isDowntimeActive, setIsDowntimeActive] = useState(false);

  // 2. المراجع (Refs) لإدارة الحماية
  const isBlockingActive = useRef(false);
  const stopMonitoringTemporarily = useRef(false); 
  const localBlockedListRef = useRef([]);
  const localDowntimeRef = useRef(false);

  // إعدادات الرابط (تأكدي أن الـ IP 192.168.1.9 هو الصحيح لجهازك)
  const BASE_URL = "http://192.168.1.9:8000/api/child";

  // --- وظيفة إرسال الموقع الجغرافي ---
  const sendLocationUpdate = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const childData = await AsyncStorage.getItem('childInfo');
      const childId = childData ? JSON.parse(childData).id : 100;

      await axios.post(`${BASE_URL}/locations/store`, {
        child_id: childId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log("⚠️ Sync Error (Location)");
    }
  };

  // --- وظيفة الخروج لواجهة الهاتف (Exit to Phone) ---
  const handleExitToLauncher = () => {
    console.log("🚀 Executing React Native Exit...");
    // إيقاف المراقبة مؤقتاً لتجنب أي تعليق أثناء الخروج
    stopMonitoringTemporarily.current = true;
    
    // الخروج من التطبيق بالكامل فوراً وتوجيه المستخدم للشاشة الرئيسية للهاتف
    BackHandler.exitApp();
  };

  // --- منع زر الرجوع وإدارة التبديل بين التبويبات ---
  useEffect(() => {
    const backAction = () => {
      if (activeTab !== 'menu') {
        setActiveTab('menu');
        return true;
      }
      if (isBlockedUI) return true;
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeTab, isBlockedUI]);

  // --- جلب الإعدادات من السيرفر ---
  const fetchConfig = async () => {
    try {
      const childData = await AsyncStorage.getItem('childInfo');
      const childId = childData ? JSON.parse(childData).id : 100;
      
      const resConfig = await axios.get(`${BASE_URL}/config?child_id=${childId}`, { timeout: 5000 });
      if (resConfig.data && resConfig.data.data) {
        localBlockedListRef.current = resConfig.data.data;
      }

      const resDowntime = await axios.get(`${BASE_URL}/downtime/check/${childId}`, { timeout: 5000 });
      const locked = resDowntime.data && resDowntime.data.is_locked === true;
      localDowntimeRef.current = locked;
      setIsDowntimeActive(locked);
    } catch (error) {
      console.log("⚠️ Sync Error (Config)");
    }
  };

  // --- مراقبة التطبيقات وحظر المحتوى غير المسموح ---
  const checkAndBlockApps = async () => {
    if (Platform.OS !== 'android' || !AppListModule || stopMonitoringTemporarily.current) return;

    try {
      const currentApp = await AppListModule.getCurrentApp();
      const myPackage = "com.securesprout.app"; 

      if (!currentApp || currentApp === "none") return;
      const formattedApp = currentApp.toLowerCase().trim();

      // السماح للتطبيقات الأساسية بالعمل
      if (formattedApp.includes(myPackage) || formattedApp.includes("launcher") || formattedApp.includes("settings")) return;

      let shouldBlock = false;
      let reason = "";

      if (localDowntimeRef.current) {
        shouldBlock = true;
        reason = "Device Downtime Active";
      } else {
        const appRule = localBlockedListRef.current.find(app => 
            app.package_name && app.package_name.toLowerCase().trim() === formattedApp
        );

        if (appRule && parseInt(appRule.is_blocked) === 1) {
            shouldBlock = true;
            reason = `🚫 ${appRule.app_name || 'App'} is Blocked`;
        }
      }

      if (shouldBlock && !isBlockedUI) {
        setIsBlockedUI(true);
        setBlockedAppName(reason);
        AppListModule.forceLockScreen(); 
      } else if (!shouldBlock && isBlockedUI) {
        setIsBlockedUI(false);
      }
    } catch (error) {
      console.log("⚠️ Monitor Error");
    }
  };

  // --- تشغيل الخدمات عند التحميل ---
  useEffect(() => {
    if (Platform.OS === 'android' && AppListModule?.startMonitorService) {
      AppListModule.startMonitorService();
    }

    const monitorInterval = setInterval(checkAndBlockApps, 1000);
    const syncInterval = setInterval(fetchConfig, 30000);
    const locationInterval = setInterval(sendLocationUpdate, 60000);
    
    fetchConfig();
    sendLocationUpdate();

    return () => {
      clearInterval(monitorInterval);
      clearInterval(syncInterval);
      clearInterval(locationInterval);
    };
  }, []);

  // --- دالة عرض المحتوى بناءً على الاختيار ---
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

    // القائمة الرئيسية (الأزرار)
    return (
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Hello, Champ!</Text>
          <Text style={styles.subtitleText}>Your device is protected 🛡️</Text>
        </View>
        
        <View style={styles.buttonGap}>
          {/* بوكس ابدأ التصفح */}
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('browser')}>
            <Text style={styles.buttonText}>Safe Browser</Text>
            <MaterialCommunityIcons name="web" size={24} color="#01579B" />
          </TouchableOpacity>

          {/* بوكس مجلد التحميلات */}
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} 
            onPress={() => setActiveTab('scanner')}
          >
            <Text style={[styles.buttonText, { color: '#2E7D32' }]}>Downloads Scanner</Text>
            <MaterialCommunityIcons name="folder-search-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>

          {/* زر الخروج لواجهة الهاتف */}
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
      {isBlockedUI ? (
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
      ) : renderContent()}
    </SafeAreaView>
  );
}

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