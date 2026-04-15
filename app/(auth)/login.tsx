import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [storedOtp, setStoredOtp] = useState('');
  
  const { sendOtp, login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      clearError();
      const otpCode = await sendOtp(phone);
      setStoredOtp(otpCode);
      setStep('otp');
      Alert.alert(otpCode);
      
      if (otpCode) {
        Alert.alert(
          '📱 OTP Received (Mock SMS)',
          `Your BMC E-Waste OTP is: ${otpCode}\n\n(In production, this will be sent via SMS)`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : (err?.message || 'Failed to send OTP');
      Alert.alert('Error', errorMsg);
    }
  };

  const handleLogin = async () => {
    if (otp.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a 4-digit OTP');
      return;
    }

    try {
      clearError();
      console.log('Attempting login with phone:', phone, 'OTP:', storedOtp || otp);
      
      // Use stored OTP from mock API or user input
      await login(phone, storedOtp || otp);
      
      console.log('Login successful!');
      
      // Explicitly navigate based on user role
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'CITIZEN') {
        router.replace('/(tabs)/citizen');
      } else if (currentUser?.role === 'VENDOR') {
        router.replace('/(tabs)/vendor');
      } else if (currentUser?.role === 'ADMIN') {
        router.replace('/(tabs)/admin');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = error || err.message || 'Invalid OTP. Please try again.';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>BMC E-Waste</Text>
        <Text style={styles.subtitle}>Recycle Responsibly</Text>

        <View style={styles.form}>
          {step === 'phone' ? (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit phone number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit OTP"
                keyboardType="number-pad"
                maxLength={4}
                value={otp}
                onChangeText={setOtp}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep('phone');
                  setOtp('');
                  setStoredOtp('');
                }}
              >
                <Text style={styles.backButtonText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>📝 How it works:</Text>
          <Text style={styles.demoText}>• Enter any 10-digit phone number</Text>
          <Text style={styles.demoText}>• Auto-registration on first login</Text>
          <Text style={styles.demoText}>• Use OTP: 1234 for testing</Text>
          <Text style={styles.demoText}>• Default role: Citizen</Text>
        </View>

        <View style={[styles.demoInfo, styles.demoInfoSmall]}>
          <Text style={styles.demoTitle}>👥 Demo Accounts:</Text>
          <Text style={styles.demoText}>Citizen: 9876543210</Text>
          <Text style={styles.demoText}>Vendor: 9876543211</Text>
          <Text style={styles.demoText}>Admin: 9876543212</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 12,
    textAlign: 'center',
  },
  demoInfo: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  demoInfoSmall: {
    marginTop: 12,
    padding: 12,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
});
