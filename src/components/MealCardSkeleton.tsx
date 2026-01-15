import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export function MealCardSkeleton() {
    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.skeleton, styles.titleSkeleton]} />
                <View style={[styles.skeleton, styles.timeSkeleton]} />
            </View>
            <View style={styles.macros}>
                <View style={[styles.skeleton, styles.caloriesSkeleton]} />
                <View style={styles.macroRow}>
                    <View style={[styles.skeleton, styles.macroSkeleton]} />
                    <View style={[styles.skeleton, styles.macroSkeleton]} />
                    <View style={[styles.skeleton, styles.macroSkeleton]} />
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        padding: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    macros: {
        gap: SPACING.xs,
    },
    macroRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    skeleton: {
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.sm,
    },
    titleSkeleton: {
        width: 120,
        height: 20,
    },
    timeSkeleton: {
        width: 60,
        height: 16,
    },
    caloriesSkeleton: {
        width: 80,
        height: 18,
    },
    macroSkeleton: {
        width: 50,
        height: 16,
    },
});
