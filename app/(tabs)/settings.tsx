import AppBottomSheet, { BottomSheetRef } from '@/components/bottom-sheet';
import Button from '@/components/button';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { useAuthStore, useConfirmStore } from '@/hooks/zustand';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Switch, TouchableOpacity, View } from 'react-native';
import { Accounts } from '.';

const SettingScreen = () => {
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
      <View className="pt-7 px-5 rounded-bl-full"
        style={{
          backgroundColor: colors.primary
        }}
      >
        <View className="flex-row items-start">
          <Ionicons name='settings-outline' size={30} style={{ color: "#fff" }} />
          <CText className='font-medium text-4xl mb-6 leading-tight ml-2' style={{ color: "#fff" }}>Settings</CText>
        </View>

        {/* PROFILE HEADER */}
        <View className="flex-row items-center mb-4">
          <View
            className="p-4 bg-slate-700 rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="person" size={40} color="white" />
          </View>

          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <CText className="text-2xl font-semibold" style={{ color: "#fff" }}>
                {authData?.Fullname ?? "Guest"}
              </CText>

              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <CText className="text-base font-medium" style={{ color: "#2563eb" }}>
                  {authData?.Role ?? "Guest"}
                </CText>
              </View>
            </View>

            <CText className="text-gray-500 text-lg" style={{ color: "#fff" }}>
              {authData?.Email ? (authData.Email.trim() !== "" ? authData.Email : "Email not registered") : "Email not registered"}
            </CText>
          </View>

        </View>
      </View>

      <View className="pt-6 px-4">
        {/* CONTENT */}
        <View>
          {/* ACCOUNT BUTTONS */}
          <View className="flex-row justify-between mb-8 px-2">
            <Button title='Switch Account' prefixIcon='swap-horizontal-outline'
              className="flex-1 bg-transparent border border-gray-500 me-3"
              style={{ borderRadius: 9999, paddingTop: 11, paddingBottom: 11 }}
              titleColor={colors.text}
              onPress={() => bottomSheetRef.current?.open()}
            />
            <Button onPress={() => router.push("/pages/new_account")} title='Add Account' prefixIcon="add" className="flex-1 bg-blue-500" style={{ borderRadius: 9999, paddingTop: 11, paddingBottom: 11 }} />
          </View>

          {/* MENU ITEMS */}
          <View className="rounded-2xl px-4 py-2" style={{ backgroundColor: colors.surface }}>
            {/* Profile */}
            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
              <Ionicons name="person-outline" size={22} color={colors.text} />
              <View className='flex-1 ml-4'>
                <CText className="font-medium text-lg">
                  Profile
                </CText>
                <CText>
                  Manage your personal information
                </CText>
              </View>
              <Ionicons name="chevron-forward" size={21} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Dark Mode */}
            <View className="flex-row items-center py-3 border-b border-gray-200">
              <Ionicons name="moon-outline" size={22} color={colors.text} />
              <View className='flex-1 ml-4'>
                <CText className="font-medium text-lg">
                  Dark Mode
                </CText>
                <CText>
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
            <TouchableOpacity onPress={confirmLogout} className="flex-row items-center py-4">
              <Ionicons name="log-out-outline" size={24} color={colors.text} />
              <View className='flex-1 ml-4'>
                <CText className="font-medium text-lg">
                  Logout
                </CText>
                <CText>
                  Sign out from your account
                </CText>
              </View>
              <Ionicons name="chevron-forward" size={21} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FOOTER VERSION */}
        <View className="items-center pt-6 pb-4">
          <CText className="font-regular text-base" style={{ color: colors.textMuted }}>
            PAJM Warehouse App
          </CText>
          <CText className="font-regular text-base" style={{ color: colors.textMuted }}>
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
              <Accounts data={x} activeUser={authData?.Username ?? ""} />
            </TouchableOpacity>
          ))
        }

        <Button onPress={() => router.push("/pages/new_account")} title='Add Account' prefixIcon="add" className='mb-10' />
      </AppBottomSheet>
    </ScreenWrapper>
  )
}

export default SettingScreen