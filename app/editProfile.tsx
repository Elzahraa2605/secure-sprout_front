import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [parentData, setParentData] = useState({ name: 'Loading...', image: null });
  const [loading, setLoading] = useState(true);

  // التأكد من أن الأساس هو مسار الأب
  const API_BASE_URL = 'http://192.168.1.9:8000/api/parent';

  // 1. جلب بيانات البروفايل
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.get(`${API_BASE_URL}/manage-children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      const finalData = response.data.data || response.data;
      setChildren(Array.isArray(finalData) ? finalData : (finalData.children || []));

      if (response.data.parent) {
        setParentData({
          name: response.data.parent.name,
          image: response.data.parent.profile_image
        });
      } else {
        const storedName = await AsyncStorage.getItem('parentName');
        setParentData(prev => ({ ...prev, name: storedName || 'Parent Account' }));
      }

    } catch (error) {
      console.log("❌ Error fetching data:", error.message);
      if (error.response?.status === 401) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

  // 2. دالة اختيار الصورة
  const pickImage = async (childId = null) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      if (!childId) {
        setParentData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
      Alert.alert("Success", "Image selected successfully!");
    }
  };

  // 3. دالة حذف مجموعة العائلة (الميزة الجديدة)
  const handleDeleteFamilyGroup = async () => {
    Alert.alert(
      "⚠️ Delete Family Group",
      "This will permanently delete all children and their photos, but your account will remain. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Group",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              // المسار المعتمد في الباك إند: parent/profile/delete-family-group
              await axios.delete(`${API_BASE_URL}/profile/delete-family-group`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                }
              });
              Alert.alert("Success", "Family group has been deleted.");
              fetchProfileData(); // تحديث الواجهة
            } catch (error) {
              console.log("Delete Group Error:", error.response?.data);
              Alert.alert("Error", "Could not delete family group.");
            }
          }
        }
      ]
    );
  };

  // 4. دالة حذف الحساب نهائياً
  const handleDeleteAccount = async () => {
    Alert.alert("⚠️ Delete Account", "This will permanently delete your account and all children data. Proceed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Forever",
        style: "destructive",
        onPress: async () => {
          // هنا يفضل استدعاء API الحذف إذا كان متاحاً
          await AsyncStorage.clear();
          router.replace('/userType');
        }
      }
    ]);
  };

  // 5. دالة تسجيل الخروج
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userType');
          router.replace('/userType');
        }
      }
    ]);
  };

  const handleDeleteChild = (id, name) => {
    Alert.alert("⚠️ Delete Child", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(`${API_BASE_URL}/manage-children/destroy/${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchProfileData();
          } catch (error) {
            Alert.alert("Error", "Failed to delete child.");
          }
        }
      }
    ]);
  };

  const renderChildItem = ({ item }) => (
    <View style={styles.childCard}>
      <View style={styles.childInfo}>
        <TouchableOpacity style={styles.childIconBg} onPress={() => pickImage(item.id)}>
          {item.profile_image || item.image ? (
            <Image source={{ uri: item.profile_image || item.image }} style={styles.avatarImgSmall} />
          ) : (
            <MaterialCommunityIcons name="face-man-shimmer" size={24} color="#01579B" />
          )}
        </TouchableOpacity>
        <Text style={styles.childName}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteChild(item.id, item.name)}>
        <View style={styles.deleteIconBg}>
          <Ionicons name="trash-outline" size={20} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/addChild')}>
          <MaterialCommunityIcons name="account-plus" size={28} color="#01579B" />
        </TouchableOpacity>
      </View>

      <View style={styles.parentSection}>
        <TouchableOpacity style={styles.parentAvatar} onPress={() => pickImage()}>
          {parentData.image ? (
            <Image source={{ uri: parentData.image }} style={styles.avatarImg} />
          ) : (
            <MaterialCommunityIcons name="face-man" size={50} color="#01579B" />
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={14} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.parentNameText}>{parentData.name}</Text>
      </View>

      <Text style={styles.sectionTitle}>Children Group</Text>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0288D1" />
        </View>
      ) : (
        <FlatList
          data={children}
          renderItem={renderChildItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No children added yet.</Text>}
          ListFooterComponent={() => (
            <View style={{ marginTop: 10 }}>
              
              {/* زر حذف مجموعة العائلة - تمت الإضافة هنا */}
              <TouchableOpacity style={styles.childCard} onPress={handleDeleteFamilyGroup}>
                <Text style={styles.dangerText}>Delete Family Group</Text>
                <View style={[styles.deleteIconBg, { backgroundColor: '#EF6C00' }]}>
                  <MaterialCommunityIcons name="account-group-remove" size={20} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.childCard} onPress={handleDeleteAccount}>
                <Text style={styles.dangerText}>Delete My Account</Text>
                <View style={styles.deleteIconBg}>
                  <Ionicons name="trash-outline" size={20} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.childCard, { backgroundColor: '#0288D1' }]} onPress={handleLogout}>
                <Text style={[styles.dangerText, { color: 'white' }]}>Logout</Text>
                <View style={[styles.deleteIconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name="log-out-outline" size={20} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#01579B' },
  parentSection: { alignItems: 'center', marginVertical: 20 },
  parentAvatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#BBDEFB', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
  avatarImgSmall: { width: 45, height: 45, borderRadius: 10 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0288D1', padding: 4, borderRadius: 12, borderWidth: 2, borderColor: 'white' },
  parentNameText: { fontSize: 20, fontWeight: 'bold', color: '#01579B', marginTop: 10 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#01579B', marginBottom: 15 },
  childCard: { flexDirection: 'row', backgroundColor: '#BBDEFB', padding: 15, borderRadius: 20, alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, elevation: 2 },
  childInfo: { flexDirection: 'row', alignItems: 'center' },
  childIconBg: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
  childName: { fontSize: 18, color: '#01579B', fontWeight: 'bold' },
  deleteIconBg: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 10 },
  dangerText: { fontSize: 18, fontWeight: 'bold', color: '#C62828' },
  emptyText: { textAlign: 'center', color: '#01579B', marginTop: 20, fontSize: 16, opacity: 0.7 }
});