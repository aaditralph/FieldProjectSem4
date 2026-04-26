import { useAuthStore } from '@/src/store/authStore';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [storedOtp, setStoredOtp] = useState('');

  const { sendOtp, signup, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!name || !phone || !password || !address) {
      Alert.alert('Missing Fields', 'Please fill all the details');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      clearError();
      const otpCode = await sendOtp(phone, 'signup');
      setStoredOtp(otpCode);
      setStep('otp');
      
      if (otpCode) {
        Alert.alert(
          '📱 OTP Received (Mock SMS)',
          `Your BMC E-Waste OTP is: ${otpCode}\n\n(In production, this will be sent via SMS)`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      const storeError = useAuthStore.getState().error;
      const errorMsg = storeError || (typeof err === 'string' ? err : (err?.message || 'Failed to send OTP'));
      Alert.alert('Error', errorMsg);
    }
  };

  const handleSignup = async () => {
    if (otp.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a 4-digit OTP');
      return;
    }

    try {
      clearError();
      console.log('Attempting signup with phone:', phone, 'OTP:', storedOtp || otp);
      
      await signup({
        name,
        phone,
        password,
        address,
        otp: storedOtp || otp
      });
      
      console.log('Signup successful!');
      Alert.alert('Success', 'Account created successfully!');
      
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'CITIZEN') {
        router.replace('/(tabs)/citizen');
      } else if (currentUser?.role === 'VENDOR') {
        router.replace('/(tabs)/vendor');
      } else if (currentUser?.role === 'ADMIN') {
        router.replace('/(tabs)/admin');
      } else {
        router.replace('/(tabs)/citizen');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const storeError = useAuthStore.getState().error;
      const errorMessage = storeError || err?.message || 'Signup Failed. Please try again.';
      Alert.alert('Signup Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join BMC E-Waste Platform</Text>

          <View style={styles.form}>
            {step === 'details' ? (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />

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

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password (min 6 chars)"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />

                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your full address"
                  multiline
                  numberOfLines={3}
                  value={address}
                  onChangeText={setAddress}
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

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>Enter OTP</Text>
                <Text style={styles.helperText}>Sent to +91 {phone}</Text>
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
                  onPress={handleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Sign Up</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setStep('details');
                    setOtp('');
                    setStoredOtp('');
                  }}
                >
                  <Text style={styles.backButtonText}>Edit Details</Text>
                </TouchableOpacity>
              </>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 12,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  loginLink: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 12,
    textAlign: 'center',
  },
});
