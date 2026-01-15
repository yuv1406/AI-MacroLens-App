import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useMeals } from '../hooks/useMeals';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export function ManualLogMealScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { addMeal } = useMeals(user?.id);

    const [description, setDescription] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const caloriesNum = parseInt(calories);
        const proteinNum = parseFloat(protein);
        const carbsNum = parseFloat(carbs);
        const fatNum = parseFloat(fat);

        if (isNaN(caloriesNum) || isNaN(proteinNum) || isNaN(carbsNum) || isNaN(fatNum)) {
            Alert.alert('Invalid Input', 'Please enter valid numbers for all fields');
            return;
        }

        if (caloriesNum <= 0) {
            Alert.alert('Invalid Input', 'Calories must be greater than 0');
            return;
        }

        setSaving(true);
        const { error } = await addMeal({
            calories: caloriesNum,
            protein: proteinNum,
            carbs: carbsNum,
            fat: fatNum,
            source: 'manual',
            description: description || undefined,
        });

        setSaving(false);

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
                <Text style={styles.title}>Manual Meal Entry</Text>

                <Card>
                    <Input
                        label="Description (optional)"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="e.g., Chicken salad"
                        multiline
                        numberOfLines={2}
                    />

                    <Input
                        label="Calories *"
                        value={calories}
                        onChangeText={setCalories}
                        placeholder="0"
                        keyboardType="numeric"
                    />

                    <Input
                        label="Protein (g) *"
                        value={protein}
                        onChangeText={setProtein}
                        placeholder="0"
                        keyboardType="numeric"
                    />

                    <Input
                        label="Carbs (g) *"
                        value={carbs}
                        onChangeText={setCarbs}
                        placeholder="0"
                        keyboardType="numeric"
                    />

                    <Input
                        label="Fat (g) *"
                        value={fat}
                        onChangeText={setFat}
                        placeholder="0"
                        keyboardType="numeric"
                    />

                    <Button
                        title={saving ? 'Saving...' : '✓ Save Meal'}
                        onPress={handleSave}
                        loading={saving}
                        disabled={saving}
                    />
                </Card>

                <Text style={styles.hint}>
                    * Required fields. Enter nutritional information from food label or estimation.
                </Text>
            </ScrollView>
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
    hint: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textTertiary,
        marginTop: SPACING.md,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
