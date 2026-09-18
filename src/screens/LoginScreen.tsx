import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing, typography } from "../theme/colors";
import { useAuth } from "../state/AuthContext";
import { useTabBarSpace } from "../hooks/useTabBarSpace";

const HERO_IMAGE = require("../../assets/login-hero.jpg");

// How far down from the top the card sits when fully open — the hero image
// fills the whole screen behind it, so this is also how much of it stays
// covered at rest.
const EXPANDED_TOP_FRACTION = 0.4;
// How much of the card (its drag handle) stays visible once pulled all the
// way down, so there's still something to grab to bring it back up.
const PEEK_HEIGHT = 64;

export function LoginScreen() {
  const { login, loginGoogle } = useAuth();
  const tabBarSpace = useTabBarSpace();
  const { height: screenHeight } = useWindowDimensions();
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const expandedTop = screenHeight * EXPANDED_TOP_FRACTION;
  const maxDrag = Math.max(0, screenHeight - expandedTop - PEEK_HEIGHT);

  const pan = useRef(new Animated.Value(0)).current;
  const dragStart = useRef(0);
  const isCollapsed = useRef(false);

  // A drag-to-reveal card, like a bottom sheet: pulling it down uncovers
  // more of the hero photo behind it, pulling it back up (or tapping the
  // handle) restores it to the normal login layout. Built on the built-in
  // PanResponder/Animated so this doesn't need react-native-gesture-handler
  // or reanimated as new dependencies.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        pan.stopAnimation((value) => {
          dragStart.current = value;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const next = Math.min(maxDrag, Math.max(0, dragStart.current + gesture.dy));
        pan.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const isTap = Math.abs(gesture.dy) < 6 && Math.abs(gesture.dx) < 6;
        const current = dragStart.current + gesture.dy;
        const nextCollapsed = isTap
          ? !isCollapsed.current
          : current > maxDrag / 2 || gesture.vy > 0.5;
        isCollapsed.current = nextCollapsed;
        Animated.spring(pan, {
          toValue: nextCollapsed ? maxDrag : 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const res = await login(usr, pwd);
    setLoading(false);
    if (!res.ok) setError(res.message);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const res = await loginGoogle();
    setGoogleLoading(false);
    if (!res.ok) setError(res.message);
  };

  const notAvailable = () => setError("Fitur ini belum tersedia di X-SHA.");

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          <View style={styles.heroFull} pointerEvents="none">
            <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <Text style={styles.heroBrand}>X-SHA</Text>
          </View>

          <Animated.View
            style={[
              styles.card,
              { top: expandedTop, transform: [{ translateY: pan }] },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.handleArea}>
              <View style={styles.grabber} />
            </View>

            <ScrollView
              contentContainerStyle={[styles.cardContent, { paddingBottom: tabBarSpace }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>Masuk ke Akun Anda</Text>

              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={colors.onSurfaceVariant} />
                <TextInput
                  style={styles.input}
                  value={usr}
                  onChangeText={setUsr}
                  placeholder="Masukkan Email Anda"
                  placeholderTextColor={colors.onSurfaceVariant}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.onSurfaceVariant} />
                <TextInput
                  style={styles.input}
                  value={pwd}
                  onChangeText={setPwd}
                  placeholder="Masukkan Kata Sandi"
                  placeholderTextColor={colors.onSurfaceVariant}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              </View>

              <View style={styles.optionsRow}>
                <Pressable style={styles.rememberRow} onPress={() => setRememberMe((r) => !r)}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={12} color={colors.onPrimary} />}
                  </View>
                  <Text style={styles.rememberText}>Ingat saya</Text>
                </Pressable>
                <Pressable onPress={notAvailable}>
                  <Text style={styles.linkText}>Lupa Kata Sandi?</Text>
                </Pressable>
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={styles.submitButtonText}>Masuk</Text>
                )}
              </Pressable>

              <Text style={styles.dividerText}>Atau masuk dengan</Text>

              <Pressable style={styles.googleButton} onPress={handleGoogleLogin} disabled={googleLoading}>
                {googleLoading ? (
                  <ActivityIndicator size="small" color={colors.onSurface} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#EA4335" />
                    <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  heroFull: { ...StyleSheet.absoluteFill, backgroundColor: colors.primary },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primary,
    opacity: 0.12,
  },
  heroBrand: {
    position: "absolute",
    top: spacing.xl,
    alignSelf: "center",
    color: colors.white,
    fontSize: 26,
    fontFamily: fonts.display.extraBold,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl + 8,
    borderTopRightRadius: radius.xl + 8,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handleArea: { paddingTop: spacing.sm, paddingBottom: spacing.xs, alignItems: "center" },
  grabber: { width: 40, height: 4, borderRadius: radius.full, backgroundColor: colors.border },
  cardContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  title: {
    ...typography.headlineLg,
    fontSize: 22,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, color: colors.onSurface, fontSize: 14 },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  rememberText: { fontSize: 13, color: colors.onSurfaceVariant },
  linkText: { fontSize: 13, fontFamily: fonts.body.bold, color: colors.secondary },
  error: { color: colors.error, fontSize: 12, marginBottom: spacing.sm, textAlign: "center" },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  submitButtonText: { color: colors.onPrimary, fontFamily: fonts.body.bold, fontSize: 15 },
  dividerText: {
    textAlign: "center",
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 50,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  googleButtonText: { fontSize: 14, fontFamily: fonts.body.semiBold, color: colors.onSurface },
});
