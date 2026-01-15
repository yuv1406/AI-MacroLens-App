import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Target, Flame, Droplets, Info, LogOut, Save, TrendingDown, TrendingUp, Activity } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BottomSheet, BottomSheetHandle } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { GoalMode, ActivityLevel, Sex } from '../types';
import { AI_DAILY_LIMIT } from '../constants/defaults';
import { calculateHealthStats, HealthStats, ACTIVITY_MULTIPLIERS } from '../utils/healthCalculations';

export function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { profile, updateProfile } = useUserProfile(user?.id);
    const { toasts, showSuccess, showError, dismissToast } = useToast();

    // State for Profile & Goals is now derived from core attributes
    const [goalMode, setGoalMode] = useState<GoalMode>('maintain');

    // Core Attributes
    const [height, setHeight] = useState('175');
    const [weight, setWeight] = useState('70');
    const [age, setAge] = useState('25');
    const [sex, setSex] = useState<Sex>('male');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

    const [saving, setSaving] = useState(false);

    // UI State
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const goalsSheetRef = useRef<BottomSheetHandle>(null);

    useEffect(() => {
        if (profile) {
            setGoalMode(profile.goal_mode);

            if (profile.height_cm) setHeight(profile.height_cm.toString());
            if (profile.weight_kg) setWeight(profile.weight_kg.toString());
            if (profile.age) setAge(profile.age.toString());
            if (profile.sex) setSex(profile.sex);
            if (profile.activity_level) setActivityLevel(profile.activity_level);
        }
    }, [profile]);

    // Real-time calculations
    const stats: HealthStats = calculateHealthStats(
        parseFloat(height) || 0,
        parseFloat(weight) || 0,
        parseInt(age) || 0,
        sex,
        activityLevel,
        goalMode
    );

    const handleSave = async () => {
        const h = parseInt(height);
        const w = parseFloat(weight);
        const a = parseInt(age);

        if (isNaN(h) || isNaN(w) || isNaN(a) || h <= 0 || w <= 0 || a <= 0) {
            showError('Please enter valid physical stats');
            return;
        }

        setSaving(true);
        const { error } = await updateProfile({
            height_cm: h,
            weight_kg: w,
            age: a,
            sex: sex,
            activity_level: activityLevel,
            maintenance_calories: stats.tdee, // Use TDEE as maintenance
            protein_target: stats.protein,
            carbs_target: stats.carbs,
            fat_target: stats.fats,
            water_target_ml: stats.water,
            goal_mode: goalMode,
        });

        setSaving(false);

        if (error) {
            showError('Failed to update settings');
        } else {
            showSuccess('Settings updated successfully!');
            // Close all sheets on success
            goalsSheetRef.current?.close();
        }
    };

    const handleSignOut = async () => {
        setShowSignOutDialog(false);
        await signOut();
    };

    if (!profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loading}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const goalLabels: Record<GoalMode, string> = {
        cut: 'Cutting (15% deficit)',
        maintain: 'Maintaining',
        gain: 'Gaining (15% surplus)',
    };

    const activityLevelLabels: Record<ActivityLevel, string> = {
        sedentary: 'Sedentary',
        light: 'Lightly Active',
        moderate: 'Moderately Active',
        active: 'Very Active',
        super_active: 'Extremely Active',
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionHeader}>Preferences</Text>

                {/* Main Stats Summary */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => goalsSheetRef.current?.snapToIndex(0)}
                    activeOpacity={0.7}
                >
                    <View style={styles.settingIconContainer}>
                        <Target size={22} color={COLORS.primary} />
                    </View>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Personal Stats</Text>
                        <Text style={styles.settingValue}>
                            {height}cm • {weight}kg • {age}y • {sex.charAt(0).toUpperCase() + sex.slice(1)}
                        </Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => goalsSheetRef.current?.snapToIndex(0)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                        <Flame size={22} color={COLORS.warning} />
                    </View>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Daily Goal: {goalLabels[goalMode]}</Text>
                        <Text style={styles.settingValue}>{stats.calories} kcal / day</Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>

                <View style={styles.settingRowNoAction}>
                    <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Save size={22} color={COLORS.success} />
                    </View>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Calculated Macros</Text>
                        <Text style={styles.settingValue}>P: {stats.protein}g • C: {stats.carbs}g • F: {stats.fats}g</Text>
                    </View>
                </View>

                <View style={styles.settingRowNoAction}>
                    <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
                        <Droplets size={22} color={COLORS.water} />
                    </View>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>Daily Water Target</Text>
                        <Text style={styles.settingValue}>{stats.water} ml</Text>
                    </View>
                </View>

                {/* Edit Button */}
                <Button
                    title="Edit Profile & Goals"
                    onPress={() => goalsSheetRef.current?.snapToIndex(0)}
                    variant="outline"
                    style={{ marginTop: SPACING.md }}
                />

                <Text style={styles.sectionHeader}>System</Text>

                <Card style={styles.aiCard}>
                    <View style={styles.aiHeader}>
                        <Info size={18} color={COLORS.primary} />
                        <Text style={styles.aiTitle}>AI Usage</Text>
                    </View>
                    <Text style={styles.infoText}>
                        Daily Limit: <Text style={styles.bold}>{AI_DAILY_LIMIT}</Text> analyses per day. This helps control costs while providing top-tier meal tracking.
                    </Text>
                </Card>

                <TouchableOpacity
                    style={[styles.settingRow, styles.signOutRow]}
                    onPress={() => setShowSignOutDialog(true)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                        <LogOut size={22} color={COLORS.error} />
                    </View>
                    <View style={styles.settingTextContainer}>
                        <Text style={[styles.settingLabel, { color: COLORS.error }]}>Sign Out</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.2.0</Text>
            </ScrollView>

            {/* Bottom Sheet for Editing Profile & Goals */}
            <BottomSheet ref={goalsSheetRef} title="Edit Profile & Goals">
                <ScrollView contentContainerStyle={styles.sheetContent}>
                    {/* 1. Core Physical Attributes */}
                    <Text style={styles.sheetSectionTitle}>Physical Stats</Text>
                    <View style={styles.inputRow}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Height (cm)"
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                                placeholder="175"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING.md }}>
                            <Input
                                label="Weight (kg)"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                placeholder="70"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING.md }}>
                            <Input
                                label="Age"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                                placeholder="25"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Sex</Text>
                    <View style={styles.goalSelectorRow}>
                        {(['male', 'female'] as Sex[]).map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={[
                                    styles.goalOption,
                                    sex === s && { borderColor: COLORS.primary, backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                                ]}
                                onPress={() => setSex(s)}
                            >
                                <Text style={[
                                    styles.goalOptionLabel,
                                    sex === s && { color: COLORS.primary }
                                ]}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 2. Activity Level */}
                    <Text style={[styles.label, { marginTop: SPACING.md }]}>Lifestyle / Activity Level</Text>
                    <View style={styles.activityGrid}>
                        {(['sedentary', 'light', 'moderate', 'active', 'super_active'] as ActivityLevel[]).map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.activityOption,
                                    activityLevel === level && { borderColor: COLORS.success, backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                                ]}
                                onPress={() => setActivityLevel(level)}
                            >
                                <Text style={[
                                    styles.activityLabelText,
                                    activityLevel === level && { color: COLORS.success }
                                ]}>
                                    {activityLevelLabels[level]}
                                </Text>
                                <Text style={styles.activityDescText}>
                                    x{ACTIVITY_MULTIPLIERS[level]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 3. Goal Selection */}
                    <Text style={[styles.label, { marginTop: SPACING.md }]}>Weight Goal</Text>
                    <View style={styles.goalSelectorRow}>
                        {[
                            { id: 'cut', label: 'Lose Weight', icon: TrendingDown, color: COLORS.info },
                            { id: 'maintain', label: 'Maintain', icon: Activity, color: COLORS.success },
                            { id: 'gain', label: 'Gain Weight', icon: TrendingUp, color: COLORS.warning },
                        ].map((mode) => (
                            <TouchableOpacity
                                key={mode.id}
                                style={[
                                    styles.goalOption,
                                    goalMode === mode.id && { borderColor: mode.color, backgroundColor: `${mode.color}10` }
                                ]}
                                onPress={() => setGoalMode(mode.id as GoalMode)}
                            >
                                <mode.icon
                                    size={18}
                                    color={goalMode === mode.id ? mode.color : COLORS.textTertiary}
                                />
                                <Text style={[
                                    styles.goalOptionLabel,
                                    goalMode === mode.id && { color: mode.color }
                                ]}>
                                    {mode.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 4. Calculated Results - Read Only */}
                    <View style={styles.calculatedCard}>
                        <Text style={styles.calculatedTitle}>Automatically Calculated Targets</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>BMR</Text>
                                <Text style={styles.statVal}>{stats.bmr}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>TDEE</Text>
                                <Text style={styles.statVal}>{stats.tdee}</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Text style={styles.statLabel}>Daily KCal</Text>
                                <Text style={[styles.statVal, { color: COLORS.primary }]}>{stats.calories}</Text>
                            </View>
                        </View>

                        <View style={styles.macrosPreview}>
                            <View style={styles.macroPill}>
                                <View style={[styles.macroDot, { backgroundColor: COLORS.protein }]} />
                                <Text style={styles.macroText}>P: {stats.protein}g</Text>
                            </View>
                            <View style={styles.macroPill}>
                                <View style={[styles.macroDot, { backgroundColor: COLORS.carbs }]} />
                                <Text style={styles.macroText}>C: {stats.carbs}g</Text>
                            </View>
                            <View style={styles.macroPill}>
                                <View style={[styles.macroDot, { backgroundColor: COLORS.fats }]} />
                                <Text style={styles.macroText}>F: {stats.fats}g</Text>
                            </View>
                        </View>

                        <View style={styles.waterPreview}>
                            <Droplets size={14} color={COLORS.water} />
                            <Text style={styles.waterText}>Water Goal: {stats.water}ml</Text>
                        </View>
                    </View>

                    <Button
                        title={saving ? 'Applying...' : 'Apply & Save Settings'}
                        onPress={handleSave}
                        loading={saving}
                        disabled={saving}
                        style={styles.sheetButton}
                    />
                </ScrollView>
            </BottomSheet>

            {/* Dialogs & Toasts */}
            <ConfirmDialog
                visible={showSignOutDialog}
                title="Sign Out"
                message="Are you sure you want to sign out? Your progress will be saved in the cloud."
                confirmText="Sign Out"
                onConfirm={handleSignOut}
                onCancel={() => setShowSignOutDialog(false)}
            />

            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onDismiss={() => dismissToast(toast.id)}
                />
            ))}
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
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
    },
    header: {
        paddingHorizontal: SPACING.sm,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
    },
    scrollContent: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.lg,
    },
    sectionHeader: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: SPACING.md,
        marginTop: SPACING.lg,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    settingRowNoAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        opacity: 0.8, // Slightly lower opacity to indicate read-only
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
    },
    settingValue: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    signOutRow: {
        marginTop: SPACING.md,
    },
    aiCard: {
        marginTop: SPACING.sm,
        padding: SPACING.md,
        backgroundColor: COLORS.surfaceLight,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    aiTitle: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    infoText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    bold: {
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
    },
    versionText: {
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textTertiary,
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    sheetContent: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.lg,
        paddingBottom: 100,
    },
    sheetSectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    activityOption: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        alignItems: 'center',
    },
    activityLabelText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    activityDescText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    calculatedCard: {
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginTop: SPACING.xl,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    calculatedTitle: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    statVal: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
    },
    macrosPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    macroPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    macroDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    macroText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
    },
    waterPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    waterText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.water,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
    },
    sheetButton: {
        marginTop: SPACING.md,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    goalSelectorRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    goalOption: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        position: 'relative',
        ...SHADOWS.sm,
    },
    goalOptionLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        textTransform: 'uppercase',
    },
    goalOptionDesc: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    activeDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
