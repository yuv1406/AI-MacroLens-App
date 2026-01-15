import React, { useState } from 'react';
import {
    View,
} from 'react-native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useMeals } from '../hooks/useMeals';
import { analyzeMealTextOnly } from '../services/mealAnalysis';
import { WandSparkles } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import { AnalysisStep } from '../types';

interface ManualLogContentProps {
    selectedDate?: Date;
    onClose?: () => void;
    onLoadingChange?: (loading: boolean, message?: string, step?: AnalysisStep) => void;
}

export function ManualLogContent({ selectedDate = new Date(), onClose, onLoadingChange }: ManualLogContentProps) {
    const { user } = useAuth();
    const { addMeal } = useMeals(user?.id, selectedDate);
    const { toasts, dismissToast, showSuccess, showError, showWarning, showInfo } = useToast();

    const [description, setDescription] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [saving, setSaving] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleGetAIEstimate = async () => {
        if (!description || description.trim().length < 10) {
            showWarning('Please describe your meal with quantities (e.g., "300g rice with 200g dal and 1 tbsp ghee")');
            return;
        }

        if (!user?.id) {
            showError('You must be logged in');
            return;
        }

        setAnalyzing(true);
        onLoadingChange?.(true, 'Analyzing meal description...', 'parsing');
        const { data, error } = await analyzeMealTextOnly(
            user.id,
            description,
            (step) => onLoadingChange?.(true, undefined, step)
        );
        setAnalyzing(false);
        onLoadingChange?.(false);

        if (error || !data) {
            showError(error || 'Could not analyze meal description. Please try again or enter macros manually.');
            return;
        }

        // Pre-fill the macro fields with AI estimates
        setCalories(data.calories.toString());
        setProtein(data.protein.toString());
        setCarbs(data.carbs.toString());
        setFat(data.fat.toString());

        showInfo(`${data.meal_description || 'Meal analyzed'}. You can edit the values before saving.`);
    };

    const handleSave = async () => {
        // Validate description is provided
        if (!description.trim()) {
            showWarning('Please enter a meal description');
            return;
        }

        // At least one nutritional value must be provided (calories or macros)
        const caloriesNum = calories ? parseInt(calories) : 0;
        const proteinNum = protein && !isNaN(parseFloat(protein)) ? parseFloat(protein) : 0;
        const carbsNum = carbs && !isNaN(parseFloat(carbs)) ? parseFloat(carbs) : 0;
        const fatNum = fat && !isNaN(parseFloat(fat)) ? parseFloat(fat) : 0;

        // Check if at least some nutritional data is provided
        if (caloriesNum === 0 && proteinNum === 0 && carbsNum === 0 && fatNum === 0) {
            showWarning('Please either click "Get AI Estimate" for automatic values, or enter at least calories manually');
            return;
        }

        // Validate calories if provided
        if (calories && (isNaN(caloriesNum) || caloriesNum < 0)) {
            showError('Please enter a valid number for calories');
            return;
        }

        setSaving(true);
        const { error } = await addMeal({
            calories: caloriesNum,
            protein: proteinNum,
            carbs: carbsNum,
            fat: fatNum,
            source: 'manual',
            description: description.trim(),
        });

        setSaving(false);

        if (error) {
            showError('Failed to save meal');
        } else {
            showSuccess('Meal logged successfully!');
            setDescription('');
            setCalories('');
            setProtein('');
            setCarbs('');
            setFat('');
            onClose?.();
        }
    };

    return (
        <View>
            {/* Toast Notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onDismiss={() => dismissToast(toast.id)}
                />
            ))}

            <Input
                label="Meal Description *"
                value={description}
                onChangeText={setDescription}
                placeholder="e.g., 300g rice with 200g dal and 1 tbsp ghee"
                multiline
                numberOfLines={2}
            />

            {description.trim().length >= 10 && (
                <View style={{ marginTop: -SPACING.xs, marginBottom: SPACING.md }}>
                    <Button
                        title={analyzing ? 'Analyzing...' : '✨ Get AI Estimate'}
                        onPress={handleGetAIEstimate}
                        loading={analyzing}
                        disabled={analyzing || saving}
                        variant="secondary"
                    />
                </View>
            )}

            <Input
                label="Calories (or use AI Estimate)"
                value={calories}
                onChangeText={setCalories}
                placeholder="Optional - use AI or enter manually"
                keyboardType="numeric"
            />

            <Input
                label="Protein (g) - optional"
                value={protein}
                onChangeText={setProtein}
                placeholder="Leave blank if unknown"
                keyboardType="numeric"
            />

            <Input
                label="Carbs (g) - optional"
                value={carbs}
                onChangeText={setCarbs}
                placeholder="Leave blank if unknown"
                keyboardType="numeric"
            />

            <Input
                label="Fat (g) - optional"
                value={fat}
                onChangeText={setFat}
                placeholder="Leave blank if unknown"
                keyboardType="numeric"
            />

            <Button
                title={saving ? 'Saving...' : 'Save Meal'}
                onPress={handleSave}
                loading={saving}
                disabled={saving}
            />
        </View>
    );
}
