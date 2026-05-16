import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. ضفنا الـ router
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const TeenProfile = () => { // شيلنا الـ navigation من هنا
  const router = useRouter(); // 2. عرفنا الـ router جوه الكومبوننت

  return (
    <ScrollView style={styles.container}>
      {/* Header - الجزء العلوي */}
      <View style={styles.header}>
        {/* 3. التعديل هنا: خليناها router.back() عشان ترجع صح */}
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>'TeenName' Profile</Text>
      </View>

      {/* Profile Icon Section */}
      <View style={styles.profileSection}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="account-search-outline" size={48} color="#0288D1" />
        </View>
        <Text style={styles.deviceModel}>device-model</Text>
        
        <TouchableOpacity style={styles.reportsBtn}  onPress={() => router.push('/Reborts')}>
          <MaterialCommunityIcons name="file-chart" size={24} color="#0288D1" />
          <Text style={styles.reportsText}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Map Section */}
      <View style={styles.mapCard}>
        <View style={styles.mapPlaceholder}>
           <Text style={{color: '#888'}}>Map View - GPS Tracking</Text>
        </View>
        <View style={styles.mapInfo}>
          <Text style={styles.locationTitle}>"Teen Location"</Text>
          <Text style={styles.lastUpdated}>Last updated: 2 mins ago</Text>
          <Text style={styles.preciseText}>Precise location sharing is on</Text>
        </View>
      </View>

      {/* Alerts Section */}
      <Text style={styles.sectionTitle}>Alerts & Activity</Text>

      {/* Alert 1 */}
      <View style={styles.alertCard}>
        <MaterialCommunityIcons name="alert" size={30} color="#FFD600" style={styles.alertIcon} />
        <View>
          <Text style={styles.alertTitle}>New Content Alert</Text>
          <Text style={styles.alertSub}>A new app was installed on 'teen name' phone.</Text>
        </View>
      </View>

      {/* Alert 2 */}
      <View style={styles.alertCard}>
        <MaterialCommunityIcons name="file-lock" size={30} color="#FFD600" style={styles.alertIcon} />
        <View>
          <Text style={styles.alertTitle}>Threat Blocked</Text>
          <Text style={styles.alertSub}>1 File blocked from downloading</Text>
        </View>
      </View>

      <View style={{height: 50}} /> 
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E1F5FE' },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingTop: 50, paddingHorizontal: 20, marginBottom: 10 
  },
  headerTitle: { 
    flex: 1, textAlign: 'center',
    fontSize: 20, 
    fontWeight: 'bold', color: '#01579B', marginRight: 25
  },
  profileSection: { alignItems: 'center', marginBottom: 15 },
  iconCircle: { 
    width: 90, height: 90, borderRadius: 45, // ظبطت الـ height والـ width عشان تكون دايرة بالظبط
    backgroundColor: '#B3E5FC', justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2, borderColor: '#0288D1' // عدلت borderWeight لـ borderWidth
  },
  deviceModel: { color: '#0288D1', marginTop: 10, fontSize: 12 },
  reportsBtn: { 
    flexDirection: 'row', backgroundColor: '#B3E5FC', 
    paddingVertical: 10, paddingHorizontal: 40, 
    borderRadius: 10, marginTop: 15, alignItems: 'center' 
  },
  reportsText: { color: '#01579B', fontWeight: 'bold', marginLeft: 10, fontSize: 18 },
  mapCard: { 
    marginHorizontal: 20, borderRadius: 20, 
    backgroundColor: '#B3E5FC', overflow: 'hidden', elevation: 2 
  },
  mapPlaceholder: { height: 180, backgroundColor: '#d1eefc', justifyContent: 'center', alignItems: 'center' },
  mapInfo: { padding: 15 },
  locationTitle: { fontSize: 22, fontWeight: 'bold', color: '#01579B' },
  lastUpdated: { color: '#0288D1', fontSize: 14 },
  preciseText: { color: '#0288D1', fontSize: 12, marginTop: 5 },
  sectionTitle: { 
    fontSize: 22, fontWeight: 'bold', color: '#01579B', 
    marginHorizontal: 20, marginVertical: 15 
  },
  alertCard: { 
    backgroundColor: '#6D4C00', 
    marginHorizontal: 20, marginBottom: 15, 
    borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' 
  },
  alertIcon: { marginRight: 15 },
  alertTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  alertSub: { color: '#E0E0E0', fontSize: 14, marginTop: 5, width: width * 0.6 },
});

export default TeenProfile;