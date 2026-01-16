const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config plugin to set android:windowSoftInputMode to adjustResize
 * This ensures the window resizes when keyboard appears, enabling proper keyboard height detection
 */
const withAndroidWindowSoftInputMode = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const mainActivity = androidManifest.manifest.application[0].activity.find(
            (activity) => activity.$['android:name'] === '.MainActivity'
        );

        if (mainActivity) {
            // Set windowSoftInputMode to adjustResize for proper keyboard handling
            mainActivity.$['android:windowSoftInputMode'] = 'adjustResize';
            console.log('✅ Set android:windowSoftInputMode to adjustResize');
        }

        return config;
    });
};

module.exports = withAndroidWindowSoftInputMode;
