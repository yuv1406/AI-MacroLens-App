import React, { memo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import Svg, { Circle, G, Defs, RadialGradient, Stop, Path, ClipPath } from 'react-native-svg';
import { WarningCircleIcon } from './icons/WarningCircleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WaterDropIcon } from './icons/WaterDropIcon';
import { Tooltip } from './ui/Tooltip';
import { GlowView } from './ui/GlowView';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface HydrationDonutProps {
    currentWater: number;
    goalWater: number;
}

export const HydrationDonut = memo(function HydrationDonut({
    currentWater,
    goalWater,
}: HydrationDonutProps) {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
    const waveAnim1 = useRef(new Animated.Value(0)).current;
    const waveAnim2 = useRef(new Animated.Value(0)).current;
    const fillAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createWaveAnim = (anim: Animated.Value, duration: number) => {
            return Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: false,
                })
            );
        };

        const anim1 = createWaveAnim(waveAnim1, 3500);
        const anim2 = createWaveAnim(waveAnim2, 2500);

        anim1.start();
        anim2.start();

        return () => {
            anim1.stop();
            anim2.stop();
        };
    }, []);

    const percentage = Math.min((currentWater / goalWater) * 100, 100);

    useEffect(() => {
        Animated.spring(fillAnim, {
            toValue: percentage,
            tension: 20,
            friction: 7,
            useNativeDriver: false,
        }).start();
    }, [percentage]);

    const actualPercentage = (currentWater / goalWater) * 100;
    const remaining = Math.max(goalWater - currentWater, 0);

    const size = 180;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = percentage / 100;
    const strokeDashoffset = circumference - progress * circumference;

    const angle = (progress * 360 - 90) * (Math.PI / 180);
    const indicatorX = size / 2 + radius * Math.cos(angle);
    const indicatorY = size / 2 + radius * Math.sin(angle);

    const holeRadius = radius - strokeWidth / 2;
    const holeBottom = size / 2 + holeRadius;
    const holeTop = size / 2 - holeRadius;

    const waveHeight1 = 5;
    const waveHeight2 = 3;
    const waveWidth = size;

    const fillHeight = fillAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [holeBottom, holeTop],
    });

    const waveTranslate1 = waveAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -waveWidth],
    });

    const waveTranslate2 = waveAnim2.interpolate({
        inputRange: [0, 1],
        outputRange: [-waveWidth, 0],
    });

    const getWavePath = (h: number) => {
        return `M 0 0 
                Q ${waveWidth / 4} ${-h}, ${waveWidth / 2} 0 
                T ${waveWidth} 0 
                T ${waveWidth * 1.5} 0 
                T ${waveWidth * 2} 0 
                V ${size} 
                H 0 
                Z`;
    };

    const path1 = getWavePath(waveHeight1);
    const path2 = getWavePath(waveHeight2);

    const now = new Date();
    const isAfter1PM = now.getHours() >= 13;
    const isCompleted = actualPercentage >= 100;

    let statusIcon = null;
    let statusColor = COLORS.primary;
    let warningMessage = "Hydration level is low for this time of day";
    let showStatus = isAfter1PM || isCompleted;

    if (isCompleted) {
        statusIcon = <CheckCircleIcon size={18} color={COLORS.primary} />;
    } else if (isAfter1PM) {
        if (actualPercentage < 30) {
            statusColor = '#c23b19';
        } else if (actualPercentage < 50) {
            statusColor = '#c26819';
        } else if (actualPercentage < 70) {
            statusColor = '#c28f19';
        } else if (actualPercentage < 100) {
            statusColor = COLORS.primary;
            warningMessage = "You are almost there, complete your water intake";
        } else {
            showStatus = false;
        }

        if (showStatus) {
            statusIcon = (
                <View style={styles.warningContainer}>
                    <GlowView color={statusColor} active={!hasSeenTooltip}>
                        <Pressable onPress={() => { setTooltipVisible(true); setHasSeenTooltip(true); }}>
                            <WarningCircleIcon size={18} color={statusColor} />
                        </Pressable>
                    </GlowView>
                    {tooltipVisible && (
                        <Tooltip
                            message={warningMessage}
                            backgroundColor={statusColor}
                            onHide={() => setTooltipVisible(false)}
                        />
                    )}
                </View>
            );
        }
    }

    useEffect(() => {
        setHasSeenTooltip(false);
    }, [statusColor, showStatus]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <WaterDropIcon size={20} color={COLORS.water} />
                    <Text style={styles.title}>Hydration</Text>
                </View>
                {showStatus && statusIcon}
            </View>

            {/* Bounded Donut Box */}
            <View style={styles.donutContainer}>
                <View style={{ width: size, height: size, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={COLORS.surfaceLight} strokeWidth={strokeWidth} fill="none" />
                            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={COLORS.water} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                        </G>
                        <Defs>
                            <ClipPath id="donutHole">
                                <Circle cx={size / 2} cy={size / 2} r={holeRadius} />
                            </ClipPath>
                            <RadialGradient id="waterShadowGradient" cx="0.5" cy="0.5" r="0.5">
                                <Stop offset="0%" stopColor="#000" stopOpacity="0.6" />
                                <Stop offset="70%" stopColor="#000" stopOpacity="0.3" />
                                <Stop offset="100%" stopColor="#000" stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <G clipPath="url(#donutHole)">
                            <AnimatedG translateX={waveTranslate2} translateY={fillHeight}>
                                <Path d={path2} fill={COLORS.water} opacity={0.25} />
                            </AnimatedG>
                            <AnimatedG translateX={waveTranslate1} translateY={fillHeight}>
                                <Path d={path1} fill={COLORS.water} opacity={0.4} />
                            </AnimatedG>
                        </G>
                        {progress > 0 && (
                            <>
                                <Circle cx={indicatorX} cy={indicatorY} r={strokeWidth / 2 + 6} fill="url(#waterShadowGradient)" />
                                <Circle cx={indicatorX} cy={indicatorY} r={strokeWidth / 2} fill={COLORS.water} />
                            </>
                        )}
                    </Svg>

                    {/* DETERMINISTIC CENTERING OVERLAY */}
                    <View
                        pointerEvents="none"
                        style={[
                            StyleSheet.absoluteFillObject,
                            { justifyContent: 'center', alignItems: 'center' },
                        ]}
                    >
                        {/* Anchor Point: center of this View matches circle center */}
                        <View style={{ alignItems: 'center' }}>
                            {/* Primary Value: PIXEL PERFECT CENTER */}
                            <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>

                            {/* Secondary Items: Absolute positioned so they don't pull the primary value */}
                            <View style={{ position: 'absolute', top: '85%', marginTop: -4, alignItems: 'center', width: size }}>
                                <Text style={styles.remainingText}>{remaining} ml</Text>
                                <Text style={styles.labelText}>Remaining</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{currentWater}</Text>
                    <Text style={styles.statLabel}>consumed</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{goalWater}</Text>
                    <Text style={styles.statLabel}>goal</Text>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    title: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.lg * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
    },
    warningContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: SPACING.lg,
    },
    percentageText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize['3xl'] * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        // No lineHeight to avoid asymmetrical shifting
    },
    remainingText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.base * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.water,
        textAlign: 'center',
        marginTop: -7,
    },
    labelText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.xs * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
        marginTop: -10,
        textAlign: 'center',
        lineHeight: Math.round(TYPOGRAPHY.fontSize.xs * 1.1 * 1.2),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: Math.round(TYPOGRAPHY.fontSize['2xl'] * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
    },
    statLabel: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.xs * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
        marginTop: 0,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.border,
    },
});
