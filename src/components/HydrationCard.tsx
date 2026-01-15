import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WaterDropIcon } from './icons/WaterDropIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface HydrationCardProps {
    currentWater: number;
    goalWater: number;
    onAddSmall: () => void;
    onAddLarge: () => void;
}

export const HydrationCard = memo(function HydrationCard({
    currentWater,
    goalWater,
    onAddSmall,
    onAddLarge,
}: HydrationCardProps) {
    const percentage = Math.min((currentWater / goalWater) * 100, 100);
    const dropletsToFill = Math.round((percentage / 100) * 8);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <WaterDropIcon size={24} color={COLORS.water} />
                    <Text style={styles.title}>Hydration</Text>
                </View>
                <Text style={styles.value}>
                    {currentWater}/{goalWater}ml
                </Text>
            </View>

            <View style={styles.contentContainer}>
                {/* Percentage Display */}
                <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${percentage}%` }
                            ]}
                        />
                    </View>
                </View>

                {/* Droplet Grid */}
                <View style={styles.dropletGrid}>
                    {Array.from({ length: 8 }).map((_, index) => (
                        <WaterDropIcon
                            key={index}
                            size={20}
                            color={index < dropletsToFill ? COLORS.water : COLORS.border}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonSmall]}
                    onPress={onAddSmall}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>+250ml</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonLarge]}
                    onPress={onAddLarge}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>+500ml</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
        marginLeft: SPACING.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    value: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.water,
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    percentageText: {
        fontSize: TYPOGRAPHY.fontSize['4xl'],
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    progressBarContainer: {
        width: '100%',
        marginBottom: SPACING.lg,
    },
    progressBarBackground: {
        width: '100%',
        height: 6,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.full,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.water,
        borderRadius: RADIUS.full,
    },
    dropletGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: SPACING.sm,
        maxWidth: 200,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    button: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSmall: {
        backgroundColor: COLORS.surfaceLight,
    },
    buttonLarge: {
        backgroundColor: COLORS.water,
    },
    buttonText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
    },
});
