import useTheme from "@/hooks/useTheme";
import { Stack } from "expo-router";

const PurchaseRequestLayout = () => {
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: "Purchase Request",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text
      }} />
    </Stack>
  )
}

export default PurchaseRequestLayout