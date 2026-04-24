import CopywriteFooter from '@/components/c-footer';
import ScreenWrapper from '@/components/screen-wrapper';
import HelloSvg from '@/components/svg/hello';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Switch, View } from 'react-native';
import { ItemMenu } from '../(tabs)/settings';



const LoginConfig = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const scales = useResposiveScale();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper edges={['bottom']}>
      <View style={{ paddingTop: rpm(28), paddingHorizontal: rpm(12) }}>
        <View className='items-center' style={{ paddingBottom: rpm(18) }}>
          <HelloSvg width={rw(200)} height={rh(120)} style={{ marginBottom: rpm(18) }} />

          <CText className='text-center font-semibold' style={{ fontSize: rf(17) }}>Welcome to Platform</CText>
          <CText className='text-center'>Before getting start to explore the features, Please take a moment to complete organization information below</CText>
        </View>

        <View
          style={{
            borderRadius: rpm(14),
            paddingHorizontal: rpm(13),
            paddingVertical: rpm(5),
            backgroundColor: colors.surface
          }}
        >
          <ItemMenu
            onPressItem={() => { }}
            icon='business-outline'
            colors={colors}
            title='Organization'
            desc='Register and Manage app organization list'
            scales={scales}
            isBordered={true}
          />

          {/* border-b border-gray-200 */}
          <View className="flex-row items-center"
            style={{
              paddingVertical: rpm(10)
            }}
          >
            <Ionicons name="moon-outline" size={rf(18)} color={colors.text} />
            <View className='flex-1 ml-4'
              style={{
                marginLeft: rpm(13)
              }}
            >
              <CText className="font-medium" style={{ fontSize: rf(13) }}>
                Dark Mode
              </CText>
              <CText style={{ fontSize: rf(12) }}>
                Switch between light and dark theme
              </CText>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(val) => {
                toggleDarkMode(val);
              }}
            />
          </View>
        </View>
      </View>

      <CopywriteFooter />
    </ScreenWrapper>
  )
}

export default LoginConfig