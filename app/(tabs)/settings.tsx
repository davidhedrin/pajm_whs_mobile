import AppBottomSheet, { BottomSheetRef } from '@/components/bottom-sheet';
import Button from '@/components/button';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme, { ColorScheme } from '@/hooks/use-theme';
import { useAuthStore, useConfirmStore } from '@/hooks/zustand';
import { ResponsiveScale } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Switch, TouchableOpacity, View } from 'react-native';
import { Accounts } from '.';

const SettingScreen = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const scales = useResposiveScale();
  const { authData, accounts, switchAccount } = useAuthStore();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { showConfirm } = useConfirmStore();
  const router = useRouter();
  const { logout } = useAuthStore();

  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const confirmLogout = async () => {
    const confirmed = await showConfirm({
      title: "Confirm Logout!",
      message: "Are you sure you want to log out of your account?",
      confirmText: "Yes, Logout",
      cancelText: "Cancel",
      icon: 'log-out-outline'
    });

    if (confirmed) {
      await logout(authData?.Username ?? "");
      router.replace("/(auth)/login");
    }
  };

  return (
    <ScreenWrapper>
      <View className="rounded-bl-full"
        style={{
          paddingTop: rpm(24),
          paddingHorizontal: rpm(18),
          backgroundColor: colors.primary
        }}
      >
        <View className="flex-row items-start">
          <Ionicons name='settings-outline' size={rf(27)} style={{ color: "#fff" }} />
          <CText className='font-medium leading-tight'
            style={{
              color: "#fff",
              fontSize: rpm(28),
              marginLeft: rpm(6),
              marginBottom: rpm(20),
            }}
          >Settings</CText>
        </View>

        {/* PROFILE HEADER */}
        <View className="flex-row items-center" style={{ marginBottom: rpm(14) }}>
          <View
            className="bg-slate-700 rounded-full items-center justify-center"
            style={{
              padding: rpm(14),
              marginRight: rpm(14)
            }}
          >
            <Ionicons name="person" size={rf(30)} color="white" />
          </View>

          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <CText className="font-semibold" style={{ color: "#fff", fontSize: rf(17) }}>
                {authData?.Fullname ?? "Guest"}
              </CText>

              <View className="bg-blue-100 rounded-full" style={{ paddingHorizontal: rpm(10), paddingVertical: rpm(3) }}>
                <CText className="font-medium" style={{ color: "#2563eb", fontSize: rf(13) }}>
                  {authData?.Role ?? "Guest"}
                </CText>
              </View>
            </View>

            <CText className="text-gray-500" style={{ color: "#fff", fontSize: rf(14) }}>
              {authData?.Email ? (authData.Email.trim() !== "" ? authData.Email : "Email not registered") : "Email not registered"}
            </CText>
          </View>

        </View>
      </View>

      <View style={{ paddingTop: rpm(20), paddingHorizontal: rpm(12) }}>
        {/* CONTENT */}
        <View>
          {/* ACCOUNT BUTTONS */}
          <View className="flex-row justify-between" style={{ marginBottom: rpm(24), paddingHorizontal: rpm(6) }}>
            <Button title='Switch Account' prefixIcon='swap-horizontal-outline'
              className="flex-1 bg-transparent border border-gray-500"
              style={{
                borderRadius: 9999,
                paddingTop: rpm(10),
                paddingBottom: rpm(10),
                marginEnd: rpm(10)
              }}
              titleColor={colors.text}
              onPress={() => bottomSheetRef.current?.open()}
            />
            <Button onPress={() => router.push("/pages/new_account")} title='Add Account' prefixIcon="add" className="flex-1 bg-blue-500"
              style={{
                borderRadius: 9999,
                paddingTop: rpm(10),
                paddingBottom: rpm(10),
              }} />
          </View>

          {/* MENU ITEMS */}
          <View
            style={{
              borderRadius: rpm(14),
              paddingHorizontal: rpm(13),
              paddingVertical: rpm(5),
              backgroundColor: colors.surface
            }}
          >
            {/* Profile */}
            <ItemMenu
              onPressItem={() => { }}
              icon='person-outline'
              colors={colors}
              title='Profile'
              desc='Manage your personal information'
              scales={scales}
              isBordered={true}
            />

            {/* Dark Mode */}
            <View className="flex-row items-center border-b border-gray-200"
              style={{
                paddingVertical: rpm(9)
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

            {/* Logout */}
            <ItemMenu
              onPressItem={confirmLogout}
              icon='log-out-outline'
              colors={colors}
              title='Logout'
              desc='Sign out from your account'
              scales={scales}
            />
          </View>
        </View>

        {/* FOOTER VERSION */}
        <View className="items-center"
          style={{
            paddingTop: rpm(20),
            paddingBottom: rpm(14)
          }}
        >
          <CText className="font-regular" style={{ color: colors.textMuted, fontSize: rf(12) }}>
            PAJM Warehouse App
          </CText>
          <CText className="font-regular" style={{ color: colors.textMuted, fontSize: rf(12) }}>
            Version 1.0
          </CText>
        </View>
      </View>

      <AppBottomSheet title="Switch Account" ref={bottomSheetRef} snapPoints={["30%", "40%"]} enableGesture={true}>
        {
          accounts.map((x, i) => (
            <TouchableOpacity
              key={i}
              onPress={async () => {
                await switchAccount(x.Username);
                bottomSheetRef.current?.close();
              }}
            >
              <Accounts data={x} activeUser={authData?.Username ?? ""} scales={scales} />
            </TouchableOpacity>
          ))
        }

        <Button onPress={() => router.push("/pages/new_account")} title='Add Account' prefixIcon="add" className="w-full" style={{ marginBottom: rpm(30) }} />
      </AppBottomSheet>
    </ScreenWrapper>
  )
}

export default SettingScreen

type ItemMenuProps = {
  title: string;
  desc: string;
  colors: ColorScheme;
  onPressItem?: () => void;
  scales: ResponsiveScale;
  icon?: keyof typeof Ionicons.glyphMap;
  isBordered?: boolean
};

function ItemMenu({ title, desc, onPressItem, colors, scales, icon, isBordered = false }: ItemMenuProps) {
  const { rpm, rf } = scales;

  return <View className={`${isBordered ? "border-b border-gray-200" : ""}`}>
    <TouchableOpacity onPress={onPressItem} className='flex-row items-center'
      style={{
        paddingVertical: rpm(12)
      }}
    >
      {icon && <Ionicons name={icon} size={rf(19)} color={colors.text}
        style={{
          marginRight: rpm(13)
        }}
      />}
      <View className='flex-1'>
        <CText className="font-medium" style={{ fontSize: rf(13) }}>
          {title}
        </CText>
        <CText style={{ fontSize: rf(12) }}>
          {desc}
        </CText>
      </View>
      <Ionicons name="chevron-forward" size={rf(18)} color={colors.textMuted} />
    </TouchableOpacity>
  </View>;
}
