import ScreenWrapper from '@/components/screen-wrapper';
import useTheme from '@/hooks/use-theme';
import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const NewAccount = () => {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        presentation: 'modal',
        title: "Add New Account",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text
      }} />

      <ScreenWrapper edges={['bottom']}>
        <View>
          <Text>NewAccount</Text>
        </View>
      </ScreenWrapper>
    </>
  )
}

export default NewAccount