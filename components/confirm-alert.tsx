import useTheme from "@/hooks/use-theme";
import { useConfirmStore } from "@/hooks/zustand";
import { useResposiveScale } from "@/lib/resposive";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";
import { CText } from "./text";

export const GlobalConfirmModal = () => {
  const { rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const { visible, params, closeConfirm } = useConfirmStore();

  if (!params) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable
        onPress={() => closeConfirm(false)}
        className="flex-1 justify-center items-center bg-black/40"
      >
        <View
          className="rounded-xl shadow-lg overflow-hidden"
          style={{
            width: rpm(270),
            backgroundColor: colors.surface
          }}
        >

          <View className="items-center"
            style={{
              paddingHorizontal: rpm(14),
              paddingTop: rpm(14)
            }}
          >
            {params.icon && <Ionicons name={params.icon} size={rf(36)} color={colors.textMuted} style={{ marginBottom: rpm(9) }} />}
            <CText className="font-semibold text-gray-800 text-center"
              style={{
                fontSize: rf(14),
                marginBottom: rpm(4)
              }}
            >
              {params.title}
            </CText>
            <CText className="text-lg font-regular text-gray-600 mb-3 text-center"
              style={{
                fontSize: rf(13),
                marginBottom: rpm(10)
              }}
            >
              {params.message}
            </CText>
          </View>

          {/* Tombol iOS style */}
          <View className="flex-row border-t border-gray-200"
            style={{
              height: rh(40)
            }}
          >
            <TouchableOpacity
              className="flex-1 justify-center items-center"
              onPress={() => closeConfirm(false)}
            >
              <CText className="text-gray-700 font-medium" style={{ fontSize: rf(13) }}>{params.cancelText ?? "Cancel"}</CText>
            </TouchableOpacity>

            {/* Garis vertikal */}
            <View className="w-[1px] bg-gray-200" />

            <TouchableOpacity
              className="flex-1 justify-center items-center"
              onPress={() => closeConfirm(true)}
            >
              <CText className="text-blue-500 font-medium" style={{ fontSize: rf(13) }}>{params.confirmText ?? "Confirm"}</CText>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};