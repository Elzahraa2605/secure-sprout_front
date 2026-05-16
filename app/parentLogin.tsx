import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ParentLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 Attempting to login with:", email);
      
      const response = await fetch('http://192.168.1.9:8000/api/parent/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // مهم جداً لضمان رد السيرفر بـ JSON
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login Successful:', data);
        
        // التوكن جاي في الداتا باسم access_token بناءً على اللوج السابق
        if (data.access_token) {
          // 1. تخزين التوكن لاستخدامه في صفحة البروفايل
          await AsyncStorage.setItem('userToken', data.access_token);
          
          // 2. تخزين دور المستخدم
          await AsyncStorage.setItem('userRole', 'parent');
          
          // 3. تخزين بيانات المستخدم الإضافية (اختياري - لو حابة تعرضي الاسم)
          if (data.user) {
            await AsyncStorage.setItem('parentData', JSON.stringify(data.user));
          }

          console.log('💾 Token Saved Successfully');
          
          // التوجه للخطوة التالية (تأكدي من صحة المسار /nextStep أو /ProfileScreen)
          router.replace('/nextStep'); 
        } else {
          alert("Login success but no token received");
        }
      } else {
        console.log('⚠️ Login Failed:', data.message);
        alert(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error('❌ Connection failed:', error);
      alert("Network error, please check your server connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.container}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#01579B" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={60} color="#0288D1" style={{ marginBottom: 10 }} />
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to your parent account</Text>
          </View>

          <View style={styles.form}>
            {/* Input Email */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#90A4AE" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Email Address" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#90A4AE"
                autoCapitalize="none"
              />
            </View>

            {/* Input Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#90A4AE" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Password" 
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} 
                placeholderTextColor="#90A4AE"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#90A4AE" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.forgotPass}
              onPress={() => router.push('/forgotPassword')}
              activeOpacity={0.6}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && { backgroundColor: '#B0BEC5' }]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/parentSignUp')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', padding: 25, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 1 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#0D47A1' },
  subtitle: { fontSize: 15, color: '#546E7A', marginTop: 5 },
  form: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, height: 60, elevation: 2 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#37474F' },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { color: '#0288D1', fontWeight: '600' },
  loginButton: { backgroundColor: '#0288D1', height: 55, borderRadius: 15, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#546E7A', fontSize: 14 },
  signUpText: { color: '#0D47A1', fontWeight: 'bold', fontSize: 14 },
});