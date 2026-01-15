import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { WaterDropIcon } from './icons/WaterDropIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WaveHydrationCardProps {
    currentWater: number;
    goalWater: number;
    onAddSmall: () => void;
    onAddLarge: () => void;
}

export function WaveHydrationCard({
    currentWater,
    goalWater,
    onAddSmall,
    onAddLarge,
}: WaveHydrationCardProps) {
    const percentage = Math.min((currentWater / goalWater) * 100, 100);
    const waveAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(waveAnimation, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: false,
            })
        ).start();
    }, []);

    const fillHeight = 200 - (200 * percentage) / 100;
    const waveHeight = 8;
    const waveLength = 80;

    const animatedD = waveAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [
            `M 0 ${fillHeight}
             Q ${waveLength / 2} ${fillHeight - waveHeight}, ${waveLength} ${fillHeight}
             Q ${waveLength * 1.5} ${fillHeight + waveHeight}, ${waveLength * 2} ${fillHeight}
             L ${waveLength * 2} 200
             L 0 200
Z`,
            `M 0 ${fillHeight}
             Q ${waveLength / 2} ${fillHeight + waveHeight}, ${waveLength} ${fillHeight}
             Q ${waveLength * 1.5} ${fillHeight - waveHeight}, ${waveLength * 2} ${fillHeight}
             L ${waveLength * 2} 200
             L 0 200
Z`,
        ],
    });

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

            <View style={styles.waveContainer}>
                <Svg width={160} height={200} viewBox="0 0 160 200">
                    <Defs>
                        <LinearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={COLORS.water} stopOpacity="0.8" />
                            <Stop offset="100%" stopColor={COLORS.water} stopOpacity="0.4" />
                        </LinearGradient>
                    </Defs>
                    <AnimatedPath
                        d={animatedD as any}
                        fill="url(#waveGradient)"
                    />
                </Svg>

                <View style={styles.percentageOverlay}>
                    <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
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
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
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
    waveContainer: {
        width: 160,
        height: 200,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        alignSelf: 'center',
        marginBottom: SPACING.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
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
