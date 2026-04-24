import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from "expo-router";
import React from 'react';
import { TouchableOpacity } from 'react-native';

const AuthLayout = () => {
  const { rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="login" options={{
        headerShown: true,
        headerTitle: () => null,
        headerTransparent: true,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTintColor: colors.text,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              router.push('/(auth)/config');
            }}
            style={{ paddingEnd: rpm(6) }}
          >
            <Ionicons name="settings-outline" size={rf(21)} color={colors.text} />
          </TouchableOpacity>
        )
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