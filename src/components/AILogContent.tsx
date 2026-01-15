import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useMeals } from '../hooks/useMeals';
import { logMealWithAI } from '../services/mealAnalysis';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { MealAnalysisResponse, AnalysisStep } from '../types';

interface AILogContentProps {
    selectedDate?: Date;
    onClose?: () => void;
    onLoadingChange?: (loading: boolean, message?: string, step?: AnalysisStep) => void;
}

export function AILogContent({ selectedDate = new Date(), onClose, onLoadingChange }: AILogContentProps) {
    const { user } = useAuth();
    const { addMeal } = useMeals(user?.id, selectedDate);
    const { toasts, dismissToast, showSuccess, showError, showWarning } = useToast();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<MealAnalysisResponse | null>(null);

    const [editableCalories, setEditableCalories] = useState('');
    const [editableProtein, setEditableProtein] = useState('');
    const [editableCarbs, setEditableCarbs] = useState('');
    const [editableFat, setEditableFat] = useState('');
    const [saving, setSaving] = useState(false); // Prevent double-save

    /**
     * Compress image to reduce upload time and processing burden
     * Resizes to max 1200px width while maintaining aspect ratio
     */
    const compressImage = async (uri: string): Promise<string> => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1200 } }], // Resize to max 1200px width, height auto-scales
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipResult.uri;
        } catch (error) {
            console.warn('Image compression failed, using original:', error);
            return uri; // Fallback to original if compression fails
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showWarning('Please grant photo library access');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // Skip crop screen
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            const compressedUri = await compressImage(result.assets[0].uri);
            setImageUri(compressedUri);
            setResult(null);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            showWarning('Please grant camera access');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false, // Skip crop screen
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            const compressedUri = await compressImage(result.assets[0].uri);
            setImageUri(compressedUri);
            setResult(null);
        }
    };

    const analyzeMeal = async () => {
        if (!imageUri || !user) return;

        setAnalyzing(true);
        onLoadingChange?.(true, 'Analyzing your meal...', 'uploading');
        try {
            const { data, imageUrl, error } = await logMealWithAI(
                user.id,
                imageUri,
                description,
                (step) => onLoadingChange?.(true, undefined, step)
            );

            if (error || !data) {
                throw new Error(error || 'Analysis failed');
            }

            setResult(data);
            setUploadedImageUrl(imageUrl); // Store the uploaded image URL
            setEditableCalories(data.calories.toString());
            setEditableProtein(data.protein.toString());
            setEditableCarbs(data.carbs.toString());
            setEditableFat(data.fat.toString());
        } catch (err: any) {
            showError(err.message || 'Analysis failed');
        } finally {
            setAnalyzing(false);
            onLoadingChange?.(false);
        }
    };

    const saveMeal = async () => {
        if (!result || !user || saving) return; // Prevent double-save

        const calories = parseInt(editableCalories);
        const protein = parseFloat(editableProtein);
        const carbs = parseFloat(editableCarbs);
        const fat = parseFloat(editableFat);

        if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
            showError('Please enter valid numbers');
            return;
        }

        setSaving(true);
        console.log('🔵 SAVE MEAL CALLED - Data:', {
            description,
            meal_description: result.meal_description,
            image_url: uploadedImageUrl,
        });

        const { error } = await addMeal({
            calories,
            protein,
            carbs,
            fat,
            confidence: result.confidence,
            source: 'ai',
            ai_model: result.ai_model_used,
            description: description, // User's notes/input
            meal_description: result.meal_description, // AI's analysis
            image_url: uploadedImageUrl ?? undefined, // Convert null to undefined for type compatibility
        });

        setSaving(false);
        console.log('🟢 SAVE MEAL COMPLETED - Error:', error);

        if (error) {
            showError('Failed to save meal');
        } else {
            showSuccess('Meal logged successfully!');
            setImageUri(null);
            setUploadedImageUrl(null);
            setDescription('');
            setResult(null);
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

            {!imageUri ? (
                <>
                    <Button
                        title="Take Photo"
                        onPress={takePhoto}
                        variant="primary"
                        style={styles.button}
                    />
                    <Button
                        title="Choose from Gallery"
                        onPress={pickImage}
                        variant="secondary"
                    />
                </>
            ) : (
                <>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    <Button
                        title="Change Image"
                        onPress={() => setImageUri(null)}
                        variant="outline"
                        style={styles.button}
                    />

                    {!result && (
                        <>
                            <Input
                                label="Description (optional)"
                                value={description}
                                onChangeText={setDescription}
                                placeholder="e.g., Dal and rice"
                                multiline
                                numberOfLines={2}
                            />
                            <Button
                                title={analyzing ? 'Analyzing...' : 'Analyze with AI'}
                                onPress={analyzeMeal}
                                loading={analyzing}
                                disabled={analyzing}
                            />
                        </>
                    )}

                    {result && (
                        <>
                            <Text style={styles.sectionTitle}>AI Analysis</Text>
                            {result.meal_description && (
                                <Text style={styles.aiDescription}>
                                    {result.meal_description}
                                </Text>
                            )}
                            <View
                                style={[
                                    styles.confidenceBadge,
                                    { backgroundColor: COLORS[`confidence${result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)}` as keyof typeof COLORS] },
                                ]}
                            >
                                <Text style={styles.confidenceText}>
                                    {result.confidence.toUpperCase()} CONFIDENCE
                                </Text>
                            </View>

                            <Text style={styles.sectionTitle}>Nutritional Info</Text>
                            <Text style={styles.hint}>You can edit these values</Text>
                            <Input
                                label="Calories"
                                value={editableCalories}
                                onChangeText={setEditableCalories}
                                keyboardType="numeric"
                            />
                            <Input
                                label="Protein (g)"
                                value={editableProtein}
                                onChangeText={setEditableProtein}
                                keyboardType="numeric"
                            />
                            <Input
                                label="Carbs (g)"
                                value={editableCarbs}
                                onChangeText={setEditableCarbs}
                                keyboardType="numeric"
                            />
                            <Input
                                label="Fat (g)"
                                value={editableFat}
                                onChangeText={setEditableFat}
                                keyboardType="numeric"
                            />
                            <Button title="Save Meal" onPress={saveMeal} />
                        </>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        marginBottom: SPACING.md,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.surfaceLight,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    aiDescription: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
        lineHeight: TYPOGRAPHY.lineHeight.relaxed * 16,
    },
    confidenceBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.sm,
        alignSelf: 'flex-start',
        marginBottom: SPACING.md,
    },
    confidenceText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        letterSpacing: 0.5,
    },
    hint: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textTertiary,
        marginBottom: SPACING.md,
        fontStyle: 'italic',
    },
});
