import useTheme from "@/hooks/use-theme";
import { useResposiveScale } from "@/lib/resposive";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

const PurchaseRequestLayout = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: "Purchase Request List",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontSize: rf(15),
        },
        // headerLeft: () => (
        //   <TouchableOpacity
        //     onPress={() => navigation.goBack()}
        //   >
        //     <Ionicons name="arrow-back-outline" size={rf(21)} color={colors.text} />
        //   </TouchableOpacity>
        // ),
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
          title: "Purchase Request Detail",
          headerTitleAlign: "center",
          headerShown: true,

          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontSize: rf(15),
          },
        }}
      />
    </Stack>
  )
}

export default PurchaseRequestLayout