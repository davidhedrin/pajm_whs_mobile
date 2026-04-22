import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

const DeliveryNotes = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper edges={['bottom']}>
      <View className='flex-1 justify-center items-center'
        style={{
          paddingHorizontal: rpm(10),
          marginTop: rpm(-35)
        }}
      >
        <Ionicons name="construct-outline" size={rf(40)} color={colors.textMuted} />

        <View className='items-center' style={{ paddingVertical: rpm(60) }}>
          <CText className='font-semibold' style={{ fontSize: rf(15) }}>COMMING SOON!</CText>
          <CText style={{ fontSize: rf(13) }}>This module is currently under construction. Thank's!</CText>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <View className='flex-row items-center'>
            <Ionicons name='arrow-back' size={rf(17)} color={colors.primary} />
            <CText style={{ fontSize: rf(13), marginStart: rpm(3), color: colors.primary }}>Back Home</CText>
          </View>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  )
}

export default DeliveryNotes