import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import OverviewTab from '@/app/pages/index';
import TransactionsScreen from '@/app/pages/transactions';
import BudgetScreen from '@/app/pages/budgets';
import ExpensesScreen from '@/app/pages/expenses';

const Tab = createBottomTabNavigator();

// Simplified icon configuration for JavaScript
const getTabIcon = (routeName, focused) => {
    const iconMap = {
        Overview: 'home',
        Expenses: 'card',
        Transactions: 'cash',
        Budgets: 'pie-chart'
    };

    return (
        <Ionicons
            name={iconMap[routeName]}
            size={24}
            color={focused ? '#76c75f' : '#64748b'}
        />
    );
};

export default function HomeScreen() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => getTabIcon(route.name, focused),
                tabBarActiveTintColor: '#76c75f',
                tabBarInactiveTintColor: '#64748b',
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 4,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Overview"
                component={OverviewTab}
                options={{ tabBarLabel: 'Overview' }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{ tabBarLabel: 'Transactions' }}
            />
            <Tab.Screen
                name="Budgets"
                component={BudgetScreen}
                options={{ tabBarLabel: 'Budgets' }}
            />
            <Tab.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{ tabBarLabel: 'Expenses' }}
            />
        </Tab.Navigator>
    );
}