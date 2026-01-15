import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export function PlusIcon({ size = 24, color = 'white', style }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
            <Path
                d="M12 4V20"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M4 12H20"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
