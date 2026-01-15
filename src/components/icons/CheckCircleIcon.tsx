import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export function CheckCircleIcon({ size = 24, color = '#10B981', style }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
            <Circle
                opacity="0.2"
                cx="12"
                cy="12"
                r="10"
                fill={color}
            />
            <Path
                d="M8 12L11 15L16 9"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Circle
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth="2"
            />
        </Svg>
    );
}
