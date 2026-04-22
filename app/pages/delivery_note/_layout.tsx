import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Stack } from 'expo-router';
import React from 'react';

const DeliveryNoteLayout = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: "Delivery Notes",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontSize: rf(15),
        },
      }} />
    </Stack>
  )
}

export default DeliveryNoteLayout