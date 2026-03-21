import Button from '@/components/button';
import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import Select from '@/components/select';
import { CText } from '@/components/text';
import { useAuthStore } from '@/hooks/zustand';
import { callApi } from '@/utils/api-fatch';
import { ExecuteMinDelay } from '@/utils/common';
import { UserAuthData } from '@/utils/model-type';
import React, { useState } from 'react';
import { Image, View } from 'react-native';

const AuthLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState<string>("david");
  const [password, setPassword] = useState<string>("Jeis0304!");
  const [togglePass, setTogglePass] = useState(true);
  const [orgs, setOrgs] = useState<string>("Jeis0304!");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fatchData = async () => {
    try {
      setIsLoading(true);
      const createReq = callApi({
        isCredentian: false,
        endpoint: "Login",
        params: {
          username,
          password
        }
      });
      const req = await ExecuteMinDelay(createReq, 2000)
      const res = req.Data as UserAuthData;
      await setAuth(res);
    } catch (error: any) {
      console.error(error.message);
    }
    setIsLoading(false);
  };

  return (
    <ScreenWrapper>
      <View className='flex-1 justify-center items-center px-5'>
        <Image
          className="w-[80] h-[80] mb-10"
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
          <Input
            value={username}
            onChangeText={(e) => setUsername(e)}
            className='mb-3'
            placeholder="Enter your username"
          />
          <Input
            value={password}
            onChangeText={(e) => setPassword(e)}
            secureTextEntry={togglePass}
            suffixIcon={togglePass ? "eye-off-outline" : "eye-outline"}
            onPressSuffixIcon={() => setTogglePass((prev) => !prev)}
            className='mb-3'
            placeholder="Enter your password"
          />
          <Select
            options={[
              { label: 'PAJM - Pemalang Aji Jaya Maritimindo', value: 'PAJM' },
              { label: 'LCS - Lentera Cipta Samudra', value: 'LCS', disabled: true },
            ]}
            value={"PAJM"}
            onChange={setOrgs}
            placeholder="Select your organization"
          />
        </View>

        <Button onPress={fatchData} title='Sign in' isLoading={isLoading} loadingTitle='Signing in...' className='mb-10' />

        <CText className='font-regular text-lg w-[70%] text-center'>
          Enter your account credential login to continue explore!
        </CText>
      </View>
    </ScreenWrapper>
  )
}

export default AuthLogin