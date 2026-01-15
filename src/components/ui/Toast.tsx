import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    type: ToastType;
    message: string;
    duration?: number;
    onDismiss: () => void;
}

const TOAST_CONFIG = {
    success: {
        Icon: CheckCircle,
        color: COLORS.success,
    },
    error: {
        Icon: XCircle,
        color: COLORS.error,
    },
    warning: {
        Icon: AlertCircle,
        color: COLORS.warning,
    },
    info: {
        Icon: Info,
        color: COLORS.info,
    },
};

export function Toast({ type, message, duration = 3000, onDismiss }: ToastProps) {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const config = TOAST_CONFIG[type];
    const Icon = config.Icon;

    useEffect(() => {
        // Slide in animation
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto dismiss
        const timer = setTimeout(() => {
            dismissToast();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const dismissToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <Pressable onPress={dismissToast} style={[styles.toast, { borderLeftColor: config.color }]}>
                <Icon size={24} color={config.color} strokeWidth={2} />
                <Text style={styles.message} numberOfLines={3}>
                    {message}
                </Text>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50, // Moved from top: 50
        left: SPACING.md,
        right: SPACING.md,
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderLeftWidth: 4,
        padding: SPACING.md,
        gap: SPACING.md,
        ...SHADOWS.lg,
    },
    message: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.text,
        lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
    },
});

