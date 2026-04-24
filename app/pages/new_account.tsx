import Button from '@/components/button';
import ErrorLable from '@/components/error-lable';
import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import Select from '@/components/select';
import { CText } from '@/components/text';
import { clearRecentItems } from '@/hooks/recently-halper';
import useTheme from '@/hooks/use-theme';
import { LoginApi, useAuthStore } from '@/hooks/zustand';
import { sistemOrgList, UserAuthData } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { ExecuteMinDelay, orgLable, showToast } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Image, TouchableOpacity, View } from 'react-native';
import { z } from "zod";

const NewAccount = () => {
  const params = useLocalSearchParams<{ org: string }>();
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [togglePass, setTogglePass] = useState(true);
  const optOrg = sistemOrgList.map((org) => ({
    label: `${org} - ${orgLable[org]}`,
    value: org,
  }));

  const regSchema = z.object({
    username: z.string().nonempty("Please enter your username"),
    password: z.string().nonempty("Please enter your password"),
    organization: z.string().nonempty("Please select organization"),
  });

  type RegFormData = z.infer<typeof regSchema>;

  const { control, handleSubmit, formState: { errors } } = useForm<RegFormData>({
    resolver: zodResolver(regSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      organization: params.org
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fatchData = async (data: RegFormData) => {
    try {
      setIsLoading(true);
      const createReq = LoginApi<UserAuthData>(data.username, data.password, data.organization);
      const req = await ExecuteMinDelay(createReq, 1000);
      const res = req.Data;

      if (res) {
        await clearRecentItems();
        await setAuth(res);
        router.back();
        showToast({
          type: "success",
          title: "Success Added",
          message: "The new account added successfully."
        });
      }
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
        <TouchableOpacity onPress={() => router.back()}
          style={{
            paddingStart: rpm(12),
            paddingTop: rpm(10)
          }}
        >
          <Ionicons name='arrow-back' size={rf(21)} color={colors.text} />
        </TouchableOpacity>
        <View className='flex-1 justify-center items-center'
          style={{
            paddingHorizontal: rpm(16),
            marginTop: rpm(-35)
          }}
        >
          <Image
            source={require("../../assets/images/splash-icon.png")}
            resizeMode="contain"
            style={{
              width: rw(65),
              height: rh(65),
              marginBottom: rpm(30)
            }}
          />

          <CText className='font-semibold leading-tight text-blue-950'
            style={{
              fontSize: rf(25),
              marginBottom: rpm(6)
            }}
          >
            Add Account
          </CText>
          <CText className='font-medium w-full text-center'
            style={{
              fontSize: rf(14),
              marginBottom: rpm(30)
            }}
          >
            Here form to adding new account
          </CText>

          <View className='w-full' style={{ marginBottom: rpm(26) }}>
            <View style={{ marginBottom: rpm(10) }}>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter account username"
                      autoCapitalize='none'
                    />

                    {errors.username && <ErrorLable err_msg={errors.username.message} />}
                  </>
                )}
              />
            </View>

            <View style={{ marginBottom: rpm(10) }}>
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

                    {errors.password && <ErrorLable err_msg={errors.password.message} />}
                  </>
                )}
              />
            </View>

            <View>
              <Controller
                control={control}
                name="organization"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Select
                      options={optOrg}
                      value={value}
                      onChange={onChange}
                      placeholder="Select organization"
                    />

                    {errors.organization && <ErrorLable err_msg={errors.organization.message} />}
                  </>
                )}
              />
            </View>
          </View>

          <Button onPress={handleSubmit(fatchData)} title='Add Account' isLoading={isLoading} loadingTitle='Adding...' className='w-full'
            style={{
              marginBottom: rpm(30)
            }}
          />

          <CText className='font-regular w-[70%] text-center'
            style={{
              fontSize: rf(13),
              color: colors.textMuted
            }}
          >
            Add new account credential to make it easier your access!
          </CText>
        </View>
      </ScreenWrapper>
    </>
  )
}

export default NewAccount