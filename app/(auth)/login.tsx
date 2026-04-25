import { useAuthStore } from '@/src/store/authStore';
import { Link, useRouter } from 'expo-router';
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
  const [password, setPassword] = useState('');
  
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
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
      await login(phone, password);
      
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
      const storeError = useAuthStore.getState().error;
      const errorMessage = storeError || err?.message || 'Login failed. Please try again.';
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
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
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
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>📝 Demo Notes:</Text>
          <Text style={styles.demoText}>• Use password "123456" for demo users</Text>
          <Text style={styles.demoText}>• Real users need to sign up first</Text>
        </View>

        <View style={[styles.demoInfo, styles.demoInfoSmall]}>
          <Text style={styles.demoTitle}>👥 Demo Accounts:</Text>
          <Text style={styles.demoText}>Citizen: 9876543210</Text>
          <Text style={styles.demoText}>Pick Up Everywhere: 9876543211</Text>
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  signupLink: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '600',
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
