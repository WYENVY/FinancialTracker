import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

// Tab icons configuration
const TAB_ICONS = {
    Home: 'home',
    Transactions: 'cash',
    Budgets: 'pie-chart',
    Goals: 'trophy',
    Settings: 'settings',
} as const;

export default function TabLayout() {
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
            <Tab.Screen name="Home" getComponent={() => require('./index').default} />
            <Tab.Screen name="Transactions" getComponent={() => require('./transactions').default} />
            <Tab.Screen name="Budgets" getComponent={() => require('./budgets').default} />
            <Tab.Screen name="Goals" getComponent={() => require('./goals').default} />
            <Tab.Screen name="Settings" getComponent={() => require('./settings').default} />
        </Tab.Navigator>
    );
}