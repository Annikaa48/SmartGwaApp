import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import AuthLayout from "../components/AuthLayout";
import FormMessage from "../components/FormMessage";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { colors, fontSize, spacing } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { MIN_PASSWORD_LENGTH, isValidEmail } from "../lib/validation";

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirm !== password) next.confirm = "Passwords do not match.";
    return next;
  }

  async function handleRegister() {
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    setNotice(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await signUp(fullName, email, password);

    if (result.error) {
      setFormError(result.error);
    } else if (result.needsEmailConfirmation) {
      setNotice("Account created! Check your email to confirm your address, then log in.");
      setPassword("");
      setConfirm("");
    } else {
      router.replace("/");
    }
    setSubmitting(false);
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Track your GWA across every semester."
    >
      {formError ? <FormMessage type="error" message={formError} /> : null}
      {notice ? <FormMessage type="success" message={notice} /> : null}

      <TextField
        label="Full name"
        icon="person-outline"
        value={fullName}
        onChangeText={setFullName}
        error={errors.fullName}
        placeholder="Juan Dela Cruz"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        editable={!submitting}
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <TextField
        ref={emailRef}
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
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        editable={!submitting}
        onSubmitEditing={() => confirmRef.current?.focus()}
      />

      <TextField
        ref={confirmRef}
        label="Confirm password"
        icon="lock-closed-outline"
        isPassword
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        placeholder="Re-enter your password"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        editable={!submitting}
        onSubmitEditing={handleRegister}
      />

      <PrimaryButton
        title="Create account"
        onPress={handleRegister}
        loading={submitting}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/login" replace style={styles.link}>
          Log in
        </Link>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs + 2,
  },
  footerText: { fontSize: fontSize.md, color: colors.textMuted },
  link: { fontSize: fontSize.md, fontWeight: "700", color: colors.primary },
});
