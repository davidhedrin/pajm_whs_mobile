import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const LoginConfig = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View>
      <Text>LoginConfig</Text>
    </View>
  )
}

export default LoginConfig