import Alert from '@/components/alert';
import Button from '@/components/button';
import CopywriteFooter from '@/components/c-footer';
import ErrorLable from '@/components/error-lable';
import Input from '@/components/input';
import BaseModal from '@/components/modal';
import ScreenWrapper from '@/components/screen-wrapper';
import HelloSvg from '@/components/svg/hello';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { useAuthStore, useConfirmStore } from '@/hooks/zustand';
import { SistemOrg } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { ExecuteMinDelay, useDefaultState } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Switch, TouchableOpacity, View } from 'react-native';
import z from 'zod/v3';
import { ItemMenu } from '../(tabs)/settings';

const LoginConfig = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const scales = useResposiveScale();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { allOrgs, addOrg, deleteOrg } = useAuthStore();
  const { showConfirm } = useConfirmStore();
  const router = useRouter();

  const [openModalOrg, setOpenModaOrg] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [urlAccess, setUrlAccess, resetUrlAccess] = useDefaultState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const regSchema = z.object({
    key: z.string().nonempty("Please enter organization key"),
    name: z.string().nonempty("Please enter organization name"),
    url: z.string().nonempty("Please enter path url"),
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [objAlerForm, setObjAlertForm, resetObjAlertForm] = useDefaultState({
    type: "success",
    icon: "checkmark-circle-outline",
    title: "Title Info",
    msg: "This application was reviewed and has been finish approved."
  });

  type RegFormData = z.infer<typeof regSchema>;
  const { control, handleSubmit, clearErrors, reset, setError, formState: { errors } } = useForm<RegFormData>({
    resolver: zodResolver(regSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      key: "",
      name: "",
      url: "",
    }
  });

  const cancelForm = () => {
    setOpenForm(false);
    setUrlAccess(false);
    setShowAlertForm(false);
    resetObjAlertForm();
    setLoadingSubmit(false);

    reset({ key: "", name: "", url: "" });
    clearErrors("key");
    clearErrors("name");
    clearErrors("url");
  };

  const verifyUrlOrg = async (url: string) => {
    setLoadingUrl(true);
    try {
      const normalizeUrl = url.replace(/\/+$/, "");
      const setReq = fetch(
        `${normalizeUrl}/WebServicesNoCred/MobileJsonWebService.asmx/VerifyUrl`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: "",
        },
      );

      const res = await ExecuteMinDelay(setReq, 1200);

      const raw = await res.json();
      const rawData = raw.d;
      const success: boolean = rawData["Success"];

      if (success === true) setUrlAccess(true);
    } catch (error: any) {
      setError("url", {
        message: error.message
      })
    }
    setLoadingUrl(false);
  };

  const submitForm = async (data: RegFormData) => {
    setLoadingSubmit(true);
    try {
      const normalizeUrl = data.url.replace(/\/+$/, "");
      const setReq = fetch(
        `${normalizeUrl}/WebServicesNoCred/MobileJsonWebService.asmx/VerifyOrg`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            org_key: data.key
          }),
        },
      );
      const res = await ExecuteMinDelay(setReq, 1200);

      const raw = await res.json();
      const rawData = raw.d;
      const success: boolean = rawData["Success"];
      if (success === false) throw new Error(rawData["Message"] ?? "Something gone wrong. Please wait a moment!");

      await addOrg({
        key: data.key,
        name: data.name,
        url: normalizeUrl
      });

      cancelForm();
    } catch (error: any) {
      setObjAlertForm({
        type: "warning",
        icon: "warning-outline",
        title: "Submit Failed",
        msg: error.message,
      })
      setShowAlertForm(true);
    }
    setLoadingSubmit(false);
  };

  const confirmDelOrg = async (org: SistemOrg) => {
    setOpenModaOrg(false);
    const confirmed = await showConfirm({
      title: "Confirm Delete!",
      message: "Are you sure want to delete this organization?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      icon: 'trash-outline'
    });
    if (!confirmed) {
      setOpenModaOrg(true);
      return;
    }

    await deleteOrg(org);
  };

  return (
    <ScreenWrapper edges={['bottom']}>
      <BaseModal
        visible={openModalOrg}
        onClose={(val) => {
          setOpenModaOrg(val);
          cancelForm();
        }}
      // resolveTitle='Submit'
      // resolveAction={() => {
      //   setOpenModaOrg(false);
      // }}
      >
        {
          showAlertForm && <View style={{ paddingBottom: rpm(10) }}>
            <Alert
              {...objAlerForm as any}
              closeBtn={() => {
                setShowAlertForm(false);
                resetObjAlertForm();
              }}
            />
          </View>
        }

        {
          openForm && <View style={{ paddingBottom: rpm(8) }}>
            <CText className="font-semibold" style={{ fontSize: rf(14), marginBottom: rpm(4) }}>Organization Form</CText>

            <View className='border-b border-gray-300' style={{ paddingBottom: rpm(8) }}>
              <View style={{ marginBottom: rpm(10) }}>
                <Controller
                  control={control}
                  name="key"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Input
                        value={value}
                        onChangeText={onChange}
                        placeholder="Enter organization key"
                      />

                      {errors.key && <ErrorLable err_msg={errors.key.message} />}
                    </>
                  )}
                />
              </View>

              <View style={{ marginBottom: rpm(10) }}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Input
                        value={value}
                        onChangeText={onChange}
                        placeholder="Enter organization name"
                      />

                      {errors.name && <ErrorLable err_msg={errors.name.message} />}
                    </>
                  )}
                />
              </View>

              <View style={{ marginBottom: rpm(12) }}>
                <Controller
                  control={control}
                  name="url"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Input
                        value={value}
                        onChangeText={(val) => {
                          onChange(val);
                          resetUrlAccess();
                        }}
                        placeholder="https://example.com"
                        autoCapitalize='none'
                        suffixGroup={{
                          content: loadingUrl ? <ActivityIndicator size="small" /> : (
                            urlAccess ? <Ionicons name='checkmark-sharp' size={rf(18)} color="#fff" /> : <Ionicons name='search-outline' size={rf(18)} color={colors.text} />
                          ),
                          bgColor: urlAccess ? colors.success : colors.bg_shadow,
                          action: () => {
                            if (value.trim() === "" || urlAccess === true) return;

                            verifyUrlOrg(value);
                          }
                        }}
                      />

                      {errors.url && <ErrorLable err_msg={errors.url.message} />}
                    </>
                  )}
                />
              </View>

              {
                loadingSubmit ? <View className='flex-row items-center justify-center' style={{ marginBottom: rpm(12) }}>
                  <ActivityIndicator size="small" />
                  <CText className='top-0.5' style={{ marginStart: rpm(3) }}>Submiting...</CText>
                </View> : <View className='flex-row items-center' style={{ marginBottom: rpm(8) }}>
                  <Button
                    onPress={() => cancelForm()}
                    title='Close' className="flex-1 bg-gray-400"
                    style={{ marginEnd: rpm(6), paddingVertical: rpm(8) }}
                  />
                  <Button
                    onPress={handleSubmit(submitForm)}
                    title='Submit' className="flex-1"
                    style={{ paddingVertical: rpm(8) }}
                    disabled={!urlAccess}
                  />
                </View>
              }

              <CText className='text-justify' style={{ color: colors.textMuted }}>
                Info: To submit new data, press the verify URL button to ensure the address is accessible.
              </CText>
            </View>
          </View>
        }

        <View className='flex-row justify-between items-center' style={{ marginBottom: rpm(10) }}>
          <CText className="font-semibold" style={{ fontSize: rf(14), }}>Organization List</CText>

          <TouchableOpacity onPress={() => setOpenForm(true)}>
            <CText className="font-semibold" style={{ fontSize: rf(14), color: colors.primary }}>
              <Ionicons name='add-outline' size={rf(16)} /> Add New
            </CText>
          </TouchableOpacity>
        </View>

        {
          allOrgs.length > 0 ? allOrgs.map((x, i) => (
            <View key={i} className="flex-row bg-gray-300/20 border border-gray-400/15"
              style={{
                borderRadius: rpm(10),
                padding: rpm(9),
                marginBottom: i === (allOrgs.length - 1) ? undefined : rpm(10)
              }}
            >
              <View className="flex-1" style={{ marginEnd: rpm(8) }}>
                <CText className="font-medium" style={{ fontSize: rf(13) }}>{i + 1}. {x.key} - {x.name}</CText>
                <CText className="opacity-60" style={{ fontSize: rf(12) }}>{x.url}</CText>
              </View>

              <TouchableOpacity onPress={() => {
                confirmDelOrg(x);
              }}>
                <Ionicons name="trash-outline" size={rf(19)} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )) : <View className="items-center justify-center"
            style={{
              paddingVertical: rpm(10),
            }}
          >
            <Ionicons name="folder-open-outline" size={rf(38)} color="#9CA3AF" style={{ marginBottom: rpm(10) }} />

            <CText className="font-semibold text-center" style={{ fontSize: rf(13) }}>
              No data found.
            </CText>

            <CText className="font-regular text-center" style={{ color: colors.textMuted, fontSize: rf(13) }}>
              Add new data to register organization.
            </CText>
          </View>
        }
      </BaseModal>

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
            onPressItem={() => setOpenModaOrg(true)}
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