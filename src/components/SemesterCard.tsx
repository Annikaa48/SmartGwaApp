import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import {
    formatGwa,
    formatUnits,
    getStanding,
    summarizeSubjects,
} from "../lib/gwa";
import type { SemesterWithSubjects } from "../types/database";
import StandingBadge from "./StandingBadge";

type Props = {
  semester: SemesterWithSubjects;
  onPress: () => void;
  onDelete: () => void;
};

export default function SemesterCard({ semester, onPress, onDelete }: Props) {
  const summary = summarizeSubjects(semester.subjects);
  const standing = getStanding(summary);

  const subjectLabel =
    summary.subjectCount === 1
      ? "1 subject"
      : `${summary.subjectCount} subjects`;
  const unitLabel = summary.totalUnits === 1 ? "unit" : "units";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.term} numberOfLines={1}>
          {semester.term_name}
        </Text>
        <Pressable
          onPress={onDelete}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${semester.term_name}`}
        >
          <Ionicons name="trash-outline" size={19} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.meta}>
        {subjectLabel} · {formatUnits(summary.totalUnits)} {unitLabel}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.badgeSlot}>
          {standing ? <StandingBadge standing={standing} size="sm" /> : null}
        </View>
        <View style={styles.gwaBox}>
          <Text style={styles.gwaValue}>{formatGwa(summary.gwa)}</Text>
          <Text style={styles.gwaLabel}>GWA</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.xs + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { backgroundColor: colors.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  term: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  meta: { fontSize: fontSize.sm, color: colors.textMuted },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  badgeSlot: { flex: 1, paddingRight: spacing.sm },
  gwaBox: { alignItems: "flex-end" },
  gwaValue: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 34,
  },
  gwaLabel: {
    fontSize: fontSize.sm - 1,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
