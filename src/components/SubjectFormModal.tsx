import { confirmAction, showAlert } from "../lib/alerts";
import { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import { validateSubject } from "../lib/subjectValidation";
import { Subject } from "../types";

type SubjectFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (subjectData: Omit<Subject, "id" | "created_at">) => Promise<void>;
  onDelete?: (subjectId: string) => Promise<void>;
  existingSubjects: Subject[];
  semesterId: string;
  initialData?: Subject | null;
};

export function SubjectFormModal({
  visible,
  onClose,
  onSave,
  onDelete,
  existingSubjects,
  semesterId,
  initialData,
}: SubjectFormModalProps) {
  const [code, setCode] = useState("");
  const [units, setUnits] = useState("");
  const [grade, setGrade] = useState("");
  const [isIncluded, setIsIncluded] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && visible) {
      setCode(initialData.subject_code || (initialData as any).code || "");
      setUnits(
        initialData.units !== undefined && initialData.units !== null
          ? String(initialData.units)
          : "",
      );
      setGrade(
        initialData.grade !== undefined &&
          initialData.grade !== null &&
          !isNaN(Number(initialData.grade))
          ? String(initialData.grade)
          : "",
      );
      setIsIncluded(initialData.is_included_in_gwa ?? true);
      setErrorMessage(null);
    } else if (visible) {
      setCode("");
      setUnits("");
      setGrade("");
      setIsIncluded(true);
      setErrorMessage(null);
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    setErrorMessage(null);
    const numUnits = parseFloat(units.trim());
    const trimmedGrade = grade.trim();
    const numGrade = trimmedGrade === "" ? null : parseFloat(trimmedGrade);

    const validation = validateSubject(
      code,
      numUnits,
      numGrade,
      existingSubjects,
      initialData?.id,
    );

    if (!validation.isValid) {
      setErrorMessage(validation.error || "Please check inputs.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        semester_id: semesterId,
        subject_code: code.trim().toUpperCase(),
        units: numUnits,
        grade: numGrade,
        is_included_in_gwa: isIncluded,
      });
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to save subject.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!initialData || !onDelete) return;
    confirmAction(
      "Delete Subject",
      `Are you sure you want to delete ${initialData.subject_code || (initialData as any).code}?`,
      async () => {
        setIsSubmitting(true);
        try {
          await onDelete(initialData.id);
          onClose();
        } catch (error: any) {
          showAlert("Error", error.message || "Failed to delete.");
        } finally {
          setIsSubmitting(false);
        }
      },
      "Delete",
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.headerTitle}>
            {initialData ? "Edit Subject" : "Add Subject"}
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subject Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. CS 101, ENG 1"
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={(t) => {
                setCode(t);
                setErrorMessage(null);
              }}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>Units</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 3"
                placeholderTextColor={colors.textMuted}
                value={units}
                onChangeText={(t) => {
                  setUnits(t);
                  setErrorMessage(null);
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>Final Grade (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="1.00 - 5.00 or blank"
                placeholderTextColor={colors.textMuted}
                value={grade}
                onChangeText={(t) => {
                  setGrade(t);
                  setErrorMessage(null);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={styles.fieldHint}>
            Tip: Leave grade blank if this course is currently in progress.
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Include in GWA</Text>
              <Text style={styles.switchSub}>
                Disable for non-academic/PE/NSTP courses
              </Text>
            </View>
            <Switch
              value={isIncluded}
              onValueChange={setIsIncluded}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? "Saving..." : "Save Subject"}
              </Text>
            </TouchableOpacity>
          </View>

          {initialData && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={isSubmitting}
            >
              <Text style={styles.deleteButtonText}>Delete Subject</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: fontSize.sm,
    fontWeight: "600",
    textAlign: "center",
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: fontSize.sm - 1,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md - 2,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  halfInput: { flex: 1 },
  fieldHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  switchLabel: { fontSize: fontSize.md, color: colors.text, fontWeight: "700" },
  switchSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  buttonRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: colors.background },
  saveButton: { backgroundColor: colors.primary },
  cancelButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: fontSize.md,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: fontSize.md,
  },
  deleteButton: { padding: spacing.sm, alignItems: "center" },
  deleteButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: fontSize.md,
  },
});
