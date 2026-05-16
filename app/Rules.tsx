// import { FontAwesome5, Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator, Alert, SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const API_URL = 'http://192.168.1.9:8000/api/parent'; 

// export default function RulesScreen() {
//   const [loading, setLoading] = useState(true);
//   const [children, setChildren] = useState<any[]>([]);
//   const [selectedChildId, setSelectedChildId] = useState<string | number>('all');

//   const fetchData = async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const res = await axios.get(`${API_URL}/rules`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (res.data.status === 'success') setChildren(res.data.data);
//     } catch (e) { console.error("Fetch Error"); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetchData(); }, []);

//   // دالة التحديث الذكية: لو مختارة All بتلف على كل الأطفال وتحدثهم
//   const handleToggle = async (field: string, currentValue: any) => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const newValue = !currentValue;

//       if (selectedChildId === 'all') {
//         // تحديث جماعي لكل الأطفال
//         await Promise.all(children.map(child => {
//           if (child.rules?.uuid) {
//             return axios.patch(`${API_URL}/rules/update/${child.rules.uuid}`, 
//               { [field]: newValue }, 
//               { headers: { 'Authorization': `Bearer ${token}` } }
//             );
//           }
//         }));
//       } else {
//         // تحديث طفل واحد فقط
//         const child = children.find(c => c.id === selectedChildId);
//         if (child?.rules?.uuid) {
//           await axios.patch(`${API_URL}/rules/update/${child.rules.uuid}`, 
//             { [field]: newValue }, 
//             { headers: { 'Authorization': `Bearer ${token}` } }
//           );
//         }
//       }
//       fetchData(); // تحديث الشاشة بعد العملية
//     } catch (e) {
//       Alert.alert("Error", "Failed to update rules. Check your server.");
//     }
//   };

//   if (loading) return <ActivityIndicator style={{flex:1}} size="large" />;

//   // القيمة اللي الـ Switch هيعرضها في تاب All هي قيمة أول طفل كمثال
//   const getGlobalValue = (field: string) => {
//     if (selectedChildId === 'all') return !!children[0]?.rules?.[field];
//     return !!children.find(c => c.id === selectedChildId)?.rules?.[field];
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity><Ionicons name="arrow-back" size={26} color="#0288D1" /></TouchableOpacity>
//         <Text style={styles.headerTitle}>Rules</Text>
//         <TouchableOpacity><Ionicons name="add-circle" size={30} color="#0288D1" /></TouchableOpacity>
//       </View>

