import { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { colors, fontSize, radius, spacing } from "../constants/theme";
import {
    TERM_LABELS,
    YEAR_LABELS,
    buildTermName,
    parseTermName,
    suggestNextTerm,
} from "../lib/terms";
import PrimaryButton from "./PrimaryButton";
import TextField from "./TextField";

type Props = {
  visible: boolean;
  existingNames: string[];
  onClose: () => void;
  onSubmit: (termName: string) => Promise<{ error: string | null } | any>;
};

type SheetProps = Omit<Props, "visible">;

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Sheet({ existingNames, onClose, onSubmit }: SheetProps) {
  const [initial] = useState(() => {
    const suggestion = suggestNextTerm(existingNames);
    return { name: suggestion, parsed: parseTermName(suggestion) };
  });

  const [yearIndex, setYearIndex] = useState(initial.parsed?.yearIndex ?? 0);
  const [termIndex, setTermIndex] = useState(initial.parsed?.termIndex ?? 0);
  const [name, setName] = useState(initial.name);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function pickYear(index: number) {
    setYearIndex(index);
    setName(buildTermName(index, termIndex));
    setError(null);
  }

  function pickTerm(index: number) {
    setTermIndex(index);
    setName(buildTermName(yearIndex, index));
    setError(null);
  }

  async function handleSubmit() {
    if (submitting) return;

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Enter a semester name.");
      return;
    }
    if (trimmed.length > 60) {
      setError("Keep the name under 60 characters.");
      return;
    }
    const duplicate = existingNames.some(
      (existing) => existing.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setError("You already have a semester with that name.");
      return;
    }

    setSubmitting(true);
    const result = await onSubmit(trimmed);
    setSubmitting(false);

    if (result && result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close"
      />

      <View style={styles.sheet}>
        <Text style={styles.heading}>New semester</Text>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Year</Text>
          <View style={styles.chipRow}>
            {YEAR_LABELS.map((label, index) => (
              <Chip
                key={label}
                label={label}
                selected={index === yearIndex}
                onPress={() => pickYear(index)}
              />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Term</Text>
          <View style={styles.chipRow}>
            {TERM_LABELS.map((label, index) => (
              <Chip
                key={label}
                label={label}
                selected={index === termIndex}
                onPress={() => pickTerm(index)}
              />
            ))}
          </View>
        </View>

        <TextField
          label="Semester name"
          icon="calendar-outline"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(null);
          }}
          error={error || undefined}
          placeholder="e.g. 2nd Year - Summer"
          autoCapitalize="words"
          returnKeyType="done"
          editable={!submitting}
          onSubmitEditing={() => {
            void handleSubmit();
          }}
        />

        <View style={styles.actions}>
          <PrimaryButton
            title="Add semester"
            onPress={handleSubmit}
            loading={submitting}
          />
          <PrimaryButton
            title="Cancel"
            variant="secondary"
            onPress={onClose}
            disabled={submitting}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function AddSemesterModal({
  visible,
  existingNames,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {visible ? (
        <Sheet
          existingNames={existingNames}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  sheet: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
  },
  group: { gap: spacing.sm },
  groupLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.text,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: (colors as any).primarySoft || "#eff6ff",
  },
  chipLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textMuted,
  },
  chipLabelSelected: {
    color: (colors as any).primaryPressed || colors.primary,
  },
  actions: { gap: spacing.sm + 2, marginTop: spacing.xs },
});
