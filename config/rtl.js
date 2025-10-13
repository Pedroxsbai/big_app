import { I18nManager, Platform } from 'react-native';

let applied = false;

export function configureRTL(force = true) {
  if (applied) return;
  try {
    if (force && !I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      // On Android, forcing RTL may require app reload; the dev server handles this.
      if (Platform.OS === 'android') {
        // No-op here to avoid reload loops; user reloads once.
      }
    }
    applied = true;
  } catch (e) {
    // swallow
  }
}
