<<<<<<< Updated upstream
/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from './(tabs)/Signup';
import SignIn from './(tabs)/Signin';
import HomeScreen from './(tabs)/HomeScreen';
import ForgotPassword from './(tabs)/Forgetpassword';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    //<NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp">
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      </Stack.Navigator>
    //</NavigationContainer>
  );
}
*/
=======
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect } from 'react';
// import { useColorScheme } from '@/hooks/useColorScheme';
//
// SplashScreen.preventAutoHideAsync();
//
// export default function RootLayout() {
//     const [fontsLoaded] = useFonts({
//         SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//     });
//     const colorScheme = useColorScheme();
//
//     useEffect(() => {
//         if (fontsLoaded) SplashScreen.hideAsync();
//     }, [fontsLoaded]);
//
//     if (!fontsLoaded) return null;
//
//     return (
//         <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//             <Stack screenOptions={{ headerShown: false }}>
//                 <Stack.Screen name="(tabs)" />
//                 <Stack.Screen name="+not-found" />
//                 <Stack.Screen name="settings" options={{ title: 'Settings' }} />
//             </Stack>
//         </ThemeProvider>
//     );
// }

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from '@/app/(auth)/Signup';
import SignIn from '@/app/(auth)/Signin'
import HomeScreen from '@/app/(tabs)/index';
import BudgetsScreen from '@/app/(tabs)/budgets';
import TransactionsScreen from '@/app/(tabs)/transactions';
import ForgotPassword from '@/app/(auth)/Forgetpassword';


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <Stack.Navigator initialRouteName="SignUp">
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Budgets" component={BudgetsScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </Stack.Navigator>
    );
}

>>>>>>> Stashed changes
