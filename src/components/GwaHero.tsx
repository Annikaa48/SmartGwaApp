import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import { formatGwa, getStanding, GwaSummary } from "../lib/gwa";
import StandingBadge from "./StandingBadge";

type Stat = { label: string; value: string };

type Props = {
  title: string;
  summary: GwaSummary;
  stats: Stat[];
};

export default function GwaHero({ title, summary, stats }: Props) {
  const standing = getStanding(summary);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.gwa}>{formatGwa(summary.gwa)}</Text>

      <View style={styles.badgeSlot}>
        {standing ? (
          <StandingBadge standing={standing} />
        ) : (
          <Text style={styles.hint}>Add subjects to see your GWA.</Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
  gwa: {
    marginTop: spacing.xs,
    fontSize: 60,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -1,
  },
  badgeSlot: {
    minHeight: 30,
    marginTop: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.85)",
  },
  divider: {
    alignSelf: "stretch",
    height: 1,
    marginVertical: spacing.md,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  statsRow: {
    flexDirection: "row",
    alignSelf: "stretch",
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.white,
  },
  statLabel: {
    marginTop: 2,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.85)",
  },
});
