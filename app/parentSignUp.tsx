import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 1. استيراد axios
import axios from 'axios';

export default function ParentSignUp() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // 2. حالة للتحميل عشان الـ User يعرف إن فيه حاجة بتحصل
  const [loading, setLoading] = useState(false);

  // 3. الدالة الذكية الجديدة (بتكلم الـ Laravel)
  const handleSignUp = async () => {
    // تحقق محلي بسيط
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("خطأ", "من فضلك املئي جميع الخانات");
      return;
    } 
    
    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمة المرور غير متطابقة");
      return;
    }

    setLoading(true); // ابدأ التحميل

    try {
      // 4. إرسال البيانات للـ Laravel
      const response = await axios.post('http://192.168.1.9:8000/api/parent/register', {
        name: fullName,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
      });

      // 5. لو الـ Laravel رد بـ نجاح (Status 200 أو 201)
      if (response.status === 200 || response.status === 201) {
        Alert.alert("نجاح", "تم إنشاء الحساب بنجاح!");
        router.push('/parentLogin'); // نقليه للداشبورد
      }
    } catch (error) {
      // 6. لو حصل خطأ (مثلاً الإيميل موجود قبل كدة)
      console.error(error);
      Alert.alert("خطأ", error.response?.data?.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false); // وقف التحميل
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ... نفس كود الـ UI ... */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start protecting your family today</Text>
      </View>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Full Name" 
          placeholderTextColor="#90A4AE" 
          onChangeText={(text) => setFullName(text)}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Email Address" 
          keyboardType="email-address" 
          placeholderTextColor="#90A4AE" 
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          secureTextEntry={true} 
          placeholderTextColor="#90A4AE" 
          onChangeText={(text) => setPassword(text)}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Confirm Password" 
          secureTextEntry={true} 
          placeholderTextColor="#90A4AE" 
          onChangeText={(text) => setConfirmPassword(text)}
        />

        {/* 7. زرار التسجيل بيتحول لـ loading لما يضغط */}
        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading} // تعطيل الزرار أثناء التحميل
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/parentLogin')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ... نفس الـ Styles ...
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E3F2FD',
    padding: 25,
    justifyContent: 'center',
  },
  backButton: { marginBottom: 20 },
  backText: { color: '#01579B', fontSize: 16, fontWeight: '600' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#0D47A1' },
  subtitle: { fontSize: 16, color: '#546E7A', marginTop: 5 },
  form: { width: '100%' },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  signUpButton: {
    backgroundColor: '#0288D1',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#546E7A' },
  loginLink: { color: '#0D47A1', fontWeight: 'bold' },
});