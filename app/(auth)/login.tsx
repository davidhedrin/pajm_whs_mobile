import Button from '@/components/button';
import ErrorLable from '@/components/error-lable';
import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import Select from '@/components/select';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { LoginApi, useAuthStore } from '@/hooks/zustand';
import { sistemOrgList, UserAuthData } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { orgLable, showToast } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Image, View } from 'react-native';
import { z } from "zod";

const AuthLogin = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [togglePass, setTogglePass] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const optOrg = sistemOrgList.map((org) => ({
    label: `${org} - ${orgLable[org]}`,
    value: org,
  }));

  const regSchema = z.object({
    username: z.string().nonempty("Please enter your username"),
    password: z.string().nonempty("Please enter your password"),
    organization: z.string().nonempty("Please select organization"),
    // .min(8, "Password must be at least 8 char")
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
      const createReq = await LoginApi<UserAuthData>(data.username, data.password, data.organization);
      const res = createReq.Data;
      if (res) {
        await setAuth(res);
        showToast({
          type: "success",
          title: "Success Login",
          message: "You have logged in successfully."
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
    <ScreenWrapper>
      <View className='flex-1 justify-center items-center px-5'>
        <Image
          source={require("../../assets/images/splash-icon.png")}
          resizeMode="contain"
          style={{
            width: rw(80),
            height: rh(80),
            marginBottom: rpm(30)
          }}
        />

        <CText className='font-semibold leading-tight text-blue-950'
          style={{
            fontSize: rf(25),
            marginBottom: rpm(6)
          }}
        >
          Login Here!
        </CText>
        <CText className='font-medium w-full text-center'
          style={{
            fontSize: rf(14),
            marginBottom: rpm(30)
          }}
        >
          Welcome to
          <CText className='font-semibold'>
            <CText className='font-semibold' style={{ color: "#ef4444" }}> PAJM </CText>
          </CText>
          Warehouse
          Mobile App!
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
                    placeholder="Enter your username"
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
                    placeholder="Enter your password"
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
                    placeholder="Select your organization"
                  />

                  {errors.organization && <ErrorLable err_msg={errors.organization.message} />}
                </>
              )}
            />
          </View>
        </View>

        <Button onPress={(handleSubmit(fatchData))} title='Sign in' isLoading={isLoading} loadingTitle='Signing in...' className='w-full'
          style={{
            marginBottom: rpm(30)
          }}
        />
        {/* <Button onPress={async () => {

          // ClearAllStorage();
          // CheckAllStorage();

        }} title='Test' className='mb-10' /> */}

        <CText className='font-regular w-[70%] text-center'
          style={{
            fontSize: rf(13),
            color: colors.textMuted
          }}
        >
          Enter your account credential login to continue explore!
        </CText>
      </View>
    </ScreenWrapper>
  )
}

export default AuthLogin