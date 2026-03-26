import Button from '@/components/button';
import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import Select from '@/components/select';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { LoginApi, useAuthStore } from '@/hooks/zustand';
import { UserAuthData } from '@/lib/model-type';
import { ExecuteMinDelay, showToast } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Image, View } from 'react-native';
import { z } from "zod";

const AuthLogin = () => {
  const { colors } = useTheme();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [togglePass, setTogglePass] = useState(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const regSchema = z.object({
    username: z.string().nonempty("Please enter your username"),
    password: z.string().nonempty("Please enter your password").min(8, "Password must be at least 8 char"),
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
      organization: "",
    }
  });

  const fatchData = async (data: RegFormData) => {
    try {
      setIsLoading(true);
      const createReq = LoginApi<UserAuthData>(data.username, data.password);
      const req = await ExecuteMinDelay(createReq, 2000);
      const res = req.Data;
      if (res) await setAuth(res);
      showToast({
        type: "success",
        title: "Success Login",
        message: "You have logged in successfully."
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
    <ScreenWrapper>
      <View className='flex-1 justify-center items-center px-5'>
        <Image
          className="w-20 h-20 mb-10"
          source={require("../../assets/images/splash-icon.png")}
          resizeMode="contain"
        />

        <CText className='font-semibold text-4xl mb-2 leading-tight text-blue-950'>
          Login Here!
        </CText>
        <CText className='font-medium text-xl mb-10 w-full text-center'>
          Welcome to
          <CText className='font-semibold'>
            <CText className='font-semibold' style={{ color: "#ef4444" }}> PAJM </CText>
          </CText>
          Warehouse
          Mobile App!
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
                    placeholder="Enter your username"
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
          <View className='mb-3'>
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
                    placeholder="Enter your password"
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
          <View>
            <Controller
              control={control}
              name="organization"
              render={({ field: { onChange, value } }) => (
                <>
                  <Select
                    options={[
                      { label: 'PAJM - Pemalang Aji Jaya Maritimindo', value: 'PAJM' },
                      { label: 'LCS - Lentera Cipta Samudra', value: 'LCS', disabled: true },
                    ]}
                    value={value}
                    onChange={onChange}
                    placeholder="Select your organization"
                  />

                  {errors.organization && (
                    <CText className='font-regular text-lg ms-0.5 mt-0.5' style={{ color: "red" }}>
                      {errors.organization.message}
                    </CText>
                  )}
                </>
              )}
            />
          </View>
        </View>

        <Button onPress={(handleSubmit(fatchData))} title='Sign in' isLoading={isLoading} loadingTitle='Signing in...' className='mb-10' />
        {/* <Button onPress={async () => {

          ClearAllStorage();
          CheckAllStorage();

        }} title='Test' className='mb-10' /> */}

        <CText className='font-regular text-lg w-[70%] text-center' style={{ color: colors.textMuted }}>
          Enter your account credential login to continue explore!
        </CText>
      </View>
    </ScreenWrapper>
  )
}

export default AuthLogin