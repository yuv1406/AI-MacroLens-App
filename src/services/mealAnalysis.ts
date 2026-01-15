import { supabase } from '../config/supabase';
import { MealAnalysisRequest, MealAnalysisResponse, AnalysisStep } from '../types';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Upload meal image to Supabase Storage
 */
export async function uploadMealImage(
    userId: string,
    imageUri: string
): Promise<{ imageUrl: string | null; error: string | null }> {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${userId}/${timestamp}.jpg`;

        // Read file as base64 (use string 'base64' instead of enum)
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        // Convert base64 to blob
        const arrayBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('meal-images')
            .upload(filename, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from('meal-images').getPublicUrl(data.path);

        return { imageUrl: publicUrl, error: null };
    } catch (err: any) {
        console.error('Error uploading image:', err);
        return { imageUrl: null, error: err.message };
    }
}

/**
 * Analyze meal using AI via Supabase Edge Function
 */
export async function analyzeMealWithAI(
    userId: string,
    imageUrl: string,
    description?: string
): Promise<{ data: MealAnalysisResponse | null; error: string | null }> {
    try {
        const requestBody: MealAnalysisRequest = {
            user_id: userId,
            image_url: imageUrl,
            description,
        };

        const { data, error } = await supabase.functions.invoke<MealAnalysisResponse>(
            'analyze-meal',
            {
                body: requestBody,
            }
        );

        if (error) throw error;

        if (!data) {
            throw new Error('No data returned from AI analysis');
        }

        return { data, error: null };
    } catch (err: any) {
        console.error('Error analyzing meal:', err);
        return { data: null, error: err.message || 'Failed to analyze meal' };
    }
}

/**
 * Analyze meal from text description only (no image required)
 * For manual entry with "Get AI Estimate" feature
 */
export async function analyzeMealTextOnly(
    userId: string,
    description: string,
    onStepChange?: (step: AnalysisStep) => void
): Promise<{ data: MealAnalysisResponse | null; error: string | null }> {
    try {
        onStepChange?.('parsing');
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!description || description.trim().length < 10) {
            throw new Error('Description must be at least 10 characters');
        }

        const requestBody = {
            user_id: userId,
            description: description.trim(),
            // Explicitly NO image_url for text-only mode
        };

        onStepChange?.('estimating');
        const { data, error } = await supabase.functions.invoke<MealAnalysisResponse>(
            'analyze-meal',
            {
                body: requestBody,
            }
        );

        if (error) throw error;

        if (!data) {
            throw new Error('No data returned from text analysis');
        }

        onStepChange?.('finalizing');
        await new Promise(resolve => setTimeout(resolve, 1000));

        return { data, error: null };
    } catch (err: any) {
        console.error('Error analyzing text:', err);
        return { data: null, error: err.message || 'Failed to analyze meal description' };
    } finally {
        onStepChange?.('done');
    }
}

/**
 * Complete meal logging workflow: upload image + analyze + save
 */
export async function logMealWithAI(
    userId: string,
    imageUri: string,
    description?: string,
    onStepChange?: (step: AnalysisStep) => void
): Promise<{ data: MealAnalysisResponse | null; imageUrl: string | null; error: string | null }> {
    try {
        // Step 1: Upload image
        onStepChange?.('uploading');
        const { imageUrl, error: uploadError } = await uploadMealImage(userId, imageUri);
        if (uploadError || !imageUrl) {
            throw new Error(uploadError || 'Failed to upload image');
        }

        // Step 2: Analyze with AI
        onStepChange?.('analyzing');
        const { data, error: analysisError } = await analyzeMealWithAI(userId, imageUrl, description);
        if (analysisError || !data) {
            throw new Error(analysisError || 'Failed to analyze meal');
        }

        onStepChange?.('extracting');
        // We could add more logic here if needed, like post-processing

        onStepChange?.('completing');
        // Small delay to let the user see the "completing" step
        await new Promise(resolve => setTimeout(resolve, 500));

        return { data, imageUrl, error: null };
    } catch (err: any) {
        console.error('Error in meal logging workflow:', err);
        return { data: null, imageUrl: null, error: err.message };
    } finally {
        onStepChange?.('done');
    }
}
