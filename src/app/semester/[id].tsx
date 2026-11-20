import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GwaHero from "../../components/GwaHero";
import { SubjectFormModal } from "../../components/SubjectFormModal";
import { SubjectRow } from "../../components/SubjectRow";
import { TargetForecasterCard } from "../../components/TargetForecasterCard";
import { colors, fontSize, radius, spacing } from "../../constants/theme";
import { useSemesters } from "../../context/SemestersContext";
import { formatGrade, formatUnits, summarizeSubjects } from "../../lib/gwa";
import { stepGrade } from "../../lib/simulation";
import { Subject } from "../../types";

export default function SemesterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { semesters, isLoading, addSubject, updateSubject, deleteSubject } =
    useSemesters();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // --- Simulation Sandbox State ---
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedSubjects, setSimulatedSubjects] = useState<Subject[]>([]);

  const semester = semesters.find((item) => item.id === id);
  const officialSubjects = (semester?.subjects ?? []) as Subject[];

  // Keep simulated copy synchronized when not in simulation mode
  useEffect(() => {
    if (!isSimulating) {
      setSimulatedSubjects(officialSubjects);
    }
  }, [officialSubjects, isSimulating]);

  const activeSubjects = isSimulating ? simulatedSubjects : officialSubjects;

  const summary = useMemo(
    () => summarizeSubjects(activeSubjects as any),
    [activeSubjects],
  );

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  // --- Simulation Handlers ---
  const handleToggleSimulation = (forcedValue?: boolean) => {
    const nextState =
      typeof forcedValue === "boolean" ? forcedValue : !isSimulating;
    if (nextState) {
      setSimulatedSubjects(JSON.parse(JSON.stringify(officialSubjects)));
    }
    setIsSimulating(nextState);
  };

  const handleStepGrade = (subjectId: string, direction: "up" | "down") => {
    setSimulatedSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            grade: stepGrade(sub.grade, direction),
          };
        }
        return sub;
      }),
    );
  };

  const handleRevertSimulation = () => {
    setSimulatedSubjects(JSON.parse(JSON.stringify(officialSubjects)));
  };

  // --- Official Supabase Handlers ---
  const handleOpenAddModal = () => {
    setSelectedSubject(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    if (isSimulating) return;
    setSelectedSubject(subject);
    setModalVisible(true);
  };

  const handleSaveSubject = async (subjectData: any) => {
    const code = subjectData.subject_code || subjectData.code || "";

    if (selectedSubject) {
      await updateSubject(selectedSubject.id, {
        subject_code: code,
        units: subjectData.units,
        grade: subjectData.grade,
        is_included_in_gwa: subjectData.is_included_in_gwa,
      });
    } else {
      await addSubject(id as string, {
        semester_id: id as string,
        subject_code: code,
        units: subjectData.units,
        grade: subjectData.grade,
        is_included_in_gwa: subjectData.is_included_in_gwa,
      });
    }
  };

  const handleToggleGwa = async (subjectId: string, isIncluded: boolean) => {
    if (isSimulating) {
      setSimulatedSubjects((prev) =>
        prev.map((sub) =>
          sub.id === subjectId
            ? { ...sub, is_included_in_gwa: isIncluded }
            : sub,
        ),
      );
      return;
    }

    try {
      await updateSubject(subjectId, { is_included_in_gwa: isIncluded });
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not update subject.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={goBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>

          {!isSimulating && (
            <Pressable
              onPress={handleOpenAddModal}
              accessibilityRole="button"
              style={styles.addPill}
            >
              <Ionicons name="add" size={18} color={colors.white} />
              <Text style={styles.addPillLabel}>Add subject</Text>
            </Pressable>
          )}
        </View>

        {!semester ? (
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.spinner} />
          ) : (
            <Text style={styles.notFound}>
              This semester could not be found.
            </Text>
          )
        ) : (
          <>
            <Text style={styles.title}>{semester.term_name}</Text>

            {/* Whole-Row Tap-Friendly Toggle Bar */}
            <TouchableOpacity
              style={[
                styles.sandboxToggleBar,
                isSimulating && styles.sandboxToggleBarActive,
              ]}
              onPress={() => handleToggleSimulation()}
              activeOpacity={0.7}
            >
              <View style={styles.toggleInfo}>
                <Ionicons
                  name="flask-outline"
                  size={20}
                  color={isSimulating ? "#d97706" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.toggleLabel,
                    isSimulating && { color: "#92400e" },
                  ]}
                >
                  What-If Simulator
                </Text>
              </View>
              <View pointerEvents="none">
                <Switch
                  value={isSimulating}
                  trackColor={{ false: colors.border, true: "#f59e0b" }}
                  thumbColor={colors.white}
                />
              </View>
            </TouchableOpacity>

            {/* Simulation Active Notice */}
            {isSimulating && (
              <View style={styles.simulationNotice}>
                <View style={styles.noticeHeader}>
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color="#92400e"
                  />
                  <Text style={styles.noticeTitle}>Simulation Active</Text>
                </View>
                <Text style={styles.noticeDescription}>
                  Tweak grades below to preview your target GWA. None of these
                  changes will affect your Supabase database.
                </Text>
                <TouchableOpacity
                  style={styles.revertButton}
                  onPress={handleRevertSimulation}
                >
                  <Ionicons name="refresh-outline" size={16} color="#92400e" />
                  <Text style={styles.revertButtonText}>
                    Reset to Official Grades
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <GwaHero
              title={isSimulating ? "SIMULATED GWA" : "SEMESTER GWA"}
              summary={summary}
              stats={[
                {
                  label: "Units earned",
                  value: formatUnits(summary.earnedUnits),
                },
                {
                  label: "Units in GWA",
                  value: formatUnits(summary.countedUnits),
                },
                { label: "Subjects", value: String(summary.subjectCount) },
              ]}
            />

            {/* Target Standing Forecaster */}
            {isSimulating && <TargetForecasterCard subjects={activeSubjects} />}

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>
                {isSimulating ? "Adjust Simulated Grades" : "Subjects"}
              </Text>
            </View>

            {activeSubjects.length === 0 ? (
              <Text style={styles.empty}>
                No subjects yet. Tap "+ Add subject" to start.
              </Text>
            ) : (
              activeSubjects.map((subject) => {
                if (isSimulating) {
                  return (
                    <View key={subject.id} style={styles.simulatedCard}>
                      <View style={styles.simLeft}>
                        <Text style={styles.simCode}>
                          {subject.subject_code}
                        </Text>
                        <Text style={styles.simMeta}>
                          {formatUnits(subject.units)} units
                          {!subject.is_included_in_gwa && " · Excluded"}
                        </Text>
                      </View>

                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() => handleStepGrade(subject.id, "down")}
                          accessibilityLabel="Lower grade"
                        >
                          <Ionicons
                            name="remove"
                            size={18}
                            color={colors.text}
                          />
                        </TouchableOpacity>

                        <Text style={styles.simGrade}>
                          {formatGrade(subject.grade)}
                        </Text>

                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() => handleStepGrade(subject.id, "up")}
                          accessibilityLabel="Improve grade"
                        >
                          <Ionicons name="add" size={18} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }

                return (
                  <SubjectRow
                    key={subject.id}
                    subject={subject}
                    onEdit={handleOpenEditModal}
                    onToggleGwa={handleToggleGwa}
                  />
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {semester && !isSimulating && (
        <SubjectFormModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveSubject}
          onDelete={deleteSubject}
          existingSubjects={officialSubjects}
          semesterId={id as string}
          initialData={selectedSubject}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl, maxWidth: 680, width: '100%', alignSelf: 'center' },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  spinner: { marginTop: spacing.xl },
  notFound: {
    marginTop: spacing.lg,
    textAlign: "center",
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
  },
  sandboxToggleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sandboxToggleBarActive: {
    backgroundColor: "#fffbeb",
    borderColor: "#f59e0b",
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  toggleLabel: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  simulationNotice: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  noticeTitle: {
    fontWeight: "800",
    color: "#92400e",
    fontSize: fontSize.sm,
  },
  noticeDescription: {
    color: "#78350f",
    fontSize: 13,
    lineHeight: 18,
  },
  revertButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: "#fde68a",
  },
  revertButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  sectionRow: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
  },
  empty: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: spacing.xl,
  },
  simulatedCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  simLeft: {
    flex: 1,
  },
  simCode: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  simMeta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  simGrade: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.text,
    minWidth: 44,
    textAlign: "center",
  },
});
