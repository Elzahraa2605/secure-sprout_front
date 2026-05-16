import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChildSignUp() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(''); // السن بقى متغير هنا
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword || !age) {
      Alert.alert("Error", "Please fill in all fields including Age");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 16) {
      Alert.alert("Error", "Please enter a valid age (0-16)");
      return;
    }

    setLoading(true);
    try {
      const parentToken = await AsyncStorage.getItem('userToken');

      // تحديد النوع بناءً على السن اللي إنتي قولتيه
      // من 0 لـ 2 -> infantChild | أكبر من 2 -> child
      const childType = ageNum <= 2 ? 'infantChild' : 'child';

      const response = await axios.post('http://192.168.1.9:8000/api/parent/childs/store', {
        name: fullName,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        type: 'child', // ببعت النوع المتحدد أتوماتيك
        age: ageNum,    // ببعت السن الحقيقي
        date_of_birth: '2025-01-01'
      }, {
        headers: {
          Authorization: `Bearer ${parentToken}`,
          Accept: 'application/json',
        }
      });

      if (response.status === 200 || response.status === 201) {
        const pairingCode = response.data.pairing_code;
        
        // التوجيه الذكي (Smart Routing)
        // if (childType === 'infantChild') {
        //   Alert.alert("Success", "Infant account created. Redirecting to baby monitor setup...");
        //   router.push({ pathname: '/infantPairing', params: { code: pairingCode } });
        // } else {
        //   Alert.alert("Success", "Child account created. Redirecting to device pairing...");
        //   router.push({ pathname: '/childDevice', params: { code: pairingCode } });
        // }
        if (ageNum <= 2) {
  // توجيه لداشبورد الرضيع
  router.push({ pathname: '/infantRoom', params: { code: response.data.pairing_code } });
       } else {
  // توجيه لداشبورد التحكم العادي
       router.push({ pathname: '/childLogin', params: { code: response.data.pairing_code } });
           }
      }
    } catch (error: any) {
      console.log('Error details:', error.response?.data);
      Alert.alert("Registration Failed", error.response?.data?.message || "Check connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Family Member</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={{fontSize: 50}}>{parseInt(age) <= 2 ? '👶' : '👦'}</Text>
          </View>
        </View>

        {/* حقل الاسم */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Child Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter name" 
            placeholderTextColor="#90CAF9"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* حقل السن - جديد */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age (0 - 16)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. 1 for Baby, 10 for Child" 
            placeholderTextColor="#90CAF9"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          {age !== '' && (
            <Text style={styles.typeTag}>
                Status: {parseInt(age) <= 2 ? 'Infant (Baby Monitor Mode)' : 'Child (Control Mode)'}
            </Text>
          )}
        </View>

        {/* حقل البريد */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="child@safe-step.com" 
            placeholderTextColor="#90CAF9"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* الباسوردات */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput 
              style={styles.input} 
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#90CAF9" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput 
              style={styles.input} 
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#90CAF9" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save and Continue"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: '#03A9F4', fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 30, paddingTop: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#BBDEFB' },
  inputGroup: { width: '100%', marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#0288D1', marginBottom: 8, marginLeft: 5 },
  input: { width: '100%', height: 55, backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 20, fontSize: 14, borderWidth: 1, borderColor: '#BBDEFB', color: '#01579B' },
  passwordWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 20, top: 18 },
  typeTag: { fontSize: 12, color: '#0288D1', marginTop: 5, fontWeight: 'bold', textAlign: 'right' },
  saveBtn: { width: '100%', height: 60, backgroundColor: '#90CAF9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#0D47A1', fontSize: 18, fontWeight: 'bold' }
});