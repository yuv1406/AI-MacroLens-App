import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Dongle_300Light, Dongle_400Regular, Dongle_700Bold } from '@expo-google-fonts/dongle';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeImageCleanup } from './src/services/imageCleanup';
import { COLORS } from './src/constants/theme';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

// Set to true to see font test screen
const SHOW_FONT_TEST = false;

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Dongle_300Light,
    Dongle_400Regular,
    Dongle_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded or error occurs
      SplashScreen.hideAsync();

      if (fontError) {
        console.error('❌ Font loading error:', fontError);
      } else {
        console.log('✅ Fonts loaded successfully - Dongle is ready');
        console.log('📝 Registered font keys: Dongle_300Light, Dongle_400Regular, Dongle_700Bold');
      }

      // Initialize daily image cleanup
      try {
        initializeImageCleanup();
      } catch (e) {
        console.warn('⚠️ Cleanup initialization failed:', e);
      }
    }
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are loaded - CRITICAL for Android
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Font test screen
  if (SHOW_FONT_TEST) {
    return (
      <View style={styles.testContainer}>
        <Text style={styles.testDefault}>Default Font (System)</Text>
        <Text style={styles.testDongle}>Dongle-Regular Test</Text>
        <Text style={styles.testDongleBold}>Dongle-Bold Test</Text>
        <Text style={styles.testDongleLight}>Dongle-Light Test</Text>
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  testContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  testDefault: {
    fontSize: 60,
    color: COLORS.text,
    marginBottom: 20,
  },
  testDongle: {
    fontSize: 60,
    fontFamily: 'Dongle_400Regular',
    color: COLORS.text,
    marginBottom: 20,
  },
  testDongleBold: {
    fontSize: 60,
    fontFamily: 'Dongle_700Bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  testDongleLight: {
    fontSize: 60,
    fontFamily: 'Dongle_300Light',
    color: COLORS.text,
    marginBottom: 20,
  },
});
