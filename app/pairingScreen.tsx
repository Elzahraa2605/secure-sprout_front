import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PairingScreen() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']); 
  const inputs = useRef<TextInput[]>([]);

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.toUpperCase(); 
    setCode(newCode);

    if (text !== '' && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleConfirmPairing = async () => {
    const fullCode = code.join(''); 
    
    if (fullCode.length < 6) {
      Alert.alert("Error", "Please enter the full 6-digit code.");
      return;
    }

    try {
      // 1. نجيب التوكن اللي اتخزن وقت الـ Login بتاع الطفل
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.post('http://192.168.1.9:8000/api/child/pairing', {
        code: fullCode, 
      }, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
      });

      // if (response.data.success) {
      //   // --- التعديل السحري هنا ---
      //   // 2. بنخزن علامة (Flag) إن الجهاز ده خلاص تم ربطه بنجاح
      //   await AsyncStorage.setItem('isPaired', 'true'); 
        
      //   Alert.alert("Success", "Device linked successfully!");
        
      //   // 3. نستخدم replace عشان نمسح صفحة الكود من الـ History وما يرجعش لها بالـ Back
      //   router.replace('/welcomeChild'); 
      // }
      if (response.data.success) {
        // 1. تخزين الـ Role عشان الـ index يعرف إن ده طفل
        await AsyncStorage.setItem('userRole', 'child'); 
        
        // 2. تخزين علامة إن الربط تم (اختياري بس مفيد)
        await AsyncStorage.setItem('isPaired', 'true'); 
        
        Alert.alert("Success", "Device linked successfully!");
        
        // 3. التوجه لصفحة الطفل
        router.replace('/welcomeChild'); 
      }
    } catch (error: any) {
      console.log("Error Response:", error.response?.data);
      const errorMessage = error.response?.data?.message || "Invalid pairing code.";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.headerTitle}>Active Parental{"\n"}Supervision</Text>
        
        <Text style={styles.subtitle}>
          Enter the 6-digit code from parent's device
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.codeInput}
              maxLength={1}
              keyboardType="default" 
              autoCapitalize="characters"
              onChangeText={(text) => handleInput(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit}
              ref={(ref) => (inputs.current[index] = ref as any)}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmPairing}
        >
          <Text style={styles.confirmButtonText}>Confirm Pairing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.needHelpButton}>
          <Text style={styles.needHelpText}>Need Help?</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0277BD', textAlign: 'center', marginBottom: 20, lineHeight: 35 },
  subtitle: { fontSize: 16, color: '#90CAF9', textAlign: 'center', marginBottom: 40, paddingHorizontal: 30 },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 50 },
  codeInput: { width: 45, height: 55, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#0288D1', borderRadius: 8, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#0277BD' },
  confirmButton: { backgroundColor: '#90CAF9', width: '100%', height: 55, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  confirmButtonText: { color: '#0277BD', fontSize: 18, fontWeight: '600' },
  needHelpButton: { marginTop: 20 },
  needHelpText: { color: '#0288D1', fontSize: 16, fontWeight: '500' },
});