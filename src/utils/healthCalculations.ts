import { ActivityLevel, Sex, GoalMode } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    super_active: 1.9,
};

export interface HealthStats {
    bmr: number;
    tdee: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    water: number;
}

export function calculateHealthStats(
    height: number,
    weight: number,
    age: number,
    sex: Sex,
    activity: ActivityLevel,
    goal: GoalMode
): HealthStats {
    // 1. Calculate BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (sex === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    // 2. Calculate TDEE
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];

    // 3. Goal Adjustment (Percentage-based to match defaults.ts)
    let calories = tdee;
    if (goal === 'cut') {
        calories = tdee * 0.85; // 15% deficit
    } else if (goal === 'gain') {
        calories = tdee * 1.15; // 15% surplus
    }

    // 4. Water Intake (35ml per kg)
    const water = 35 * weight;

    // 5. Macros
    // Protein: 1.8g/kg bodyweight (standard fitness recommendation)
    const protein = weight * 1.8;

    // Fats: 25% of total calories
    const fats = (calories * 0.25) / 9;

    // Carbs: Remaining calories
    const carbsCurrentCal = (protein * 4) + (fats * 9);
    const carbs = (calories - carbsCurrentCal) / 4;

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fats: Math.round(fats),
        water: Math.round(water),
    };
}
