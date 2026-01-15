import React, { memo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DonutChartProps {
    current: number;
    target: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export const DonutChart = memo(function DonutChart({
    current,
    target,
    size = 200,
    strokeWidth = 20,
    color = COLORS.primary,
}: DonutChartProps) {
    const progress = Math.min(current / target, 1);
    const percentage = Math.round((current / target) * 100);
    const isOverTarget = current > target;
    const remaining = Math.max(target - current, 0);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;

    // Dynamic color based on percentage
    const getProgressColor = () => {
        if (percentage >= 100) return '#c23b19'; // Red - over 100%
        if (percentage >= 75) return '#c26819';  // Dark orange - 75%+
        if (percentage >= 50) return '#c28f19';  // Orange - 50%+
        return color; // Default blue/primary
    };

    const fillColor = getProgressColor();

    // Calculate position of indicator circle at end of progress
    const angle = (progress * 360 - 90) * (Math.PI / 180); // -90 to start from top
    const indicatorX = size / 2 + radius * Math.cos(angle);
    const indicatorY = size / 2 + radius * Math.sin(angle);

    return (
        <View style={{ alignItems: 'center' }}>
            {/* The Donut Circle & Overlay - Perfectly Bounded Square */}
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={size} height={size}>
                    <Defs>
                        <RadialGradient id="shadowGradient" cx="0.5" cy="0.5" r="0.5">
                            <Stop offset="0%" stopColor="#000" stopOpacity="0.6" />
                            <Stop offset="70%" stopColor="#000" stopOpacity="0.3" />
                            <Stop offset="100%" stopColor="#000" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* Background circle */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={COLORS.surfaceLight}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        {/* Progress circle */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={fillColor}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                    {/* Indicator circle with shadow at progress endpoint */}
                    {progress > 0 && (
                        <>
                            <Circle
                                cx={indicatorX}
                                cy={indicatorY}
                                r={strokeWidth / 2 + 6}
                                fill="url(#shadowGradient)"
                            />
                            <Circle
                                cx={indicatorX}
                                cy={indicatorY}
                                r={strokeWidth / 2}
                                fill={fillColor}
                            />
                        </>
                    )}
                </Svg>

                {/* Text overlay - centered relative to SVG circle center */}
                <View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFillObject,
                        {
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
                    ]}
                >
                    {/* Anchor point: This View's center matches the circle's center */}
                    <View style={{ alignItems: 'center' }}>
                        {/* Primary: Remaining calories - sits exactly at circle center (X and Y) */}
                        <Text style={styles.valueText}>
                            {isOverTarget ? 0 : remaining}
                        </Text>

                        {/* Secondary/Tertiary labels - positioned below center point */}
                        <View style={{ position: 'absolute', top: '85%', marginTop: -4, alignItems: 'center', width: size }}>
                            <Text style={styles.labelText}>
                                {isOverTarget ? 'Over Target' : 'Calories Remaining'}
                            </Text>
                            <Text style={styles.subText}>
                                {current} / {target}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Percentage message below the chart */}
            <Text style={[styles.percentageText, { color: fillColor }]}>
                You have consumed {percentage}% of your daily target
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    valueText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize['3xl'] * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
    },
    labelText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.xs * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
        marginTop: 3,
        lineHeight: Math.round(TYPOGRAPHY.fontSize.xs * 1.1 * 1.2),
        textAlign: 'center',
    },
    subText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.xs * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textTertiary,
        marginTop: -2,
        lineHeight: Math.round(TYPOGRAPHY.fontSize.xs * 1.1 * 1.2),
        textAlign: 'center',
    },
    percentageText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.xs * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
});
