import Alert from '@/components/alert';
import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import { useStatisticStore } from '@/hooks/statistic-zustand';
import useTheme from '@/hooks/use-theme';
import { useAuthStore, useConfirmStore, useLoadingStore } from '@/hooks/zustand';
import { callApi } from '@/lib/api-fatch';
import { ApproverLevel, CheckAprLevelProps, PoProps, PrPoActionProps, PrPoDetailPageProps } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { formatDate, formatMoney, showToast } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { CheckPoUserLevel, MappingPo, PoAction } from '.';
import { getStatusStyle } from '../purchase_request';

const PoDetail = () => {
  const { authData } = useAuthStore();
  const params = useLocalSearchParams<PrPoDetailPageProps>();
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const { showConfirm } = useConfirmStore();
  const loadingPage = useLoadingStore.getState();
  const { fetchStatistic } = useStatisticStore();

  const [loading, setLoading] = useState(true);
  const [dataPo, setDataPo] = useState<PoProps | null>(null);
  const [curAprLevel, setCurAprLevel] = useState<ApproverLevel | null>(null);
  const [remark, setRemark] = useState("");
  const [resCheckAprLevel, setResCheckAprLevel] = useState<CheckAprLevelProps | null>(null);

  const [grandTotalItems, setGrandTotalItems] = useState(0);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const fatchDatas = async (po_id: string) => {
    setLoading(true);
    try {
      const createReq = await callApi<any>({
        endpoint: "PoDetailById",
        params: {
          po_id: parseInt(po_id),
        }
      });


      if (createReq.Data !== undefined && createReq.Data !== null) {
        const poData = MappingPo(createReq.Data.Header, authData?.BpUserId, createReq.Data.Items);
        const getCurAprLevel = poData.Approvers.find(x => x.Level === poData.AssignLevel);
        setDataPo(poData);
        setCurAprLevel(getCurAprLevel ?? null);

        const grandTotalItems = poData.ItemDetails?.reduce((total, item) => {
          return total + item.Quantity * item.UnitPrice;
        }, 0);
        setGrandTotalItems(grandTotalItems ?? 0);

        const checkAprLevel = CheckPoUserLevel(poData, getCurAprLevel);
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

  const handlePoAction = async ({ action, doc_id, level, remark }: PrPoActionProps) => {
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
      const reqDelay = await PoAction({ action, doc_id, level, remark });
      await fatchDatas(doc_id.toString());
      showToast({
        type: "success",
        title: "Update Finish",
        message: reqDelay.Message
      });

      fetchStatistic(authData?.BpUserId ?? 0);
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
    <ScreenWrapper
      edges={['bottom']}
      refreshControlAction={async () => {
        await fatchDatas(params.id);
      }}
    >
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
            dataPo ? <View style={{ paddingTop: rpm(16) }}>
              {
                dataPo.Status !== "" && (
                  <View style={{ marginBottom: rpm(16) }}>
                    <Alert
                      type={dataPo.Status === 'APPROVED' ? "success" : "danger"}
                      icon='checkmark-circle-outline'
                      title={`${dataPo.Status}!`}
                      msg={
                        dataPo.Status === 'APPROVED' ?
                          "This application was reviewed and has been finish approved successfully." :
                          "This request has been rejected for any reason. See the timelines comment if any!"
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
                  marginBottom: rpm(16)
                }}
              >
                <View
                  style={{
                    padding: rpm(8),
                  }}
                >
                  <View style={{ marginBottom: rpm(4) }}>
                    <View className='flex-row justify-between items-center'>
                      <CText>PO Number: </CText>
                      <View
                        className="flex-row items-center rounded-full font-regular leading-none"
                        style={[
                          {
                            paddingHorizontal: rpm(6),
                            paddingVertical: rpm(5),
                          },
                          getStatusStyle(dataPo.Status, colors)
                        ]}
                      >
                        <Ionicons name={dataPo.Status === 'APPROVED' ? "checkmark-done-outline" : dataPo.Status === 'REJECTED' ? "close-circle-outline" : "time-outline"} color={colors.text} />
                        <CText className='leading-none' style={{ fontSize: rf(12), marginStart: rpm(3) }}>
                          {dataPo.Status === '' ? "ON PROGRESS" : dataPo.Status}
                        </CText>
                      </View>
                    </View>
                    <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPo.PoNo}</CText>
                  </View>

                  <View style={{ marginBottom: rpm(4) }}>
                    <CText>Request By: </CText>
                    <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPo.User1Name}</CText>
                  </View>

                  <View style={{ marginBottom: rpm(4) }}>
                    <CText>Request Remark: </CText>
                    <CText className='font-semibold' style={{ fontSize: rf(13) }}>
                      {dataPo.Remark ? (dataPo.Remark.trim() !== "" ? dataPo.Remark : "-") : "-"}
                    </CText>
                  </View>

                  <View className='flex-row justify-between'>
                    <View>
                      <CText>Request At: </CText>
                      {
                        dataPo.SubmitDtm !== null ? <CText className='font-semibold' style={{ fontSize: rf(13) }}>
                          {formatDate(dataPo.SubmitDtm, 'medium', 'short')}
                        </CText> : <CText style={{ color: colors.danger, fontSize: rf(13) }}>NOT SUBMITTED YET</CText>
                      }
                    </View>
                    {
                      dataPo.AssignLevel !== undefined && <View className='items-end'>
                        <CText>Assign As</CText>
                        <CText className='font-semibold' style={{ fontSize: rf(13) }}>Approval - {(dataPo.AssignLevel ?? 2) - 1}</CText>
                      </View>
                    }
                  </View>
                </View>

                <View className="bg-gray-300" style={{ height: rh(2) }} />


                <View
                  style={{
                    padding: rpm(8),
                  }}
                >
                  {
                    showMoreInfo && <>
                      <View style={{ marginBottom: rpm(4) }}>
                        <View className='flex-row justify-between items-center'>
                          <CText>Supplier: </CText>
                          <CText>Delivery Time: </CText>

                        </View>
                        <View className='flex-row justify-between items-center'>
                          <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPo.SupplierName ?? "-"}</CText>
                          <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPo.DeliveryTime ?? "-"}</CText>
                        </View>
                      </View>

                      <View style={{ marginBottom: rpm(4) }}>
                        <CText>Shipping To: </CText>
                        <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPo.ShipToName ?? "-"}</CText>
                      </View>

                      <View style={{ marginBottom: rpm(4) }}>
                        <CText>Cost Center: </CText>
                        <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPo.CostCenterName ?? "-"}</CText>
                      </View>

                      <View style={{ marginBottom: rpm(4) }}>
                        <CText>Sub Cost Center: </CText>
                        <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPo.SubCostCenterName ?? "-"}</CText>
                      </View>

                      <View style={{ marginBottom: rpm(4) }}>
                        <CText>PR Referen: </CText>
                        <CText className='font-semibold' style={{ fontSize: rf(13) }}>{dataPo.PrNo}</CText>
                      </View>
                    </>
                  }

                  <TouchableOpacity onPress={() => setShowMoreInfo(prev => !prev)} className='flex-row justify-between items-center'>
                    <CText className="font-semibold" style={{ fontSize: rf(13), color: colors.primary }}>
                      More Info...
                    </CText>

                    <Ionicons name={showMoreInfo ? 'chevron-up' : 'chevron-down'} size={rf(16)} color={colors.primary} />
                  </TouchableOpacity>
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
                        You are assigned as the <CText className='font-bolds-i'>Approval - {(dataPo.AssignLevel ?? 2) - 1}</CText> user who approves this application. Please confirm your response below!
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
                          if (curAprLevel) handlePoAction({
                            action: 'APPROVED',
                            level: curAprLevel.Level,
                            doc_id: dataPo.Id,
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
                          if (curAprLevel) handlePoAction({
                            action: 'REJECTED',
                            level: curAprLevel.Level,
                            doc_id: dataPo.Id,
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
                  </View> : resCheckAprLevel.msg !== null && <CText style={{ marginBottom: rpm(14) }} className='font-medium-i text-center underline'>{resCheckAprLevel.msg}</CText>
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
                    dataPo.Approvers.map((item, index) => {
                      const color = getStatusStyle(item.UserResponse, colors);
                      const isLast = index === dataPo.Approvers.length - 1;

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
                          <View className="flex-1" style={{ marginBottom: index !== (dataPo.Approvers.length - 1) ? rpm(16) : undefined }}>
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
                    dataPo.ItemDetails && dataPo.ItemDetails.length > 0 ? dataPo.ItemDetails.map((x, i) => {
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
                                SKU: {x.SKU}
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
                    }) : <View className="items-center justify-center"
                      style={{
                        paddingHorizontal: rpm(8),
                        paddingVertical: rpm(20),
                      }}
                    >
                      <Ionicons name="folder-open-outline" size={rf(38)} color="#9CA3AF" style={{ marginBottom: rpm(10) }} />

                      <CText className="font-semibold text-center" style={{ fontSize: rf(13) }}>
                        Item not found!
                      </CText>

                      <CText className="font-regular text-center" style={{ color: colors.textMuted, fontSize: rf(13) }}>
                        No item detail in this application.
                      </CText>
                    </View>
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

export default PoDetail