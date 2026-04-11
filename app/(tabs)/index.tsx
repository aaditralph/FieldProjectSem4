import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function TabIndexScreen() {
  const { isAuthenticated, user, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'CITIZEN') {
        (router as any).replace('/(tabs)/citizen');
      } else if (user.role === 'VENDOR') {
        (router as any).replace('/(tabs)/vendor');
      } else if (user.role === 'ADMIN') {
        (router as any).replace('/(tabs)/admin');
      }
    }
  }, [isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#27ae60" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
});
