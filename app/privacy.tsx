import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.textH}>1. Data Collection</Text>
        <Text style={styles.textP}>We collect location data to provide parental control features. This data is encrypted and never shared with third parties.</Text>
        <Text style={styles.textH}>2. Child Safety</Text>
        <Text style={styles.textP}>Our app is designed to protect children. All monitoring is done with parental consent.</Text>
        <Text style={styles.textH}>3. Security</Text>
        <Text style={styles.textP}>We use industry-standard encryption to keep your family data safe.</Text>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  textH: { fontSize: 18, fontWeight: 'bold', marginTop: 20, color: '#37474F' },
  textP: { fontSize: 15, color: '#607D8B', marginTop: 10, lineHeight: 22 }
});