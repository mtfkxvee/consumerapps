// X-SHA design system — Heritage of Tasikmalaya, violet palette.
// Hex approximations of the web app's oklch tokens (src/styles.css in xsha-app).
export const colors = {
  background: "#F8F7FA",
  surface: "#FFFFFF",
  surfaceContainerLow: "#F2F1F5",
  surfaceContainer: "#EDECF1",
  surfaceContainerHigh: "#E6E4EC",
  onSurface: "#241F2E",
  onSurfaceVariant: "#5C5566",

  primary: "#3D1F73",
  onPrimary: "#FFFFFF",
  primaryContainer: "#5A2FA0",
  onPrimaryContainer: "#E4D3F5",
  primaryFixed: "#E9DDF7",

  secondary: "#9A1FA8",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#C24FD3",
  onSecondaryContainer: "#4A1653",

  tertiary: "#8A6A1E",
  tertiaryContainer: "#D9B95A",
  onTertiaryContainer: "#4A3A10",

  error: "#B3261E",
  errorContainer: "#F9DEDC",
  onError: "#FFFFFF",
  success: "#2E7D4F",
  successContainer: "#DCF3E4",

  outline: "#8A8394",
  outlineVariant: "#D4CFDB",
  border: "#E6E4EC",

  white: "#FFFFFF",
  black: "#000000",
} as const;

export const gradients = {
  primary: [colors.primary, colors.secondary] as const,
  member: [colors.primary, "#6B2FA6", colors.secondary] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Height to reserve below scrollable/fixed content so the floating bottom
// tab bar (see navigation/FloatingTabBar.tsx) never overlaps it.
export const TAB_BAR_SPACE = 95;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Matches the web app's font pairing (src/styles.css in xsha-app):
// Bricolage Grotesque for display/headline text, Plus Jakarta Sans for
// everything else. Loaded in App.tsx via expo-font/useFonts — these are
// the exact family names registered there.
export const fonts = {
  display: {
    semiBold: "BricolageGrotesque_600SemiBold",
    bold: "BricolageGrotesque_700Bold",
    extraBold: "BricolageGrotesque_800ExtraBold",
  },
  body: {
    regular: "PlusJakartaSans_400Regular",
    medium: "PlusJakartaSans_500Medium",
    semiBold: "PlusJakartaSans_600SemiBold",
    bold: "PlusJakartaSans_700Bold",
    extraBold: "PlusJakartaSans_800ExtraBold",
  },
} as const;

export const typography = {
  display: { fontSize: 32, fontFamily: fonts.display.extraBold, letterSpacing: -0.5 },
  headlineLg: { fontSize: 26, fontFamily: fonts.display.bold },
  headlineMd: { fontSize: 20, fontFamily: fonts.display.bold },
  bodyLg: { fontSize: 16, fontFamily: fonts.body.regular },
  bodyMd: { fontSize: 14, fontFamily: fonts.body.regular },
  label: { fontSize: 13, fontFamily: fonts.body.semiBold },
  price: { fontSize: 16, fontFamily: fonts.body.extraBold },
};
