import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CircularProgress } from './CircularProgress';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface LoadingSpinnerProps {
    message?: string;
    overlay?: boolean;
}

export function LoadingSpinner({ message, overlay = false }: LoadingSpinnerProps) {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Smooth entrance animation
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const content = (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                }
            ]}
        >
            <View style={styles.card}>
                {/* Circular Progress Bar */}
                <View style={styles.progressContainer}>
                    <CircularProgress size={80} strokeWidth={6} />
                </View>
                {message && <Text style={styles.message}>{message}</Text>}
            </View>
        </Animated.View>
    );

    if (overlay) {
        return (
            <View style={styles.overlay}>
                {content}
            </View>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker overlay for better focus
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING['2xl'],
        alignItems: 'center',
        minWidth: 240,
        ...SHADOWS.lg,
    },
    progressContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: SPACING.lg,
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.lg,
    },
});
