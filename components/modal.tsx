import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import React from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Button from './button';
import { CText } from './text';

type BaseModalProps = {
  visible: boolean;
  onClose: (val: boolean) => void;
  children?: React.ReactNode;
  resolveTitle?: string;
  resolveAction?: () => void;
};

const BaseModal = ({
  resolveTitle,
  resolveAction,
  visible,
  onClose,
  children,
}: BaseModalProps) => {
  const { rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => onClose(false)}
    >
      <TouchableWithoutFeedback onPress={() => onClose(false)}>
        <View className="flex-1 justify-center items-center bg-black/40">
          <TouchableWithoutFeedback>
            <View
              className="w-[80%] rounded-xl shadow-lg overflow-hidden"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="w-full"
                style={{
                  padding: rpm(14),
                }}
              >
                {
                  children ?? <>
                    <CText>Ini isi modal bebas 🚀</CText>
                    <Button title="Close" onPress={() => onClose(false)} />
                  </>
                }
              </View>

              {
                resolveAction && <View className="flex-row border-t border-gray-200"
                  style={{
                    height: rh(40)
                  }}
                >
                  <TouchableOpacity
                    className="flex-1 justify-center items-center"
                    onPress={() => onClose(false)}
                  >
                    <CText className="text-gray-700 font-medium" style={{ fontSize: rf(13) }}>Cancel</CText>
                  </TouchableOpacity>

                  {/* Garis vertikal */}
                  <View className="w-[1px] bg-gray-200" />

                  <TouchableOpacity
                    className="flex-1 justify-center items-center"
                    onPress={resolveAction}
                  >
                    <CText className="text-blue-500 font-medium" style={{ fontSize: rf(13) }}>{resolveTitle ?? "Confirm"}</CText>
                  </TouchableOpacity>
                </View>
              }
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

export default BaseModal;