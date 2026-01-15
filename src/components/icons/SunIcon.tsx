import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export function SunIcon({ size = 24, color = '#3B82F6', style }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
            <Circle
                opacity="0.5"
                cx="12"
                cy="12"
                r="5"
                fill={color}
            />
            <Path
                d="
    M12 2V4
    M12 20V22
    M4 12H2
    M22 12H20
    M19.07 4.93L17.66 6.34
    M6.34 17.66L4.93 19.07
    M19.07 19.07L17.66 17.66
    M6.93 5.07L5.07 6.93
  "
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </Svg>
    );
}
