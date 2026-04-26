import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Alert, TouchableOpacity } from 'react-native';

export default function VendorTabs() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            (router as any).replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2980b9',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#dee2e6',
        },
        headerStyle: {
          backgroundColor: '#2980b9',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
       <Tabs.Screen
         name="index"
         options={{
           title: 'My Pickups',
           tabBarIcon: ({ color, size }) => (
             <Ionicons name="car-outline" size={size} color={color} />
           ),
         }}
       />
       <Tabs.Screen
         name="drives"
         options={{
           title: 'Drives',
           tabBarIcon: ({ color, size }) => (
             <Ionicons name="calendar-outline" size={size} color={color} />
           ),
         }}
       />
       <Tabs.Screen
         name="completed"
         options={{
           title: 'Completed',
           tabBarIcon: ({ color, size }) => (
             <Ionicons name="checkmark-done-outline" size={size} color={color} />
           ),
         }}
       />
    </Tabs>
  );
}
