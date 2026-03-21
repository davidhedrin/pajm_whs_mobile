import useTheme from '@/hooks/use-theme';
import { Stack } from "expo-router";
import React from 'react';

const AuthLayout = () => {
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen name="login" options={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text
      }} />
    </Stack>
  )
}

export default AuthLayout