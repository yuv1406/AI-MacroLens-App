import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Meal } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface MealCardProps {
    meal: Meal;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
    const [expanded, setExpanded] = useState(false);

    const formattedTime = new Date(meal.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    const confidenceColor =
        meal.confidence === 'high'
            ? COLORS.confidenceHigh
            : meal.confidence === 'medium'
                ? COLORS.confidenceMedium
                : COLORS.confidenceLow;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {meal.image_url && (
                    <Image source={{ uri: meal.image_url }} style={styles.thumbnail} />
                )}
                <View style={styles.info}>
                    <View style={styles.row}>
                        <Text style={styles.time}>{formattedTime}</Text>
                        {meal.confidence && (
                            <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
                                <Text style={styles.confidenceText}>{meal.confidence}</Text>
                            </View>
                        )}
                        {expanded ? (
                            <ChevronUp size={20} color={COLORS.textSecondary} />
                        ) : (
                            <ChevronDown size={20} color={COLORS.textSecondary} />
                        )}
                    </View>
                    {meal.meal_description && (
                        <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
                            {meal.meal_description}
                        </Text>
                    )}
                    <View style={styles.macros}>
                        <Text style={styles.calories}>{meal.calories} cal</Text>
                        <Text style={styles.macro}>P: {(meal.protein || 0).toFixed(0)}g</Text>
                        <Text style={styles.macro}>C: {(meal.carbs || 0).toFixed(0)}g</Text>
                        <Text style={styles.macro}>F: {(meal.fat || 0).toFixed(0)}g</Text>
                    </View>

                    {/* Expanded section showing full details */}
                    {expanded && (
                        <View style={styles.expandedSection}>
                            {meal.description && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>User Notes:</Text>
                                    <Text style={styles.detailValue}>{meal.description}</Text>
                                </View>
                            )}
                            {meal.source && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Source:</Text>
                                    <Text style={styles.detailValue}>
                                        {meal.source === 'ai' ? 'AI Analysis' : 'Manual Entry'}
                                    </Text>
                                </View>
                            )}
                            {meal.ai_model && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>AI Model:</Text>
                                    <Text style={styles.detailValue}>{meal.ai_model}</Text>
                                </View>
                            )}
                            {meal.description && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Additional Info:</Text>
                                    <Text style={styles.detailValue}>{meal.description}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>
            {(onEdit || onDelete) && (
                <View style={styles.actions}>
                    {onEdit && (
                        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                            <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    content: {
        flexDirection: 'row',
        padding: SPACING.md,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.surfaceLight,
        marginRight: SPACING.md,
    },
    info: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    time: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
    },
    confidenceBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        marginLeft: SPACING.sm,
    },
    confidenceText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        lineHeight: TYPOGRAPHY.lineHeight.relaxed * 16,
    },
    macros: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    calories: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.primary,
    },
    macro: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.medium,  // Changed from regular for better visibility
        color: COLORS.textSecondary,
    },
    expandedSection: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    detailRow: {
        marginBottom: SPACING.sm,
    },
    detailLabel: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.textTertiary,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.text,
        lineHeight: TYPOGRAPHY.lineHeight.relaxed * 14,
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    actionButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.primary,
    },
    deleteText: {
        color: COLORS.warning,
    },
});
