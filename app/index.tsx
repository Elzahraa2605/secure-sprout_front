import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // الفنكشن دي بتشتغل بس لما المستخدم يدوس على الزرار
  const handleGetStarted = async () => {
    try {
      // ⚠️ السطر ده سحري، ضيفيه دلوقتي عشان يصفر الموبايل تماماً
    await AsyncStorage.clear(); 
    console.log("⚠️ Storage Cleared Successfully!");
      // بنشوف هل فيه توكن ودور (Role) متخزنين ولا لأ
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      if (token && role) {
        // لو البيانات موجودة، بنوجهه لصفحته بناءً على نوعه
        if (role === 'parent') {
          router.replace('/nextStep');
        } else if (role === 'child') {
          router.replace('/welcomeChild');
        }
      } else {
        // لو مفيش بيانات (أول مرة يفتح الأبلكيشن)، بنوديه لصفحة اختيار النوع
        router.push('/userType'); 
      }
    } catch (error) {
      console.log("Error checking login status:", error);
      // في حالة حدوث خطأ، بنوديه لصفحة البداية كأمان
      router.push('/userType');
    }
  };

  return (
    <View style={styles.container}>
      {/* اسم التطبيق في الأعلى */}
      <View style={styles.header}>
        <Text style={styles.brandText}>🛡️ Secure Sprout</Text>
      </View>

      {/* الكارت اللي فيه الصورة */}
      <View style={styles.imageCard}>
        <Image 
          source={require('../assets/o3.jpg')} 
          style={styles.mainImage}
          resizeMode="cover"
        />
      </View>

      {/* النص التعريفي والزرار */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Protecting Your Child...{"\n"}Safety For Your Entire Family.
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // لون الخلفية اللبني الهادي
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  header: { 
    marginTop: 20 
  },
  brandText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1565C0' 
  },
  imageCard: {
    width: width * 0.85,
    height: 320,
    backgroundColor: '#fff',
    borderRadius: 30,
    elevation: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  mainImage: { 
    width: '100%', 
    height: '100%' 
  },
  content: { 
    alignItems: 'center', 
    paddingHorizontal: 30 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    textAlign: 'center', 
    color: '#0D47A1', 
    lineHeight: 32, 
    marginBottom: 30 
  },
  button: { 
    backgroundColor: '#4FC3F7', 
    paddingVertical: 16, 
    paddingHorizontal: 60, 
    borderRadius: 30, 
    width: width * 0.7, 
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});