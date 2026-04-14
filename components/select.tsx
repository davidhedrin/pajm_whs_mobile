import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ColorValue,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CText } from './text';

export type OptionProps = {
  label: string;
  value: string;
  disabled?: boolean;
};

type GroupProps = {
  content?: React.ReactNode;
  bgColor?: ColorValue | undefined;
};

type SelectProps = {
  options: OptionProps[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;

  // ✅ tambahan
  prefixGroup?: GroupProps;
  suffixGroup?: GroupProps;
  prefixIcon?: keyof typeof Ionicons.glyphMap;
  onPressPrefixIcon?: () => void;
};

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select your option',
  className,
  prefixGroup,
  suffixGroup,
  prefixIcon,
  onPressPrefixIcon,
}) => {
  const { rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const selected = options.find((opt) => opt.value === value);

  return (
    <View className={`w-full flex-row items-stretch ${className ?? ''}`}>

      {/* PREFIX GROUP */}
      {prefixGroup && (
        <View className="justify-center border border-gray-300/80 border-e-0"
          style={{
            paddingHorizontal: rpm(10),
            borderTopLeftRadius: rpm(10),
            borderBottomLeftRadius: rpm(10),
            backgroundColor: prefixGroup.bgColor ?? colors.surface
          }}
        >
          {typeof prefixGroup.content === 'string' ? (
            <Text className="text-gray-700" style={{ fontSize: rf(13) }}>{prefixGroup.content}</Text>
          ) : (
            prefixGroup.content
          )}
        </View>
      )}

      {/* MAIN SELECT */}
      <View className="flex-1">

        {/* Select Box */}
        <Pressable
          onPress={() => setVisible(true)}
          className="flex-row items-center justify-between border-gray-300/80"
          style={{
            paddingHorizontal: rpm(10),
            paddingVertical: rpm(10),
            borderWidth: visible ? rpm(2) : rpm(1),

            borderTopLeftRadius: !prefixGroup ? 10 : undefined,
            borderBottomLeftRadius: !prefixGroup ? 10 : undefined,
            borderTopRightRadius: !suffixGroup ? 10 : undefined,
            borderBottomRightRadius: !suffixGroup ? 10 : undefined,

            backgroundColor: colors.surface
          }}
        >
          <View className="flex-row items-center flex-1">

            {/* PREFIX ICON */}
            {prefixIcon && (
              <TouchableOpacity
                onPress={onPressPrefixIcon}
                disabled={!onPressPrefixIcon}
                style={{
                  marginRight: rpm(6)
                }}
              >
                <Ionicons name={prefixIcon} size={rf(17)} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            <Text
              style={{
                fontSize: rf(13),
                fontFamily: 'PoppinsMedium',
                color: selected ? colors.text : colors.backgrounds.placeholder
              }}
            >
              {selected ? selected.label : placeholder}
            </Text>
          </View>

          <Ionicons name="chevron-down" size={rf(17)} color={colors.textMuted} />
        </Pressable>

        {/* Modal */}
        <Modal transparent visible={visible} animationType="fade">
          <Pressable
            className="flex-1 bg-black/20 justify-center"
            onPress={() => setVisible(false)}
            style={{
              paddingHorizontal: rpm(17)
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="overflow-hidden"
                style={{
                  borderRadius: rpm(10),
                  backgroundColor: colors.surface
                }}
              >

                {/* Header */}
                <View className="border-gray-200"
                  style={{
                    borderBottomWidth: rpm(1),
                    paddingHorizontal: rpm(13),
                    paddingVertical: rpm(10)
                  }}
                >
                  <CText
                    className="text-gray-700"
                    style={{ fontFamily: 'PoppinsMedium', fontSize: rf(13) }}
                  >
                    {placeholder}
                  </CText>
                </View>

                {/* List */}
                <View style={{ paddingVertical: rpm(6), maxHeight: rh(240) }}>
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => {
                      const isSelected = item.value === value;
                      const isDisabled = item.disabled;

                      return (
                        <TouchableOpacity
                          disabled={isDisabled}
                          className={`${isDisabled ? 'opacity-50' : ''}`}
                          style={{
                            marginHorizontal: rpm(6),
                            paddingHorizontal: rpm(10),
                            paddingVertical: rpm(10),
                            borderRadius: rpm(10),
                            backgroundColor: isSelected ? colors.bg_primary : undefined
                          }}
                          onPress={() => {
                            if (isDisabled) return;

                            onChange?.(item.value);
                            setVisible(false);
                          }}
                        >
                          <Text
                            style={{
                              fontSize: rf(13),
                              fontFamily: 'PoppinsMedium',
                              color: isDisabled ? colors.textMuted : isSelected ? colors.primary : colors.text
                            }}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>

              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>

      {/* SUFFIX GROUP */}
      {suffixGroup && (
        <View className="justify-center border border-gray-300/80"
          style={{
            paddingHorizontal: rpm(10),
            borderTopRightRadius: rpm(10),
            borderBottomRightRadius: rpm(10),
            backgroundColor: suffixGroup.bgColor ?? colors.surface
          }}
        >
          {typeof suffixGroup.content === 'string' ? (
            <Text className="text-gray-700" style={{ fontSize: rf(13) }}>{suffixGroup.content}</Text>
          ) : (
            suffixGroup.content
          )}
        </View>
      )}

    </View>
  );
};

export default Select;