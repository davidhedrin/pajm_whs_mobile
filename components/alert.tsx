import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CText } from './text';

type typeAlert = "success" | "primary" | "warning" | "danger" | "shadow";

const Alert = ({
  type,
  icon,
  title = "Title Alert!",
  msg = "Description of alert",
  closeBtn
}: {
  type: typeAlert,
  icon?: keyof typeof Ionicons.glyphMap,
  title?: string,
  msg?: string,
  closeBtn?: () => void;
}) => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors[`bg_${type}`],
        borderStartWidth: rpm(4),
        borderColor: colors[type],
        paddingHorizontal: rpm(10),
        paddingVertical: rpm(12)
      }}
    >
      {
        closeBtn && <TouchableOpacity
          className='absolute top-1.5 right-1.5'
          onPress={closeBtn}
        >
          <Ionicons name='close-circle-outline' size={rf(19)} color={colors.textMuted} />
        </TouchableOpacity>
      }

      <View className="flex-row items-center">
        {
          icon && <View className="shrink-0">
            <Ionicons name={icon} size={rf(30)} color={colors[type]} />
          </View>
        }
        <View className='flex-1' style={{ marginStart: rpm(8) }}>
          <CText className="font-semibold" style={{ fontSize: rf(14) }}>
            {title}
          </CText>
          <CText>
            {msg}
          </CText>
        </View>
      </View>
    </View>
  )
}

export default Alert