import useTheme from "@/hooks/use-theme";
import { Text, TextProps } from "react-native";

export function CText({ className, ...props }: { className?: string } & TextProps) {
  const { colors } = useTheme();

  return (
    <Text
      className={`${className ?? ''} font-regular`}
      {...props}
      style={[{ color: colors.text }, props.style]}
    />
  );
}