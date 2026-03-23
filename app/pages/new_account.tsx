import Button from '@/components/button';
import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { LoginApi, useAuthStore } from '@/hooks/zustand';
import { UserAuthData } from '@/lib/model-type';
import { ExecuteMinDelay } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

const NewAccount = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [togglePass, setTogglePass] = useState(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fatchData = async () => {
    try {
      setIsLoading(true);
      const createReq = LoginApi<UserAuthData>(username, password);
      const req = await ExecuteMinDelay(createReq, 2000);
      const res = req.Data;
      if (res) await setAuth(res);
      router.back();
    } catch (error: any) {
      console.error(error.message);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{
        headerShown: false,
        title: "Add New Account",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text
      }} />

      <ScreenWrapper>
        <TouchableOpacity onPress={() => router.back()} className='ps-4 pt-3'>
          <Ionicons name='arrow-back' size={22} color={colors.text} />
        </TouchableOpacity>
        <View className='flex-1 justify-center items-center px-5 -mt-10'>
          <Image
            className="w-[80] h-[80] mb-10"
            source={require("../../assets/images/splash-icon.png")}
            resizeMode="contain"
          />

          <CText className='font-semibold text-4xl mb-2 leading-tight text-blue-950'>
            Add Account
          </CText>
          <CText className='font-medium text-xl mb-10 w-full text-center'>
            Here form to adding new account
          </CText>

          <View className='w-full mb-8'>
            <Input
              value={username}
              onChangeText={(e) => setUsername(e)}
              className='mb-3'
              placeholder="Enter the username"
            />
            <Input
              value={password}
              onChangeText={(e) => setPassword(e)}
              secureTextEntry={togglePass}
              suffixIcon={togglePass ? "eye-off-outline" : "eye-outline"}
              onPressSuffixIcon={() => setTogglePass((prev) => !prev)}
              placeholder="Enter the password"
            />
          </View>

          <Button onPress={fatchData} title='Add Account' isLoading={isLoading} loadingTitle='Adding...' className='mb-10' />

          <CText className='font-regular text-lg w-[70%] text-center' style={{ color: colors.textMuted }}>
            Add new account credential to make it easier your access!
          </CText>
        </View>
      </ScreenWrapper>
    </>
  )
}

export default NewAccount