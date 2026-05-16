import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapScreen() {
  const router = useRouter();
  const { childId, name } = useLocalSearchParams(); // استقبال البيانات من الداشبورد
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({
    latitude: 30.0444,
    longitude: 31.2357,
    address: "Fetching location...",
  });

  const fetchLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/parentLogin');
        return;
      }

      // استخدمت نفس الـ IP اللي شغال في الداشبورد (1.9) ونفس الـ ID (اللي هو 8)
      const response = await axios.get(`http://192.168.1.9:8000/api/parent/locations/show/${childId || 8}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // تصحيح قراءة الداتا بناءً على الـ LOG اللي بعتيه
      const locData = response.data.data?.locations?.[0]; 
      
      if (locData) {
        setLocation({
          latitude: parseFloat(locData.latitude),
          longitude: parseFloat(locData.longitude),
          address: locData.address || "Location found",
        });
      }
    } catch (error: any) {
      console.error("📍 Full Map Error:", error.message);
      // لو جاب Network Error هنا، تأكدي إن الموبايل والسيرفر على نفس الواي فاي
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, [childId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live Location</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0288D1" />
          <Text style={{marginTop: 10}}>Connecting to satellite...</Text>
        </View>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{ // استخدمنا region بدل initialRegion عشان يركز على الطفل أول ما يفتح
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title={`${name || 'Soso'} is here`}
            description={location.address}
          />
        </MapView>
      )}

      <View style={styles.detailCard}>
        <Text style={styles.childName}>Child: {name || 'Soso'}</Text>
        <Text style={styles.address}>📍 {location.address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingBottom: 15, 
    elevation: 5, 
    zIndex: 10 
  },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#01579B' },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  detailCard: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20, 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 25, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  childName: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1', marginBottom: 5 },
  address: { fontSize: 14, color: '#546E7A' }
});