import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export function WaterLogCardSkeleton() {
    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.skeleton, styles.titleSkeleton]} />
            </View>
            <View style={styles.content}>
                <View style={[styles.skeleton, styles.amountSkeleton]} />
                <View style={[styles.skeleton, styles.timeSkeleton]} />
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
        marginBottom: SPACING.sm,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skeleton: {
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.sm,
    },
    titleSkeleton: {
        width: 100,
        height: 20,
    },
    amountSkeleton: {
        width: 80,
        height: 24,
    },
    timeSkeleton: {
        width: 60,
        height: 16,
    },
});
