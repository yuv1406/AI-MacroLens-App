import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoalMode } from '../../types';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';
import { GOAL_MODE_LABELS } from '../../constants/defaults';

interface BadgeProps {
    goalMode: GoalMode;
}

export function Badge({ goalMode }: BadgeProps) {
    const backgroundColor =
        goalMode === 'cut'
            ? COLORS.info  // Blue for cutting
            : goalMode === 'gain'
                ? COLORS.success // Green for gaining
                : COLORS.surfaceLight; // Gray for maintaining

    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={styles.text}>{GOAL_MODE_LABELS[goalMode]}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        alignSelf: 'flex-start',
    },
    text: {
        color: COLORS.text,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
