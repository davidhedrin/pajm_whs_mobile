import useTheme from "@/hooks/use-theme";
import { useResposiveScale } from "@/lib/resposive";
import { Stack } from "expo-router";

const PurchaseOrderLayout = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: "Purchase Order List",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontSize: rf(15),
        },
        // headerRight: () => (
        //   <TouchableOpacity
        //     style={{ paddingEnd: rpm(6) }}
        //   >
        //     <Ionicons name="options-outline" size={rf(21)} color={colors.text} />
        //   </TouchableOpacity>
        // )
      }} />

      <Stack.Screen
        name="detail"
        options={{
          title: "Purchase Order Detail",
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

export default PurchaseOrderLayout