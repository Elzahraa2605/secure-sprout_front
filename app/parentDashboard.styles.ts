import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', paddingTop: 40 },
  loadingContainer: { flex: 1, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginBottom: 10 },
  hiText: { fontSize: 20, fontWeight: 'bold', color: '#01579B' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#01579B', marginLeft: 20, marginVertical: 15 },
  familyRow: { paddingHorizontal: 20, paddingBottom: 10 },
  familyMember: { alignItems: 'center', marginRight: 20, width: 80 },
  addChildBtn: { alignItems: 'center', marginRight: 20 },
  addCircleInside: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#0288D1' },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, position: 'relative' },
  selectedAvatar: { borderWidth: 2, borderColor: '#0288D1', backgroundColor: '#BBDEFB' },
  hardwareOnlineAvatar: { backgroundColor: '#E3F2FD', borderWidth: 2, borderColor: '#0288D1' },
  hardwareOfflineAvatar: { backgroundColor: '#fff', borderWidth: 0 },
  statusDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff', position: 'absolute', right: 2, top: 2, elevation: 3 },
  statusDotOnline: { backgroundColor: '#2ecc71' },
  statusDotOffline: { backgroundColor: '#95a5a6' },
  memberName: { fontSize: 13, fontWeight: 'bold', color: '#01579B', marginTop: 8 },
  memberSubDevice: { fontSize: 10, color: '#4FC3F7', textAlign: 'center' },
  statusOnlineText: { color: '#2ecc71' },
  statusOfflineText: { color: '#95a5a6' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, justifyContent: 'space-between' },
  statCard: { width: '48%', borderRadius: 20, padding: 20, height: 160, backgroundColor: '#BBDEFB', elevation: 1 },
  statIcon: { marginBottom: 10 },
  cardLabel: { fontSize: 12, color: '#01579B', fontWeight: 'bold' },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#01579B', marginTop: 10 },
  noChangeText: { fontSize: 10, color: '#4FC3F7', marginTop: 5 },
  alertPriorityCard: { backgroundColor: '#827717', marginHorizontal: 20, borderRadius: 15, padding: 15, marginTop: 10 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  priorityText: { color: '#FFD600', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  alertTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  alertSub: { color: '#fff', fontSize: 12, marginTop: 3 },
  alertArrow: { position: 'absolute', right: 15, top: '50%' },
  mapCard: { backgroundColor: '#BBDEFB', marginHorizontal: 20, borderRadius: 25, padding: 15, flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  mapInfo: { flex: 1 },
  mapTitle: { color: '#0288D1', fontWeight: 'bold', fontSize: 12 },
  mapChildName: { fontSize: 16, fontWeight: 'bold', color: '#01579B' },
  mapTime: { fontSize: 11, color: '#0288D1' },
  viewMapBtn: { backgroundColor: '#4FC3F7', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, marginTop: 10, alignSelf: 'flex-start' },
  viewMapText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  mapMiniContainer: { width: 110, height: 110, borderRadius: 20, overflow: 'hidden' },
  mapPlaceholder: { flex: 1, backgroundColor: '#E1F5FE', justifyContent: 'center', alignItems: 'center' },
  actionButton: { backgroundColor: '#BBDEFB', flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderRadius: 20, marginTop: 12, marginHorizontal: 20, alignItems: 'center' },
  actionLeft: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 15, fontSize: 15, fontWeight: 'bold', color: '#0D47A1' },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#E3F2FD', height: 80, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: '#B3E5FC' },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { fontSize: 10, color: '#01579B', marginTop: 4 },
  navTextActive: { fontSize: 10, color: '#01579B', fontWeight: 'bold', marginTop: 4 },
  childEmoji: { fontSize: 35 },
  bottomSpacer: { height: 100 },
});

export const getHardwareAvatarStyle = (isHardwareOnline: boolean) => [
  styles.avatarCircle,
  isHardwareOnline ? styles.hardwareOnlineAvatar : styles.hardwareOfflineAvatar,
];

export const getStatusDotStyle = (isHardwareOnline: boolean) => [
  styles.statusDot,
  isHardwareOnline ? styles.statusDotOnline : styles.statusDotOffline,
];

export const getMemberSubDeviceStyle = (isHardwareOnline: boolean) => [
  styles.memberSubDevice,
  isHardwareOnline ? styles.statusOnlineText : styles.statusOfflineText,
];

export const getChildAvatarStyle = (isSelected: boolean | undefined) => [
  styles.avatarCircle,
  isSelected ? styles.selectedAvatar : undefined,
];

export const getChildEmojiStyle = () => styles.childEmoji;
export default styles;
