import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, radius, spacing } from "../constants/theme";

type Props = {
  type: "error" | "success";
  message: string;
};

export default function FormMessage({ type, message }: Props) {
  const isError = type === "error";
  const tint = isError ? colors.danger : colors.successText;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.box,
        { backgroundColor: isError ? colors.dangerSoft : colors.successSoft },
      ]}
    >
      <Ionicons
        name={isError ? "alert-circle" : "checkmark-circle"}
        size={18}
        color={tint}
      />
      <Text style={[styles.text, { color: tint }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md - 4,
    borderRadius: radius.md,
  },
  text: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: "600",
    lineHeight: 18,
  },
});
