import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, NativeEventEmitter } from 'react-native';

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (val: string) => void;
}

export default function OTPInput({ length, value, onChange }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (value === '') {
      setOtp(Array(length).fill(''));
      setFocusedIndex(0);
      inputs.current[0]?.focus();
    }
  }, [value]);

  const handleChange = (text: string, index: number) => {
    const char = text.slice(-1); // Only take last character
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    if (char && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array(length).fill(0).map((_, i) => (
        <TextInput
          key={`otp-${i}`}
          ref={(el: TextInput | null) => { if (el) inputs.current[i] = el; }}
          style={[
            styles.input,
            focusedIndex === i && styles.inputFocused,
            otp[i] !== '' && styles.inputFilled
          ]}
          keyboardType="number-pad"
          maxLength={1}
          value={otp[i]}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(null)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 25,
  },
  input: {
    width: 48,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#f8fbfc',
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputFilled: {
    borderColor: '#94a3b8',
    backgroundColor: '#fff',
  },
});
