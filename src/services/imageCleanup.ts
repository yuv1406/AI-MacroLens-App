import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

const LAST_CLEANUP_KEY = 'last_image_cleanup_date';
const CLEANUP_INTERVAL_DAYS = 1; // Run cleanup once per day
const IMAGE_RETENTION_DAYS = 90; // Keep images for 90 days

/**
 * Checks if cleanup should run (once per day)
 */
async function shouldRunCleanup(): Promise<boolean> {
    try {
        const lastCleanup = await AsyncStorage.getItem(LAST_CLEANUP_KEY);

        if (!lastCleanup) {
            return true; // Never run before
        }

        const lastCleanupDate = new Date(lastCleanup);
        const now = new Date();
        const daysSinceLastCleanup = (now.getTime() - lastCleanupDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysSinceLastCleanup >= CLEANUP_INTERVAL_DAYS;
    } catch (error) {
        console.error('Error checking cleanup schedule:', error);
        return false; // Don't run if we can't determine
    }
}

/**
 * Deletes meal images older than 90 days
 * Runs silently in the background, doesn't block app startup
 */
export async function cleanupOldMealImages(): Promise<void> {
    try {
        // Check if we should run cleanup today
        const shouldRun = await shouldRunCleanup();
        if (!shouldRun) {
            console.log('Skipping cleanup - already ran today');
            return;
        }

        console.log('Starting daily image cleanup...');

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('No user logged in, skipping cleanup');
            return;
        }

        // Calculate cutoff date (90 days ago)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - IMAGE_RETENTION_DAYS);
        const cutoffISO = cutoffDate.toISOString();

        // Query meals older than 90 days that have images
        const { data: oldMeals, error: queryError } = await supabase
            .from('meals')
            .select('id, image_url')
            .eq('user_id', user.id)
            .lt('created_at', cutoffISO)
            .not('image_url', 'is', null);

        if (queryError) {
            console.error('Error querying old meals:', queryError);
            return;
        }

        if (!oldMeals || oldMeals.length === 0) {
            console.log('No old images to clean up');
            await AsyncStorage.setItem(LAST_CLEANUP_KEY, new Date().toISOString());
            return;
        }

        console.log(`Found ${oldMeals.length} meals with images to clean up`);

        // Delete images from storage and update database
        let deletedCount = 0;
        let errorCount = 0;

        for (const meal of oldMeals) {
            try {
                // Extract file path from URL
                // URL format: https://<project>.supabase.co/storage/v1/object/public/meal-images/<user_id>/<filename>
                const url = meal.image_url!;
                const pathMatch = url.match(/meal-images\/(.+)$/);

                if (!pathMatch) {
                    console.warn(`Could not extract path from URL: ${url}`);
                    errorCount++;
                    continue;
                }

                const filePath = pathMatch[1];

                // Delete from storage
                const { error: deleteError } = await supabase.storage
                    .from('meal-images')
                    .remove([filePath]);

                if (deleteError) {
                    console.error(`Failed to delete image for meal ${meal.id}:`, deleteError);
                    errorCount++;
                    continue;
                }

                // Update database to remove image_url
                const { error: updateError } = await supabase
                    .from('meals')
                    .update({ image_url: null })
                    .eq('id', meal.id);

                if (updateError) {
                    console.error(`Failed to update meal ${meal.id}:`, updateError);
                    errorCount++;
                    continue;
                }

                deletedCount++;
            } catch (error) {
                console.error(`Error processing meal ${meal.id}:`, error);
                errorCount++;
            }
        }

        console.log(`Cleanup complete: ${deletedCount} images deleted, ${errorCount} errors`);

        // Update last cleanup date
        await AsyncStorage.setItem(LAST_CLEANUP_KEY, new Date().toISOString());
    } catch (error) {
        console.error('Error during image cleanup:', error);
        // Don't throw - cleanup should never crash the app
    }
}

/**
 * Initializes cleanup on app startup
 * Call this from App.tsx after user authentication
 */
export function initializeImageCleanup(): void {
    // Run cleanup in background, don't await
    // This ensures it doesn't block app startup
    cleanupOldMealImages().catch(error => {
        console.error('Background image cleanup failed:', error);
    });
}
