# MacroLens - AI Fitness Tracker

A minimalist, modern, dark-themed fitness tracking mobile app built with Expo (React Native) and powered by Supabase + AI.

## Features

✨ **Smart Tracking**
- 📊 Dashboard with circular progress rings
- 🎯 Goal-based calorie tracking (Cut/Maintain/Gain)
- 📈 Macro targets (Protein, Carbs, Fats)
- 💧 Hydration tracking with quick-add buttons

🤖 **AI-Powered Meal Logging**
- 📸 Take photo or upload from gallery
- 🔍 AI analysis via Gemini Vision API
- ✏️ Edit AI results before saving
- 📝 Manual entry fallback

📱 **User Experience**
- 🌑 Beautiful dark theme
- ⚡ Smooth animations
- 📋 Daily meal log with delete functionality
- ⚙️ Customizable settings

## Quick Start

### Prerequisites

- Node.js 20.17+ installed
- Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) or [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Supabase project with:
  - `user_profiles` table
  - `meals` table
  - `hydration_logs` table
  - `meal-images` storage bucket
  - `analyze-meal` Edge Function deployed

### Setup

1. **Configure environment:**
   ```bash
   cd mobile-app
   cp .env .env.local
   ```
   
   Edit `.env` and add your Supabase Anon Key:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://djtqlcljpmmuvvbptvhc.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Test on your phone:**
   - Open Expo Go app
   - Scan the QR code from your terminal
   - App will load on your phone!

## Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base components (Button, Card, Badge, etc.)
│   │   ├── CalorieSummary.tsx
│   │   ├── HydrationTracker.tsx
│   │   ├── MacroBar.tsx
│   │   └── MealCard.tsx
│   ├── constants/          # Theme and default values
│   │   ├── theme.ts        # Dark theme colors, typography, spacing
│   │   └── defaults.ts     # Default user values and constants
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication state
│   │   ├── useUserProfile.ts
│   │   ├── useMeals.ts
│   │   └── useHydration.ts
│   ├── navigation/         # React Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/            # App screens
│   │   ├── AuthScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── AILogMealScreen.tsx
│   │   ├── ManualLogMealScreen.tsx
│   │   ├── DailyLogScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # API services
│   │   └── mealAnalysis.ts # AI meal analysis integration
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   └── config/             # Configuration
│       └── supabase.ts     # Supabase client
├── App.tsx                 # Entry point
├── app.json                # Expo configuration
└── package.json            # Dependencies
```

## Database Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  maintenance_calories INTEGER DEFAULT 2000,
  protein_target DECIMAL(5,1) DEFAULT 150.0,
  carbs_target DECIMAL(5,1) DEFAULT 200.0,
  fat_target DECIMAL(5,1) DEFAULT 60.0,
  water_goal INTEGER DEFAULT 2500,
  goal_mode TEXT DEFAULT 'maintain' CHECK (goal_mode IN ('cut', 'maintain', 'gain')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hydration logs table
CREATE TABLE hydration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for hydration_logs
CREATE POLICY "Users can view own hydration logs"
  ON hydration_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration logs"
  ON hydration_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Tech Stack

- **Framework:** Expo / React Native
- **Language:** TypeScript
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI:** Google Gemini 2.5 Flash Vision
- **Navigation:** React Navigation v6
- **State:** React Hooks + Supabase Realtime
- **Animations:** Reanimated 3
- **UI:** Custom dark theme components

## Development

### Available Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator (macOS only)
- `npm run web` - Start web version

### Tips

- Use Expo Go for quick testing
- Changes hot-reload automatically
- Check Metro bundler for errors
- Use React DevTools for debugging

## Design Philosophy

- **Minimalist:** Clean, uncluttered interface
- **Dark Theme:** Easy on the eyes, modern aesthetic
- **Mobile-First:** Optimized for phone screens
- **Performance:** Fast loading, smooth animations
- **Intuitive:** Clear navigation, obvious actions

## License

MIT
