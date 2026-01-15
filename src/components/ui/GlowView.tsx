import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface GlowViewProps {
    color: string;
    active: boolean;
    children: React.ReactNode;
    style?: ViewStyle;
}

export function GlowView({ color, active, children, style }: GlowViewProps) {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (active) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(0);
        }
    }, [active, pulseAnim]);

    const glowStyle = {
        opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.6],
        }),
        transform: [
            {
                scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.4], // Reduced scale
                }),
            },
        ],
    };

    return (
        <View style={[styles.container, style]}>
            {active && (
                <Animated.View
                    style={[
                        styles.glow,
                        { backgroundColor: color },
                        glowStyle,
                    ]}
                />
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 24, // Reduced base size
        height: 24, // Reduced base size
        borderRadius: 12,
    },
});

