import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './ui/Card';
import { Trash2 } from 'lucide-react-native';
import { WaterDropIcon } from './icons/WaterDropIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { HydrationLog } from '../types';

interface WaterLogCardProps {
    waterLog: HydrationLog;
    onDelete: () => void;
}

export function WaterLogCard({ waterLog, onDelete }: WaterLogCardProps) {
    const time = new Date(waterLog.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <WaterDropIcon size={20} color={COLORS.water} />
                    <Text style={styles.title}>Water Intake</Text>
                </View>
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                    <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.amount}>{waterLog.amount_ml}ml</Text>
                <Text style={styles.time}>{time}</Text>
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
    },
    deleteButton: {
        padding: SPACING.xs,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: TYPOGRAPHY.fontSize.xl,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.water,
    },
    time: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
    },
});
