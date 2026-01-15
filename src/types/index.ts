export type GoalMode = 'cut' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'super_active';
export type Sex = 'male' | 'female';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
    user_id: string;
    maintenance_calories: number;
    protein_target: number;
    carbs_target: number;
    fat_target: number;
    water_target_ml: number;
    goal_mode: GoalMode;
    // Core physical attributes
    height_cm?: number;
    weight_kg?: number;
    age?: number;
    sex?: Sex;
    activity_level?: ActivityLevel;
    created_at: string;
}

export interface Meal {
    id: string;
    user_id: string;
    image_url?: string;
    description?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence?: ConfidenceLevel;
    source: 'ai' | 'manual';
    ai_model?: 'gemini' | 'openai';
    meal_description?: string;
    created_at: string;
}

export interface HydrationLog {
    id: string;
    user_id: string;
    amount_ml: number;
    created_at: string;  // Changed from 'logged_at'
}

export interface DailySummary {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalWater: number;
    mealsCount: number;
}

export interface MealAnalysisRequest {
    user_id: string;
    image_url: string;
    description?: string;
}

export interface MealAnalysisResponse {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: ConfidenceLevel;
    meal_description?: string;
    source: 'ai';
    ai_model_used?: 'gemini' | 'openai';
}

export type AnalysisStep = 'uploading' | 'analyzing' | 'extracting' | 'completing' | 'done' | 'parsing' | 'estimating' | 'finalizing';
