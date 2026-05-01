import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Stack } from "expo-router";
import React from 'react';

const AuthLayout = () => {
  const { rpm, rf } = useResposiveScale();
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerShown: false,
      }} />

      <Stack.Screen
        name="config"
        options={{
          title: "App Config",
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

export default AuthLayout