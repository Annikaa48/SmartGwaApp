import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import { formatGrade, formatUnits } from "../lib/gwa";
import { Subject } from "../types";

type SubjectRowProps = {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onToggleGwa: (subjectId: string, isIncluded: boolean) => void;
};

export function SubjectRow({ subject, onEdit, onToggleGwa }: SubjectRowProps) {
  return (
    <TouchableOpacity
      style={[styles.card, !subject.is_included_in_gwa && styles.cardExcluded]}
      onPress={() => onEdit(subject)}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{subject.subject_code}</Text>
          <Text style={styles.units}>
            {formatUnits(subject.units)}{" "}
            {subject.units === 1 ? "unit" : "units"}
            {!subject.is_included_in_gwa && " · Excluded"}
          </Text>
        </View>
        <Text style={styles.grade}>{formatGrade(subject.grade)}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.toggleLabel}>Include in GWA</Text>
        <Switch
          value={subject.is_included_in_gwa}
          onValueChange={(val) => onToggleGwa(subject.id, val)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardExcluded: {
    opacity: 0.65,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeContainer: {
    flex: 1,
    gap: 2,
  },
  code: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  units: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  grade: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
