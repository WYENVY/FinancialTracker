<<<<<<< Updated upstream
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
=======
/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from './(tabs)/Signup';
import SignIn from './(tabs)/Signin';
import HomeScreen from './(tabs)/HomeScreen';
import ForgotPassword from './(tabs)/Forgetpassword';
>>>>>>> Stashed changes

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </ThemeProvider>
  );
<<<<<<< Updated upstream
}
=======
}
*/
>>>>>>> Stashed changes
