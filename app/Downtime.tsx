import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const API_BASE_URL = 'http://192.168.1.9:8000/api/parent';

export default function DowntimeScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams(); 

  // --- 1. الـ States الأساسية ---
  const [isEnabled, setIsEnabled] = useState(true);
  const [applyToAll, setApplyToAll] = useState(true);
  const [blockDowntime, setBlockDowntime] = useState(true);
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [loading, setLoading] = useState(false);
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<number[]>([]);

  // --- 2. لوجيك الوقت ---
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'from' | 'to'>('from');

  // جلب قائمة الأطفال عند فتح الصفحة
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${API_BASE_URL}/childs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // التعامل مع شكل الداتا الراجع من السيرفر
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setChildrenList(data);
      
      // لو جاي من الداشبورد لطفل معين، نحدده تلقائياً في القائمة
      if (childId) {
        setSelectedChildrenIds([Number(childId)]);
        setApplyToAll(false);
      }
    } catch (e) {
      console.log("Error fetching children list");
    }
  };

  const formatToBackendTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  // --- 3. لوجيك اختيار الأطفال ---
  const toggleChildSelection = (id: number) => {
    if (selectedChildrenIds.includes(id)) {
      setSelectedChildrenIds(selectedChildrenIds.filter(item => item !== id));
    } else {
      setSelectedChildrenIds([...selectedChildrenIds, id]);
    }
  };

  // --- 4. حفظ التغييرات ---
  const handleSaveChanges = async () => {
    const targetIds = applyToAll ? childrenList.map(c => c.id) : selectedChildrenIds;

    if (targetIds.length === 0) {
      Alert.alert("تنبيه", "يرجى اختيار طفل واحد على الأقل لتطبيق الإعدادات.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const commonPayload = {
        name: "Downtime Schedule",
        start_time: formatToBackendTime(fromDate),
        end_time: formatToBackendTime(toDate),
        days: selectedDays, 
        block_all: blockDowntime ? 1 : 0,
        is_enabled: isEnabled ? 1 : 0
      };

      // تنفيذ الطلب لكل طفل مختار
      await Promise.all(targetIds.map(id => {
        const childObj = childrenList.find(c => c.id === id);
        return axios.post(`${API_BASE_URL}/downtimes/store`, 
          { 
            ...commonPayload, 
            child_id: id,
            rule_id: childObj?.rules?.id || id 
          }, 
          { headers }
        );
      }));

      Alert.alert("Success ✅", "Downtime settings saved for selected children!");
      router.back();
    } catch (error: any) {
      Alert.alert("Error ❌", error.response?.data?.message || "Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false); 
    if (selectedDate) {
      if (pickerMode === 'from') setFromDate(selectedDate);
      else setToDate(selectedDate);
    }
  };

  const toggleDay = (index: number) => {
    if (selectedDays.includes(index)) setSelectedDays(selectedDays.filter(i => i !== index));
    else setSelectedDays([...selectedDays, index]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downtime</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* كارت الجدول الزمني */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconTitle}>
              <Ionicons name="moon" size={24} color="#0288D1" />
              <Text style={styles.cardTitle}>Schedule</Text>
            </View>
            <Switch value={isEnabled} onValueChange={setIsEnabled} trackColor={{ true: '#0288D1' }} />
          </View>
          <Text style={styles.cardSubText}>Set a schedule to restrict device access during certain time...</Text>
          
          <View style={[styles.timeRow, !isEnabled && { opacity: 0.5 }]}>
            <TouchableOpacity onPress={() => isEnabled && (setPickerMode('from'), setShowPicker(true))}>
              <Text style={styles.timeLabel}>From</Text>
              <Text style={styles.timeValue}>{fromDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
            </TouchableOpacity>
            <View style={styles.timeDivider} />
            <TouchableOpacity onPress={() => isEnabled && (setPickerMode('to'), setShowPicker(true))}>
              <Text style={styles.timeLabel}>To</Text>
              <Text style={styles.timeValue}>{toDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* كارت اختيار الأيام */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Days</Text>
          <View style={styles.daysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <TouchableOpacity key={index} onPress={() => toggleDay(index)} style={[styles.dayCircle, selectedDays.includes(index) && styles.activeDay]}>
                <Text style={[styles.dayText, selectedDays.includes(index) && styles.activeDayText]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* كارت تطبيق الإعدادات (Apply to) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apply to</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>All Children</Text>
            <Switch 
              value={applyToAll} 
              onValueChange={(val) => {
                setApplyToAll(val);
                if (val) setSelectedChildrenIds([]); 
              }} 
              trackColor={{ true: '#0288D1' }} 
            />
          </View>

          {/* قائمة الأطفال تظهر فقط عند إغلاق "All Children" */}
          {!applyToAll && (
            <View style={styles.childListContainer}>
              <View style={styles.divider} />
              {childrenList.map((child) => (
                <TouchableOpacity 
                  key={child.id} 
                  style={styles.childItem} 
                  onPress={() => toggleChildSelection(child.id)}
                >
                  <View style={styles.childInfo}>
                    <Ionicons name="person-circle-outline" size={32} color="#0288D1" />
                    <Text style={styles.childName}>{child.name}</Text>
                  </View>
                  <Ionicons 
                    name={selectedChildrenIds.includes(child.id) ? "checkbox" : "square-outline"} 
                    size={24} 
                    color="#0288D1" 
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>Block during downtime</Text>
             <Switch value={blockDowntime} onValueChange={setBlockDowntime} trackColor={{ true: '#0288D1' }} />
          </View>
          <Text style={styles.cardSubText}>If on, devices cannot be used during the scheduled downtime.</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loading}>
          {loading ? <ActivityIndicator color="#0D47A1" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={pickerMode === 'from' ? fromDate : toDate}
          mode="time"
          is24Hour={false}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, marginTop: 40, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0D47A1' },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#BBDEFB', borderRadius: 25, padding: 20, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconTitle: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1', marginLeft: 5 },
  cardSubText: { color: '#0288D1', fontSize: 12, marginTop: 10, opacity: 0.8 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, alignItems: 'center' },
  timeLabel: { color: '#0288D1', textAlign: 'center', fontSize: 12 },
  timeValue: { fontSize: 22, fontWeight: 'bold', color: '#0D47A1' },
  timeDivider: { width: 30, height: 1, backgroundColor: '#90CAF9' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  dayCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  activeDay: { backgroundColor: '#0288D1' },
  dayText: { color: '#0288D1', fontWeight: 'bold' },
  activeDayText: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  switchLabel: { fontSize: 16, color: '#0D47A1', fontWeight: '500' },
  childListContainer: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#90CAF9', marginVertical: 10 },
  childItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  childInfo: { flexDirection: 'row', alignItems: 'center' },
  childName: { marginLeft: 10, fontSize: 16, color: '#0D47A1' },
  saveButton: { backgroundColor: '#90CAF9', padding: 18, borderRadius: 25, alignItems: 'center', marginTop: 10, marginBottom: 40, elevation: 3 },
  saveButtonText: { color: '#0D47A1', fontSize: 18, fontWeight: 'bold' }
});