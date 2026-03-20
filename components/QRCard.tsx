import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCardProps {
  value: string;
  onEnlarge: () => void;
}

export default function QRCard({ value, onEnlarge }: QRCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your Medical ID</Text>
      <View style={styles.qrContainer}>
        <QRCode 
          value={value} 
          size={180}
          color="#1e293b"
          backgroundColor="#fff"
        />
      </View>
      <TouchableOpacity onPress={onEnlarge} style={styles.button}>
        <Text style={styles.buttonText}>Enlarge QR Code</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Responders scan this to see your profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: '#64748b',
  },
});
