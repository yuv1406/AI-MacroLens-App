import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { DonutChart } from '../components/DonutChart';
import { VerticalPillGauge } from '../components/VerticalPillGauge';
import { HydrationDonut } from '../components/HydrationDonut';
import { MealCarousel } from '../components/MealCarousel';
import { BottomSheet, BottomSheetHandle } from '../components/BottomSheet';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PlusIcon } from '../components/icons/PlusIcon';
import { WandSparkles, SquarePen } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useMeals } from '../hooks/useMeals';
import { useHydration } from '../hooks/useHydration';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRID } from '../constants/theme';
import { GOAL_MODE_CALORIE_MULTIPLIER } from '../constants/defaults';
import { ManualLogContent } from '../components/ManualLogContent';
import { AILogContent } from '../components/AILogContent';
import { AnalysisLoadingOverlay } from '../components/ui/AnalysisLoadingOverlay';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { AnalysisStep } from '../types';

export function DashboardScreen() {
    const { user } = useAuth();
    const { profile, refetch: refetchProfile } = useUserProfile(user?.id);
    const { meals, getDailySummary, getWeeklySummary, refetch: refetchMeals, cacheVersion } = useMeals(user?.id);
    const { totalWater, addSmallCup, addLargeCup, refetch: refetchHydration } = useHydration(user?.id);

    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiAnalysis, setIsAiAnalysis] = useState(false);
    const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('uploading');
    const [loadingMessage, setLoadingMessage] = useState('');
    const manualLogSheetRef = useRef<BottomSheetHandle>(null);
    const aiLogSheetRef = useRef<BottomSheetHandle>(null);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchProfile(), refetchMeals(), refetchHydration()]);
        setRefreshing(false);
    }, [refetchProfile, refetchMeals, refetchHydration]);

    if (!profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loading}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const summary = getDailySummary();
    const targetCalories = Math.round(
        profile.maintenance_calories * GOAL_MODE_CALORIE_MULTIPLIER[profile.goal_mode]
    );

    // Get last 7 days calorie data from cached meals
    // This will re-compute when cacheVersion changes (after prefetch completes)
    const weeklyData = getWeeklySummary();

    // Calculate RDC (Recommended Daily Calories = maintenance)
    const rdcTarget = profile.maintenance_calories;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* Weekly Calendar with Greeting */}
                <WeeklyCalendar
                    weeklyCalories={weeklyData.calories}
                    dayLabels={weeklyData.labels}
                    isTodayFlags={weeklyData.isToday}
                    maintenanceCalories={profile.maintenance_calories}
                    targetCalories={targetCalories}
                />

                {/* Main Calorie Progress Card with Donut Chart */}
                <Card style={styles.progressCard}>
                    <DonutChart
                        current={summary.totalCalories}
                        target={targetCalories}
                        size={200} // Slightly smaller donut
                        strokeWidth={20} // Slightly thinner stroke
                    />
                </Card>

                {/* Macro Pill Gauges - 4 columns */}
                <Card style={styles.macrosCard}>
                    <View style={styles.pillRow}>
                        <VerticalPillGauge
                            label="Protein"
                            current={summary.totalProtein}
                            target={profile.protein_target}
                            color={COLORS.protein}
                            tooltipPosition="left"
                        />
                        <VerticalPillGauge
                            label="Carbs"
                            current={summary.totalCarbs}
                            target={profile.carbs_target}
                            color={COLORS.carbs}
                        />
                        <VerticalPillGauge
                            label="Fats"
                            current={summary.totalFat}
                            target={profile.fat_target}
                            color={COLORS.fats}
                        />
                        <VerticalPillGauge
                            label="RDC"
                            current={summary.totalCalories}
                            target={rdcTarget}
                            color={COLORS.rdc}
                            unit=""
                        />
                    </View>
                </Card>

                {/* Hydration Donut Chart */}
                <View>
                    <HydrationDonut
                        currentWater={totalWater}
                        goalWater={profile.water_target_ml}
                    />
                    <View style={styles.waterButtonsRow}>
                        <TouchableOpacity
                            style={styles.waterButton}
                            onPress={addSmallCup}
                            activeOpacity={0.7}
                        >
                            <PlusIcon size={14} color={COLORS.water} />
                            <Text style={styles.waterButtonText}>250ml</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.waterButton, styles.waterButtonLarge]}
                            onPress={addLargeCup}
                            activeOpacity={0.7}
                        >
                            <PlusIcon size={14} color={COLORS.text} />
                            <Text style={[styles.waterButtonText, styles.waterButtonTextLarge]}>500ml</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Meal Carousel */}
                <MealCarousel meals={meals} />
            </ScrollView>

            {/* Bottom Sheets */}
            <BottomSheet ref={manualLogSheetRef} title="Log Meal">
                <ManualLogContent
                    onClose={() => {
                        manualLogSheetRef.current?.close();
                        refetchMeals();
                        refetchHydration();
                    }}
                    onLoadingChange={(loading, message, step) => {
                        setIsLoading(loading);
                        setIsAiAnalysis(!!step);
                        if (message) setLoadingMessage(message);
                        if (step) setAnalysisStep(step);
                    }}
                />
            </BottomSheet>

            <BottomSheet ref={aiLogSheetRef} title="AI Meal Analysis">
                <AILogContent
                    onClose={() => {
                        aiLogSheetRef.current?.close();
                        refetchMeals();
                        refetchHydration();
                    }}
                    onLoadingChange={(loading, message, step) => {
                        setIsLoading(loading);
                        setIsAiAnalysis(true);
                        if (message) setLoadingMessage(message);
                        if (step) setAnalysisStep(step);
                    }}
                />
            </BottomSheet>

            {/* Global Loading Overlay - Renders at screen level */}
            {isLoading && (
                isAiAnalysis ? (
                    <AnalysisLoadingOverlay
                        visible={isLoading}
                        currentStep={analysisStep}
                        mode={['parsing', 'estimating', 'finalizing'].includes(analysisStep) ? 'text' : 'image'}
                    />
                ) : (
                    <LoadingSpinner message={loadingMessage} overlay />
                )
            )}

            {/* Floating Action Button */}
            <FloatingActionButton
                onAIPress={() => aiLogSheetRef.current?.snapToIndex(0)}
                onManualPress={() => manualLogSheetRef.current?.snapToIndex(0)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.lg * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    progressCard: {
        marginBottom: SPACING.lg,
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    macrosCard: {
        marginBottom: SPACING.lg,
        padding: SPACING.md,
    },
    pillRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: GRID.gap,
        minHeight: GRID.pillGaugeHeight + 60,
    },
    logButtonsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    logButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    logButtonText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.lg * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
    },
    manualButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    manualButtonText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.base * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
    },
    waterButtonsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: -SPACING.md,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    waterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.water,
    },
    waterButtonLarge: {
        backgroundColor: COLORS.water,
        borderColor: COLORS.water,
    },
    waterButtonText: {
        fontSize: Math.round(TYPOGRAPHY.fontSize.sm * 1.1),
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.water,
    },
    waterButtonTextLarge: {
        color: COLORS.text,
    },
});
