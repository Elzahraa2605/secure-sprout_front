import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AddChild() {
  const router = useRouter();
  
  // رقم عشوائي كأنه كود الربط
  const pairCode = "582 941";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New Child</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.stepCircle}>
          <Text style={styles.stepText}>Step 1</Text>
        </View>
        
        <Text style={styles.instruction}>
          Install **Secure Sprout** on your child's phone and select "Child" mode.
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Your Pairing Code</Text>
          <Text style={styles.codeNumber}>{pairCode}</Text>
          <Text style={styles.codeExpiry}>This code expires in 10 minutes</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ⚠️ Keep this screen open until your child enters the code on their device.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.doneButton} 
          onPress={() => router.replace('/parentDashboard')}
        >
          <Text style={styles.doneButtonText}>I'm Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  stepCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E1F5FE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  stepText: { color: '#0288D1', fontWeight: 'bold' },
  instruction: { fontSize: 18, textAlign: 'center', color: '#37474F', marginBottom: 40, lineHeight: 26 },
  codeContainer: { backgroundColor: '#F5F7FA', width: '100%', padding: 30, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: '#0288D1', borderStyle: 'dashed' },
  codeLabel: { fontSize: 14, color: '#78909C', marginBottom: 10, textTransform: 'uppercase' },
  codeNumber: { fontSize: 42, fontWeight: 'bold', color: '#0288D1', letterSpacing: 5 },
  codeExpiry: { fontSize: 12, color: '#90A4AE', marginTop: 10 },
  infoBox: { marginTop: 30, padding: 15, backgroundColor: '#FFF9C4', borderRadius: 12 },
  infoText: { fontSize: 14, color: '#F57F17', textAlign: 'center' },
  doneButton: { marginTop: 40, backgroundColor: '#0288D1', width: '100%', padding: 18, borderRadius: 15, alignItems: 'center' },
  doneButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});