//       <View style={styles.tabsWrapper}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           <Tab active={selectedChildId === 'all'} label="All" onPress={() => setSelectedChildId('all')} />
//           {children.map(c => (
//             <Tab key={c.id} active={selectedChildId === c.id} label={c.name} onPress={() => setSelectedChildId(c.id)} />
//           ))}
//         </ScrollView>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <RuleCard 
//           title="Screen Time Limit" sub="Daily usage control" icon="hourglass-half"
//           value={getGlobalValue('is_active')} 
//           onToggle={() => handleToggle('is_active', getGlobalValue('is_active'))} 
//         />
//         <RuleCard 
//           title="App Blocking" sub="Restrict specific apps" icon="ban"
//           value={getGlobalValue('app_blocking')} 
//           onToggle={() => handleToggle('app_blocking', getGlobalValue('app_blocking'))} 
//         />
//         <RuleCard 
//           title="Content Filtering" sub="Strict web security" icon="filter"
//           value={getGlobalValue('web_filtering')} 
//           onToggle={() => handleToggle('web_filtering', getGlobalValue('web_filtering'))} 
//         />
//         <RuleCard 
//           title="Bedtime Schedule" sub="9:00 PM - 7:00 AM" icon="moon"
//           value={true} onToggle={() => {}} 
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const Tab = ({ active, label, onPress }: any) => (
//   <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
//     <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
//   </TouchableOpacity>
// );

// const RuleCard = ({ title, sub, icon, value, onToggle }: any) => (
//   <View style={styles.card}>
//     <View style={styles.cardRow}>
//       <FontAwesome5 name={icon} size={22} color="#0288D1" style={{marginRight: 15}} />
//       <View style={{ flex: 1 }}>
//         <Text style={styles.cardTitle}>{title}</Text>
//         <Text style={styles.cardSubTitle}>{sub}</Text>
//       </View>
//       <Switch value={value} onValueChange={onToggle} />
//     </View>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#E3F2FD' },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
//   headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#467b97' },
//   tabsWrapper: { marginHorizontal: 20, backgroundColor: '#BBDEFB', padding: 5, borderRadius: 15, marginBottom: 10 },
//   tab: { paddingVertical: 10, paddingHorizontal: 25, borderRadius: 12 },
//   activeTab: { backgroundColor: '#64B5F6' },
//   tabText: { color: '#0277BD', fontWeight: 'bold' },
//   activeTabText: { color: '#FFF' },
//   scrollContent: { padding: 20 },
//   card: { backgroundColor: '#BBDEFB', borderRadius: 25, padding: 20, marginBottom: 15 },
//   cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1' },
//   cardSubTitle: { fontSize: 12, color: '#0288D1' }
// });
import React, { useEffect, useState } from 'react';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator, Alert, SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';

const API_URL = 'http://192.168.1.9:8000/api/parent';
const { width } = Dimensions.get('window');

export default function RulesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | number>('all');

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${API_URL}/rules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setChildren(res.data.data);
      }
    } catch (e) {
      console.error("Fetch Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (field: string, childId: any, currentVal: boolean) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const newValue = !currentVal;
      
      // تحديث الحالة محلياً فوراً عشان المستخدم يحس بالسرعة (Optimistic Update)
      const updatedChildren = children.map(c => {
        if (childId === 'all' || c.id === childId) {
          return { ...c, rules: { ...c.rules, [field]: newValue } };
        }
        return c;
      });
      setChildren(updatedChildren);

      // إرسال الطلب للسيرفر
      if (childId === 'all') {
        await Promise.all(children.map(child => {
          if (child.rules?.uuid) {
            return axios.patch(`${API_URL}/rules/update/${child.rules.uuid}`, { [field]: newValue }, 
              { headers: { 'Authorization': `Bearer ${token}` } });
          }
        }));
      } else {
        const child = children.find(c => c.id === childId);
        if (child?.rules?.uuid) {
          await axios.patch(`${API_URL}/rules/update/${child.rules.uuid}`, { [field]: newValue }, 
            { headers: { 'Authorization': `Bearer ${token}` } });
        }
      }
    } catch (e) {
      Alert.alert("Error", "Failed to update. Please try again.");
      fetchData(); // تراجع عن التغيير لو فشل
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0288D1" /></View>;

  // تحديد الأطفال المطلوب عرضهم بناءً على التاب المختارة
  const displayChildren = selectedChildId === 'all' ? children : children.filter(c => c.id === selectedChildId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={28} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rules</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle" size={32} color="#0288D1" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity 
            onPress={() => setSelectedChildId('all')} 
            style={[styles.tab, selectedChildId === 'all' && styles.activeTab]}
          >
            <Text style={[styles.tabText, selectedChildId === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          {children.map(child => (
            <TouchableOpacity 
              key={child.id} 
              onPress={() => setSelectedChildId(child.id)} 
              style={[styles.tab, selectedChildId === child.id && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedChildId === child.id && styles.activeTabText]}>{child.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Screen Time Card */}
        <RuleCard 
          title="Screen Time Limit"
          sub="Daily usage control"
          icon="hourglass-half"
          isActive={displayChildren.every(c => c.rules?.is_active)}
          onToggle={() => handleToggle('is_active', selectedChildId, displayChildren.every(c => c.rules?.is_active))}
          targetChildren={displayChildren}
        />

        {/* App Blocking Card */}
        <RuleCard 
          title="App Blocking"
          sub="Restrict specific apps"
          icon="ban"
          isActive={displayChildren.every(c => c.rules?.app_blocking)}
          onToggle={() => handleToggle('app_blocking', selectedChildId, displayChildren.every(c => c.rules?.app_blocking))}
          targetChildren={displayChildren}
        />

        {/* Bedtime Card */}
        <RuleCard 
          title="Bedtime Schedule"
          sub="9:00 PM - 7:00 AM"
          icon="moon"
          isActive={true} // ثابت كمثال
          onToggle={() => {}}
          targetChildren={displayChildren}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// مكون الـ Card الاحترافي
const RuleCard = ({ title, sub, icon, isActive, onToggle, targetChildren }: any) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name={icon} size={22} color="#0288D1" />
      </View>
      <View style={styles.cardTextContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      <Switch 
        value={isActive} 
        onValueChange={onToggle}
        trackColor={{ false: "#D1E9FF", true: "#0288D1" }}
        thumbColor="#FFF"
      />
    </View>
    
    {/* أيقونات الأطفال تحت الـ Card */}
    <View style={styles.childIconsRow}>
      {targetChildren.map((child: any) => (
        <View key={child.id} style={styles.childBadge}>
          <Ionicons name="person-circle-outline" size={24} color="#0288D1" />
          <Text style={styles.childBadgeName}>{child.name}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 20 
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0D47A1' },
  tabsContainer: { 
    backgroundColor: '#BBDEFB', 
    marginHorizontal: 20, 
    borderRadius: 20, 
    padding: 6,
    marginBottom: 15
  },
  tabsScroll: { flexDirection: 'row', alignItems: 'center' },
  tab: { 
    paddingVertical: 10, 
    paddingHorizontal: 25, 
    borderRadius: 15, 
    marginRight: 5 
  },
  activeTab: { backgroundColor: '#64B5F6' },
  tabText: { color: '#0288D1', fontWeight: 'bold', fontSize: 15 },
  activeTabText: { color: '#FFF' },
  scrollBody: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { 
    backgroundColor: '#BBDEFB', 
    borderRadius: 25, 
    padding: 20, 
    marginBottom: 20, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { 
    backgroundColor: 'rgba(2, 136, 209, 0.1)', 
    padding: 12, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#0288D1'
  },
  cardTextContent: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1' },
  cardSub: { fontSize: 13, color: '#0288D1', marginTop: 2 },
  childIconsRow: { 
    flexDirection: 'row', 
    marginTop: 15, 
    paddingTop: 15, 
    borderTopWidth: 0.5, 
    borderTopColor: 'rgba(2, 136, 209, 0.2)' 
  },
  childBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.5)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 10,
    marginRight: 8
  },
  childBadgeName: { fontSize: 11, color: '#0D47A1', marginLeft: 4, fontWeight: '600' }
});