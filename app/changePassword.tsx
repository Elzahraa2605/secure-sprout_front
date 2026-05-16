import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChangePassword() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
      </View>

      <View style={styles.content}>
        <TextInput style={styles.input} placeholder="Current Password" secureTextEntry={true} />
        <TextInput style={styles.input} placeholder="New Password" secureTextEntry={true} />
        <TextInput style={styles.input} placeholder="Confirm New Password" secureTextEntry={true} />

        <TouchableOpacity style={styles.updateButton} onPress={() => router.back()}>
          <Text style={styles.updateButtonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 25 },
  input: { backgroundColor: '#F5F7FA', padding: 15, borderRadius: 12, marginBottom: 15 },
  updateButton: { backgroundColor: '#0288D1', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  updateButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});