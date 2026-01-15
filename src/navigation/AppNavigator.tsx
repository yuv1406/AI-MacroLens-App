import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';
import { HomeIcon } from '../components/icons/HomeIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { AuthScreen } from '../screens/AuthScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DailyLogScreen } from '../screens/DailyLogScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AILogMealScreen } from '../screens/AILogMealScreen';
import { ManualLogMealScreen } from '../screens/ManualLogMealScreen';
import { useAuth } from '../hooks/useAuth';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused, color }: { label: string; focused: boolean; color: string }) {
    const size = 29; // 20% larger than 24 (24 * 1.2 = 28.8 ≈ 29)

    if (label === 'Home') {
        return <HomeIcon size={size} color={color} />;
    } else if (label === 'Log') {
        return <ClipboardListIcon size={size} color={color} />;
    } else {
        return <SettingsIcon size={size} color={color} />;
    }
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    height: 80,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textTertiary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: TYPOGRAPHY.fontWeight.medium,
                    marginTop: 0,
                    marginBottom: 4,
                },
                tabBarHideOnKeyboard: true,
                tabBarShowLabel: false, // Hide tab labels
            }}
        >
            <Tab.Screen
                name="Home"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => <TabIcon label="Home" focused={focused} color={color} />,
                }}
            />
            <Tab.Screen
                name="Log"
                component={DailyLogScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => <TabIcon label="Log" focused={focused} color={color} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => <TabIcon label="Settings" focused={focused} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                    primary: COLORS.primary,
                    background: COLORS.background,
                    card: COLORS.surface,
                    text: COLORS.text,
                    border: COLORS.border,
                    notification: COLORS.primary,
                },
                fonts: {
                    regular: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontWeight: 'normal' },
                    medium: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontWeight: 'normal' },
                    bold: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontWeight: 'normal' },
                    heavy: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontWeight: 'normal' },
                },
            }}
        >
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: COLORS.surface,
                    },
                    headerTintColor: COLORS.text,
                    headerTitleStyle: {
                        fontFamily: TYPOGRAPHY.fontFamily.semibold,
                    },
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: COLORS.background,
                    },
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen
                        name="Auth"
                        component={AuthScreen}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={MainTabs}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="AILogMeal"
                            component={AILogMealScreen}
                            options={{
                                title: 'AI Meal Log',
                                presentation: 'modal',
                            }}
                        />
                        <Stack.Screen
                            name="ManualLogMeal"
                            component={ManualLogMealScreen}
                            options={{
                                title: 'Manual Entry',
                                presentation: 'modal',
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
