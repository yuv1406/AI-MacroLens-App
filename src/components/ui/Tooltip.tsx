import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface TooltipProps {
    message: string;
    backgroundColor: string;
    onHide: () => void;
    duration?: number;
}

export function Tooltip({ message, backgroundColor, onHide, duration = 3000 }: TooltipProps) {
    const opacity = new Animated.Value(0);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    }, []);

    return (
        <Animated.View style={[styles.container, { backgroundColor, opacity }]}>
            <Text style={styles.text}>{message}</Text>
            <View style={[styles.arrow, { borderTopColor: backgroundColor }]} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: '100%',
        right: 0, // Anchor to right to prevent overflow
        marginBottom: 8,
        paddingHorizontal: SPACING.md, // Wider horizontal padding
        paddingVertical: 6,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        minWidth: 150, // Wider base
        maxWidth: 250, // Screen safe
        ...SHADOWS.md,
    },
    text: {
        color: COLORS.text,
        fontSize: 18,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        textAlign: 'center',
        lineHeight: 20,
    },
    arrow: {
        position: 'absolute',
        bottom: -4,
        right: 8, // Move arrow to match right alignment
        width: 0,
        height: 0,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 4,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
});
