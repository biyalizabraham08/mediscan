import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmergencyScreen({ route }: any) {
  const { userId, profile: passedProfile, isDemo } = route.params || {};
  const [profile, setProfile] = useState<any>(passedProfile || null);
  const [loading, setLoading] = useState(!passedProfile);

  useEffect(() => {
    if (!passedProfile && userId) fetchProfile();
  }, [userId, passedProfile]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, blood_group, allergies, conditions, medications, emergency_contacts')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      await AsyncStorage.setItem(`emergency_profile_${userId}`, JSON.stringify(data));
    } catch (error) {
      const cached = await AsyncStorage.getItem(`emergency_profile_${userId}`);
      if (cached) setProfile(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  if (!profile) return <View style={styles.center}><Text>Profile not found.</Text></View>;

  const contact = profile.emergency_contacts?.[0];

  const handleCall = () => {
    if (contact?.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    } else {
      Alert.alert('No number', 'No emergency contact phone provided.');
    }
  };

  const formatData = (data: any) => {
    if (!data) return 'None reported';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) {
      return data.map((item: any) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          // Format medication object: "Name (Dosage, Frequency)"
          const parts = [
            item.name,
            item.dosage ? `, ${item.dosage}` : '',
            item.frequency ? `, ${item.frequency}` : ''
          ].filter(Boolean);
          return parts.join('');
        }
        return JSON.stringify(item);
      }).join('\n');
    }
    return JSON.stringify(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Severe Allergies (Red Banner) */}
        {profile.allergies ? (
          <View style={styles.allergyBanner}>
            <Text style={styles.allergyTitle}>⚠ SEVERE ALLERGIES</Text>
            <Text style={styles.allergyText}>
              {formatData(profile.allergies)}
            </Text>
          </View>
        ) : null}

        {/* 2. Blood Group (Large) */}
        <View style={styles.bloodCard}>
          <Text style={styles.label}>BLOOD GROUP</Text>
          <Text style={styles.bloodValue}>{profile.blood_group || 'N/A'}</Text>
        </View>

        {/* 3. Call Emergency Contact (Button) */}
        {contact ? (
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Text style={styles.callBtnText}>CALL EMERGENCY CONTACT</Text>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactPhone}>{contact.phone}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.callBtn, { backgroundColor: '#94a3b8' }]}>
            <Text style={styles.callBtnText}>NO CONTACT PROVIDED</Text>
          </View>
        )}

        {/* 4. Medications */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>MEDICATIONS</Text>
          <Text style={styles.sectionText}>{formatData(profile.medications)}</Text>
        </View>

        {/* 5. Medical Conditions */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>MEDICAL CONDITIONS</Text>
          <Text style={styles.sectionText}>{formatData(profile.conditions)}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Information provided by patient on MediScan.</Text>
          <Text style={styles.footerText}>Verify with standard medical protocols.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  allergyBanner: { backgroundColor: '#dc2626', padding: 24, alignItems: 'center' },
  allergyTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  allergyText: { color: '#fff', fontSize: 20, textAlign: 'center', fontWeight: '600' },
  bloodCard: { padding: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 16, color: '#64748b', fontWeight: '800', marginBottom: 8 },
  bloodValue: { fontSize: 84, fontWeight: '900', color: '#dc2626' },
  callBtn: { backgroundColor: '#2563eb', margin: 20, borderRadius: 24, padding: 24, alignItems: 'center', elevation: 4 },
  callBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  contactName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  contactPhone: { color: '#dbeafe', fontSize: 18, marginTop: 4 },
  infoSection: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sectionHeader: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 12 },
  sectionText: { fontSize: 18, color: '#475569', lineHeight: 28 },
  aiSection: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd', borderTopWidth: 1, borderBottomWidth: 1 },
  footer: { padding: 40, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 4 }
});
