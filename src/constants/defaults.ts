import { GoalMode } from '../types';

// Default user profile values (from user_settings table)
export const DEFAULT_MAINTENANCE_CALORIES = 2000;
export const DEFAULT_PROTEIN_TARGET = 150;
export const DEFAULT_WATER_TARGET_ML = 3000; // in ml (matches DB default)

// Client-side only defaults (not in DB)
export const DEFAULT_CARBS_TARGET = 200;
export const DEFAULT_FAT_TARGET = 60;
export const DEFAULT_GOAL_MODE: GoalMode = 'maintain';

// Calorie adjustments for each goal mode (percentage of maintenance)
export const GOAL_MODE_CALORIE_MULTIPLIER = {
    cut: 0.85, // 15% deficit
    maintain: 1.0, // No change
    gain: 1.15, // 15% surplus
};

// AI usage limits
export const AI_DAILY_LIMIT = 7;

// Hydration quick add amounts (in ml)
export const HYDRATION_QUICK_ADD = {
    small: 250,
    large: 500,
};

// Meal time categories
export const MEAL_TIMES = {
    breakfast: { start: 5, end: 11 },
    lunch: { start: 11, end: 16 },
    snack: { start: 16, end: 18 },
    dinner: { start: 18, end: 23 },
    lateNight: { start: 23, end: 5 },
};

// Status badge text
export const GOAL_MODE_LABELS: Record<GoalMode, string> = {
    cut: 'Cutting',
    maintain: 'Maintaining',
    gain: 'Gaining',
};
