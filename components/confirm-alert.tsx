import useTheme from "@/hooks/use-theme";
import { useConfirmStore } from "@/hooks/zustand";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";
import { CText } from "./text";

export const GlobalConfirmModal = () => {
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
          className="rounded-xl shadow-lg w-80 overflow-hidden"
          style={{ backgroundColor: colors.surface }}
        >

          <View className="px-4 pt-4 items-center">
            {params.icon && <Ionicons name={params.icon} size={40} color={colors.textMuted} className=" mb-3" />}
            <CText className="text-xl font-semibold text-gray-800 mb-1.5 text-center">
              {params.title}
            </CText>
            <CText className="text-lg font-regular text-gray-600 mb-3 text-center">
              {params.message}
            </CText>
          </View>

          {/* Tombol iOS style */}
          <View className="flex-row h-14 border-t border-gray-200">
            <TouchableOpacity
              className="flex-1 justify-center items-center"
              onPress={() => closeConfirm(false)}
            >
              <CText className="text-gray-700 text-lg font-medium">{params.cancelText ?? "Cancel"}</CText>
            </TouchableOpacity>

            {/* Garis vertikal */}
            <View className="w-[1px] bg-gray-200" />

            <TouchableOpacity
              className="flex-1 justify-center items-center"
              onPress={() => closeConfirm(true)}
            >
              <CText className="text-blue-500 text-lg font-medium">{params.confirmText ?? "Confirm"}</CText>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};