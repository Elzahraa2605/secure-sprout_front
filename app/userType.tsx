import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function UserTypeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // حالة عشان نمنع الـ Unmatched Route

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const userType = await AsyncStorage.getItem('userType');

        if (userToken) {
          // لو فيه توكن، بنحاول نوجه المستخدم للمكان الصح
          if (userType === 'parent') {
            router.replace('/parentDashboard');
            return; // نوقف التنفيذ هنا
          } else if (userType === 'child') {
            try {
              const response = await axios.get('http://192.168.1.9:8000/api/child/me', {
                headers: { 'Authorization': `Bearer ${userToken}` }
              });

              if (response.data.child.is_active == 1) {
                await AsyncStorage.setItem('isPaired', 'true');
                router.replace('/welcomeChild');
              } else {
                router.replace('/pairingScreen'); // تأكدي من اسم الملف عندك
              }
              return;
            } catch (apiError) {
              router.replace('/childLogin');
              return;
            }
          }
        }
        // لو مفيش توكن أو خلصنا الفحص، بنظهر الزراير عادي
        setIsLoading(false);
      } catch (e) {
        console.log("Error checking status", e);
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  // لو لسه بيفحص الـ Storage، بنعرض شاشة تحميل بدل ما يظهر Unmatched
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0D47A1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>Who are you?</Text>
      
      <View style={styles.buttonContainer}>
        {/* Parent Button */}
        <TouchableOpacity 
          style={styles.cardButton} 
          onPress={() => router.push('/parentLogin')}
        >
          <Text style={styles.buttonText}>Parent</Text>
        </TouchableOpacity>

        {/* Child Button */}
        <TouchableOpacity 
          style={[styles.cardButton, { backgroundColor: '#B3E5FC' }]} 
          onPress={() => router.push('/childLogin')}
        >
          <Text style={styles.buttonText}>Child</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E3F2FD', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  questionText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#0D47A1', 
    marginBottom: 50 
  },
  buttonContainer: { 
    width: '100%', 
    alignItems: 'center', 
    gap: 20 
  },
  cardButton: { 
    width: width * 0.8, 
    height: 150, 
    backgroundColor: '#fff', 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: { 
    fontSize: 30, 
    fontWeight: '900', 
    color: '#01579B' 
  },
});