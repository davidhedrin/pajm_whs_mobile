import Input from '@/components/input';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import useTheme from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from "react";
import {
  FlatList, LayoutAnimation, TouchableOpacity,
  View
} from "react-native";

type ApprovalStatus = "WAITING" | "APPROVED" | "REJECTED";

type Approval = {
  step: string;
  name: string;
  status: ApprovalStatus;
  date: string;
};

type PO = {
  id: string;
  number: string;
  vendor: string;
  date: string;
  status: ApprovalStatus;
  app_at: string;
  appr_data: Approval[];
};

const DATA: PO[] = [
  {
    id: "1",
    number: "PR/PAJM/1033/2/2026",
    vendor: "Diana Vega Yuliningtyas",
    date: "10:38 AM - 22 Feb 2026",
    status: "WAITING",
    app_at: "1",
    appr_data: [
      {
        step: "Approval 1",
        name: "John Doe",
        status: "APPROVED",
        date: "12 Mar 2026, 10:20 AM",
      },
      {
        step: "Approval 2",
        name: "Jane Smith",
        status: "WAITING",
        date: "-",
      },
      {
        step: "Approval 3",
        name: "Michael Lee",
        status: "REJECTED",
        date: "-",
      },
    ]
  },
  {
    id: "2",
    number: "PR/PAJM/1078/3/2026",
    vendor: "Iqbal Caesario Haryadi",
    date: "13:33 PM - 16 Jan 2025",
    status: "APPROVED",
    app_at: "3",
    appr_data: [
      {
        step: "Approval 1",
        name: "John Doe",
        status: "APPROVED",
        date: "12 Mar 2026, 10:20 AM",
      },
      {
        step: "Approval 2",
        name: "Jane Smith",
        status: "WAITING",
        date: "-",
      },
      {
        step: "Approval 3",
        name: "Michael Lee",
        status: "REJECTED",
        date: "-",
      },
    ]
  },
  {
    id: "3",
    number: "PR/PAJM/1080/3/2026",
    vendor: "Sofia Wijayanti",
    date: "09:26 AM - 08 Mar 2024",
    status: "REJECTED",
    app_at: "2",
    appr_data: [
      {
        step: "Approval 1",
        name: "John Doe",
        status: "APPROVED",
        date: "12 Mar 2026, 10:20 AM",
      },
      {
        step: "Approval 2",
        name: "Jane Smith",
        status: "WAITING",
        date: "-",
      },
      {
        step: "Approval 3",
        name: "Michael Lee",
        status: "REJECTED",
        date: "-",
      },
    ]
  },
];

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

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };
  const renderItem = ({ item }: { item: PO }) => {
    const isExpanded = expandedId === item.id;
    return <TouchableOpacity className="rounded-xl px-4 py-3 mb-4 shadow-sm" style={{ backgroundColor: colors.surface }}>
      <View className="flex-row justify-between items-center mb-2">
        <CText className="font-semibold text-gray-900 text-lg">
          {item.number}
        </CText>

        <View className="flex-row items-center">
          <CText
            className="px-2 py-1 rounded-full text-sm font-regular mr-2"
            style={getStatusStyle(item.status)}
          >
            {item.status}
          </CText>

          {/* 🔽 ICON TOGGLE */}
          <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 MAIN CONTENT */}
      <View className="flex-row justify-between items-end">
        <View>
          <CText className="font-regular text-lg">
            Req By: {item.vendor}
          </CText>
          <CText style={{ color: colors.textMuted }}>{item.date}</CText>
        </View>

        <View>
          <CText className="font-medium" style={{ color: colors.textMuted }}>
            Approval At - {item.app_at}
          </CText>
        </View>
      </View>

      {isExpanded && (
        <View className="mt-4 pt-3 border-t border-gray-200">
          {/* APPROVAL LIST */}
          {item.appr_data.map((a, index) => {
            const style = getStatusStyle(a.status);

            return (
              <View key={index} className="flex-row items-start mb-4">
                <View
                  className="w-2 h-2 mt-2 rounded-full mr-3"
                  style={{ backgroundColor: style.color }}
                />

                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <View>
                      <CText className="font-medium">
                        {a.step}
                      </CText>

                      <CText className="text-sm font-regular">
                        {a.name}
                      </CText>
                    </View>

                    <View className="items-end">
                      <CText
                        className="px-2 py-0.5 rounded-full text-sm"
                        style={style}
                      >
                        {a.status}
                      </CText>

                      <CText className="text-sm font-regular mt-1">
                        {a.date}
                      </CText>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  };

  return (
    <ScreenWrapper scrollable={false} edges={['bottom']}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        className='pt-5 px-4'

        ListHeaderComponent={
          <View className="mb-2">
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
              className='mb-3'
            />
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default PurchaseRequest;