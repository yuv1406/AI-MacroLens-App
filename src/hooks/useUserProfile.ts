import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { UserProfile } from '../types';
import {
    DEFAULT_MAINTENANCE_CALORIES,
    DEFAULT_PROTEIN_TARGET,
    DEFAULT_CARBS_TARGET,
    DEFAULT_FAT_TARGET,
    DEFAULT_WATER_TARGET_ML,
    DEFAULT_GOAL_MODE,
} from '../constants/defaults';

export function useUserProfile(userId: string | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile
    const fetchProfile = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_settings')  // Changed from 'user_profiles'
                .select('*')
                .eq('user_id', userId)  // Changed from 'id'
                .single();

            if (error) {
                // If profile doesn't exist, create it with defaults
                if (error.code === 'PGRST116') {
                    await createProfile(userId);
                    return;
                }
                throw error;
            }

            setProfile(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create profile with default values
    const createProfile = async (userId: string) => {
        try {
            const newProfile: Partial<UserProfile> = {
                user_id: userId,  // Changed from 'id'
                maintenance_calories: DEFAULT_MAINTENANCE_CALORIES,
                protein_target: DEFAULT_PROTEIN_TARGET,
                carbs_target: DEFAULT_CARBS_TARGET,
                fat_target: DEFAULT_FAT_TARGET,
                water_target_ml: DEFAULT_WATER_TARGET_ML,  // Changed from 'water_goal'
                goal_mode: DEFAULT_GOAL_MODE,
            };

            const { data, error } = await supabase
                .from('user_settings')  // Changed from 'user_profiles'
                .insert(newProfile)
                .select()
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating profile:', err);
        }
    };

    // Update profile
    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!userId) return { error: 'No user ID' };

        try {
            const { data, error } = await supabase
                .from('user_settings')  // Changed from 'user_profiles'
                .update(updates)  // Removed updated_at field
                .eq('user_id', userId)  // Changed from 'id'
                .select()
                .single();

            if (error) throw error;
            setProfile(data);
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    useEffect(() => {
        fetchProfile();

        // Set up realtime subscription
        if (!userId) return;

        const channel = supabase
            .channel(`profile - ${userId} `)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_settings',  // Changed from 'user_profiles'
                    filter: `user_id = eq.${userId} `,  // Changed from 'id'
                },
                (payload) => {
                    setProfile(payload.new as UserProfile);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        refetch: fetchProfile,
    };
}
