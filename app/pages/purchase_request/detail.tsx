import Alert from '@/components/alert';
import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { useAuthStore, useConfirmStore, useLoadingStore } from '@/hooks/zustand';
import { callApi } from '@/lib/api-fatch';
import { ApproverLevel, CheckAprLevelProps, PrPoActionProps, PrPoDetailPageProps, PrProps } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { ExecuteMinDelay, formatDate, formatMoney, showToast } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { checkAprUserLevel, getStatusStyle, MappingPr, PrAction } from '.';

const PRDetail = () => {
  const { authData } = useAuthStore();
  const params = useLocalSearchParams<PrPoDetailPageProps>();
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const { showConfirm } = useConfirmStore();
  const loadingPage = useLoadingStore.getState();

  const [loading, setLoading] = useState(true);
  const [dataPr, setDataPr] = useState<PrProps | null>(null);
  const [curAprLevel, setCurAprLevel] = useState<ApproverLevel | null>(null);
  const [remark, setRemark] = useState("");
  const [resCheckAprLevel, setResCheckAprLevel] = useState<CheckAprLevelProps | null>(null);

  const [grandTotalItems, setGrandTotalItems] = useState(0);

  const fatchDatas = async (pr_id: string) => {
    setLoading(true);
    try {
      const createReq = await callApi<any>({
        endpoint: "PrDetailById",
        params: {
          pr_id: parseInt(pr_id),
        }
      });

      if (createReq.Data !== undefined && createReq.Data !== null) {
        const prData = MappingPr(createReq.Data.Header, authData?.BpUserId, createReq.Data.Items);
        const getCurAprLevel = prData.Approvers.find(x => x.Level === prData.AssignLevel);
        setDataPr(prData);
        setCurAprLevel(getCurAprLevel ?? null);

        const grandTotalItems = prData.ItemDetails?.reduce((total, item) => {
          return total + item.Quantity * item.UnitPrice;
        }, 0);
        setGrandTotalItems(grandTotalItems ?? 0);

        const checkAprLevel = checkAprUserLevel(prData, getCurAprLevel);
        setResCheckAprLevel(checkAprLevel);
      };

    } catch (error: any) {
      showToast({
        type: "error",
        title: "Something's wrong",
        message: error.message
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fatchDatas(params.id);
  }, []);

  const handlePrAction = async ({ action, pr_id, level, remark }: PrPoActionProps) => {
    const confirmed = await showConfirm({
      title: `Confirm ${action === 'APPROVED' ? "Approving" : "Rejecting"}!`,
      message: `Are you sure you want to ${action === 'APPROVED' ? "Aprove" : "Reject"} this application? You can't undo this action!`,
      confirmText: `Yes, ${action === 'APPROVED' ? "Aprove" : "Reject"}`,
      cancelText: "No, Go back",
      icon: action === 'APPROVED' ? "checkmark-circle-outline" : "close-circle-outline"
    });
    if (!confirmed) return;

    loadingPage.show();
    try {
      const reqDelay = await ExecuteMinDelay(PrAction({ action, pr_id, level, remark }), 2000);
      await fatchDatas(pr_id.toString());
      showToast({
        type: "success",
        title: "Update Finish",
        message: reqDelay.Message
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Request Failed",
        message: error.message
      });
    }
    loadingPage.hide();
  };

  return (
    <ScreenWrapper edges={['bottom']}>
      {
        loading ? <View className='flex-1 justify-center items-center'
          style={{
            marginTop: rpm(-65)
          }}
        >
          <View className='flex-row justify-center items-center'
            style={{ marginBottom: rpm(18), marginTop: rpm(8) }}
          >
            <ActivityIndicator size="small" />
            <CText className='font-medium' style={{ fontSize: rf(13), marginStart: rpm(6) }}>Loading...</CText>
          </View>
        </View> : <View
          style={{
            paddingHorizontal: rpm(12),
          }}
        >
          {
            dataPr ? <View style={{ paddingTop: rpm(16) }}>
              {
                dataPr.Status !== "" && (
                  <View style={{ marginBottom: rpm(16) }}>
                    <Alert
                      type={dataPr.Status === 'APPROVED' ? "success" : "danger"}
                      icon='checkmark-circle-outline'
                      title={`${dataPr.Status}!`}
                      msg={
                        dataPr.Status === 'APPROVED' ?
                          "This application was reviewed and has been finish approved successfully." :
                          "Sorry, but this request has been rejected for any reason. Please check timelines!"
                      }
                    />
                  </View>
                )
              }

              <View
                className='border-dashed'
                style={{
                  borderTopWidth: rpm(3),
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  padding: rpm(8),
                  marginBottom: rpm(16)
                }}
              >
                <View style={{ marginBottom: rpm(4) }}>
                  <View className='flex-row justify-between items-center'>
                    <CText>PR Number: </CText>
                    <View
                      className="flex-row items-center rounded-full font-regular leading-none"
                      style={[
                        {
                          paddingHorizontal: rpm(6),
                          paddingVertical: rpm(5),
                        },
                        getStatusStyle(dataPr.Status, colors)
                      ]}
                    >
                      <Ionicons name={dataPr.Status === 'APPROVED' ? "checkmark-done-outline" : dataPr.Status === 'REJECTED' ? "close-circle-outline" : "time-outline"} color={colors.text} />
                      <CText className='leading-none' style={{ fontSize: rf(12), marginStart: rpm(3) }}>
                        {dataPr.Status === '' ? "ON PROGRESS" : dataPr.Status}
                      </CText>
                    </View>
                  </View>
                  <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPr.PrNo}</CText>
                </View>

                <View style={{ marginBottom: rpm(4) }}>
                  <CText>Request By: </CText>
                  <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPr.User1Name}</CText>
                </View>

                <View style={{ marginBottom: rpm(4) }}>
                  <CText>Request Remark: </CText>
                  <CText className='font-semibold' style={{ fontSize: rf(13) }}>
                    {dataPr.Remark ? (dataPr.Remark.trim() !== "" ? dataPr.Remark : "-") : "-"}
                  </CText>
                </View>

                <View className='flex-row justify-between' style={{ marginBottom: rpm(4) }}>
                  <View>
                    <CText>Request At: </CText>
                    {
                      dataPr.DtmSubmit !== null ? <CText className='font-semibold' style={{ fontSize: rf(13) }}>
                        {formatDate(dataPr.DtmSubmit, 'medium', 'short')}
                      </CText> : <CText style={{ color: colors.danger, fontSize: rf(13) }}>NOT SUBMITTED YET</CText>
                    }
                  </View>
                  {
                    dataPr.AssignLevel !== undefined && <View className='items-end'>
                      <CText>Assign As</CText>
                      <CText className='font-semibold' style={{ fontSize: rf(13) }}>Approval - {(dataPr.AssignLevel ?? 2) - 1}</CText>
                    </View>
                  }
                </View>
              </View>

              {
                resCheckAprLevel && (
                  resCheckAprLevel.show ? <View style={{ marginBottom: rpm(14) }}>
                    <View style={{ marginBottom: rpm(10) }}>
                      <CText
                        className="font-medium leading-none"
                        style={{ fontSize: rf(13), marginBottom: rpm(6) }}
                      >
                        Remark
                      </CText>
                      <Input
                        value={remark}
                        onChangeText={(val) => setRemark(val)}
                        placeholder="Leave your comment here if any"
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View className='items-center' style={{ marginBottom: rpm(6) }}>
                      <CText className='font-medium-i text-center'>
                        You are assigned as the <CText className='font-bolds-i'>Approval - {(dataPr.AssignLevel ?? 2) - 1}</CText> user who approves this application. Please confirm your response below!
                      </CText>
                    </View>

                    <View className="flex-row overflow-hidden self-center"
                      style={{ borderRadius: rpm(10) }}
                    >
                      <TouchableOpacity
                        className="flex-row justify-center items-center"
                        style={{
                          paddingHorizontal: rpm(20),
                          paddingVertical: rpm(10),
                          backgroundColor: colors.success,
                        }}
                        onPress={async () => {
                          if (curAprLevel) handlePrAction({
                            action: 'APPROVED',
                            level: curAprLevel.Level,
                            pr_id: dataPr.Id,
                            remark: remark.trim()
                          });
                        }}
                      >
                        <Ionicons name='checkmark-outline' size={rf(17)} color={"#fff"} />
                        <CText className="font-medium ms-1" style={{ fontSize: rf(13), color: "#fff" }}>
                          Approve
                        </CText>
                      </TouchableOpacity>

                      <View className="w-[1px] bg-gray-200" />

                      <TouchableOpacity
                        className="flex-row justify-center items-center"
                        style={{
                          paddingHorizontal: rpm(20),
                          paddingVertical: rpm(10),
                          backgroundColor: colors.danger,
                        }}
                        onPress={async () => {
                          if (curAprLevel) handlePrAction({
                            action: 'REJECTED',
                            level: curAprLevel.Level,
                            pr_id: dataPr.Id,
                            remark: remark.trim()
                          });
                        }}
                      >
                        <Ionicons name='close-outline' size={rf(17)} color={"#fff"} />
                        <CText className="font-medium ms-1" style={{ fontSize: rf(13), color: "#fff" }}>
                          Reject
                        </CText>
                      </TouchableOpacity>
                    </View>
                  </View> : resCheckAprLevel.msg !== null && <CText style={{ marginBottom: rpm(14) }} className='font-medium-i text-center'>{resCheckAprLevel.msg}</CText>
                )
              }

              <View style={{ marginBottom: rpm(16) }}>
                <CText
                  className="font-medium leading-none"
                  style={{ fontSize: rf(13), marginBottom: rpm(6) }}
                >
                  Timeline
                </CText>

                <View
                  style={{
                    borderRadius: rpm(10),
                    backgroundColor: colors.surface,
                    padding: rpm(12)
                  }}
                >
                  {
                    dataPr.Approvers.map((item, index) => {
                      const color = getStatusStyle(item.UserResponse, colors);
                      const isLast = index === dataPr.Approvers.length - 1;

                      return (
                        <View key={index} className="flex-row">

                          {/* LEFT: Circle + Line */}
                          <View className="items-center" style={{ marginRight: rpm(8) }}>
                            {/* Circle */}
                            <View
                              className='rounded-full'
                              style={{
                                width: rpm(14),
                                height: rpm(14),
                                backgroundColor: item.UserResponse === '' ? color.backgroundColor : color.color,
                              }}
                            />

                            {/* Line */}
                            {!isLast && (
                              <View
                                style={{
                                  width: rpm(2),
                                  flex: 1,
                                  backgroundColor: item.UserResponse === '' ? color.backgroundColor : color.color,
                                  marginVertical: rpm(2),
                                }}
                              />
                            )}
                          </View>

                          {/* RIGHT: Content */}
                          <View className="flex-1" style={{ marginBottom: index !== (dataPr.Approvers.length - 1) ? rpm(16) : undefined }}>

                            {/* Header */}
                            <View className="flex-row justify-between items-center">
                              <CText className="font-semibold">
                                Approval - {item.Level - 1}
                              </CText>

                              <CText
                                className="rounded-full"
                                style={[
                                  {
                                    paddingHorizontal: rpm(6),
                                    paddingVertical: rpm(2),
                                    fontSize: rf(12)
                                  },
                                  color
                                ]}
                              >
                                {item.UserResponse === '' ? "WAITING" : item.UserResponse}
                              </CText>
                            </View>

                            <View className='flex-row items-center justify-between' style={{ marginTop: rpm(2) }}>
                              {/* Name */}
                              <CText className="text-gray-700" style={{ fontSize: rf(13) }}>
                                {item.UserName}
                              </CText>

                              {/* Date */}
                              <CText className="text-gray-400" style={{ fontSize: rf(13) }}>
                                {item.DtmResponse !== null ? formatDate(item.DtmResponse, 'medium', 'short') : "-"}
                              </CText>
                            </View>

                            <CText className="text-gray-700" style={{ fontSize: rf(13) }}>
                              Comment: {item.Remark ? (item.Remark.trim() !== "" ? item.Remark : "-") : "-"}
                            </CText>
                          </View>
                        </View>
                      );
                    })
                  }
                </View>
              </View>

              <View style={{ marginBottom: rpm(16) }}>
                <CText
                  className="font-medium leading-none"
                  style={{ fontSize: rf(13), marginBottom: rpm(6) }}
                >
                  Item Details
                </CText>

                <View
                  style={{
                    backgroundColor: colors.surface,
                    padding: rpm(8),
                    // marginBottom: rpm(3),
                  }}
                >
                  {
                    dataPr.ItemDetails?.map((x, i) => {
                      const totalPrice = x.Quantity * x.UnitPrice;

                      return <View key={i}>
                        {
                          i > 0 && <View className="bg-gray-300" style={{ height: rh(1), marginVertical: rpm(10) }} />
                        }

                        <View className='flex-row'>
                          <CText className="font-semibold" style={{ fontSize: rf(13) }}>
                            {i + 1}.
                          </CText>

                          <View className='flex-1 ms-2'>
                            <View style={{ marginBottom: rpm(6) }}>
                              <CText className="font-semibold" style={{ fontSize: rf(13) }}>
                                {x.ProductName}
                              </CText>

                              {/* SKU */}
                              <CText className="font-regular" style={{ fontSize: rf(13) }}>
                                SKU: ABC-12345
                              </CText>

                              <View className="flex-row justify-between">
                                <CText className="font-regular underline" style={{ fontSize: rf(13) }}>Request Qty</CText>
                                <CText className="font-medium underline" style={{ fontSize: rf(13) }}>{x.Quantity} {x.MeasurementName}</CText>
                              </View>
                            </View>

                            {/* Key-Value Section */}
                            <View style={{ marginBottom: rpm(6) }}>
                              <View className="flex-row justify-between">
                                <CText className="font-regular" style={{ fontSize: rf(13) }}>Last Stock</CText>
                                <CText className="font-medium" style={{ fontSize: rf(13) }}>{x.LastStock} {x.MeasurementName}</CText>
                              </View>

                              <View className="flex-row justify-between">
                                <CText className="font-regular" style={{ fontSize: rf(13) }}>Est. Unit Price</CText>
                                <CText className="font-medium" style={{ fontSize: rf(13) }}>{formatMoney(x.UnitPrice)} / {x.MeasurementName}</CText>
                              </View>

                              <View className="flex-row justify-between">
                                <CText className="font-regular" style={{ fontSize: rf(13) }}>Est. Total Price</CText>
                                <CText className="font-medium" style={{ fontSize: rf(13) }}>{formatMoney(totalPrice)}</CText>
                              </View>
                            </View>

                            {/* Remark */}
                            <CText className="font-regular" style={{ fontSize: rf(13) }}>
                              Remark: {x.Remark ? (x.Remark.trim() !== "" ? x.Remark.trim() : "-") : "-"}
                            </CText>
                          </View>
                        </View>
                      </View>
                    })
                  }
                </View>

                <View
                  className='flex-row justify-between items-center border-dashed border-gray-300'
                  style={{
                    backgroundColor: colors.surface,
                    paddingHorizontal: rpm(10),
                    paddingVertical: rpm(14),
                    borderTopWidth: rpm(2),
                  }}
                >
                  <CText className="font-semibold" style={{ fontSize: rf(13) }}>
                    Total Price
                  </CText>


                  <CText className="font-semibold" style={{ fontSize: rf(13) }}>
                    {formatMoney(grandTotalItems)}
                  </CText>
                </View>
              </View>
            </View> : <View>
              <CText>Data Not Found</CText>
            </View>
          }
        </View>
      }
    </ScreenWrapper>
  )
}

export default PRDetail

