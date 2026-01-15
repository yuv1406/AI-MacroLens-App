import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

interface IconButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    size?: number;
    style?: ViewStyle;
    disabled?: boolean;
}

export function IconButton({
    onPress,
    children,
    size = 48,
    style,
    disabled = false,
}: IconButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                { width: size, height: size, borderRadius: size / 2 },
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            {children}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    disabled: {
        opacity: 0.5,
    },
});
