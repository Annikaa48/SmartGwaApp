import { confirmAction, showAlert } from "../lib/alerts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddSemesterModal from "../components/AddSemesterModal";
import EmptyState from "../components/EmptyState";
import FormMessage from "../components/FormMessage";
import GwaHero from "../components/GwaHero";
import SemesterCard from "../components/SemesterCard";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useSemesters } from "../context/SemestersContext";
import { formatUnits, summarizeSemesters } from "../lib/gwa";

function Separator() {
  return <View style={styles.separator} />;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { fullName, signOut } = useAuth();

  const {
    semesters,
    isLoading,
    refreshSemesters,
    addSemester,
    deleteSemester,
  } = useSemesters();

  const [addVisible, setAddVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = fullName?.split(" ")[0] || "there";
  const overall = useMemo(
    () => summarizeSemesters(semesters as any),
    [semesters],
  );

  const existingNames = useMemo(
    () =>
      semesters.map(
        (semester: any) => semester.term_name || semester.name || "",
      ),
    [semesters],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSemesters();
    setRefreshing(false);
  };

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      router.replace("/login");
    }
  }

  function confirmDelete(semester: any) {
    confirmAction(
      "Delete semester?",
      `"${semester.term_name || semester.name}" and all of its subjects will be permanently deleted.`,
      async () => {
        try {
          await deleteSemester(semester.id);
        } catch (err: any) {
          showAlert("Couldn't delete", err?.message || "Error deleting");
        }
      },
      "Delete"
    );
  }

  const handleAddSemester = async (termOrName: any) => {
    try {
      const termName =
        typeof termOrName === "object" && termOrName !== null
          ? termOrName.term_name || termOrName.name
          : termOrName;

      const result = await addSemester(termName);
      if (result?.error) {
        setError(result.error);
      } else {
        setAddVisible(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to add semester");
    }
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.greetingBox}>
          <Text style={styles.hello}>Hi, {firstName}</Text>
          <Text style={styles.subhello}>Here's your academic standing</Text>
        </View>
        <View style={styles.topActions}>
          <Pressable
            onPress={() => router.push("/profile")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Student Profile"
            style={({ pressed }) => [
              styles.iconButton,
              pressed && { opacity: 0.7 },
              Platform.OS === "web" && ({ cursor: "pointer" } as any),
            ]}
          >
            <Ionicons name="person-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={handleSignOut}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
            style={({ pressed }) => [
              styles.iconButton,
              styles.signOutIconButton,
              pressed && { opacity: 0.7 },
              Platform.OS === "web" && ({ cursor: "pointer" } as any),
            ]}
          >
            <Ionicons name="log-out-outline" size={22} color="#b91c1c" />
          </Pressable>
        </View>
      </View>

      <GwaHero
        title="OVERALL GWA"
        summary={overall}
        stats={[
          { label: "Units earned", value: formatUnits(overall.earnedUnits) },
          { label: "Semesters", value: String(semesters.length) },
          { label: "Subjects", value: String(overall.subjectCount) },
        ]}
      />

      {error ? <FormMessage type="error" message={error} /> : null}

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Semesters</Text>
        <Pressable
          onPress={() => setAddVisible(true)}
          accessibilityRole="button"
          style={styles.addPill}
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.addPillLabel}>Add semester</Text>
        </Pressable>
      </View>
    </View>
  );

  let emptyContent = null;
  if (isLoading) {
    emptyContent = (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  } else if (!error) {
    emptyContent = (
      <EmptyState
        icon="library-outline"
        title="No semesters yet"
        message="Add your first semester, then add subjects to watch your GWA update instantly."
        actionLabel="Add your first semester"
        onAction={() => setAddVisible(true)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={semesters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListEmptyComponent={emptyContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <SemesterCard
            semester={item as any}
            onPress={() =>
              router.push({
                pathname: "/semester/[id]",
                params: { id: item.id },
              })
            }
            onDelete={() => confirmDelete(item)}
          />
        )}
      />

      <AddSemesterModal
        visible={addVisible}
        existingNames={existingNames}
        onClose={() => setAddVisible(false)}
        onSubmit={handleAddSemester as any}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  header: { gap: spacing.md, marginBottom: spacing.md },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greetingBox: { flex: 1 },
  hello: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
  },
  subhello: { marginTop: 2, fontSize: fontSize.md, color: colors.textMuted },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
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
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  signOutIconButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
  },
  addPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingLeft: spacing.sm + 2,
    paddingRight: spacing.md - 2,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
  },
  addPillLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.white,
  },
  separator: { height: spacing.md - 4 },
  loadingBox: { paddingVertical: spacing.xl },
});
