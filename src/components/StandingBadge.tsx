import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { StandingKey } from "../constants/grading";
import { fontSize, radius, spacing } from "../constants/theme";

type StandingStyle = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
};

const STANDING_STYLES: Record<StandingKey, StandingStyle> = {
  presidents: {
    label: "President's List",
    icon: "trophy",
    color: "#4338CA",
    background: "#EEF2FF",
  },
  deans: {
    label: "Dean's List",
    icon: "ribbon",
    color: "#047857",
    background: "#ECFDF5",
  },
  regular: {
    label: "Good Standing / Regular",
    icon: "checkmark-circle",
    color: "#0369A1",
    background: "#F0F9FF",
  },
  probation: {
    label: "Needs Improvement / Probation",
    icon: "alert-circle",
    color: "#DC2626",
    background: "#FEF2F2",
  },
  in_progress: {
    label: "In Progress",
    icon: "time-outline",
    color: "#64748B",
    background: "#F1F5F9",
  },
};

type Props = {
  standing: StandingKey | null;
  size?: "sm" | "md";
};

export default function StandingBadge({ standing, size = "md" }: Props) {
  if (!standing) return null;

  const style = STANDING_STYLES[standing] || STANDING_STYLES.in_progress;
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.background, borderColor: style.color + "33" },
        isSmall ? styles.badgeSmall : styles.badgeMedium,
      ]}
    >
      <Ionicons
        name={style.icon}
        size={isSmall ? 13 : 16}
        color={style.color}
      />
      <Text
        style={[
          styles.label,
          {
            color: style.color,
            fontSize: isSmall ? fontSize.sm - 1 : fontSize.sm,
          },
        ]}
      >
        {style.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs + 1,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  badgeSmall: { paddingHorizontal: spacing.sm + 2, paddingVertical: 4 },
  badgeMedium: { paddingHorizontal: spacing.md - 2, paddingVertical: 6 },
  label: { fontWeight: "700" },
});
