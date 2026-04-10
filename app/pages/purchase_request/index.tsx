import Input from '@/components/input';
import BaseModal from '@/components/modal';
import ScreenWrapper from '@/components/screen-wrapper';
import { OptionProps } from '@/components/select';
import { CText } from '@/components/text';
import useTheme, { ColorScheme } from '@/hooks/use-theme';
import { callApi } from '@/lib/api-fatch';
import { ApproverLevel, CheckAprLevelProps, PrPoDetailPageProps, PrProps, ResponsiveScale } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { formatDate, useDefaultState } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList, LayoutAnimation, Platform, Pressable, TouchableOpacity,
  View
} from "react-native";

import { useAuthStore, useConfirmStore } from '@/hooks/zustand';
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from 'expo-router';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

type DateRangePicker = "start" | "end";

export function getStatusStyle(status: string, colors: ColorScheme) {
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

const PurchaseRequest: React.FC = () => {
  const { authData } = useAuthStore();
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const router = useRouter();
  const { showConfirm } = useConfirmStore();

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const closeAllSwipe = () => {
    swipeableRefs.current.forEach((ref) => ref?.close());
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const [openModalFilter, setOpenModalFilter] = useState(false);
  const DEFAULT_STATUS_FILTER = "ShowAllData";
  const statusOptions: OptionProps[] = [
    { label: "All Data", value: DEFAULT_STATUS_FILTER },
    { label: "On Progress", value: "ShowNotRespondedOnly" },
    { label: "Finish Approval", value: "ShowRespondedOnly" },
    { label: "Not Submitted", value: "ShowNotSubmittedOnly" },
    { label: "Submitted", value: "ShowSubmittedOnly" },
  ];
  const [inputSearchFilter, setInputSearchFilter] = useState("");
  const [statusFilter, setStatusFilter, resetStatusFilter] = useDefaultState<string>(DEFAULT_STATUS_FILTER);

  const [startDate, setStartDate, resetStartDate] = useDefaultState<Date | undefined>(undefined);
  const [endDate, setEndDate, resetEndDate] = useDefaultState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [activeDatePicker, setActiveDatePicker] = useState<DateRangePicker | null>(null);
  const onChangeDatePicker = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    };

    if (selectedDate && activeDatePicker) {
      if (activeDatePicker === "start") {
        setStartDate(selectedDate);
      } else if (activeDatePicker === "end") {
        setEndDate(selectedDate);
      }
    };

    setShowDatePicker(Platform.OS === "ios");
  };
  const openPicker = (field: DateRangePicker) => {
    setActiveDatePicker(field);
    setShowDatePicker(true);
  };

  const [onEndReCalled, setOnEndReCalled, resetOnEndReCalled] = useDefaultState<boolean>(true);
  const [startData, setStartData] = useState(0);
  const [startLimit] = useState(15);
  const [data, setData] = useState<PrProps[]>([]);
  const [loading, setLoading] = useState(false);

  const resetFilter = () => {
    resetStatusFilter();
    resetStartDate();
    resetEndDate();
  };

  const fatchDatas = async (isNewSearch: boolean = false) => {
    if (loading) return;

    if (isNewSearch == true) {
      resetOnEndReCalled();
      setStartData(0);
      setData([]);
    }
    const currentStart = isNewSearch === true ? 0 : startData;

    setLoading(true);

    const searchGridFilter = {
      f_0_field: "PrNo",
      f_0_data_type: "string",
      f_0_data_value: inputSearchFilter,
      f_1_field: "User1Name",
      f_1_data_type: "string",
      f_1_data_value: inputSearchFilter,
    };

    const createReq = await callApi<any[]>({
      endpoint: "PrPaging",
      params: {
        start: currentStart,
        limit: startLimit,
        sort: "Id",
        dir: "DESC",
        gridfilters: inputSearchFilter.trim() !== "" ? JSON.stringify(searchGridFilter) : "",
        option2: statusFilter,
        dtm1: startDate ? startDate.toLocaleDateString("en-CA") : "",
        dtm2: endDate ? endDate.toLocaleDateString("en-CA") : "",
      }
    });

    // setTotalData(createReq.TotalRecord ?? 0);

    // console.log(createReq);
    let resData: PrProps[] = [];
    if (createReq.Data !== undefined) resData = createReq.Data.map(x => MappingPr(x, authData?.BpUserId));

    const totalDataRecord = data.length + resData.length;
    if (totalDataRecord === createReq.TotalRecord) setOnEndReCalled(false);
    if ((createReq.TotalRecord ?? 0) > totalDataRecord) setStartData(prev => prev + startLimit);

    // setData(resData);
    setData(prev => [...prev, ...resData]);

    setLoading(false);
  };

  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    const firstInit = async () => {
      await fatchDatas(true);
      setIsFirstRender(false);
    };
    firstInit();
  }, []);

  return (
    <ScreenWrapper scrollable={false} edges={['bottom']}>
      <BaseModal
        visible={openModalFilter}
        onClose={setOpenModalFilter}
        resolveTitle='Apply'
        resolveAction={() => {
          setOpenModalFilter(false);
          fatchDatas(true);
        }}
      >
        <View className='flex-row justify-between items-center' style={{ marginBottom: rpm(10) }}>
          <CText className="font-semibold" style={{ fontSize: rf(14), }}>Filter Data</CText>

          <TouchableOpacity onPress={resetFilter}>
            <CText className="font-semibold" style={{ fontSize: rf(14), color: colors.primary }}>
              <Ionicons name='refresh-sharp' size={rf(16)} /> Reset
            </CText>
          </TouchableOpacity>
        </View>

        <CText className="font-medium" style={{ fontSize: rf(13), marginBottom: rpm(4) }}>Status</CText>
        <View>
          {statusOptions.map((item) => {
            const active = statusFilter === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => setStatusFilter(item.value)}
                className="flex-row items-center"
                style={{ marginBottom: rpm(6) }}
              >
                <View
                  className="rounded-full border items-center justify-center"
                  style={{
                    width: rw(15),
                    height: rh(15),
                    marginRight: rpm(6),
                    borderColor: active ? colors.primary : colors.textMuted
                  }}
                >
                  {active && (
                    <View className="rounded-full"
                      style={{
                        width: rw(9),
                        height: rh(9),
                        backgroundColor: colors.primary
                      }}
                    />
                  )}
                </View>
                <CText style={{ fontSize: rf(13) }}>{item.label}</CText>
              </Pressable>
            );
          })}
        </View>

        <CText className="font-medium" style={{ fontSize: rf(13), marginBottom: rpm(4), marginTop: rpm(10) }}>Date Range</CText>
        <View className="flex-row">
          <TouchableOpacity className="flex-1 border border-gray-300"
            style={{
              borderRadius: rpm(8),
              padding: rpm(10),
              marginRight: rpm(6)
            }}
            onPress={() => openPicker('start')}
          >
            <CText className="font-regular text-gray-600" style={{ fontSize: rf(13) }}>
              {startDate ? startDate.toDateString() : "Start Date"}
            </CText>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 border border-gray-300"
            style={{
              borderRadius: rpm(8),
              padding: rpm(10)
            }}
            onPress={() => openPicker('end')}
          >
            <CText className="font-regular text-gray-600" style={{ fontSize: rf(13) }}>
              {endDate ? endDate.toDateString() : "End Date"}
            </CText>
          </TouchableOpacity>
        </View>
      </BaseModal>
      {
        showDatePicker && activeDatePicker && (
          <DateTimePicker
            value={activeDatePicker === "start" ? (startDate ?? new Date()) : (endDate ?? new Date())}
            mode="date"
            display="default"
            onChange={onChangeDatePicker}
          />
        )
      }

      <View
        style={{
          paddingTop: rpm(16),
          paddingBottom: rpm(8),
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
            onPress={() => setOpenModalFilter(true)}
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
          value={inputSearchFilter}
          onChangeText={(val) => setInputSearchFilter(val)}
          placeholder="Purchase number or request name..."
          suffixGroup={{
            content: <TouchableOpacity onPress={async () => {
              fatchDatas(true);
            }}>
              <Ionicons name='search-outline' size={rf(18)} color={"#fff"} />
            </TouchableOpacity>,
            bgColor: colors.primary
          }}
        />
      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          style={{
            paddingHorizontal: rpm(14)
          }}
          onEndReached={() => {
            if (onEndReCalled) fatchDatas();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loading ? <View className='flex-row justify-center items-center'
              style={{ marginBottom: rpm(18), marginTop: rpm(8) }}
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
          renderItem={({ item, index }: { item: PrProps; index: number }) => {
            const isExpanded = expandedId === item.Id;
            const getCurAprLevel = item.Approvers.find(x => x.Level === item.AssignLevel);
            const checkAprLevel = checkAprUserLevel(item, getCurAprLevel);

            const content = (
              <TouchableOpacity className="shadow-sm"
                style={{
                  paddingStart: rpm(12),
                  paddingEnd: checkAprLevel.show ? rpm(8) : rpm(12),
                  paddingVertical: rpm(10),
                  backgroundColor: colors.surface
                }}
                onPress={() => {
                  closeAllSwipe();
                  router.push({
                    pathname: "/pages/purchase_request/detail",
                    params: {
                      id: item.Id.toString(),
                      doc_num: item.PrNo,
                    } as PrPoDetailPageProps
                  });
                }}
              >
                <View className="flex-row justify-between items-center" style={{ marginBottom: rpm(6) }}>
                  <CText className="font-semibold text-gray-900" style={{ fontSize: rf(13) }}>
                    {index + 1}. {item.PrNo}
                  </CText>

                  <View
                    className="flex-row items-center rounded-full font-regular leading-none"
                    style={[
                      {
                        paddingHorizontal: rpm(6),
                        paddingVertical: rpm(5),
                      },
                      getStatusStyle(item.Status, colors)
                    ]}
                  >
                    <Ionicons name={item.Status === 'APPROVED' ? "checkmark-done-outline" : item.Status === 'REJECTED' ? "close-circle-outline" : "time-outline"} color={colors.text} />
                    <CText className='leading-none' style={{ fontSize: rf(11), marginStart: rpm(3) }}>
                      {item.Status === '' ? "ON PROGRESS" : item.Status}
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

                {
                  isExpanded && (
                    <View className="border-t-2 border-gray-200"
                      style={{
                        marginTop: rpm(9),
                        paddingTop: rpm(9)
                      }}
                    >
                      {/* APPROVAL LIST */}
                      {item.Approvers.map((a, i) => {
                        const style = getStatusStyle(a.UserResponse, colors);

                        return (
                          <View key={i} className="flex-row items-start"
                            style={{ marginBottom: i !== (item.Approvers.length - 1) ? rpm(8) : undefined }}
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
                                <CText className="font-medium" style={{ fontSize: rf(13) }}>
                                  Approval - {a.Level - 1}
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
                  )
                }
              </TouchableOpacity>
            );

            if (checkAprLevel.show) return <View className='border-b border-gray-300'
              style={{
                borderEndWidth: rpm(4),
                borderEndColor: colors.primary
              }}
            >
              <Swipeable
                ref={(ref) => {
                  if (ref) swipeableRefs.current.set(item.Id.toString(), ref);
                }}
                // onSwipeableOpen={closeAllSwipe}
                overshootRight={false}
                renderRightActions={() => (
                  <View className="w-auto flex-col">
                    <TouchableOpacity
                      className="flex-1 items-center justify-center"
                      style={{
                        backgroundColor: colors.success,
                        paddingHorizontal: rpm(16)
                      }}
                      onPress={async () => {
                        swipeableRefs.current.get(item.Id.toString())?.close();

                        const confirmed = await showConfirm({
                          title: `Confirm Aproving!`,
                          message: `Are you sure you want to Aprove this application? You can't undo this action!`,
                          confirmText: "Yes, Confirm",
                          cancelText: "No, Go back",
                          icon: 'checkmark-circle-outline'
                        });
                      }}
                    >
                      <View className='flex-row items-center'>
                        <Ionicons name='checkmark-outline' size={rf(17)} color={colors.surface} />
                        <CText className="font-medium"
                          style={{
                            marginLeft: rpm(2),
                            color: colors.surface,
                            fontSize: rf(13)
                          }}
                        >
                          Approve
                        </CText>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center"
                      style={{
                        backgroundColor: colors.danger,
                        paddingHorizontal: rpm(16)
                      }}
                      onPress={async () => {
                        swipeableRefs.current.get(item.Id.toString())?.close();

                        const confirmed = await showConfirm({
                          title: `Confirm Rejecting!`,
                          message: `Are you sure you want to Reject this application? You can't undo this action!`,
                          confirmText: "Yes, Reject",
                          cancelText: "No, Go back",
                          icon: 'information-circle-outline'
                        });
                      }}
                    >
                      <View className='flex-row items-center'>
                        <Ionicons name='close-outline' size={rf(17)} color={colors.surface} />
                        <CText className="font-medium"
                          style={{
                            marginLeft: rpm(2),
                            color: colors.surface,
                            fontSize: rf(13)
                          }}
                        >
                          Reject
                        </CText>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              >
                {content}
              </Swipeable>
            </View>

            return <View className='border-b border-gray-300'>
              {content}
            </View>
          }}
        />
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
};

export default PurchaseRequest;

export function MappingPr(raw: any, bp_id?: number, items?: any): PrProps {
  const apprLevel = MapApproversPr({ raw, start_idx: 2 });
  const asgLevel = apprLevel.find(x => x.UserId == bp_id);
  const status = [raw.User2Response.trim(), raw.User3Response.trim(), raw.User4Response.trim()];

  return {
    Id: raw.Id,
    PrNo: raw.PrNo,
    DtmSubmit: raw.DtmSubmit ? new Date(raw.DtmSubmit) : null,
    User1Name: raw.User1Name,
    Status: status.includes("REJECTED") ? "REJECTED" : status.every(res => res === "APPROVED") ? "APPROVED" : "",
    Remark: raw.Remark,

    Approvers: apprLevel,
    AssignLevel: asgLevel ? asgLevel.Level : undefined,
    ItemDetails: items
  };
};

export function checkAprUserLevel(prData: PrProps, curLevel?: ApproverLevel): CheckAprLevelProps {
  if (curLevel !== undefined) {
    const allApproval = prData.Approvers;

    const curLevelVal = curLevel.Level;
    const curResponse = curLevel.UserResponse;

    const initLvl_1 = 2;
    const initLvl_2 = 3;
    const initLvl_3 = 4;

    if (curLevelVal == initLvl_1) {
      if (curResponse !== '') {
        if (curResponse === 'APPROVED') return { show: false, msg: "Thank's for your response! You has been already approve this application." };
        else return { show: false, msg: "Thank's for your response! You has chosen to decline this application." };
      }

      return { show: true, msg: null }
    } else if (curLevelVal == initLvl_2) {
      const prevLevel = allApproval.find(x => x.Level == (initLvl_2 - 1));
      if (!prevLevel) return { show: false, msg: null }

      if (prevLevel.UserResponse === '') return { show: false, msg: "Please waiting a moment! The previous Approval-1 is not response yet." };
      else {
        if (prevLevel.UserResponse === 'REJECTED') return { show: false, msg: null };
      }

      if (curResponse !== '') {
        if (curResponse === 'APPROVED') return { show: false, msg: "Thank's for your response! You has been already approve this application." };
        else return { show: false, msg: "Thank's for your response! You has chosen to decline this application." };
      }

      return { show: true, msg: null }
    } else if (curLevelVal == initLvl_3) {
      const prevLevel = allApproval.find(x => x.Level == (initLvl_3 - 1));
      if (!prevLevel) return { show: false, msg: null }

      if (prevLevel.UserResponse === '') return { show: false, msg: "Please waiting a moment! The previous Approval-2 is not response yet." };
      else {
        if (prevLevel.UserResponse === 'REJECTED') return { show: false, msg: null };
      }

      if (curResponse !== '') {
        if (curResponse === 'APPROVED') return { show: false, msg: "Thank's for your response! You has been already approve this application." };
        else return { show: false, msg: "Thank's for your response! You has chosen to decline this application." };
      }

      return { show: true, msg: null }
    } else return { show: false, msg: "However, you are currently not assigned to this application, Thank you!" };
  } else return { show: false, msg: "However, you are currently not assigned to this application, Thank you!" };
};

export function MapApproversPr({ raw, start_idx = 1 }: { raw: any; start_idx: number; }): ApproverLevel[] {
  const result: ApproverLevel[] = [];

  let i = start_idx;
  while (raw[`User${i}Name`]) {
    result.push({
      Level: i,
      UserId: raw[`User${i}`],
      UserApproved: raw[`User${i}Approved`],
      UserName: raw[`User${i}Name`],
      UserResponse: raw[`User${i}Response`],
      Remark: raw[`Remark${i}`],
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

export async function PrAction({ action, pr_id }: {
  action: "APPROVED" | "REJECTED",
  pr_id: number,
}) {

};