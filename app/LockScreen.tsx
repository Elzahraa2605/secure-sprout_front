import React, { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LockScreen() {
  // منع زرار الرجوع في أندرويد عشان الطفل ميهربش من الشاشة
  useEffect(() => {
    const backAction = () => {
      // إرجاع true يعني إحنا بنقول للنظام "إحنا اتصرفنا"، فميعملش Back
      return true; 
    };

    // إضافة المستمع (Listener) وحفظه في متغير
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // تنظيف المستمع باستخدام .remove() عشان الخط الأحمر يختفي تماماً
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      {/* إخفاء شريط الحالة العلوي عشان القفل يبقى كامل */}
      <StatusBar hidden={true} />
      
      <View style={styles.content}>
        <Ionicons name="moon" size={120} color="#fff" />
        <Text style={styles.title}>Downtime Active</Text>
        <Text style={styles.subtitle}>
          It's time to rest your eyes. {"\n"}
          Go and play away from the screen!
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SecureSprout Protection</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    // absoluteFillObject بتخلي الشاشة تغطي الموبايل كله من فوق لتحت
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#1A237E', 
    zIndex: 9999, // عشان تضمن إنها فوق أي حاجة تانية
  },
  content: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginTop: 25,
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 18, 
    color: '#BBDEFB', 
    textAlign: 'center', 
    marginTop: 15,
    lineHeight: 26
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center'
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    letterSpacing: 1.2
  }
});