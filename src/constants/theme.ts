// Dark theme color palette with soft pastel accents
export const COLORS = {
    // Base colors
    background: '#0A0A0B',
    surface: '#141416',
    surfaceLight: '#1C1C1F',
    border: '#2A2A2E',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#A8A8AD',
    textTertiary: '#6E6E73',

    // Primary accent
    primary: '#3B82F6', // Blue
    primaryDark: '#2563EB',
    primaryLight: '#60A5FA',

    // Status colors
    success: '#10B981', // Green for Gaining
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    info: '#3B82F6', // Blue for Cutting

    // Material Design 3 Pastel-on-Dark palette
    accentCoral: '#F28B82', // Soft coral for protein
    accentGold: '#FDD663', // Muted gold for carbs
    accentSage: '#81C995', // Sage green for fats
    accentLavender: '#D7AEFB', // Soft lavender for RDC

    // Macro colors (Material Design 3 refined)
    protein: '#F28B82', // Soft Coral
    carbs: '#FDD663', // Muted Gold
    fats: '#81C995', // Sage Green
    rdc: '#D7AEFB', // Lavender

    // Hydration
    water: '#06B6D4', // Cyan

    // Confidence badges
    confidenceLow: '#EF4444',
    confidenceMedium: '#F59E0B',
    confidenceHigh: '#10B981',

    // Calendar day indicators (for calorie tracking)
    calendarDeficit: '#3B82F6', // Blue - below maintenance
    calendarMaintenance: '#10B981', // Green - at/near maintenance
    calendarSurplus: '#F59E0B', // Orange - surplus

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
};

// Typography
export const TYPOGRAPHY = {
    // Font families (Inter preferred, fallback to Montserrat or System)
    fontFamily: {
        regular: 'Dongle_400Regular',
        medium: 'Dongle_400Regular',
        semibold: 'Dongle_700Bold',
        bold: 'Dongle_700Bold',
    },

    // Font sizes (increased by 32% total for Dongle font readability)
    fontSize: {
        xs: 18,      // was 12 → 14 → 16
        sm: 20,      // was 14 → 16 → 18
        base: 23,    // was 16 → 18 → 21
        lg: 26,      // was 18 → 21 → 24
        xl: 28,      // was 20 → 23 → 26
        '2xl': 34,   // was 24 → 28 → 32
        '3xl': 42,   // was 30 → 35 → 40
        '4xl': 49,   // was 36 → 41 → 47
    },

    // Font weights
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const, // For labels
        semibold: '600' as const, // For numeric values
        bold: '700' as const,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

// Spacing
export const SPACING = {
    xs: 4,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
};

// Border radius
export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

// Shadows (for iOS and Android)
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
};

// Animation durations (in milliseconds)
export const ANIMATION = {
    fast: 150,
    normal: 250,
    slow: 350,
};

// Bento-box grid layout
export const GRID = {
    gap: SPACING.md,
    columns: 4, // 4-column grid for pill gauges
    cardMinHeight: 120,
    pillGaugeHeight: 140,
};
