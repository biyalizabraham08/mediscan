import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCard from '../components/QRCard';
import { supabase } from '../services/supabase';
import { startAccidentDetection, stopAccidentDetection } from '../services/sensors';
import { getCurrentLocation } from '../services/location';
import { sendAccidentAlertEmail } from '../services/email';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ route, navigation }: any) {
  const { email } = route.params;
  const [profile, setProfile] = useState<any>(null);
  const profileRef = useRef<any>(null);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [isCountdownVisible, setIsCountdownVisible] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<number>(0);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    fetchProfile();
    startAccidentDetection(handleImpact);
    return () => {
      stopAccidentDetection();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, blood_group, allergies, conditions, medications, emergency_contacts')
        .eq('email', email)
        .single();

      if (error) throw error;
      setProfile(data);
      // Cache profile for offline use
      await AsyncStorage.setItem('cached_profile', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Load from cache if offline
      const cached = await AsyncStorage.getItem('cached_profile');
      if (cached) setProfile(JSON.parse(cached));
    }
  };

  const handleImpact = () => {
    const now = Date.now();
    if (now - cooldownRef.current < 120000) return; // 2 minute cooldown

    if (!isCountdownVisible) {
      setIsCountdownVisible(true);
      setCountdown(15);
      startCountdown();
    }
  };

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          triggerAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelAlert = () => {
    setIsCountdownVisible(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const triggerAlert = async () => {
    setIsCountdownVisible(false);
    cooldownRef.current = Date.now();
    
    const currentProfile = profileRef.current;
    if (!currentProfile) return;

    const contact = currentProfile.emergency_contacts?.[0];
    if (contact?.email) {
      const location = await getCurrentLocation();
      await sendAccidentAlertEmail(
        contact.email,
        contact.name,
        currentProfile.full_name,
        location || undefined
      );
      
      // Log event
      await supabase.from('sos_events').insert([{
        user_id: currentProfile.id,
        type: 'accident',
        location: location
      }]);
      
      Alert.alert('Emergency Alert Sent', 'Your emergency contacts have been notified.');
    }
  };

  const handleManualSOS = async () => {
    Alert.alert(
      'Manual SOS',
      'Are you sure you want to send an emergency alert immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'SEND ALERT', style: 'destructive', onPress: triggerAlert }
      ]
    );
  };

  if (!profile) return (
    <View style={styles.loadingContainer}>
      <Text>Loading Dashboard...</Text>
    </View>
  );

  const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
  const cleanWebUrl = webUrl?.replace(/\/$/, '');
  const emergencyUrl = cleanWebUrl 
    ? `${cleanWebUrl}/emergency/${profile.id}`
    : `mediscan://emergency/${profile.id}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name}>{profile.full_name}</Text>
        </View>

        <QRCard value={emergencyUrl} onEnlarge={() => setIsQRModalVisible(true)} />

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Profile', { profile })}>
            <Text style={styles.cardTitle}>Medical Profile</Text>
            <Text style={styles.cardSubtitle}>Update your info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.sosCard]} onPress={handleManualSOS}>
            <Text style={[styles.cardTitle, styles.sosTitle]}>Manual SOS</Text>
            <Text style={[styles.cardSubtitle, styles.sosSubtitle]}>Send immediate alert</Text>
          </TouchableOpacity>
        </View>

        {/* New Preview Button */}
        <TouchableOpacity 
          style={styles.previewCard} 
          onPress={() => navigation.navigate('Emergency', { userId: profile.id })}
        >
          <Text style={styles.previewTitle}>View My Emergency ID</Text>
          <Text style={styles.previewSubtitle}>See what responders will see</Text>
        </TouchableOpacity>

        <View style={styles.statusBox}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Accident Detection Active</Text>
        </View>
      </ScrollView>

      {/* QR Enlarge Modal */}
      <Modal visible={isQRModalVisible} transparent onRequestClose={() => setIsQRModalVisible(false)}>
        <View style={styles.modalBg}>
          <TouchableOpacity style={isQRModalVisible ? styles.modalOverlay : {}} onPress={() => setIsQRModalVisible(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency ID Scan</Text>
            <View style={styles.modalQR}>
              <QRCard value={emergencyUrl} onEnlarge={() => {}} />
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsQRModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Accident Countdown Modal */}
      <Modal visible={isCountdownVisible} transparent animationType="fade">
        <View style={[styles.modalBg, { backgroundColor: 'rgba(220, 38, 38, 0.95)' }]}>
          <View style={styles.alertContent}>
            <Text style={styles.alertEmoji}>🚨</Text>
            <Text style={styles.alertTitle}>Impact Detected</Text>
            <Text style={styles.alertText}>Sending emergency alert in</Text>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelAlert}>
              <Text style={styles.cancelBtnText}>I'M OKAY, CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  welcome: { fontSize: 16, color: '#64748b' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  card: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sosCard: { backgroundColor: '#fee2e2', borderColor: '#ef4444', borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#64748b' },
  sosTitle: { color: '#dc2626' },
  sosSubtitle: { color: '#ef4444' },
  previewCard: { 
    backgroundColor: '#eff6ff', 
    padding: 20, 
    borderRadius: 20, 
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed'
  },
  previewTitle: { fontSize: 16, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 4 },
  previewSubtitle: { fontSize: 13, color: '#3b82f6' },
  statusBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#dcfce7', 
    padding: 12, 
    borderRadius: 12, 
    marginTop: 24,
    justifyContent: 'center'
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a', marginRight: 8 },
  statusText: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 32, width: '90%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalQR: { width: '100%' },
  closeBtn: { marginTop: 20, padding: 12 },
  closeBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
  alertContent: { alignItems: 'center', padding: 40 },
  alertEmoji: { fontSize: 80, marginBottom: 20 },
  alertTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  alertText: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 30 },
  countdownCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 8, 
    borderColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 40 
  },
  countdownText: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  cancelBtn: { backgroundColor: '#fff', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 16 },
  cancelBtnText: { color: '#dc2626', fontSize: 18, fontWeight: 'bold' }
});
