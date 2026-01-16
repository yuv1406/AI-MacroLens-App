import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { MealCard } from '../components/MealCard';
import { WaterLogCard } from '../components/WaterLogCard';
import { MealCardSkeleton } from '../components/MealCardSkeleton';
import { WaterLogCardSkeleton } from '../components/WaterLogCardSkeleton';
import { BottomSheet, BottomSheetHandle } from '../components/BottomSheet';
import { ManualLogContent } from '../components/ManualLogContent';
import { AILogContent } from '../components/AILogContent';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { useAuth } from '../hooks/useAuth';
import { useMeals } from '../hooks/useMeals';
import { useHydration } from '../hooks/useHydration';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { useToast } from '../hooks/useToast';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

export function DailyLogScreen() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { meals, deleteMeal, getDailySummary, loading, refetch: refetchMeals } = useMeals(user?.id, selectedDate);
    const { waterLogs, deleteWaterLog, refetch: refetchHydration } = useHydration(user?.id, selectedDate);
    const { toasts, dismissToast, showSuccess, showError } = useToast();

    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'meal' | 'water'; id: string } | null>(null);
    const manualLogSheetRef = useRef<BottomSheetHandle>(null);
    const aiLogSheetRef = useRef<BottomSheetHandle>(null);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchMeals(), refetchHydration()]);
        setRefreshing(false);
    }, [refetchMeals, refetchHydration]);

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const handleDelete = (mealId: string) => {
        setDeleteTarget({ type: 'meal', id: mealId });
        setDeleteDialogVisible(true);
    };

    const handleDeleteWater = (logId: string) => {
        setDeleteTarget({ type: 'water', id: logId });
        setDeleteDialogVisible(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleteDialogVisible(false);

        if (deleteTarget.type === 'meal') {
            const { error } = await deleteMeal(deleteTarget.id);
            if (error) {
                showError('Failed to delete meal');
            } else {
                showSuccess('Meal deleted successfully');
                // Auto-refresh to update dashboard
                await refetchMeals();
            }
        } else {
            const { error } = await deleteWaterLog(deleteTarget.id);
            if (error) {
                showError('Failed to delete water log');
            } else {
                showSuccess('Water log deleted successfully');
                // Auto-refresh to update dashboard
                await refetchHydration();
            }
        }

        setDeleteTarget(null);
    };

    const cancelDelete = () => {
        setDeleteDialogVisible(false);
        setDeleteTarget(null);
    };

    const summary = getDailySummary();

    // Merge meals and water logs into a single chronological timeline
    const timeline = React.useMemo(() => {
        const combined: Array<
            | { type: 'meal'; data: typeof meals[0]; timestamp: Date }
            | { type: 'water'; data: typeof waterLogs[0]; timestamp: Date }
        > = [
                ...meals.map((meal) => ({
                    type: 'meal' as const,
                    data: meal,
                    timestamp: new Date(meal.created_at),
                })),
                ...waterLogs.map((log) => ({
                    type: 'water' as const,
                    data: log,
                    timestamp: new Date(log.created_at),
                })),
            ];

        // Sort by timestamp, most recent first
        return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [meals, waterLogs]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.dateRow}>
                    <TouchableOpacity onPress={() => navigateDate(-1)} style={styles.navButton}>
                        <ChevronLeftIcon size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <View style={styles.dateCenterColumn}>
                        <Text style={styles.title}>
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </Text>
                        <Text style={styles.date}>
                            {selectedDate.toLocaleDateString('en-US', { year: 'numeric' })}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigateDate(1)}
                        style={styles.navButton}
                        disabled={selectedDate.toDateString() === new Date().toDateString()}
                    >
                        <ChevronRightIcon
                            size={24}
                            color={selectedDate.toDateString() === new Date().toDateString() ? COLORS.textTertiary : COLORS.text}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                >
                    {/* Loading skeletons */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Today's Activity</Text>
                        <MealCardSkeleton />
                        <WaterLogCardSkeleton />
                        <MealCardSkeleton />
                        <WaterLogCardSkeleton />
                    </View>
                </ScrollView>
            ) : meals.length === 0 && waterLogs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No logs for today</Text>
                    <Text style={styles.emptyHint}>
                        Use the Home tab to log meals and water intake
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                >
                    {/* Unified Timeline - Meals and Water Logs */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Today's Activity</Text>
                        {timeline.map((item, index) => {
                            if (item.type === 'meal') {
                                return (
                                    <MealCard
                                        key={`meal-${item.data.id}`}
                                        meal={item.data}
                                        onDelete={() => handleDelete(item.data.id)}
                                    />
                                );
                            } else {
                                return (
                                    <WaterLogCard
                                        key={`water-${item.data.id}`}
                                        waterLog={item.data}
                                        onDelete={() => handleDeleteWater(item.data.id)}
                                    />
                                );
                            }
                        })}
                    </View>

                    {/* Daily Summary */}
                    <Card style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Daily Total</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>
                                    {summary.totalCalories}
                                </Text>
                                <Text style={styles.summaryLabel}>Calories</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>
                                    {(summary.totalProtein || 0).toFixed(0)}g
                                </Text>
                                <Text style={styles.summaryLabel}>Protein</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>
                                    {(summary.totalCarbs || 0).toFixed(0)}g
                                </Text>
                                <Text style={styles.summaryLabel}>Carbs</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>
                                    {(summary.totalFat || 0).toFixed(0)}g
                                </Text>
                                <Text style={styles.summaryLabel}>Fat</Text>
                            </View>
                        </View>
                    </Card>
                </ScrollView>
            )}

            {/* Floating Action Button */}
            <FloatingActionButton
                onAIPress={() => aiLogSheetRef.current?.snapToIndex(0)}
                onManualPress={() => manualLogSheetRef.current?.snapToIndex(0)}
            />

            {/* Bottom Sheets */}
            <BottomSheet ref={manualLogSheetRef} title="Log Meal">
                <ManualLogContent selectedDate={selectedDate} onClose={() => manualLogSheetRef.current?.close()} />
            </BottomSheet>

            <BottomSheet ref={aiLogSheetRef} title="AI Meal Analysis">
                <AILogContent selectedDate={selectedDate} onClose={() => aiLogSheetRef.current?.close()} />
            </BottomSheet>

            {/* Toast Notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onDismiss={() => dismissToast(toast.id)}
                />
            ))}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                visible={deleteDialogVisible}
                title={deleteTarget?.type === 'meal' ? 'Delete Meal' : 'Delete Water Log'}
                message={deleteTarget?.type === 'meal'
                    ? 'Are you sure you want to delete this meal?'
                    : 'Are you sure you want to delete this water intake?'}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.lg,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateCenterColumn: {
        flex: 1,
        alignItems: 'center',
    },
    navButton: {
        padding: SPACING.sm,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    date: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING['2xl'],
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    emptyHint: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
    summaryCard: {
        padding: SPACING.md,
        marginTop: SPACING.md,
        backgroundColor: COLORS.surfaceLight,
        borderColor: COLORS.border,
    },
    summaryTitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        marginBottom: SPACING.md,
        textAlign: 'center', // Centered title for better balance
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: TYPOGRAPHY.fontSize.xl,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    summaryLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    bottomButtons: {
        flexDirection: 'row',
        padding: SPACING.lg,
        gap: SPACING.md,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    logButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    aiButton: {
        backgroundColor: COLORS.primary,
    },
    aiButtonText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.background,
    },
    manualButton: {
        backgroundColor: COLORS.surfaceLight,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    manualButtonText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
    },
});
