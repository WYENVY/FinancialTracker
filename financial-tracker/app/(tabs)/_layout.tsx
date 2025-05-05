<<<<<<< Updated upstream
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from './Signup';
import SignIn from './Signin';
import HomeScreen from './HomeScreen';
import ForgotPassword from './Forgetpassword';

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
/*import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
=======
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './index';
import TransactionsScreen from './transactions';
import BudgetsScreen from './budgets';
import ExpensesScreen from './expenses';
>>>>>>> Stashed changes

const Tab = createBottomTabNavigator();

// Tab icons configuration
const TAB_ICONS = {
    Home: 'home',
    Transactions: 'cash',
    Budgets: 'pie-chart',
    Expenses: 'card',
} as const;

export default function TabLayout() {
<<<<<<< Updated upstream
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
*/
=======
    return (
        <Tab.Navigator
            screenOptions={({ route }): BottomTabNavigationOptions => ({
                tabBarIcon: ({ color, size }) => (
                    <Ionicons
                        name={TAB_ICONS[route.name as keyof typeof TAB_ICONS]}
                        color={color}
                        size={size}
                    />
                ),
                tabBarActiveTintColor: '#76c75f', // Green
                tabBarInactiveTintColor: '#64748b', // Grey
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                    paddingBottom: 4,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Transactions" component={TransactionsScreen} />
            <Tab.Screen name="Budgets" component={BudgetsScreen} />
            <Tab.Screen name="Expenses" component={ExpensesScreen} />
        </Tab.Navigator>
    );
}
>>>>>>> Stashed changes
