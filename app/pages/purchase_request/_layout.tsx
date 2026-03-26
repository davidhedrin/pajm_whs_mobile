import useTheme from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

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
        headerTintColor: colors.text,
        headerRight: () => (
          <TouchableOpacity
            style={{ paddingEnd: 8 }}
          >
            <Ionicons name="options-outline" size={25} color={colors.text} />
          </TouchableOpacity>
        )
      }} />
    </Stack>
  )
}

export default PurchaseRequestLayout