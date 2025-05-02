import React from 'react';
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
