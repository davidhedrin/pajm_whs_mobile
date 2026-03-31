import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme, { ColorScheme } from '@/hooks/use-theme';
import { callApi } from '@/lib/api-fatch';
import { ApproverLevel, PrProps, ResponsiveScale } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { formatDate } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList, LayoutAnimation, TouchableOpacity,
  View
} from "react-native";

const PurchaseRequest: React.FC = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const [search, setSearch] = useState("");
  const { colors } = useTheme();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          backgroundColor: colors.bg_success,
          color: colors.success,
        };
      case "REJECTED":
        return {
          backgroundColor: colors.bg_danger,
          color: colors.danger,
        };
      default:
        return {
          backgroundColor: colors.bg_shadow,
          color: colors.text,
        };
    }
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const [startData, setStartData] = useState(0);
  const [startLimit] = useState(15);
  const [data, setData] = useState<PrProps[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const fatchDatas = async () => {
    if (loading) return;

    setLoading(true);

    const createReq = await callApi<any[]>({
      endpoint: "PoPaging",
      params: {
        start: startData,
        limit: startLimit,
        sort: "Id",
        dir: "ASC",
        gridfilters: "",
        option2: "ShowAllData",
      }
    });

    setTotal(createReq.TotalRecord ?? 0);

    console.log(createReq);
    let resData: PrProps[] = [];
    if (createReq.Data !== undefined) resData = createReq.Data.map(MappingPr);
    // setData(resData);
    setData(prev => [...prev, ...resData]);
    console.log(resData);

    setStartData(prev => prev + startLimit);
    setLoading(false);
  };

  useEffect(() => {
    fatchDatas();
  }, []);

  return (
    <ScreenWrapper scrollable={false} edges={['bottom']}>
      <View
        style={{
          paddingTop: rpm(16),
          paddingBottom: rpm(10),
          paddingHorizontal: rpm(12)
        }}
      >
        <View style={{ marginBottom: rpm(8) }}>
          <CText
            className="font-medium leading-none"
            style={{ fontSize: rf(13) }}
          >
            Statistics
          </CText>
          <CText className="font-regular" style={{ fontSize: rf(12) }}>
            This summary data's is belongs to you!
          </CText>
        </View>
        <View className="flex-row flex-wrap justify-between" style={{ marginBottom: rpm(6) }}>
          <SummaryCard
            title="Total PO"
            count={1234}
            color={colors.bg_primary}
            icon="document-text-outline"
            color_scheme={colors}
            scales={useResposiveScale()}
          />
          <SummaryCard
            title="On Progress"
            count={3456}
            color={colors.bg_warning}
            icon="time-outline"
            color_scheme={colors}
            scales={useResposiveScale()}
          />
          <SummaryCard
            title="Finish"
            count={7890}
            color={colors.bg_success}
            icon="checkmark-done-outline"
            color_scheme={colors}
            scales={useResposiveScale()}
          />
        </View>

        <View className="flex-row justify-between mb-3" style={{ marginBottom: rpm(10) }}>
          <TouchableOpacity className="flex-row items-center"
            style={{
              borderRadius: rpm(10),
              paddingHorizontal: rpm(10),
              paddingVertical: rpm(6),
              backgroundColor: colors.surface
            }}
          >
            <Ionicons name="filter-outline" size={rf(14)} color={colors.text} />
            <CText className="font-regular" style={{ fontSize: rf(13), marginLeft: rpm(6) }}>Filter</CText>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center"
            style={{
              borderRadius: rpm(10),
              paddingHorizontal: rpm(10),
              paddingVertical: rpm(6),
              backgroundColor: colors.surface
            }}
          >
            <Ionicons name="swap-vertical-outline" size={rf(14)} color={colors.text} />
            <CText className="font-regular" style={{ fontSize: rf(13), marginLeft: rpm(6) }}>Sort</CText>
          </TouchableOpacity>
        </View>

        <Input
          prefixIcon='search-outline'
          value={search}
          onChangeText={setSearch}
          placeholder="Search purchase order number..."
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.Id.toString()}
        showsVerticalScrollIndicator={false}
        style={{
          paddingTop: rpm(6),
          paddingHorizontal: rpm(14)
        }}
        onEndReached={() => {
          if (data.length >= total) return;
          if (data.length < total) fatchDatas();
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? <View className='flex-row justify-center items-center'
            style={{ marginBottom: rpm(18) }}
          >
            <ActivityIndicator size="small" />
            <CText className='font-medium' style={{ fontSize: rf(13), marginStart: rpm(6) }}>Loading...</CText>
          </View> : null
        }
        ListEmptyComponent={
          <View>
            {
              !loading && <View className="items-center justify-center shadow-md"
                style={{
                  paddingHorizontal: rpm(16),
                  paddingVertical: rpm(20),
                  borderRadius: rpm(10),
                  backgroundColor: colors.surface
                }}
              >
                <Ionicons name="folder-open-outline" size={rf(38)} color="#9CA3AF" style={{ marginBottom: rpm(10) }} />

                <CText className="font-medium text-gray-500 text-center" style={{ fontSize: rf(13) }}>
                  No Data Found!
                </CText>

                <CText className="font-regular text-center" style={{ color: colors.textMuted, fontSize: rf(12) }}>
                  No data results or, Try adjusting filters.
                </CText>
              </View>
            }

          </View>
        }
        renderItem={({ item }: { item: PrProps }) => {
          const isExpanded = expandedId === item.Id;
          return <TouchableOpacity className="shadow-sm"
            style={{
              borderRadius: rpm(10),
              paddingHorizontal: rpm(12),
              paddingVertical: rpm(10),
              marginBottom: rpm(14),
              backgroundColor: colors.surface
            }}
          >
            <View className="flex-row justify-between items-center" style={{ marginBottom: rpm(6) }}>
              <CText className="font-semibold text-gray-900" style={{ fontSize: rf(13) }}>
                {item.PrNo}
              </CText>

              <View
                className="flex-row items-center rounded-full font-regular leading-none"
                style={[
                  {
                    paddingHorizontal: rpm(6),
                    paddingVertical: rpm(5),
                  },
                  getStatusStyle(item.Status)
                ]}>
                <Ionicons name={item.Status === 'APPROVED' ? "checkmark-done-outline" : "time-outline"} />
                <CText className='leading-none' style={{ fontSize: rf(11), marginStart: rpm(3) }}>
                  {item.Status === 'APPROVED' ? "FINISH" : "ON PROGRESS"}
                </CText>
              </View>
            </View>

            <CText className="font-regular" style={{ fontSize: rf(13), marginBottom: rpm(3) }}>
              Req By: {item.User1Name}
            </CText>

            {/* 🔹 MAIN CONTENT */}
            <View className='flex-row justify-between items-end'>
              {
                item.DtmSubmit !== null ? <CText style={{ color: colors.textMuted, fontSize: rf(12) }}>
                  Submit At: {formatDate(item.DtmSubmit, 'medium', 'short')}
                </CText> : <CText style={{ color: colors.danger, fontSize: rf(12) }}>NOT SUBMITTED YET</CText>
              }


              <TouchableOpacity onPress={() => toggleExpand(item.Id)} className='flex-row items-center'>
                <CText style={{ fontSize: rf(13) }}>{isExpanded ? "Dismiss" : "Expand"}</CText>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={rf(17)}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <View className="border-t-2 border-gray-200"
                style={{
                  marginTop: rpm(9),
                  paddingTop: rpm(9)
                }}
              >
                {/* APPROVAL LIST */}
                {item.Approvers.map((a, index) => {
                  const style = getStatusStyle(a.UserResponse);

                  return (
                    <View key={index} className="flex-row items-start"
                      style={{ marginBottom: index !== (item.Approvers.length - 1) ? rpm(8) : undefined }}
                    >
                      <View
                        className="rounded-full mr-3"
                        style={{
                          width: rw(5),
                          height: rh(5),
                          marginTop: rpm(7),
                          marginRight: rpm(8),
                          backgroundColor: colors.textMuted
                        }}
                      />

                      <View className="flex-1">
                        <View className="flex-row justify-between items-center">
                          <CText className="font-medium text-lg" style={{ fontSize: rf(13) }}>
                            Approval - {a.Level}
                          </CText>

                          <CText
                            className="rounded-full"
                            style={[
                              {
                                paddingHorizontal: rpm(6),
                                paddingVertical: rpm(2),
                                fontSize: rf(11)
                              },
                              style
                            ]}
                          >
                            {a.UserResponse === '' ? "WAITING" : a.UserResponse}
                          </CText>
                        </View>

                        <View className="flex-row justify-between items-center">
                          <CText className="font-regular" style={{ fontSize: rf(12) }}>
                            {a.UserName}
                          </CText>

                          <CText className="font-regular" style={{ fontSize: rf(12) }}>
                            {a.DtmResponse !== null ? formatDate(a.DtmResponse, 'medium', 'short') : "-"}
                          </CText>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </TouchableOpacity>
        }}
      />
    </ScreenWrapper>
  );
};

export default PurchaseRequest;

function MappingPr(raw: any): PrProps {
  return {
    Id: raw.Id,
    PrNo: raw.PrNo,
    DtmSubmit: raw.DtmSubmit ? new Date(raw.DtmSubmit) : null,
    User1Name: raw.User1Name,
    Approvers: MapApprovers({ raw, start_idx: 2 }),
    Status: (raw.DtmResponse2 && raw.DtmResponse3 && raw.DtmResponse4) ? "APPROVED" : ""
  };
};

function MapApprovers({ raw, start_idx = 1 }: { raw: any; start_idx: number; }): ApproverLevel[] {
  const result: ApproverLevel[] = [];

  let i = start_idx;
  while (raw[`User${i}Name`]) {
    result.push({
      Level: i,
      UserApproved: raw[`User${i}Approved`],
      UserName: raw[`User${i}Name`],
      UserResponse: raw[`User${i}Response`],
      DtmResponse: raw[`DtmResponse${i}`]
        ? raw[`DtmResponse${i}`].toString().trim() !== ""
          ? new Date(raw[`DtmResponse${i}`].replace(" ", "T"))
          : null
        : null,
    });
    i++;
  }

  return result;
};

type SummaryCardProps = {
  title: string;
  count: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  color_scheme: ColorScheme;
  scales: ResponsiveScale;
};

function SummaryCard({ title, count, color, icon, color_scheme, scales }: SummaryCardProps) {
  const { rpm, rf } = scales;

  return (
    <View
      className="w-[31.5%] mb-[3%] flex-row justify-between items-center"
      style={{
        borderRadius: rpm(10),
        paddingVertical: rpm(8),
        paddingHorizontal: rpm(7),
        backgroundColor: color
      }}
    >
      <Ionicons name={icon} size={rf(24)} color={color_scheme.text} />
      <View className='items-end'>
        <CText className="font-medium" style={{ fontSize: rf(12) }}>{title}</CText>
        <CText className="font-bold" style={{ fontSize: rf(14) }}>{count}</CText>
      </View>
    </View>
  );
};