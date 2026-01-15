import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { HydrationLog } from '../types';
import { HYDRATION_QUICK_ADD } from '../constants/defaults';

// Cache to store water logs by date
const waterLogsCache = new Map<string, HydrationLog[]>();

// Module-level cache version for cross-instance updates
let globalCacheVersion = 0;
const cacheListeners = new Set<() => void>();

const notifyCacheUpdate = () => {
    globalCacheVersion++;
    cacheListeners.forEach(listener => listener());
};

export function useHydration(userId: string | undefined, selectedDate: Date = new Date()) {
    const [totalWater, setTotalWater] = useState(0);
    const [waterLogs, setWaterLogs] = useState<HydrationLog[]>([]);
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

    // Prefetch last 5 days in background
    const prefetchDays = async () => {
        if (!userId || hasPrefetched.current) return;
        hasPrefetched.current = true;

        const today = new Date();
        const promises = [];

        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = getDateKey(date);

            if (!waterLogsCache.has(dateKey)) {
                promises.push(fetchWaterLogsForDate(date, dateKey));
            }
        }

        await Promise.all(promises);
    };

    // Fetch water logs for a specific date and cache them
    const fetchWaterLogsForDate = async (date: Date, dateKey: string) => {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const { data, error } = await supabase
                .from('water_logs')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            waterLogsCache.set(dateKey, data || []);
            return data || [];
        } catch (err) {
            console.error(`Error prefetching water logs for ${dateKey}:`, err);
            return [];
        }
    };

    // Fetch hydration for selected date (check cache first)
    const fetchHydration = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const dateKey = getDateKey(selectedDate);

        // Check cache first
        if (waterLogsCache.has(dateKey)) {
            const cachedLogs = waterLogsCache.get(dateKey)!;
            setWaterLogs(cachedLogs);
            const total = cachedLogs.reduce((sum, log) => sum + log.amount_ml, 0);
            setTotalWater(total);
            setLoading(false);
            setError(null);
            return;
        }

        // Not in cache, fetch from DB
        try {
            setLoading(true);
            const data = await fetchWaterLogsForDate(selectedDate, dateKey);
            setWaterLogs(data);
            const total = data.reduce((sum, log) => sum + log.amount_ml, 0);
            setTotalWater(total);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching hydration:', err);
        } finally {
            setLoading(false);
        }
    };

    // Clear cache (called when water log added/deleted)
    const clearCache = () => {
        console.log('🗑️ Clearing hydration cache and notifying all instances...');
        waterLogsCache.clear();
        hasPrefetched.current = false;
        // Notify all hook instances to re-render
        notifyCacheUpdate();
    };

    // Add water intake
    const addWater = async (amount: number) => {
        if (!userId) return { error: 'No user ID' };

        try {
            const { error } = await supabase
                .from('water_logs')
                .insert({
                    user_id: userId,
                    amount_ml: amount,
                });

            if (error) throw error;
            clearCache();
            await fetchHydration();
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    // Delete water log
    const deleteWaterLog = async (logId: string) => {
        try {
            const { error } = await supabase
                .from('water_logs')
                .delete()
                .eq('id', logId);

            if (error) throw error;
            clearCache();
            await fetchHydration();
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    // Quick add shortcuts
    const addSmallCup = () => addWater(HYDRATION_QUICK_ADD.small);
    const addLargeCup = () => addWater(HYDRATION_QUICK_ADD.large);

    useEffect(() => {
        fetchHydration();

        // Prefetch in background on first load
        if (!hasPrefetched.current) {
            prefetchDays();
        }

        // Set up realtime subscription
        if (!userId) return;

        const channel = supabase
            .channel(`hydration-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'water_logs',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    clearCache();
                    fetchHydration();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, selectedDate, cacheVersion]); // Added cacheVersion to trigger refetch

    return {
        totalWater,
        waterLogs,
        loading,
        error,
        addWater,
        deleteWaterLog,
        addSmallCup,
        addLargeCup,
        refetch: fetchHydration,
        cacheVersion, // Export for component dependencies
    };
}
