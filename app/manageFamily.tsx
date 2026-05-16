import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ManageFamily() {
  const router = useRouter();

  const familyMembers = [
    { id: 1, name: 'childName', phone: 'phone type' },
    { id: 2, name: 'childName', phone: 'phone type' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Family Member</Text>
        <TouchableOpacity>
           <MaterialCommunityIcons name="account-plus" size={32} color="#01579B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* قائمة أفراد العائلة داخل كارت واحد كبير */}
        <View style={styles.membersCard}>
          {familyMembers.map((member, index) => (
            <View key={member.id}>
              <View style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <MaterialCommunityIcons name="face-recognition" size={45} color="#01579B" />
                  <View style={styles.textContainer}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.phoneType}>{member.phone}</Text>
                  </View>
                </View>
                
                <View style={styles.actionIcons}>
                  <TouchableOpacity style={styles.editIcon}>
                    <Feather name="edit-2" size={22} color="#01579B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteIcon}>
                    <MaterialCommunityIcons name="delete-outline" size={26} color="#B71C1C" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* الخط الفاصل بين الأفراد */}
              {index < familyMembers.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* زرار مسح المجموعة في الأسفل */}
        <TouchableOpacity style={styles.deleteGroupBtn}>
          <MaterialCommunityIcons name="delete-outline" size={28} color="#B71C1C" />
          <Text style={styles.deleteGroupText}>Delete Family Group</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' }, // الخلفية السماوي الفاتح
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 40
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#01579B' },
  content: { paddingHorizontal: 20 },
  
  // كارت الأعضاء
  membersCard: { 
    backgroundColor: '#BBDEFB', 
    borderRadius: 15, 
    overflow: 'hidden',
    marginBottom: 50
  },
  memberRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20 
  },
  memberInfo: { flexDirection: 'row', alignItems: 'center' },
  textContainer: { marginLeft: 15 },
  memberName: { fontSize: 20, fontWeight: 'bold', color: '#01579B' },
  phoneType: { fontSize: 14, color: '#90CAF9', fontWeight: '500' },
  
  actionIcons: { flexDirection: 'row', alignItems: 'center' },
  editIcon: { marginRight: 15 },
  deleteIcon: { backgroundColor: '#FFEBEE', padding: 5, borderRadius: 8 },
  
  divider: { height: 1, backgroundColor: '#0288D1', opacity: 0.3, marginHorizontal: 20 },

  // زرار Delete Family Group
  deleteGroupBtn: { 
    backgroundColor: '#BBDEFB', 
    borderRadius: 20, 
    padding: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(183, 28, 28, 0.1)'
  },
  deleteGroupText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#B71C1C', 
    marginLeft: 10 
  }
});