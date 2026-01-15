import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useMeals } from '../hooks/useMeals';
import { logMealWithAI } from '../services/mealAnalysis';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { MealAnalysisResponse, AnalysisStep } from '../types';
import { AnalysisLoadingOverlay } from '../components/ui/AnalysisLoadingOverlay';

export function AILogMealScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { addMeal } = useMeals(user?.id);

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('uploading');
    const [result, setResult] = useState<MealAnalysisResponse | null>(null);

    const [editableCalories, setEditableCalories] = useState('');
    const [editableProtein, setEditableProtein] = useState('');
    const [editableCarbs, setEditableCarbs] = useState('');
    const [editableFat, setEditableFat] = useState('');

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant photo library access');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setResult(null);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera access');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setResult(null);
        }
    };

    const analyzeMeal = async () => {
        if (!imageUri || !user) return;

        setAnalyzing(true);
        setAnalysisStep('uploading');
        setResult(null);
        try {
            const { data, imageUrl, error } = await logMealWithAI(
                user.id,
                imageUri,
                description,
                (step) => setAnalysisStep(step)
            );

            if (error || !data) {
                throw new Error(error || 'Analysis failed');
            }

            setResult(data);
            setEditableCalories(data.calories.toString());
            setEditableProtein(data.protein.toString());
            setEditableCarbs(data.carbs.toString());
            setEditableFat(data.fat.toString());
        } catch (err: any) {
            Alert.alert('Analysis Failed', err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const saveMeal = async () => {
        if (!result || !user) return;

        const calories = parseInt(editableCalories);
        const protein = parseFloat(editableProtein);
        const carbs = parseFloat(editableCarbs);
        const fat = parseFloat(editableFat);

        if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
            Alert.alert('Invalid Values', 'Please enter valid numbers');
            return;
        }

        const { error } = await addMeal({
            calories,
            protein,
            carbs,
            fat,
            confidence: result.confidence,
            source: 'ai',
            ai_model: result.ai_model_used,
            meal_description: result.meal_description,
            description,
        });

        if (error) {
            Alert.alert('Error', 'Failed to save meal');
        } else {
            Alert.alert('Success', 'Meal logged successfully!');
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Log Meal with AI</Text>

                {!imageUri ? (
                    <Card>
                        <Button
                            title="📷 Take Photo"
                            onPress={takePhoto}
                            variant="primary"
                            style={styles.button}
                        />
                        <Button
                            title="🖼️ Choose from Gallery"
                            onPress={pickImage}
                            variant="secondary"
                        />
                    </Card>
                ) : (
                    <>
                        <Card>
                            <Image source={{ uri: imageUri }} style={styles.image} />
                            <Button
                                title="Change Image"
                                onPress={() => setImageUri(null)}
                                variant="outline"
                                style={styles.button}
                            />
                        </Card>

                        {!result && (
                            <Card>
                                <Input
                                    label="Description (optional)"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="e.g., Dal and rice"
                                    multiline
                                    numberOfLines={2}
                                />
                                <Button
                                    title={analyzing ? 'Analyzing...' : '🔍 Analyze with AI'}
                                    onPress={analyzeMeal}
                                    loading={analyzing}
                                    disabled={analyzing}
                                />
                            </Card>
                        )}

                        {result && (
                            <>
                                <Card>
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
                                </Card>

                                <Card>
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
                                    <Button title="✓ Save Meal" onPress={saveMeal} />
                                </Card>
                            </>
                        )}
                    </>
                )}
            </ScrollView>
            <AnalysisLoadingOverlay
                visible={analyzing && !result}
                currentStep={analysisStep}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    button: {
        marginBottom: SPACING.md,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.surfaceLight,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.semibold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    aiDescription: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
        lineHeight: TYPOGRAPHY.lineHeight.relaxed * 16,
    },
    confidenceBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.sm,
        alignSelf: 'flex-start',
    },
    confidenceText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        letterSpacing: 0.5,
    },
    hint: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textTertiary,
        marginBottom: SPACING.md,
        fontStyle: 'italic',
    },
});
