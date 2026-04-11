import { useAuthStore } from '@/src/store/authStore';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, user, loadUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await loadUser();
      setIsLoading(false);
    };
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Loading BMC E-Waste...</Text>
      </View>
    );
  }

  // Redirect based on authentication status and user role
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === 'CITIZEN') {
    return <Redirect href="/(tabs)/citizen" />;
  }

  if (user?.role === 'VENDOR') {
    return <Redirect href="/(tabs)/vendor" />;
  }

  if (user?.role === 'ADMIN') {
    return <Redirect href="/(tabs)/admin" />;
  }

  // Fallback to login if role is not recognized
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
});
