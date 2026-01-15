# MacroLens APK Build Instructions

This guide explains how to build an Android APK for the MacroLens fitness tracking app.

## Prerequisites

1. **Node.js and npm** - Already installed ✓
2. **EAS CLI** - Expo Application Services command-line tool

### Install EAS CLI

```bash
npm install -g eas-cli
```

## Build Process

### 1. Navigate to Mobile App Directory

```bash
cd c:\Users\yuvia\OneDrive\Desktop\ai-macrolens\mobile-app
```

### 2. Login to Expo (First Time Only)

```bash
eas login
```

You'll need an Expo account. If you don't have one, create it at https://expo.dev/signup

### 3. Configure the Project (First Time Only)

```bash
eas build:configure
```

This will set up your project with EAS Build.

### 4. Build the APK

For a **preview/testing APK**:

```bash
eas build --platform android --profile preview
```

For a **production build** (Google Play Store):

```bash
eas build --platform android --profile production
```

### 5. Download the APK

Once the build completes (typically 10-15 minutes), you'll receive:
- A download link in the terminal
- An email notification with the download link
- The build will also appear in your Expo dashboard: https://expo.dev/accounts/[your-account]/projects/macrolens-fitness/builds

## Installing the APK on Android Device

### Method 1: Direct Download on Device
1. Open the download link on your Android device
2. Download the APK file
3. Tap the downloaded file to install
4. If prompted, enable "Install from Unknown Sources" in Settings

### Method 2: Transfer from Computer
1. Download the APK to your computer
2. Connect your Android device via USB
3. Copy the APK to your device's Downloads folder
4. On your device, use a file manager to find and tap the APK
5. Follow the installation prompts

## Build Profiles

The project has three build profiles configured in `eas.json`:

- **development**: Development build with Expo dev client
- **preview**: APK for internal testing (recommended for initial builds)
- **production**: App bundle (AAB) for Google Play Store submission

## Environment Variables

The build automatically includes:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

These are configured in `eas.json` and will be embedded in the build.

## Troubleshooting

### Build Fails with "Project not configured"
Run: `eas build:configure`

### "Not logged in" Error
Run: `eas login` and enter your Expo credentials

### Build Takes Too Long
EAS builds run on cloud servers and typically take 10-15 minutes. You can close the terminal and check build status later with:
```bash
eas build:list
```

### APK Won't Install on Device
1. Ensure "Install from Unknown Sources" is enabled
2. Check that you downloaded the correct APK file
3. Try uninstalling any previous version of the app first

## Checking Build Status

View all builds:
```bash
eas build:list
```

View specific build details:
```bash
eas build:view [build-id]
```

## Next Steps After Building

1. **Test the APK** on your Android device
2. **Verify all features work**:
   - Login/signup
   - Camera permissions
   - Meal photo upload
   - AI meal analysis
   - Hydration tracking
   - Profile management
3. **Share with testers** if needed
4. **Prepare for Play Store** submission (use production profile)
