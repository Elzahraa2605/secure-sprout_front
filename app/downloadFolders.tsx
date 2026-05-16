import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. لازم نستورد الـ useRouter
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DownloadsChecker() {
  const router = useRouter(); // 2. بنعرف الـ router جوه الفنكشن

  // بيانات تجريبية للملفات
  const downloadedFiles = [
    { id: '1', name: 'mp3.114', size: '4.2 MB', status: 'secure' },
    { id: '2', name: 'Report_2024.pdf', size: '10.2 MB', status: 'secure' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* 3. ضفنا الـ onPress هنا عشان السهم يشتغل */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downloads checker</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#C8E6C9' }]}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>2</Text>
            <Text style={[styles.statLabel, { color: '#4CAF50' }]}>Safe</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#BBDEFB' }]}>
            <Text style={[styles.statNumber, { color: '#2196F3' }]}>2</Text>
            <Text style={[styles.statLabel, { color: '#2196F3' }]}>Total</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFCDD2' }]}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>0</Text>
            <Text style={[styles.statLabel, { color: '#F44336' }]}>Malicious</Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Downloaded Files</Text>
          <View style={styles.updatedBadge}>
            <Text style={styles.updatedText}>Updated Now</Text>
          </View>
        </View>

        {/* Files List */}
        {downloadedFiles.map((file) => (
          <View key={file.id} style={styles.fileCard}>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{file.name}</Text>
              <View style={styles.fileSubInfo}>
                <View style={styles.secureBadge}>
                  <Text style={styles.secureText}>{file.status}</Text>
                </View>
                <Text style={styles.fileSize}>MB {file.size.split(' ')[0]}</Text>
              </View>
            </View>
            <Ionicons name="checkmark-shield" size={24} color="#0D47A1" />
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomTab}>
        {/* زرار المتصفح - ممكن تربطيه بصفحة الـ Browser لو موجودة */}
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/browser')}>
          <View style={[styles.tabIconContainer, { backgroundColor: '#BBDEFB' }]}>
            <Ionicons name="globe-outline" size={24} color="#01579B" />
          </View>
          <Text style={styles.tabText}>Browser</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <View style={[styles.tabIconContainer, { backgroundColor: '#90CAF9' }]}>
            <Ionicons name="download-outline" size={24} color="#01579B" />
          </View>
          <Text style={[styles.tabText, { fontWeight: 'bold' }]}>Downloads</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#01579B' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  statCard: {
    width: '30%',
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: { fontSize: 26, fontWeight: 'bold' },
  statLabel: { fontSize: 16, fontWeight: '600', marginTop: 5 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#01579B' },
  updatedBadge: {
    backgroundColor: '#BBDEFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  updatedText: { fontSize: 10, color: '#0288D1' },

  fileCard: {
    backgroundColor: '#BBDEFB',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 18, fontWeight: 'bold', color: '#01579B' },
  fileSubInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  secureBadge: {
    backgroundColor: '#90CAF9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  secureText: { fontSize: 12, color: '#01579B' },
  fileSize: { fontSize: 12, color: '#90A4AE' },

  bottomTab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // خليته أفتح شوية عشان يبان
    borderRadius: 40,
    padding: 10,
    width: '70%',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  tabItem: { alignItems: 'center' },
  tabIconContainer: {
    width: 50,
    height: 35,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabText: { fontSize: 10, color: '#01579B' },
});