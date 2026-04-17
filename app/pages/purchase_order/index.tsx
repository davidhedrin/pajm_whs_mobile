import CustomDropdown from '@/components/dropdown';
import Input from '@/components/input';
import BaseModal from '@/components/modal';
import ScreenWrapper from '@/components/screen-wrapper';
import { OptionProps } from '@/components/select';
import { CText } from '@/components/text';
import { saveRecentItem } from '@/hooks/recently-halper';
import { useStatisticStore } from '@/hooks/statistic-zustand';
import useTheme, { ColorScheme } from '@/hooks/use-theme';
import { useAuthStore, useConfirmStore, useLoadingStore } from '@/hooks/zustand';
import { callApi } from '@/lib/api-fatch';
import { ApproverLevel, CheckAprLevelProps, PoProps, PrPoActionProps, PrPoDetailPageProps, ResponsiveScale, SortFilterProps } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { formatDate, showToast, useDefaultState } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Router, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, LayoutAnimation, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { getStatusStyle, SummaryCard } from '../purchase_request';

type DateRangePicker = "start" | "end";

const PurchaseOrder = () => {
  const { authData } = useAuthStore();
  const { rw, rh, rpm, rf } = useResposiveScale();
  const scales = useResposiveScale();
  const { colors } = useTheme();
  const router = useRouter();
  const { showConfirm } = useConfirmStore();
  const loadingPage = useLoadingStore.getState();
  const { dataStPo, fetchStatistic } = useStatisticStore();

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const closeAllSwipe = useCallback(() => {
    swipeableRefs.current.forEach((ref) => ref?.close());
  }, []);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toggleExpand = useCallback((id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  const [openModalFilter, setOpenModalFilter] = useState(false);
  const DEFAULT_STATUS_FILTER = "ShowAllData";
  const statusOptions: OptionProps[] = [
    { label: "All Data", value: DEFAULT_STATUS_FILTER },
    { label: "On Progress", value: "ShowNotRespondedOnly" },
    { label: "Finish Approval", value: "ShowRespondedOnly" },
    { label: "Not Submitted", value: "ShowNotSubmittedOnly" },
    { label: "Submitted", value: "ShowSubmittedOnly" },
    { label: "Rejected", value: "ShowRejectedOnly" },
  ];
  const [inputSearchFilter, setInputSearchFilter] = useState("");
  const [statusFilter, setStatusFilter, resetStatusFilter] = useDefaultState<string>(DEFAULT_STATUS_FILTER);

  const [openModalSortFilter, setOpenModaSortlFilter] = useState(false);
  const [sortFilter, setSortFilter, resetSortFilter] = useDefaultState<SortFilterProps[]>([{ key: "Id", dir: "DESC" }]);
  const listSortKey = [
    { label: "ID", value: "Id" },
    { label: "Doc. Number", value: "PoNo" },
    { label: "Submit Date", value: "Dtm" },
  ]
  const addNewSortFilter = () => {
    if (sortFilter.length < listSortKey.length) setSortFilter(prev => [...prev, { key: "", dir: "" }]);
  };
  const handleChangeSortFilter = (index: number, field: 'key' | 'dir', value: string) => {
    setSortFilter(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };
  const sortingFilterSort = (): SortFilterProps[] => {
    return sortFilter.filter(item => item.key !== "" && item.dir !== "");
  };

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
  const [data, setData] = useState<PoProps[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const resetFilter = () => {
    resetStatusFilter();
    resetStartDate();
    resetEndDate();
  };

  const fatchDatas = async (isNewSearch: boolean = false, filterStatus = statusFilter) => {
    if (loadingData) return;
    if (isNewSearch == true) {
      resetOnEndReCalled();
      setData([]);
    }
    const currentStart = isNewSearch === true ? 0 : startData;
    setLoadingData(true);

    const searchGridFilter = {
      f_0_field: "PoNo",
      f_0_data_type: "string",
      f_0_data_value: inputSearchFilter,
      f_1_field: "User1Name",
      f_1_data_type: "string",
      f_1_data_value: inputSearchFilter,
    };
    const sortFiltering = sortingFilterSort();
    const createReq = await callApi<any[]>({
      endpoint: "PoPaging",
      params: {
        start: currentStart,
        limit: startLimit,
        sort: JSON.stringify(sortFiltering),
        gridfilters: inputSearchFilter.trim() !== "" ? JSON.stringify(searchGridFilter) : "",
        option2: filterStatus,
        dtm1: startDate ? startDate.toLocaleDateString("en-CA") : "",
        dtm2: endDate ? endDate.toLocaleDateString("en-CA") : "",
      }
    });

    console.log(createReq);
    let resData: PoProps[] = [];
    if (createReq.Data !== undefined) resData = createReq.Data.map(x => MappingPo(x, authData?.BpUserId));

    const totalDataRecord = (isNewSearch === true ? 0 : data.length) + resData.length;
    if (totalDataRecord === createReq.TotalRecord) setOnEndReCalled(false);
    if ((createReq.TotalRecord ?? 0) > totalDataRecord) setStartData(currentStart + startLimit);

    setData(prev => [...prev, ...resData]);
    setLoadingData(false);
  }

  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    const firstInit = async () => {
      await fatchDatas(true);
      setIsFirstRender(false);
    };
    firstInit();
  }, []);

  const handleUpdateItem = (updatedItem: PoProps) => {
    setData(
      prev => prev.map(item => item.Id === updatedItem.Id ? { ...item, ...updatedItem } : item)
    );
  };

  const handlePoAction = useCallback(async ({ action, doc_id, level, remark, doc_num }: { doc_num: string } & PrPoActionProps) => {
    const confirmed = await showConfirm({
      title: `Confirm ${action === 'APPROVED' ? "Approving" : "Rejecting"}!`,
      message: `Are you sure you want to ${action === 'APPROVED' ? "Aprove" : "Reject"} application "${doc_num}"?`,
      confirmText: `Yes, ${action === 'APPROVED' ? "Aprove" : "Reject"}`,
      cancelText: "No, Go back",
      icon: action === 'APPROVED' ? "checkmark-circle-outline" : "close-circle-outline"
    });
    if (!confirmed) return;

    loadingPage.show();
    try {
      const reqDelay = await PoAction({ action, doc_id, level, remark });
      const prData = MappingPo(reqDelay.Data, authData?.BpUserId);
      handleUpdateItem(prData);
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
  }, []);

  return (
    <ScreenWrapper scrollable={false} edges={['bottom']}>
      {/* Modal show filter option */}
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

      {/* Modal show filter sort */}
      <BaseModal
        visible={openModalSortFilter}
        onClose={setOpenModaSortlFilter}
        resolveTitle='Apply'
        resolveAction={() => {
          setOpenModaSortlFilter(false);
          fatchDatas(true);
        }}
      >
        <View className='flex-row justify-between items-center' style={{ marginBottom: rpm(10) }}>
          <CText className="font-semibold" style={{ fontSize: rf(14), }}>Sort Filter</CText>

          <TouchableOpacity onPress={resetSortFilter}>
            <CText className="font-semibold" style={{ fontSize: rf(14), color: colors.primary }}>
              <Ionicons name='refresh-sharp' size={rf(16)} /> Reset
            </CText>
          </TouchableOpacity>
        </View>

        {
          sortFilter.map((x, i) => (
            <View key={i} className='flex-row items-center justify-between' style={{ marginBottom: rpm(8) }}>
              <View className='w-2/3' style={{ paddingEnd: rpm(6) }}>
                <CustomDropdown
                  data={listSortKey}
                  style={{
                    paddingTop: rpm(10),
                    paddingBottom: rpm(7),
                  }}
                  value={x.key}
                  onChange={(y) => handleChangeSortFilter(i, 'key', y)}
                  placeholder="Choose Colomn"
                />
              </View>
              <View className='w-1/3'>
                <CustomDropdown
                  data={[
                    { label: "Asc", value: "ASC" },
                    { label: "Desc", value: "DESC" },
                  ]}
                  style={{
                    paddingTop: rpm(10),
                    paddingBottom: rpm(7),
                  }}
                  value={x.dir}
                  onChange={(y) => handleChangeSortFilter(i, 'dir', y)}
                  placeholder="Dir"
                />
              </View>
            </View>
          ))
        }

        <TouchableOpacity onPress={() => addNewSortFilter()}>
          <CText className="font-semibold" style={{ fontSize: rf(14), color: colors.primary }}>
            <Ionicons name='add-outline' size={rf(16)} /> Add More
          </CText>
        </TouchableOpacity>
      </BaseModal>

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
          <View className="flex-row flex-wrap justify-between" style={{ marginBottom: rpm(6) }}>
            <SummaryCard
              title="Total Data"
              count={dataStPo?.TotalData ?? 0}
              color={colors.bg_primary}
              icon="document-text-outline"
              color_scheme={colors}
              scales={scales}
              onPress={() => {
                setStatusFilter(DEFAULT_STATUS_FILTER);
                fatchDatas(true, DEFAULT_STATUS_FILTER);
              }}
            />
            <SummaryCard
              title="On Progress"
              count={dataStPo?.OnProgress ?? 0}
              color={colors.bg_warning}
              icon="time-outline"
              color_scheme={colors}
              scales={scales}
              onPress={() => {
                setStatusFilter("ShowNotRespondedOnly");
                fatchDatas(true, "ShowNotRespondedOnly");
              }}
            />
            <SummaryCard
              title="Finish"
              count={dataStPo?.Finish ?? 0}
              color={colors.bg_success}
              icon="checkmark-done-outline"
              color_scheme={colors}
              scales={scales}
              onPress={() => {
                setStatusFilter("ShowRespondedOnly");
                fatchDatas(true, "ShowRespondedOnly");
              }}
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

              {
                (statusFilter !== DEFAULT_STATUS_FILTER || startDate || endDate) && <View
                  className="absolute bg-red-500 rounded-full items-center justify-center"
                  style={{
                    top: rpm(0),
                    right: rpm(0),
                    width: rw(8),
                    height: rh(8)
                  }}
                />
              }
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center"
              onPress={() => {
                setSortFilter(sortingFilterSort());
                setOpenModaSortlFilter(true);
              }}
              style={{
                borderRadius: rpm(10),
                paddingHorizontal: rpm(10),
                paddingVertical: rpm(6),
                backgroundColor: colors.surface
              }}
            >
              <Ionicons name="swap-vertical-outline" size={rf(14)} color={colors.text} />
              <CText className="font-regular" style={{ fontSize: rf(13), marginLeft: rpm(6) }}>Sort</CText>

              {
                (sortFilter.length > 1) && <View
                  className="absolute bg-red-500 rounded-full items-center justify-center"
                  style={{
                    top: rpm(0),
                    right: rpm(0),
                    width: rw(8),
                    height: rh(8)
                  }}
                />
              }
            </TouchableOpacity>
          </View>

          <Input
            value={inputSearchFilter}
            onChangeText={(val) => setInputSearchFilter(val)}
            placeholder="Document number or request name..."
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
              loadingData ? <View className='flex-row justify-center items-center'
                style={{ marginBottom: rpm(18), marginTop: rpm(8) }}
              >
                <ActivityIndicator size="small" />
                <CText className='font-medium' style={{ fontSize: rf(13), marginStart: rpm(6) }}>Loading...</CText>
              </View> : null
            }
            ListEmptyComponent={
              <View>
                {
                  !loadingData && <View className="items-center justify-center shadow-md"
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
            renderItem={
              ({ item, index }: { item: PoProps; index: number }) => <ItemRowFlatList
                item={item}
                index={index}
                router={router}
                expandedId={expandedId}
                swipeableRefs={swipeableRefs}
                colors={colors}
                scales={scales}
                closeAllSwipe={closeAllSwipe}
                toggleExpand={toggleExpand}
                handlePoAction={handlePoAction}
              />
            }
          />
        </GestureHandlerRootView>
      </View>
    </ScreenWrapper>
  )
};

export default PurchaseOrder;

type ItemRowProps = {
  item: PoProps;
  index: number;
  router: Router;
  expandedId: number | null;
  swipeableRefs: React.RefObject<Map<string, Swipeable>>;
  colors: ColorScheme;
  scales: ResponsiveScale;
  closeAllSwipe: () => void;
  toggleExpand: (id: number) => void;
  handlePoAction: ({ action, doc_id, level, remark, doc_num }: { doc_num: string; } & PrPoActionProps) => Promise<void>;
};

const ItemRowFlatList = React.memo(({
  item,
  index,
  router,
  expandedId,
  swipeableRefs,
  colors,
  scales,
  closeAllSwipe,
  toggleExpand,
  handlePoAction
}: ItemRowProps) => {
  const { rw, rh, rpm, rf } = scales;
  const isExpanded = expandedId === item.Id;
  const getCurAprLevel = item.Approvers.find(x => x.Level === item.AssignLevel);
  const checkAprLevel = CheckPoUserLevel(item, getCurAprLevel);

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
        saveRecentItem({
          id: item.Id,
          doc_num: item.PoNo,
          name: item.User1Name,
          date: item.SubmitDtm,
          source: 'PO',
          module_url: "/pages/purchase_order/detail",
        });

        router.push({
          pathname: "/pages/purchase_order/detail",
          params: {
            id: item.Id.toString(),
            doc_num: item.PoNo,
          } as PrPoDetailPageProps
        });
      }}
    >
      <View className="flex-row justify-between items-center" style={{ marginBottom: rpm(6) }}>
        <CText className="font-semibold" style={{ fontSize: rf(13) }}>
          {index + 1}. {item.PoNo}
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
          item.SubmitDtm !== null ? <CText style={{ color: colors.textMuted, fontSize: rf(12) }}>
            Submit At: {formatDate(item.SubmitDtm, 'medium', 'short')}
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
            {
              item.Approvers.map((a, i) => {
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
              })
            }
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

              if (getCurAprLevel) handlePoAction({
                action: 'APPROVED',
                level: getCurAprLevel.Level,
                doc_id: item.Id,
                remark: "",
                doc_num: item.PrNo
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

              if (getCurAprLevel) handlePoAction({
                action: 'REJECTED',
                level: getCurAprLevel.Level,
                doc_id: item.Id,
                remark: "",
                doc_num: item.PrNo
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
});

export function MappingPo(raw: any, bp_id?: number, items?: any): PoProps {
  const apprLevel = MapApproversPo({ raw, start_idx: 2 });
  const asgLevel = apprLevel.find(x => x.UserId == bp_id);
  const status = [raw.User2Response.trim(), raw.User3Response.trim()];

  return {
    Id: raw.Id,
    PoNo: raw.PoNo,
    PrNo: raw.PrNo,
    SubmitDtm: raw.SubmitDtm ? new Date(raw.SubmitDtm) : null,
    User1Name: raw.User1Name,
    Status: status.includes("REJECTED") ? "REJECTED" : status.every(res => res === "APPROVED") ? "APPROVED" : "",
    Remark: raw.Remark,

    Approvers: apprLevel,
    AssignLevel: asgLevel ? asgLevel.Level : undefined,
    ItemDetails: items
  };
};

export function MapApproversPo({ raw, start_idx = 1 }: { raw: any; start_idx: number; }): ApproverLevel[] {
  const result: ApproverLevel[] = [];

  let i = start_idx;
  while (raw[`User${i}Name`] !== undefined) {
    result.push({
      Level: i,
      UserId: raw[`User${i}`],
      UserApproved: raw[`User${i}Approved`],
      UserName: raw[`User${i}Name`].trim() === "" ? "UNKNOWN" : raw[`User${i}Name`].trim(),
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

export function CheckPoUserLevel(data: PoProps, curLevel?: ApproverLevel): CheckAprLevelProps {
  if (curLevel !== undefined) {
    const allApproval = data.Approvers;

    const curLevelVal = curLevel.Level;
    const curResponse = curLevel.UserResponse;

    const initLvl_1 = 2;
    const initLvl_2 = 3;

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
    } else return { show: false, msg: "However, you are currently not assigned to this application, Thank you!" };
  } else return { show: false, msg: "However, you are currently not assigned to this application, Thank you!" };
};

export async function PoAction({ action, doc_id, level, remark }: PrPoActionProps) {
  const createReq = await callApi<any>({
    endpoint: "ApproveRejectPo",
    params: {
      action,
      po_id: doc_id,
      level: level - 1,
      remark
    }
  });

  return createReq;
};