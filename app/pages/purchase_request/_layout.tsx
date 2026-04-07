import useTheme from "@/hooks/use-theme";
import { useResposiveScale } from "@/lib/resposive";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";

const PurchaseRequestLayout = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: "Purchase Request",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontSize: rf(15),
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back-outline" size={rf(21)} color={colors.text} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={{ paddingEnd: rpm(6) }}
          >
            <Ionicons name="options-outline" size={rf(21)} color={colors.text} />
          </TouchableOpacity>
        )
      }} />

      <Stack.Screen
        name="detail"
        options={{
          title: "PR Detail",
          headerTitleAlign: "center",
          headerShown: false,
        }}
      />
    </Stack>
  )
}

export default PurchaseRequestLayout