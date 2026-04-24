import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { nativeApplicationVersion } from 'expo-application';
import React from 'react';
import { View } from 'react-native';
import { CText } from './text';

const CopywriteFooter = () => {
  const { rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const version = nativeApplicationVersion;

  return (
    <View className="items-center"
      style={{
        paddingTop: rpm(18),
        paddingBottom: rpm(14)
      }}
    >
      <CText className="font-regular" style={{ color: colors.textMuted, fontSize: rf(12) }}>
        Ⓒ 2026 - PAJM Warehouse App
      </CText>
      <CText className="font-regular" style={{ color: colors.textMuted, fontSize: rf(12) }}>
        App Version {version}
      </CText>
    </View>
  )
}

export default CopywriteFooter