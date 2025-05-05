import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './index';
import TransactionsScreen from './transactions';
import BudgetsScreen from './budgets';
import ExpensesScreen from './expenses';

const Tab = createBottomTabNavigator();

// Tab icons configuration
const TAB_ICONS = {
    Home: 'home',
    Transactions: 'cash',
    Budgets: 'pie-chart',
    Expenses: 'card',
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
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Transactions" component={TransactionsScreen} />
            <Tab.Screen name="Budgets" component={BudgetsScreen} />
            <Tab.Screen name="Expenses" component={ExpensesScreen} />
        </Tab.Navigator>
    );
}