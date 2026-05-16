import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapProps {
  childId: number | string | null;
}

export default function ChildMap({ childId }: MapProps) {
  const [region, setRegion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getChildLocation = async () => {
    if (!childId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`http://192.168.1.9:8000/api/parent/locations/show/${childId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      // اللوج ده هيعرفنا الداتا واصلة فين بالظبط
      console.log("📍 Full Data:", JSON.stringify(response.data));

      // 1. الدخول لبيانات الطفل
      const childData = response.data.data;
      
      // 2. الوصول لمصفوفة المواقع (Locations Array)
      const locations = childData?.locations;

      if (locations && locations.length > 0) {
        // بناخد أول عنصر في المصفوفة [0] لأنه هو اللي جواه الإحداثيات
        const lastLoc = locations[0]; 
        
        const lat = parseFloat(lastLoc.latitude);
        const lng = parseFloat(lastLoc.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          setRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          setErrorMsg(null);
        } else {
          throw new Error("Invalid Coordinates");
        }
      } else {
        // Fallback لو الجدول فاضي في الداتابيز
        setRegion({
            latitude: 30.0444,
            longitude: 31.2357,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        setErrorMsg("لا توجد بيانات موقع مسجلة (عرض افتراضي)");
      }
    } catch (error: any) {
      console.error("❌ Map Error:", error.message);
      // إظهار موقع القاهرة كحل أخير عشان الشاشة متفضلش فاضية
      setRegion({
        latitude: 30.0444,
        longitude: 31.2357,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setErrorMsg("فشل الاتصال أو البيانات غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg("إذن الموقع مطلوب");
        setLoading(false);
        return;
      }
      getChildLocation();
    })();
  }, [childId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region ? (
        <MapView 
          style={styles.map} 
          region={region} 
          provider={PROVIDER_GOOGLE}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
            <View style={styles.markerContainer}>
               <View style={styles.markerDot} />
            </View>
          </Marker>
        </MapView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: '#BBDEFB' },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD', minHeight: 200 },
  errorText: { color: '#0D47A1', fontWeight: 'bold', textAlign: 'center' },
  markerContainer: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(2, 136, 209, 0.3)', justifyContent: 'center', alignItems: 'center' },
  markerDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#0288D1', borderWidth: 2, borderColor: '#fff' }
});