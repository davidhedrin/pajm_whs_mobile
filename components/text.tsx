import useTheme from "@/hooks/useTheme";
import { Text, TextProps } from "react-native";

export function CText(props: TextProps) {
  const { colors } = useTheme();

  return (
    <Text
      className="font-regular"
      {...props}
      style={[{ color: colors.text }, props.style]}
    />
  );
}