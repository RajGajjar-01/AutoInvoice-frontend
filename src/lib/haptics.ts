const patterns = { light: 10, success: [10, 40, 10], warning: [30, 50, 30] }

/** Short vibration on Android. iOS has no Vibration API, so this does nothing there. */
export function haptic(kind: keyof typeof patterns = "light") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(patterns[kind])
  }
}
