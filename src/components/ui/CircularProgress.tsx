import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

interface CircularProgressProps {
    size?: number;
    strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CircularProgress({ size = 80, strokeWidth = 6 }: CircularProgressProps) {
    const progress = useRef(new Animated.Value(0)).current;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        // Simulate progress over 2.5 seconds (looping)
        const animate = () => {
            progress.setValue(0);
            Animated.timing(progress, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: true,
            }).start(() => {
                animate(); // Loop the animation
            });
        };
        animate();
    }, []);

    const strokeDashoffset = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
        <Svg width={size} height={size} style={styles.svg}>
            {/* Background Circle */}
            <Circle
                stroke={COLORS.surfaceLight}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
            />
            {/* Progress Circle */}
            <AnimatedCircle
                stroke={COLORS.primary}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
            />
        </Svg>
    );
}

const styles = StyleSheet.create({
    svg: {
        transform: [{ rotate: '0deg' }],
    },
});
