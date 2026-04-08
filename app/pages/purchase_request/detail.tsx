import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { callApi } from '@/lib/api-fatch';
import { PrProps } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { formatDate, showToast } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { getStatusStyle, MappingPr } from '.';

export type PRDetailProps = {
  id: string,
  pr_no: string
}

const PRDetail = () => {
  const params = useLocalSearchParams<PRDetailProps>();
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dataPr, setDataPr] = useState<PrProps | null>(null);

  const fatchDatas = async (pr_id: string) => {
    setLoading(true);
    try {
      const createReq = await callApi<any>({
        endpoint: "PrDetailById",
        params: {
          pr_id: parseInt(pr_id),
        }
      });

      console.log(createReq);
      if (createReq.Data !== undefined && createReq.Data !== null) {
        const prData = MappingPr(createReq.Data.Header, createReq.Data.Items);
        console.log(prData);
        setDataPr(prData);
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
              <View
                className='border-dashed'
                style={{
                  borderTopWidth: rpm(3),
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  padding: rpm(8),
                  marginBottom: rpm(14)
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
                      <Ionicons name={dataPr.Status === 'APPROVED' ? "checkmark-done-outline" : "time-outline"} color={colors.text} />
                      <CText className='leading-none' style={{ fontSize: rf(12), marginStart: rpm(3) }}>
                        {dataPr.Status === 'APPROVED' ? "FINISH" : "ON PROGRESS"}
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
                  <CText>Request At: </CText>
                  <CText className='font-semibold' style={{ fontSize: rf(13) }}>
                    {formatDate(dataPr.DtmSubmit, 'medium', 'short')}
                  </CText>
                </View>
              </View>

              <View style={{ marginBottom: rpm(28) }}>
                <CText
                  className="font-medium leading-none"
                  style={{ fontSize: rf(13), marginBottom: rpm(6) }}
                >
                  Remark
                </CText>
                <Input
                  // value={inputSearchFilter}
                  // onChangeText={(val) => setInputSearchFilter(val)}
                  placeholder="Enter comment here if any"
                  multiline
                  numberOfLines={3}
                  style={{
                    minHeight: rpm(3 * 24),
                    textAlignVertical: 'top'
                  }}
                />
              </View>

              <View className="flex-row overflow-hidden self-center"
                style={{
                  borderRadius: rpm(10),
                  marginBottom: rpm(24)
                }}
              >
                <TouchableOpacity
                  className="flex-row justify-center items-center"
                  style={{
                    paddingHorizontal: rpm(20),
                    paddingVertical: rpm(10),
                    backgroundColor: colors.success,
                  }}
                  onPress={() => { }}
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
                  onPress={() => { }}
                >
                  <Ionicons name='close-outline' size={rf(17)} color={"#fff"} />
                  <CText className="font-medium ms-1" style={{ fontSize: rf(13), color: "#fff" }}>
                    Reject
                  </CText>
                </TouchableOpacity>
              </View>

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
                              <CText className="text-gray-400" style={{ fontSize: rf(12) }}>
                                {item.DtmResponse !== null ? formatDate(item.DtmResponse, 'medium', 'short') : "-"}
                              </CText>
                            </View>
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

// function MappingPrDetail(raw: any): PrDetailProps {
//   return {
//     Dtm: raw.Dtm,
//     DtmSubmit: raw.DtmSubmit ? new Date(raw.DtmSubmit) : null,
//     Status: (raw.DtmResponse2 && raw.DtmResponse3 && raw.DtmResponse4) ? "APPROVED" : "",

//     DtmResponse2: raw.DtmResponse2 ? new Date(raw.DtmResponse2) : null,
//     DtmResponse3: raw.DtmResponse3 ? new Date(raw.DtmResponse3) : null,
//     DtmResponse4: raw.DtmResponse4 ? new Date(raw.DtmResponse4) : null,

//     Remark: raw.Remark,
//     Remark2: raw.Remark2,
//     Remark3: raw.Remark3,
//     Remark4: raw.Remark4,

//     TotalAmount: raw.TotalAmount,

//     User1: raw.User1,
//     User1Email: raw.User1Email,
//     User1Name: raw.User1Name,

//     Approvers: MapApproversPr({ raw, start_idx: 2 })
//   };
// };