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
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/theme/Theme';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { AnimatedButton } from '@/src/components/ui/AnimatedButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    <LinearGradient colors={['#0B0F19', '#10172A']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="leaf" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>BMC E-Waste</Text>
            <Text style={styles.subtitle}>Recycle Responsibly</Text>
          </View>

          <GlassCard style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor={COLORS.textDim}
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
              placeholderTextColor={COLORS.textDim}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            
            <AnimatedButton 
              title={isLoading ? "Logging in..." : "Login"}
              onPress={handleLogin}
              disabled={isLoading}
              style={{ marginTop: SPACING }}
              icon="log-in-outline"
            />
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </GlassCard>

          <GlassCard style={styles.demoInfo}>
            <Text style={styles.demoTitle}>📝 Demo Notes:</Text>
            <Text style={styles.demoText}>• Use password "123456" for demo users</Text>
            <Text style={styles.demoText}>• Real users need to sign up first</Text>
          </GlassCard>

          <GlassCard style={[styles.demoInfo, styles.demoInfoSmall]}>
            <Text style={styles.demoTitle}>👥 Demo Accounts:</Text>
            <Text style={styles.demoText}>Citizen: 9876543210</Text>
            <Text style={styles.demoText}>Pick Up Everywhere: 9876543211</Text>
            <Text style={styles.demoText}>Admin: 9876543212</Text>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING * 1.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING * 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textDim,
    textAlign: 'center',
  },
  form: {
    padding: SPACING * 1.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING * 1.5,
  },
  signupText: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  demoInfo: {
    marginTop: SPACING * 2,
    padding: SPACING,
  },
  demoInfoSmall: {
    marginTop: SPACING,
    padding: SPACING * 0.75,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: COLORS.textDim,
    marginBottom: 4,
  },
});

