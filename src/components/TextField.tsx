import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { colors, fontSize, radius, spacing } from "../constants/theme";

type Props = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  label: string;
  error?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, icon, isPassword = false, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(isPassword);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.row,
          focused && styles.rowFocused,
          !!error && styles.rowError,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.textMuted}
            style={styles.leadingIcon}
          />
        ) : null}
        <TextInput
          ref={ref}
          {...inputProps}
          secureTextEntry={hidden}
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs + 2 },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  rowFocused: { borderColor: colors.primary },
  rowError: { borderColor: colors.danger },
  leadingIcon: { marginRight: spacing.sm + 2 },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontSize: fontSize.md + 1,
    color: colors.text,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    fontWeight: "500",
  },
});
