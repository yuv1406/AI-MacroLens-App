import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { PlusIcon } from '../icons/PlusIcon';
import { X } from 'lucide-react-native';
import { MagicStickIcon } from '../icons/MagicStickIcon';
import { PenIcon } from '../icons/PenIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface FloatingActionButtonProps {
    onAIPress: () => void;
    onManualPress: () => void;
}

export function FloatingActionButton({ onAIPress, onManualPress }: FloatingActionButtonProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim1 = useRef(new Animated.Value(0)).current;
    const scaleAnim2 = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isExpanded) {
            Animated.parallel([
                Animated.spring(rotateAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.stagger(50, [
                    Animated.parallel([
                        Animated.spring(scaleAnim1, {
                            toValue: 1,
                            useNativeDriver: true,
                            tension: 50,
                            friction: 7,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.spring(scaleAnim2, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 7,
                    }),
                ]),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(rotateAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.parallel([
                    Animated.timing(scaleAnim1, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim2, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [isExpanded]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    const handleAIPress = () => {
        setIsExpanded(false);
        onAIPress();
    };

    const handleManualPress = () => {
        setIsExpanded(false);
        onManualPress();
    };

    return (
        <View style={styles.container}>
            {/* Backdrop */}
            {isExpanded && (
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setIsExpanded(false)}
                />
            )}

            {/* Main FAB */}
            <Pressable
                style={styles.fab}
                onPress={() => setIsExpanded(!isExpanded)}
            >
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <PlusIcon size={28} color={COLORS.text} />
                </Animated.View>
            </Pressable>

            {/* Action Buttons - Rendered after FAB so they appear on top */}
            <Animated.View
                style={[
                    styles.actionButton,
                    styles.aiButton,
                    {
                        transform: [
                            { scale: scaleAnim1 },
                            { translateY: -80 },
                        ],
                        opacity: opacityAnim,
                    },
                ]}
                pointerEvents={isExpanded ? 'auto' : 'none'}
            >
                <Pressable
                    style={styles.actionButtonInner}
                    onPress={handleAIPress}
                >
                    <MagicStickIcon size={24} color={COLORS.text} />
                    <Text style={styles.aiButtonText}>Log with AI</Text>
                </Pressable>
            </Animated.View>

            <Animated.View
                style={[
                    styles.actionButton,
                    styles.manualButton,
                    {
                        transform: [
                            { scale: scaleAnim2 },
                            { translateY: -150 },
                        ],
                        opacity: opacityAnim,
                    },
                ]}
                pointerEvents={isExpanded ? 'auto' : 'none'}
            >
                <Pressable
                    style={styles.actionButtonInner}
                    onPress={handleManualPress}
                >
                    <PenIcon size={24} color={COLORS.text} />
                    <Text style={styles.manualButtonText}>Manual Entry</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        alignItems: 'flex-end',
    },
    backdrop: {
        position: 'absolute',
        top: -1000,
        left: -1000,
        right: -1000,
        bottom: -1000,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.lg,
        elevation: 8,
        zIndex: 2,
    },
    actionButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: RADIUS.xl,
        ...SHADOWS.md,
        elevation: 6,
        zIndex: 3,
    },
    actionButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        minWidth: 180,
    },
    aiButton: {
        backgroundColor: COLORS.primary,
    },
    aiButtonText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text, // White text
    },
    manualButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    manualButtonText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
    },
});
