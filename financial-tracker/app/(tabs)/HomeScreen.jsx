import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomePage from '@/app/pages/Home';
import TransactionsScreen from '@/app/pages/Transactions';
import BudgetScreen from '@/app/pages/Budgets';
import ExpensesScreen from '@/app/pages/Expenses';
import GoalsScreen from '@/app/pages/Goals';
import AnalysisScreen from '@/app/pages/Analysis';

const Tab = createBottomTabNavigator();

const getTabIcon = (routeName, focused) => {
    const iconMap = {
        Overview: 'home',
        Analysis: 'stats-chart',
        Expenses: 'card',
        Transactions: 'cash',
        Goals: 'trophy',
        Budgets: 'pie-chart'
    };

    return (
        <View style={{
            backgroundColor: focused ? '#00D09E' : 'transparent',
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 4,
        }}>
            <Ionicons
                name={iconMap[routeName]}
                size={28}
                color={focused ? '#052224' : '#052224'}
            />
        </View>
    );
};

export default function HomeScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: '#00D09E' }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused }) => getTabIcon(route.name, focused),
                    tabBarLabel: '',
                    tabBarActiveTintColor: '#052224',
                    tabBarInactiveTintColor: '#052224',
                    tabBarStyle: {
                        backgroundColor: '#DFF7E2',
                        borderTopWidth: 0,
                        paddingBottom: 8,
                        paddingTop: 8,
                        height: 70,
                        borderTopLeftRadius: 40,
                        borderTopRightRadius: 40,
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        elevation: 0, // Remove shadow on Android
                        shadowOpacity: 0, // Remove shadow on iOS
                    },
                    headerShown: false,
                })}
            >
                <Tab.Screen
                    name="Overview"
                    component={HomePage}
                />
                <Tab.Screen
                    name="Analysis"
                    component={AnalysisScreen}
                />
                <Tab.Screen
                    name="Transactions"
                    component={TransactionsScreen}
                />
                <Tab.Screen
                    name="Budgets"
                    component={BudgetScreen}
                    options={{ tabBarLabel: '' }}
                />
                <Tab.Screen
                    name="Goals"
                    component={GoalsScreen}
                    options={{ tabBarLabel: '' }}
                />
                <Tab.Screen
                    name="Expenses"
                    component={ExpensesScreen}
                    options={{ tabBarLabel: '' }}
                />
            </Tab.Navigator>
        </View>
    );
}