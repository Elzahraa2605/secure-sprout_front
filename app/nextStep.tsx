import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NextStepScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* زر الرجوع */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#0288D1" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>What would you like to do next?</Text>

        {/* الكارت الأول: Go to Dashboard */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/parentDashboard')}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="view-dashboard" size={35} color="#0288D1" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Go to Dashboard</Text>
            <Text style={styles.cardSub}>View family activity and manage settings.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#0288D1" />
        </TouchableOpacity>

        {/* الكارت الثاني: Connect to Child Device */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/childDevice')} // أو الصفحة اللي بتعمل كونكت
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="cellphone-link" size={35} color="#0288D1" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Connect to Child Device</Text>
            <Text style={styles.cardSub}>Set up and pair a new phone or tablet.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#0288D1" />
        </TouchableOpacity>

        {/* رابط المساعدة في الأسفل */}
        <TouchableOpacity style={styles.needHelp}>
          <Text style={styles.needHelpText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  backButton: { padding: 20, paddingTop: 30 },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 40 },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#01579B', 
    lineHeight: 38, 
    marginBottom: 50,
    width: '80%' 
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#BBDEFB', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 20,
    // ظل خفيف عشان الكارت يبرز
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: { marginRight: 15 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#01579B' },
  cardSub: { fontSize: 13, color: '#4FC3F7', marginTop: 4 },
  needHelp: { 
    position: 'absolute', 
    bottom: 40, 
    alignSelf: 'center' 
  },
  needHelpText: { color: '#03A9F4', fontSize: 16, fontWeight: '500' }
});