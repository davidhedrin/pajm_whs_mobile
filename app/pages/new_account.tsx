import Button from '@/components/button';
import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { LoginApi, useAuthStore } from '@/hooks/zustand';
import { UserAuthData } from '@/lib/model-type';
import { ExecuteMinDelay, showToast } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Image, TouchableOpacity, View } from 'react-native';
import { z } from "zod";

const NewAccount = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [togglePass, setTogglePass] = useState(true);
  const regSchema = z.object({
    username: z.string().nonempty("Please enter your username"),
    password: z.string().nonempty("Please enter your password").min(8, "Password must be at least 8 char"),
  });

  type RegFormData = z.infer<typeof regSchema>;

  const { control, handleSubmit, formState: { errors } } = useForm<RegFormData>({
    resolver: zodResolver(regSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fatchData = async (data: RegFormData) => {
    try {
      setIsLoading(true);
      const createReq = LoginApi<UserAuthData>(data.username, data.password);
      const req = await ExecuteMinDelay(createReq, 2000);
      const res = req.Data;
      if (res) await setAuth(res);
      router.back();
      showToast({
        type: "success",
        title: "Success Added",
        message: "The new account added successfully."
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Login Failed",
        message: error.message
      });
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
          <Ionicons name='arrow-back' size={24} color={colors.text} />
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
            <View className='mb-3'>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter account username"
                    />

                    {errors.username && (
                      <CText className='font-regular text-lg ms-0.5 mt-0.5' style={{ color: "red" }}>
                        {errors.username.message}
                      </CText>
                    )}
                  </>
                )}
              />
            </View>

            <View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={togglePass}
                      suffixIcon={togglePass ? "eye-off-outline" : "eye-outline"}
                      onPressSuffixIcon={() => setTogglePass((prev) => !prev)}
                      placeholder="Enter account password"
                    />

                    {errors.password && (
                      <CText className='font-regular text-lg ms-0.5 mt-0.5' style={{ color: "red" }}>
                        {errors.password.message}
                      </CText>
                    )}
                  </>
                )}
              />
            </View>
          </View>

          <Button onPress={handleSubmit(fatchData)} title='Add Account' isLoading={isLoading} loadingTitle='Adding...' className='mb-10' />

          <CText className='font-regular text-lg w-[70%] text-center' style={{ color: colors.textMuted }}>
            Add new account credential to make it easier your access!
          </CText>
        </View>
      </ScreenWrapper>
    </>
  )
}

export default NewAccount