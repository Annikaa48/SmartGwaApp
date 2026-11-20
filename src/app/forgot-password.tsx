import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/login");
    }
  };

  const handleResetRequest = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmed,
        {
          redirectTo:
            Platform.OS === "web" && typeof window !== "undefined"
              ? window.location.origin + "/login"
              : "smartgwa://reset-password",
        },
      );

      if (resetError) throw resetError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../../assets/images/smartgwa-logo.png")}
                  style={styles.logoImage}
                  resizeMode="cover"
                  accessibilityLabel="SmartGWA Logo"
                />
              </View>
              <Text style={styles.brand}>SmartGWA</Text>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your registered email and we'll send you recovery
                instructions.
              </Text>
            </View>

            {submitted ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Check your inbox</Text>
                <Text style={styles.successDescription}>
                  We've sent a password reset link to{" "}
                  <Text style={styles.boldEmail}>{email.trim()}</Text>.
                </Text>

                <PrimaryButton
                  title="Back to Sign in"
                  onPress={() => router.replace("/login")}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <TextField
                  label="Email address"
                  icon="mail-outline"
                  placeholder="student@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={error || undefined}
                  editable={!loading}
                />

                <PrimaryButton
                  title="Send Reset Instructions"
                  onPress={handleResetRequest}
                  loading={loading}
                />

                <Pressable
                  onPress={handleBack}
                  style={styles.backLink}
                  hitSlop={8}
                >
                  <Text style={styles.backLinkText}>Back to Sign In</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  content: {
    padding: spacing.lg,
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: spacing.lg,
  },
  header: { gap: spacing.xs, alignItems: "center" },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    overflow: "hidden",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  brand: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 340,
  },
  form: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backLink: { alignSelf: "center", paddingVertical: spacing.xs },
  backLinkText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.primary,
  },
  successBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: spacing.md,
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
  },
  successDescription: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  boldEmail: {
    fontWeight: "700",
    color: colors.text,
  },
});
