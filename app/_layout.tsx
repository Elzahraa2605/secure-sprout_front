import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { useEffect } from 'react';

// اسم المهمة لازم يكون موحد
const BACKGROUND_TASK_NAME = 'baby-monitor-cry-check';
// استبدلي الـ IP بـ عنوان السيرفر بتاعك (Laravel)
const API_URL = "http://192.168.1.9:8000/api"; 

// تعريف المهمة (خارج الكومبوننت)
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const res = await fetch(`${API_URL}/light-status`);
    const data = await res.json();
    // لو الطفل بيبكي والجهاز متصل، نبعت إشعار
    if (data.is_crying && data.is_online) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "👶 تنبيه SecureSprout",
          body: "طفلك يبكي الآن، يرجى التحقق من الكاميرا!",
          sound: true,
        },
        trigger: null,
      });
    }
  } catch (err) {
    console.error("Background Task Error:", err);
  }
});

export default function Layout() {
  useEffect(() => {
    const registerTasks = async () => {
      // طلب إذن الإشعارات
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
        if (!isRegistered) {
          await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
            minimumInterval: 15, // يفحص كل 15 ثانية في الخلفية
          });
        }
      }
    };
    registerTasks();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}> 
      <Stack.Screen name="index" />
      <Stack.Screen name="userType" /> 
      <Stack.Screen name="welcomeChild" />
      <Stack.Screen name="downloadFolders" />
      {/* تعريف صفحة الهاردوير الجديدة */}
      <Stack.Screen name="monitor" options={{ title: 'شاشة المراقبة' }} /> 
    </Stack>
  );
}