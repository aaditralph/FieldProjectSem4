import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/src/store/authStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { loadUser, isAuthenticated, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await loadUser();
      setIsReady(true);
    };
    initialize();
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {!isAuthenticated ? (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : user?.role === 'CITIZEN' ? (
          <Stack.Screen name="(tabs)/citizen" options={{ headerShown: false }} />
        ) : user?.role === 'VENDOR' ? (
          <Stack.Screen name="(tabs)/vendor" options={{ headerShown: false }} />
        ) : user?.role === 'ADMIN' ? (
          <Stack.Screen name="(tabs)/admin" options={{ headerShown: false }} />
        ) : null}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
