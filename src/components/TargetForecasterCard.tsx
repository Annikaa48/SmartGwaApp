import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import { calculateTargetRequirement } from "../lib/simulation";
import { Subject } from "../types";

type TargetForecasterCardProps = {
  subjects: Subject[];
};

export function TargetForecasterCard({ subjects }: TargetForecasterCardProps) {
  const [remainingUnits, setRemainingUnits] = useState<number>(3);
  const [selectedPreset, setSelectedPreset] = useState<"presidents" | "deans" | "custom">("presidents");
  const [customTargetText, setCustomTargetText] = useState<string>("1.75");

  const targetGwa = useMemo(() => {
    if (selectedPreset === "presidents") return 1.25;
    if (selectedPreset === "deans") return 1.5;
    const parsed = parseFloat(customTargetText);
    return isNaN(parsed) || parsed < 1.0 || parsed > 5.0 ? 1.75 : parsed;
  }, [selectedPreset, customTargetText]);

  const result = useMemo(() => {
    return calculateTargetRequirement(subjects, remainingUnits, targetGwa);
  }, [subjects, remainingUnits, targetGwa]);

  const handleAdjustUnits = (delta: number) => {
    setRemainingUnits((prev) => Math.max(0, Math.min(36, prev + delta)));
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons
            name="calculator-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.title}>Target GWA Forecaster</Text>
        </View>

        {/* Stepper for Remaining Units */}
        <View style={styles.unitStepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => handleAdjustUnits(-3)}
            disabled={remainingUnits <= 0}
          >
            <Ionicons
              name="remove"
              size={16}
              color={remainingUnits <= 0 ? colors.textMuted : colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.unitsValue}>{remainingUnits} units left</Text>

          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => handleAdjustUnits(3)}
            disabled={remainingUnits >= 36}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Select a target or enter a custom goal to see what average you need on your remaining {remainingUnits} units:
      </Text>

      {/* Preset Buttons */}
      <View style={styles.presetsRow}>
        <TouchableOpacity
          style={[
            styles.presetBtn,
            selectedPreset === "presidents" && styles.presetBtnActive,
          ]}
          onPress={() => setSelectedPreset("presidents")}
        >
          <Text
            style={[
              styles.presetBtnText,
              selectedPreset === "presidents" && styles.presetBtnTextActive,
            ]}
          >
            President's (1.25)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetBtn,
            selectedPreset === "deans" && styles.presetBtnActive,
          ]}
          onPress={() => setSelectedPreset("deans")}
        >
          <Text
            style={[
              styles.presetBtnText,
              selectedPreset === "deans" && styles.presetBtnTextActive,
            ]}
          >
            Dean's (1.50)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetBtn,
            selectedPreset === "custom" && styles.presetBtnActive,
          ]}
          onPress={() => setSelectedPreset("custom")}
        >
          <Text
            style={[
              styles.presetBtnText,
              selectedPreset === "custom" && styles.presetBtnTextActive,
            ]}
          >
            Custom Target
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom target input when Custom is active */}
      {selectedPreset === "custom" && (
        <View style={styles.customInputRow}>
          <Text style={styles.customInputLabel}>Target GWA:</Text>
          <TextInput
            style={styles.customInput}
            value={customTargetText}
            onChangeText={setCustomTargetText}
            keyboardType="numeric"
            placeholder="e.g. 1.75"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      )}

      {/* Result Display Box */}
      <View
        style={[
          styles.resultCard,
          result.isImpossible
            ? styles.resultCardImpossible
            : result.isAchieved
            ? styles.resultCardAchieved
            : styles.resultCardStandard,
        ]}
      >
        <View style={styles.resultHeader}>
          <View style={styles.resultBadge}>
            <Text
              style={[
                styles.resultBadgeText,
                result.isImpossible
                  ? styles.textImpossible
                  : result.isAchieved
                  ? styles.textAchieved
                  : styles.textStandard,
              ]}
            >
              Target: GWA ≤ {targetGwa.toFixed(2)}
            </Text>
          </View>

          {result.isImpossible ? (
            <View style={styles.statusPillImpossible}>
              <Ionicons name="alert-circle" size={14} color="#B91C1C" />
              <Text style={styles.statusPillTextImpossible}>Impossible</Text>
            </View>
          ) : result.isAchieved ? (
            <View style={styles.statusPillAchieved}>
              <Ionicons name="checkmark-circle" size={14} color="#15803D" />
              <Text style={styles.statusPillTextAchieved}>Achieved</Text>
            </View>
          ) : (
            <View style={styles.statusPillStandard}>
              <Ionicons name="trending-up" size={14} color={colors.primary} />
              <Text style={styles.statusPillTextStandard}>Achievable</Text>
            </View>
          )}
        </View>

        {result.isImpossible ? (
          <View style={styles.impossibleContent}>
            <Text style={styles.impossibleTitle}>Goal Out of Reach</Text>
            <Text style={styles.impossibleBody}>
              {result.message}
            </Text>
          </View>
        ) : result.isAchieved ? (
          <View style={styles.achievedContent}>
            <Text style={styles.achievedTitle}>Honors Goal Reached!</Text>
            <Text style={styles.achievedBody}>
              Your current weighted GWA of{" "}
              {result.currentGwa ? result.currentGwa.toFixed(2) : "—"} already satisfies
              the target of {targetGwa.toFixed(2)}.
            </Text>
          </View>
        ) : (
          <View style={styles.achievableContent}>
            <View style={styles.gradeHighlightBox}>
              <Text style={styles.neededGradeNumber}>
                {result.requiredAverage !== null
                  ? result.requiredAverage.toFixed(2)
                  : "—"}
              </Text>
              <Text style={styles.neededGradeLabel}>
                average grade needed on remaining {remainingUnits} units
              </Text>
            </View>
            <Text style={styles.achievableBody}>{result.message}</Text>
          </View>
        )}
      </View>
    </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.text,
  },
  unitStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
  },
  stepBtn: {
    padding: 4,
    minWidth: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  unitsValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    paddingHorizontal: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  presetsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  presetBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  presetBtnTextActive: {
    color: colors.white,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customInputLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.text,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  resultCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  resultCardStandard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  resultCardAchieved: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  resultCardImpossible: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  textStandard: { color: colors.primary },
  textAchieved: { color: "#047857" },
  textImpossible: { color: "#B91C1C" },
  statusPillStandard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPillTextStandard: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  statusPillAchieved: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPillTextAchieved: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  statusPillImpossible: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPillTextImpossible: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B91C1C",
  },
  impossibleContent: {
    gap: 2,
    marginTop: 4,
  },
  impossibleTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: "#B91C1C",
  },
  impossibleBody: {
    fontSize: 12,
    color: "#7F1D1D",
    lineHeight: 16,
  },
  achievedContent: {
    gap: 2,
    marginTop: 4,
  },
  achievedTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: "#047857",
  },
  achievedBody: {
    fontSize: 12,
    color: "#065F46",
    lineHeight: 16,
  },
  achievableContent: {
    gap: 4,
    marginTop: 4,
  },
  gradeHighlightBox: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  neededGradeNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
  },
  neededGradeLabel: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  achievableBody: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
