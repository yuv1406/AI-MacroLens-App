# MacroLens - AI-Powered Fitness Tracking App

A modern React Native mobile application for tracking macros, meals, and hydration with AI-powered meal analysis using Google's Gemini API.

![MacroLens](https://img.shields.io/badge/Platform-Android-green)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue)

## Features

### 🍽️ Meal Tracking
- **AI Meal Analysis**: Take a photo of your meal and get instant macro estimates using Google Gemini AI
- **Text-Based Analysis**: Describe your meal (e.g., "300g rice with 200g dal") for AI-estimated macros
- **Manual Entry**: Input nutritional information directly from food labels
- **Meal History**: View and manage your logged meals with detailed nutritional breakdowns

### 💧 Hydration Tracking
- Track daily water intake with visual progress indicators
- Beautiful donut chart visualization
- Quick-add water logging with customizable amounts
- Daily hydration goals and progress tracking

### 📊 Dashboard & Analytics
- Real-time macro tracking (Protein, Carbs, Fats, Calories)
- Daily progress visualization with circular progress rings
- Weekly calendar view for tracking consistency
- Time-based greetings with dynamic icons (sun/moon)
- Personalized daily goals based on user profile

### 👤 User Profile & Settings
- Customizable daily macro goals
- Personal information management (height, weight, age)
- Activity level configuration
- Goal-based calculations (weight loss, maintenance, gain)

### 🎨 Modern UI/UX
- Dark mode optimized design
- Smooth animations and transitions
- Glassmorphic design elements
- Custom icons and typography
- Responsive layouts

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI**: Google Gemini 2.0 Flash
- **Navigation**: React Navigation v7
- **Styling**: NativeWind (TailwindCSS for React Native)
- **State Management**: React Hooks
- **Image Processing**: Expo Image Picker & Manipulator

> **⚠️ Important**: This app requires a deployed Supabase Edge Function (`analyze-meal`) to work properly. The Edge Function handles AI meal analysis using the Gemini API. Without it, the AI meal analysis feature will not function.

## Prerequisites

- Node.js 20.17.0 or higher
- npm or yarn
- Expo Go app (for testing on device)
- Android Studio (for building APK)
- Supabase account
- Google Gemini API key

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yuv1406/AI-MacroLens-App.git
cd AI-MacroLens-App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Supabase Setup

> **🔴 Critical**: The app **requires** the Supabase Edge Function to be deployed for AI meal analysis to work.

You'll need to set up the following in your Supabase project:

#### Database Tables
- `user_settings`: User profiles and daily goals
- `meals`: Meal logs with nutritional information
- `water_logs`: Hydration tracking entries

#### Storage Buckets
- `meal-images`: For storing meal photos

#### Edge Functions (Required for AI Features)

The app depends on the `analyze-meal` Edge Function for AI-powered meal analysis. This function:
- Receives meal images from the mobile app
- Processes images with Google Gemini API
- Returns nutritional estimates (calories, protein, carbs, fat)
- Handles both image-based and text-based meal analysis

**To deploy the Edge Function:**

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

3. Deploy the function:
```bash
supabase functions deploy analyze-meal
```

4. Set the Gemini API key as a secret:
```bash
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
```

**Edge Function Repository**: The Edge Function code is available in a separate repository. You'll need to deploy it to your Supabase project before the app can perform AI meal analysis.

Refer to the SQL files in the repository for complete database schema and storage policies.

## Running the App

### Development Mode

```bash
npm start
```

Then:
- Scan the QR code with Expo Go (Android)
- Press `a` to open on Android emulator
- Press `w` to open in web browser

### Building APK

#### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Build APK:
```bash
eas build --platform android --profile preview
```

The APK will be available for download once the build completes.

## Project Structure

```
mobile-app/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── icons/        # Custom SVG icons
│   │   └── ui/           # UI primitives (Button, Card, Input, etc.)
│   ├── screens/          # App screens
│   │   ├── DashboardScreen.tsx
│   │   ├── DailyLogScreen.tsx
│   │   ├── AILogMealScreen.tsx
│   │   ├── ManualLogMealScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── AuthScreen.tsx
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API and service functions
│   ├── navigation/       # Navigation configuration
│   ├── config/           # App configuration
│   ├── constants/        # Theme and constants
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, icons
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
└── package.json         # Dependencies
```

## Key Features Implementation

### AI Meal Analysis
The app uses Google's Gemini 2.0 Flash model to analyze meal photos:
1. User takes/selects a photo
2. Image is compressed and uploaded to Supabase Storage
3. Supabase Edge Function processes the image with Gemini API
4. AI returns estimated macros and meal description
5. User can edit values before saving

### Keyboard Handling
Optimized keyboard behavior for meal logging screens:
- Removed problematic `KeyboardAvoidingView`
- Configured `ScrollView` with proper keyboard dismiss modes
- Added extra padding to prevent content from being hidden

### Icon Visibility
Fixed greeting icons (sun/moon) by:
- Removing opacity that made icons hard to see
- Using correct SVG paths from source files
- Ensuring proper fill colors

## Configuration Files

### `app.json`
- App metadata and configuration
- Platform-specific settings (Android/iOS)
- Permissions and capabilities

### `eas.json`
- Build profiles (development, preview, production)
- Environment variables for builds
- Platform-specific build configurations

## Dependencies

Key dependencies include:
- `expo`: ~54.0.31
- `react-native`: 0.81.5
- `@supabase/supabase-js`: ^2.89.0
- `@react-navigation/native`: ^7.1.26
- `react-native-reanimated`: ~4.1.1
- `nativewind`: ^4.0.1
- `expo-image-picker`: ^17.0.10

See `package.json` for complete list.

## Troubleshooting

### Icons Not Visible
- Ensure `react-native-svg` is properly installed
- Check that icon components have proper fill colors
- Verify opacity is not set too low

### Keyboard Scrolling Issues
- Make sure `KeyboardAvoidingView` is not wrapping `ScrollView`
- Use `keyboardDismissMode="on-drag"` on ScrollView
- Add sufficient bottom padding to content

### Build Errors
- Run `npx expo doctor` to check for dependency issues
- Ensure all peer dependencies are installed
- Clean and reinstall node_modules if needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Google Gemini AI for meal analysis
- Supabase for backend infrastructure
- Expo team for the amazing development platform
- React Native community for excellent libraries

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using React Native and Expo**
