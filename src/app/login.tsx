import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import AuthLayout from "../components/AuthLayout";
import FormMessage from "../components/FormMessage";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { colors, fontSize, spacing } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../lib/validation";

type FieldErrors = { email?: string; password?: string };

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (submitting) return;

    const nextErrors: FieldErrors = {};
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length === 0) nextErrors.password = "Enter your password.";

    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await signIn(email, password);
    if (result.error) {
      setFormError(result.error);
      setSubmitting(false);
    } else {
      router.replace("/");
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your grades and GWA."
    >
      {formError ? <FormMessage type="error" message={formError} /> : null}

      <TextField
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        placeholder="you@school.edu"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        editable={!submitting}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <TextField
        ref={passwordRef}
        label="Password"
        icon="lock-closed-outline"
        isPassword
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="Your password"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        editable={!submitting}
        onSubmitEditing={handleLogin}
      />

      {/* Forgot Password Link */}
      <View style={styles.forgotRow}>
        <Link href="/forgot-password" style={styles.forgotText}>
          Forgot password?
        </Link>
      </View>

      <PrimaryButton
        title="Log in"
        onPress={handleLogin}
        loading={submitting}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/register" replace style={styles.link}>
          Create one
        </Link>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs + 2,
  },
  footerText: { fontSize: fontSize.md, color: colors.textMuted },
  link: { fontSize: fontSize.md, fontWeight: "700", color: colors.primary },
});
