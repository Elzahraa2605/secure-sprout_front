import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header مع زرار الرجوع */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* قسم Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.item} onPress={() => router.push('/editProfile')}>
            <Text style={styles.itemText}>Edit Profile</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={() => router.push('/changePassword')}>
            <Text style={styles.itemText}>Change Password</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* قسم PREFERENCES - ده الجزء اللي طلبتيه */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.item} 
            onPress={() => router.push('/notificationSettings')}
          >
            <View>
              <Text style={styles.itemText}>Push Notifications</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* قسم Support */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.item} onPress={() => router.push('/support')}>
            <Text style={styles.itemText}>Help Center</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={() => router.push('/privacy')}>
            <Text style={styles.itemText}>Privacy Policy</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={() => router.push('/about')}>
            <Text style={styles.itemText}>About App</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* زرار تسجيل الخروج */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b4d2f0' }, // خلفية فاتحة جداً تليق بالصور
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingBottom: 15, elevation: 1 },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 10, marginTop: 15, letterSpacing: 1 },
  section: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  itemText: { fontSize: 16, color: '#334155', fontWeight: '500' },
  arrow: { fontSize: 22, color: '#CBD5E1' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 18 },
  logoutButton: { marginTop: 20, backgroundColor: '#FFF1F2', padding: 16, borderRadius: 16, alignItems: 'center' },
  logoutText: { color: '#E11D48', fontWeight: '700', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#94A3B8', marginTop: 20, fontSize: 12, marginBottom: 30 }
});