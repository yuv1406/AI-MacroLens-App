import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export function WarningCircleIcon({ size = 24, color = '#EF4444', style }: IconProps) {
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
                d="M12 8V12"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <Circle cx="12" cy="16" r="1" fill={color} />
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
