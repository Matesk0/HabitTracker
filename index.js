import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Safely register background widget handler for Android builds (gracefully skipped in Expo Go)
if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./src/widgets/widgetTaskHandler');
    if (typeof registerWidgetTaskHandler === 'function') {
      registerWidgetTaskHandler(widgetTaskHandler);
    }
  } catch (e) {
    // In Expo Go or non-widget environments, widget registration is safely skipped
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It ensures that loading the app in Expo Go, development build, or production works seamlessly
registerRootComponent(App);
