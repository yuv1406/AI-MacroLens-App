import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WarningCircleIcon } from './icons/WarningCircleIcon';
import { Tooltip } from './ui/Tooltip';
import { GlowView } from './ui/GlowView';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

interface VerticalPillGaugeProps {
    label: string;
    current: number;
    target: number;
    color: string;
    unit?: string;
    tooltipPosition?: 'left' | 'right'; // Control tooltip alignment
}

export const VerticalPillGauge = memo(function VerticalPillGauge({
    label,
    current,
    target,
    color,
    unit = 'g',
    tooltipPosition = 'right',
}: VerticalPillGaugeProps) {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [hasSeenTooltip, setHasSeenTooltip] = useState(false);

    const percentage = Math.min((current / target) * 100, 100);
    const actualPercentage = (current / target) * 100;
    const isOverTarget = current > target;

    // Late day under-consumption check (After 9:30 PM and < 50%)
    const now = new Date();
    const isLateDay = now.getHours() > 21 || (now.getHours() === 21 && now.getMinutes() >= 30);
    const isUnderTargetLate = isLateDay && actualPercentage < 50;

    const showOverWarning = isOverTarget;
    const showUnderWarning = isUnderTargetLate;
    const showWarning = showOverWarning || showUnderWarning;

    // Icon colors: Red for over, Cold Blue for under
    const warningIconColor = showOverWarning ? COLORS.error : COLORS.primary;
    const warningMessage = showOverWarning ? 'More than target' : 'Intake too low';

    // Reset "seen" state if the warning type or color changes
    useEffect(() => {
        setHasSeenTooltip(false);
    }, [warningIconColor, showWarning]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                {showWarning && (
                    <View style={styles.warningContainer}>
                        <GlowView
                            color={warningIconColor}
                            active={!hasSeenTooltip}
                        >
                            <Pressable
                                onPress={() => {
                                    setTooltipVisible(true);
                                    setHasSeenTooltip(true);
                                }}
                            >
                                <WarningCircleIcon size={14} color={warningIconColor} style={styles.warningIcon} />
                            </Pressable>
                        </GlowView>
                        {tooltipVisible && (
                            <Tooltip
                                message={warningMessage}
                                backgroundColor={warningIconColor}
                                onHide={() => setTooltipVisible(false)}
                                position={tooltipPosition}
                            />
                        )}
                    </View>
                )}
            </View>
            <View style={styles.pillContainer}>
                <View style={styles.pillBackground}>
                    <View
                        style={[
                            styles.pillFill,
                            {
                                height: `${percentage}%`,
                                backgroundColor: color, // Back to fixed color as requested
                            },
                        ]}
                    />
                </View>
            </View>
            <View style={styles.valueContainer}>
                <Text style={[styles.value]}>
                    {(current || 0).toFixed(0)}
                </Text>
                <Text style={styles.unit}>/ {(target || 0).toFixed(0)}{unit}</Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        minWidth: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs, // Reduced from sm for tighter spacing
        gap: 2,
    },
    warningContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    warningIcon: {
        marginTop: -2,
    },
    pillContainer: {
        flex: 1,
        width: 32,
        justifyContent: 'flex-end',
        marginBottom: SPACING.xs, // Reduced from sm for tighter spacing
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
        borderRadius: RADIUS.full,
    },
    valueContainer: {
        alignItems: 'center',
    },
    value: {
        fontSize: TYPOGRAPHY.fontSize.xl, // Increased from lg for better readability
        fontFamily: TYPOGRAPHY.fontFamily.bold, // Changed to bold for more prominence
        color: COLORS.text,
    },
    unit: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textTertiary,
        marginTop: 0, // Removed margin for tighter spacing
    },
});
