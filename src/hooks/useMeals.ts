import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { Meal, DailySummary } from '../types';
import { cacheManager } from '../utils/cacheManager';

// Use centralized cache manager instead of module-level cache
const mealsCache = cacheManager.getMealsCache();

// Module-level cache version for cross-instance updates
let globalCacheVersion = 0;
const cacheListeners = new Set<() => void>();

const notifyCacheUpdate = () => {
    globalCacheVersion++;
    cacheListeners.forEach(listener => listener());
};

export function useMeals(userId: string | undefined, selectedDate: Date = new Date()) {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cacheVersion, setCacheVersion] = useState(globalCacheVersion);
    const hasPrefetched = useRef(false);

    // Listen for cache updates from other instances
    useEffect(() => {
        const listener = () => {
            setCacheVersion(globalCacheVersion);
        };
        cacheListeners.add(listener);
        return () => {
            cacheListeners.delete(listener);
        };
    }, []);

    // Helper to get date key
    const getDateKey = (date: Date) => {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // Prefetch last 7 days in background (for weekly calendar)
    const prefetchDays = async () => {
        if (!userId) return;

        const today = new Date();
        const promises = [];

        console.log('🔄 Starting prefetch for 7 days...');
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = getDateKey(date);

            // Only fetch if not already in cache
            if (!mealsCache.has(dateKey)) {
                console.log(`🔄 Prefetching ${dateKey}...`);
                promises.push(fetchMealsForDate(date, dateKey));
            } else {
                console.log(`✅ ${dateKey} already in cache`);
            }
        }

        if (promises.length > 0) {
            await Promise.all(promises);
            console.log(`✅ Prefetch complete: ${promises.length} days fetched`);
            // Trigger re-render for all instances
            notifyCacheUpdate();
        } else {
            console.log('✅ All days already cached');
        }
    };

    // Fetch meals for a specific date and cache them
    const fetchMealsForDate = async (date: Date, dateKey: string) => {
        try {
            // Create start and end of day in local timezone (IST)
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Convert to ISO strings - these will be in UTC but represent the IST day boundaries
            // For example: Jan 7 00:00 IST becomes Jan 6 18:30 UTC
            const { data, error } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            mealsCache.set(dateKey, data || []);
            console.log(`📅 Fetched ${data?.length || 0} meals for ${dateKey} (${startOfDay.toISOString()} to ${endOfDay.toISOString()})`);
            return data || [];
        } catch (err) {
            console.error(`Error prefetching meals for ${dateKey}:`, err);
            return [];
        }
    };

    // Fetch meals for selected date (check cache first)
    const fetchMeals = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const dateKey = getDateKey(selectedDate);

        // Check cache first
        if (mealsCache.has(dateKey)) {
            const cachedMeals = mealsCache.get(dateKey)!;
            console.log(`📦 fetchMeals - Using cache for ${dateKey}, count:`, cachedMeals.length);
            setMeals(cachedMeals);
            setLoading(false);
            setError(null);
            return;
        }

        // Not in cache, fetch from DB
        try {
            setLoading(true);
            const data = await fetchMealsForDate(selectedDate, dateKey);
            console.log(`🗄️ fetchMeals - Fetched from DB for ${dateKey}, count:`, data.length);
            setMeals(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching meals:', err);
        } finally {
            setLoading(false);
        }
    };

    // Clear cache (called when new meal added/deleted)
    const clearCache = () => {
        console.log('🗑️ Clearing cache and notifying all instances...');
        mealsCache.clear();
        // Notify all hook instances to re-render
        notifyCacheUpdate();
    };

    // Add a meal
    const addMeal = async (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => {
        if (!userId) return { error: 'No user ID' };

        const callId = Math.random().toString(36).substr(2, 9);
        console.log(`🔵 addMeal [${callId}] - CALLED for date:`, getDateKey(selectedDate));

        try {
            console.log(`🔵 addMeal [${callId}] - Inserting into DB:`, meal);
            const { data, error } = await supabase
                .from('meals')
                .insert({
                    ...meal,
                    user_id: userId,
                })
                .select()
                .single();

            if (error) throw error;
            console.log(`🟢 addMeal [${callId}] - Insert successful, ID:`, data.id);

            // Clear cache only - let realtime subscription handle the refetch
            // This prevents race condition between manual fetch and subscription fetch
            clearCache();

            return { data, error: null };
        } catch (err: any) {
            console.error(`🔴 addMeal [${callId}] - Error:`, err);
            return { data: null, error: err.message };
        }
    };

    // Update a meal
    const updateMeal = async (mealId: string, updates: Partial<Meal>) => {
        try {
            const { data, error } = await supabase
                .from('meals')
                .update(updates)
                .eq('id', mealId)
                .select()
                .single();

            if (error) throw error;
            clearCache(); // Let realtime handle refetch
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    // Delete a meal
    const deleteMeal = async (mealId: string) => {
        try {
            const { error } = await supabase.from('meals').delete().eq('id', mealId);

            if (error) throw error;
            clearCache(); // Let realtime handle refetch
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    // Calculate daily summary
    const getDailySummary = (): DailySummary => {
        return meals.reduce(
            (summary, meal) => ({
                totalCalories: summary.totalCalories + meal.calories,
                totalProtein: summary.totalProtein + meal.protein,
                totalCarbs: summary.totalCarbs + meal.carbs,
                totalFat: summary.totalFat + meal.fat,
                totalWater: 0, // Hydration is tracked separately
                mealsCount: summary.mealsCount + 1,
            }),
            {
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                totalWater: 0,
                mealsCount: 0,
            }
        );
    };

    // Get last 7 days calorie data for calendar (rolling window)
    const getWeeklySummary = (): { calories: number[], labels: string[], isToday: boolean[] } => {
        const today = new Date();
        const weeklyCalories: number[] = [];
        const dayLabels: string[] = [];
        const isTodayFlags: boolean[] = [];
        const dayAbbrev = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        console.log('📊 getWeeklySummary - Cache contents:', Array.from(mealsCache.keys()));

        // Loop through last 7 days (6 days ago to today)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = getDateKey(date);
            const dayOfWeek = date.getDay();

            // Get day label
            dayLabels.push(dayAbbrev[dayOfWeek]);

            // Check if this is today
            isTodayFlags.push(i === 0);

            // Get calories for this day
            if (mealsCache.has(dateKey)) {
                const dayMeals = mealsCache.get(dateKey)!;
                const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
                weeklyCalories.push(totalCalories);
                console.log(`📊 ${dateKey} (${dayAbbrev[dayOfWeek]}): ${dayMeals.length} meals, ${totalCalories} cal`);
            } else {
                weeklyCalories.push(0);
                console.log(`📊 ${dateKey} (${dayAbbrev[dayOfWeek]}): NOT IN CACHE`);
            }
        }

        console.log('📊 Final weekly calories:', weeklyCalories);
        return { calories: weeklyCalories, labels: dayLabels, isToday: isTodayFlags };
    };

    useEffect(() => {
        fetchMeals().then(() => {
            // Always prefetch weekly data after initial fetch
            prefetchDays();
        });

        // Set up realtime subscription  
        if (!userId) return;

        const channel = supabase
            .channel(`meals-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'meals',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('📡 Realtime event received:', payload.eventType, (payload.new as any)?.id);
                    clearCache();
                    fetchMeals().then(() => {
                        // Refetch weekly data after realtime update
                        prefetchDays();
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, selectedDate, cacheVersion]); // Added cacheVersion to trigger refetch

    const refetch = async () => {
        await fetchMeals();
        await prefetchDays();
    };

    return {
        meals,
        loading,
        error,
        addMeal,
        updateMeal,
        deleteMeal,
        getDailySummary,
        getWeeklySummary,
        refetch,
        cacheVersion, // Export so components can use it as a dependency
    };
}
