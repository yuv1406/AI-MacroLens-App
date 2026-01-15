import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface WeeklyCalendarProps {
    userName?: string;
    weeklyCalories: number[]; // Array of 7 days (calories consumed)
    dayLabels: string[]; // Day labels (S, M, T, etc.)
    isTodayFlags: boolean[]; // Boolean flags for today
    maintenanceCalories: number;
    targetCalories: number; // Daily calorie goal
}

export function WeeklyCalendar({
    userName,
    weeklyCalories,
    dayLabels,
    isTodayFlags,
    maintenanceCalories,
    targetCalories,
}: WeeklyCalendarProps) {
    const today = new Date();
    const currentHour = today.getHours();

    // Dynamic greeting with icon
    const getGreeting = () => {
        if (currentHour < 12) {
            return { text: 'Good Morning', Icon: SunIcon };
        } else if (currentHour < 18) {
            return { text: 'Good Afternoon', Icon: SunIcon };
        } else {
            return { text: 'Good Evening', Icon: MoonIcon };
        }
    };

    const { text: greetingText, Icon: GreetingIcon } = getGreeting();

    // Calculate fill percentage for each day
    const getDayFillPercentage = (calories: number) => {
        if (calories === 0) return 0;
        return Math.min((calories / targetCalories) * 100, 100);
    };

    // Get dynamic color based on percentage
    const getDayColor = (calories: number) => {
        const percentage = (calories / targetCalories) * 100;
        if (percentage >= 100) return '#c23b19'; // Red - over 100%
        if (percentage >= 75) return '#c26819';  // Dark orange - 75%+
        if (percentage >= 50) return '#c28f19';  // Orange - 50%+
        return COLORS.accentSage; // Default sage green
    };

    return (
        <View style={styles.container}>
            <View style={styles.greetingRow}>
                <View style={styles.greetingContent}>
                    <GreetingIcon size={28} color={COLORS.primary} />
                    <Text style={styles.greeting}>
                        {greetingText}{' '}
                        <Text style={styles.name}>Yuvraj</Text>
                    </Text>
                </View>
            </View>

            <View style={styles.daysContainer}>
                {dayLabels.map((label, index) => {
                    const isToday = isTodayFlags[index];
                    const fillPercentage = getDayFillPercentage(weeklyCalories[index]);
                    const barColor = getDayColor(weeklyCalories[index]);

                    return (
                        <View key={index} style={styles.dayColumn}>
                            <Text
                                style={[
                                    styles.dayLabel,
                                    isToday && styles.dayLabelActive
                                ]}
                            >
                                {label}
                            </Text>
                            {/* Thin Vertical Pill Gauge */}
                            <View style={styles.pillContainer}>
                                <View style={styles.pillBackground}>
                                    <View
                                        style={[
                                            styles.pillFill,
                                            {
                                                height: `${fillPercentage}%`,
                                                backgroundColor: barColor,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md, // Reduced padding for compactness
        marginBottom: SPACING.lg,
    },
    greetingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    greetingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    greeting: {
        fontSize: TYPOGRAPHY.fontSize.base, // Reduced to make name stand out
        fontFamily: TYPOGRAPHY.fontFamily.regular, // Changed to regular for less weight
        color: COLORS.textSecondary, // Lighter color for secondary role
    },
    name: {
        fontSize: TYPOGRAPHY.fontSize['2xl'], // Much larger than greeting
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    dayColumn: {
        alignItems: 'center',
        gap: SPACING.sm,
    },
    dayLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    dayLabelActive: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
    },
    pillContainer: {
        width: 4, // Thin pill width
        height: 30, // Pill height
        justifyContent: 'flex-end',
    },
    pillBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.full,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    pillFill: {
        width: '100%',
        backgroundColor: COLORS.accentSage, // Sage green from new palette
        borderRadius: RADIUS.full,
    },
});
