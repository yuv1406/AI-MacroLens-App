import React, { memo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { UtensilsCrossed } from 'lucide-react-native';
import { Meal } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface MealCarouselProps {
    meals: Meal[];
}

const CARD_WIDTH = Dimensions.get('window').width * 0.7;

export const MealCarousel = memo(function MealCarousel({ meals }: MealCarouselProps) {
    if (meals.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No meals logged today</Text>
                <Text style={styles.emptySubtext}>Start by logging your first meal!</Text>
            </View>
        );
    }

    const renderMealCard = ({ item }: { item: Meal }) => {
        const formattedTime = new Date(item.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        return (
            <View style={styles.card}>
                {item.image_url ? (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.image_url }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlay} />
                    </View>
                ) : (
                    <View style={[styles.imageContainer, styles.placeholderContainer]}>
                        <UtensilsCrossed size={48} color={COLORS.textSecondary} />
                    </View>
                )}

                <View style={styles.calorieTag}>
                    <Text style={styles.calorieText}>{item.calories}</Text>
                    <Text style={styles.calUnit}>cal</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.time}>{formattedTime}</Text>
                    {item.meal_description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {item.meal_description}
                        </Text>
                    )}
                    <View style={styles.macros}>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroValue}>{(item.protein || 0).toFixed(0)}g</Text>
                            <Text style={styles.macroLabel}>Protein</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroValue}>{(item.carbs || 0).toFixed(0)}g</Text>
                            <Text style={styles.macroLabel}>Carbs</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroValue}>{(item.fat || 0).toFixed(0)}g</Text>
                            <Text style={styles.macroLabel}>Fat</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Today's Meals</Text>
            <FlatList
                data={meals}
                renderItem={renderMealCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + SPACING.md}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.lg * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    listContent: {
        paddingRight: SPACING.lg,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.md,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    imageContainer: {
        width: '100%',
        height: 160,
        backgroundColor: COLORS.surfaceLight,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    placeholderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 48,
    },
    calorieTag: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: RADIUS.full,
        flexDirection: 'row',
        alignItems: 'baseline',
        ...SHADOWS.md,
    },
    calorieText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.xl * 0.9),
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        marginRight: 2,
    },
    calUnit: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.xs * 0.9),
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.text,
    },
    content: {
        padding: SPACING.md,
    },
    time: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.sm * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    description: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.base * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        lineHeight: Math.round(TYPOGRAPHY.lineHeight.normal * 16 * 1.1),
    },
    macros: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    macroItem: {
        alignItems: 'center',
    },
    macroLabel: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.xs * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textTertiary,
        marginBottom: 2,
    },
    macroValue: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.sm * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    emptySubtext: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textTertiary,
    },
});
