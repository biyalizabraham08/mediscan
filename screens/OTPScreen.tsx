import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OTPInput from '../components/OTPInput';
import { supabase } from '../services/supabase';

export default function OTPScreen({ route, navigation }: any) {
  const { email, userId } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('user_id', userId)
        .eq('otp', otp)
        .eq('type', 'email_verify')
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        Alert.alert('Verification Failed', 'Invalid or expired OTP code.');
        return;
      }

      // Successful verification
      navigation.navigate('Dashboard', { email });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <OTPInput length={6} value={otp} onChange={setOtp} />

        <TouchableOpacity 
          style={[styles.button, (otp.length !== 6 || isLoading) && styles.buttonDisabled]} 
          onPress={handleVerify}
          disabled={otp.length !== 6 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton} onPress={() => navigation.goBack()}>
          <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendLink}>Request new</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 30,
  },
  resendText: {
    color: '#64748b',
    fontSize: 14,
  },
  resendLink: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
