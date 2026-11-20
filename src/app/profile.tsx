import { confirmAction, showAlert } from "../lib/alerts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
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
import StandingBadge from "../components/StandingBadge";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useSemesters } from "../context/SemestersContext";
import { formatGwa, formatUnits, getStanding, summarizeSemesters } from "../lib/gwa";
import { supabase } from "../lib/supabase";

function getStandingLabel(gwa: number | null | undefined, hasFailing: boolean): string {
  if (gwa === null || gwa === undefined || gwa === 0) return "In Progress";
  if (hasFailing) {
    return gwa > 3.0 ? "Needs Improvement / Probation" : "Good Standing / Regular";
  }
  if (gwa <= 1.25) return "President's List";
  if (gwa <= 1.5) return "Dean's List";
  if (gwa <= 3.0) return "Good Standing / Regular";
  return "Needs Improvement / Probation";
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, fullName, signOut } = useAuth();
  const { semesters } = useSemesters();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const overall = useMemo(
    () => summarizeSemesters(semesters as any),
    [semesters],
  );

  const email = session?.user?.email || "No email available";
  const standingKey = getStanding(overall);
  const standingLabel = getStandingLabel(overall.gwa, overall.hasFailingGrade);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showAlert("Success", "Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      router.replace("/login");
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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Top Bar with Safe Navigation */}
            <View style={styles.topBar}>
              <Pressable
                onPress={handleBack}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={styles.iconButton}
              >
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
              <Text style={styles.screenTitle}>Student Profile</Text>
              <View style={styles.placeholder} />
            </View>

            {/* User Info Header Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {(fullName || "S").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{fullName || "Student"}</Text>
                <Text style={styles.profileEmail}>{email}</Text>
              </View>
            </View>

            {/* Lifetime Academic Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Academic Standing</Text>
              <View style={styles.statsCard}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Cumulative GWA</Text>
                  <Text style={styles.statValue}>
                    {formatGwa(overall.gwa)}
                  </Text>
                  <View style={styles.badgeWrapper}>
                    <StandingBadge standing={standingKey} size="sm" />
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Units Earned</Text>
                  <Text style={styles.statValue}>
                    {formatUnits(overall.earnedUnits)}
                  </Text>
                  <Text style={styles.statSub}>
                    {semesters.length} {semesters.length === 1 ? "term" : "terms"} recorded
                  </Text>
                </View>
              </View>
            </View>

            {/* Change Password Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Security</Text>
              <View style={styles.securityCard}>
                <TextField
                  label="New password"
                  icon="lock-closed-outline"
                  isPassword
                  value={newPassword}
                  onChangeText={(t) => {
                    setNewPassword(t);
                    setPasswordError(null);
                  }}
                  placeholder="At least 6 characters"
                  autoCapitalize="none"
                  error={passwordError || undefined}
                  editable={!isUpdatingPassword}
                />

                <TextField
                  label="Confirm new password"
                  icon="lock-closed-outline"
                  isPassword
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    setPasswordError(null);
                  }}
                  placeholder="Re-enter password"
                  autoCapitalize="none"
                  editable={!isUpdatingPassword}
                />

                <PrimaryButton
                  title="Update Password"
                  onPress={handleUpdatePassword}
                  loading={isUpdatingPassword}
                  disabled={!newPassword || !confirmPassword}
                />
              </View>
            </View>

            {/* Session Sign Out */}
            <Pressable
              style={styles.signOutButton}
              onPress={handleSignOut}
              accessibilityRole="button"
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text style={styles.signOutText}>Sign Out of SmartGWA</Text>
            </Pressable>
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
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  container: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  screenTitle: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.text,
  },
  placeholder: { width: 44 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.primary,
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  section: { gap: spacing.xs + 2 },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: fontSize.sm - 1,
    color: colors.textMuted,
    fontWeight: "600",
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
  },
  badgeWrapper: {
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  securityCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: "#FEE2E2",
    borderRadius: radius.lg,
    marginTop: spacing.xs,
  },
  signOutText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: "#DC2626",
  },
});
