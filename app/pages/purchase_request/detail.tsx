import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { callApi } from '@/lib/api-fatch';
import { PrProps } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { showToast } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { MappingPr } from '.';

export type PRDetailProps = {
  id: string,
  pr_no: string
}

const PRDetail = () => {
  const params = useLocalSearchParams<PRDetailProps>();
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const router = useRouter();

  const fatchPr = async (pr_id: string) => {
    const createReq = await callApi({
      endpoint: "PrDetailById",
      params: {
        pr_id: parseInt(pr_id),
      }
    });

    let resData: PrProps | null = null;
    if (createReq.Data !== undefined && createReq.Data !== null) resData = MappingPr(createReq.Data);
  };

  const fatchPrDetails = async (pr_id: string) => {
    
  };

  useEffect(() => {
    const fatchDatas = async () => {
      try {
        await fatchPr(params.id);
        await fatchPrDetails(params.id);
      } catch (error: any) {
        showToast({
          type: "error",
          title: "Something's wrong",
          message: error.message
        });
      }
    };

    fatchDatas();
  }, [params]);

  return (
    <ScreenWrapper>
      <View
        className='flex-row justify-between items-center'
        style={{
          paddingHorizontal: rpm(12),
          paddingVertical: rpm(10)
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={rf(21)} color={colors.text} />
        </TouchableOpacity>

        <CText className='font-medium' style={{ fontSize: rf(14) }}>PR Detail</CText>
        <View></View>
      </View>

      {/* <View
        style={{
          paddingHorizontal: rpm(12),
        }}
      >

        <CText>PR Detail</CText>
      </View> */}

      <View className='flex-1 justify-center items-center'
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
      </View>
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