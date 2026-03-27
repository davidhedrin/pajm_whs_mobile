import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { callApi } from '@/lib/api-fatch';
import { ApproverLevel, PrProps } from '@/lib/model-type';
import { formatDate } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList, LayoutAnimation, TouchableOpacity,
  View
} from "react-native";

type SummaryCardProps = {
  title: string;
  count: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const PurchaseRequest: React.FC = () => {
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

  const SummaryCard = ({ title, count, color, icon }: SummaryCardProps) => {
    return (
      <View
        className="w-[31.5%] mb-[3%] rounded-xl p-3 flex-row justify-between items-center"
        style={{ backgroundColor: color }}
      >
        <Ionicons name={icon} size={28} color={colors.text} />
        <View className='items-end'>
          <CText className="font-medium">{title}</CText>
          <CText className="font-bold text-xl">{count}</CText>
        </View>
      </View>
    );
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
      <View className="pt-5 pb-3 px-4">
        <View className='mb-2'>
          <CText
            className="font-medium text-lg leading-none"
          >
            Statistics
          </CText>
          <CText className="font-regular">
            This summary data's is belongs to you!
          </CText>
        </View>
        <View className="flex-row flex-wrap justify-between mb-2">
          <SummaryCard
            title="Total PO"
            count={1234}
            color={colors.bg_primary}
            icon="document-text-outline"
          />
          <SummaryCard
            title="Waiting"
            count={3456}
            color={colors.bg_warning}
            icon="time-outline"
          />
          <SummaryCard
            title="Done"
            count={7890}
            color={colors.bg_success}
            icon="checkmark-done-outline"
          />
        </View>

        <View className="flex-row justify-between mb-3">
          <TouchableOpacity className="flex-row items-center px-3 py-2 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Ionicons name="filter-outline" size={18} color={colors.text} />
            <CText className="ml-2 font-regular text-lg">Filter</CText>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center px-3 py-2 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Ionicons name="swap-vertical-outline" size={18} color={colors.text} />
            <CText className="ml-2 font-regular text-lg">Sort</CText>
          </TouchableOpacity>
        </View>

        <Input
          prefixIcon='search-outline'
          value={search}
          onChangeText={setSearch}
          placeholder="Search purchase order..."
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.Id.toString()}
        showsVerticalScrollIndicator={false}
        className='pt-2 px-4'
        onEndReached={() => {
          if (data.length >= total) return;
          if (data.length < total) fatchDatas();
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? <View className='mb-5 flex-row justify-center items-center'>
            <ActivityIndicator size="small" />
            <CText className='font-medium text-lg ms-2'>Loading...</CText>
          </View> : null
        }
        ListEmptyComponent={
          <View>
            {
              !loading && <View className="px-5 py-6 rounded-xl items-center justify-center shadow-md"
                style={{
                  backgroundColor: colors.surface
                }}
              >
                <Ionicons name="folder-open-outline" size={45} color="#9CA3AF" className="mb-3" />

                <CText className="font-medium text-gray-500 text-center text-lg">
                  No Data Found!
                </CText>

                <CText className="font-regular text-center" style={{ color: colors.textMuted }}>
                  No data results or, Try adjusting filters.
                </CText>
              </View>
            }

          </View>
        }
        renderItem={({ item }: { item: PrProps }) => {
          const isExpanded = expandedId === item.Id;
          return <TouchableOpacity className="rounded-xl px-4 py-3 mb-4 shadow-sm" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row justify-between items-center mb-2">
              <CText className="font-semibold text-gray-900 text-lg">
                {item.PrNo}
              </CText>

              <CText
                className="px-2 py-1.5 rounded-full font-regular leading-none text-sm"
                style={getStatusStyle(item.Status)}
              >
                {item.Status === 'APPROVED' ? "DONE" : "WAITING"}
              </CText>
            </View>

            <CText className="font-regular text-lg mb-1">
              Req By: {item.User1Name}
            </CText>

            {/* 🔹 MAIN CONTENT */}
            <View className='flex-row justify-between items-end'>
              <CText style={{ color: colors.textMuted }}>Submit At: {item.DtmSubmit ? formatDate(item.DtmSubmit, 'medium', 'short') : "-"}</CText>

              <TouchableOpacity onPress={() => toggleExpand(item.Id)} className='flex-row items-center'>
                <CText>{isExpanded ? "Dismiss" : "Expand"}</CText>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <View className="mt-4 pt-3 border-t-2 border-gray-200">
                {/* APPROVAL LIST */}
                {item.Approvers.map((a, index) => {
                  const style = getStatusStyle(a.UserResponse);

                  return (
                    <View key={index} className="flex-row items-start mb-3">
                      <View
                        className="w-2 h-2 mt-2 rounded-full mr-3"
                        style={{ backgroundColor: colors.textMuted }}
                      />

                      <View className="flex-1">
                        <View className="flex-row justify-between items-center">
                          <CText className="font-medium text-lg">
                            Approval - {a.Level}
                          </CText>

                          <CText
                            className="px-2 py-0.5 rounded-full text-sm"
                            style={style}
                          >
                            {a.UserResponse === '' ? "WAITING" : a.UserResponse}
                          </CText>
                        </View>

                        <View className="flex-row justify-between items-center">
                          <CText className="font-regular">
                            {a.UserName}
                          </CText>

                          <CText className="font-regular">
                            {a.DtmResponse ? formatDate(a.DtmResponse, 'medium', 'short') : "-"}
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
    DtmSubmit: new Date(raw.DtmSubmit),
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