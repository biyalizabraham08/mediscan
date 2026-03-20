import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';

export default function ProfileScreen({ route, navigation }: any) {
  const { profile } = route.params;
  
  // Adapt existing profile data to form
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    blood_group: profile.blood_group || '',
    allergies: profile.allergies || '',
    conditions: profile.conditions || '',
    medications: profile.medications || '',
    // Handle emergency contacts
    emergency_name: profile.emergency_contacts?.[0]?.name || '',
    emergency_phone: profile.emergency_contacts?.[0]?.phone || '',
    emergency_email: profile.emergency_contacts?.[0]?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepare data for Supabase (matching web schema)
      const dataToSave = {
        full_name: form.full_name,
        blood_group: form.blood_group,
        allergies: form.allergies,
        conditions: form.conditions,
        medications: form.medications,
        emergency_contacts: [
          {
            name: form.emergency_name,
            phone: form.emergency_phone,
            email: form.emergency_email,
            relation: 'Emergency Contact'
          }
        ],
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(dataToSave)
        .eq('id', profile.id);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, key: keyof typeof form, placeholder: string, multiline = false, keyboardType: any = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={form[key]}
        onChangeText={(text) => setForm({ ...form, [key]: text })}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {renderInput('Full Name', 'full_name', 'Enter your full name')}
        {renderInput('Blood Group', 'blood_group', 'e.g. O+')}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Medical Details</Text>
        {renderInput('Severe Allergies', 'allergies', 'List all allergies', true)}
        {renderInput('Medical Conditions', 'conditions', 'List chronic conditions', true)}
        {renderInput('Active Medications', 'medications', 'List current medications', true)}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Emergency Contact</Text>
        {renderInput('Contact Name', 'emergency_name', 'Full name of contact')}
        {renderInput('Contact Phone', 'emergency_phone', 'Phone number', false, 'phone-pad')}
        {renderInput('Contact Email', 'emergency_email', 'Email address', false, 'email-address')}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#2563eb', paddingLeft: 12 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b' },
  multiline: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 32, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
