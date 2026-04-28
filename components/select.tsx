import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ColorValue,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BaseModal from './modal';
import { CText } from './text';

export type OptionProps = {
  label: string;
  value: string;
  disabled?: boolean;
};

type GroupProps = {
  content?: React.ReactNode;
  bgColor?: ColorValue | undefined;
  action?: () => void;
};

type EmptyInfoProps = {
  title?: string;
  message?: string;
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

  emptyInfo?: EmptyInfoProps;
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
  emptyInfo,
}) => {
  const { rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const selected = options.find((opt) => opt.value === value);

  return (
    <View className={`w-full flex-row items-stretch ${className ?? ''}`}>

      {/* PREFIX GROUP */}
      {prefixGroup && (
        <TouchableOpacity
          className="justify-center border border-gray-300/80 border-e-0"
          activeOpacity={prefixGroup.action !== undefined ? 0.2 : 1}
          onPress={() => { if (prefixGroup.action) prefixGroup.action() }}
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
        </TouchableOpacity>
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
        <BaseModal
          visible={visible}
          onClose={setVisible}
        >
          <View className="border-gray-200"
            style={{
              borderBottomWidth: rpm(1),
              paddingBottom: rpm(6),
              marginBottom: rpm(4)
            }}
          >
            <CText
              className="text-gray-700"
              style={{ fontFamily: 'PoppinsMedium', fontSize: rf(13) }}
            >
              {placeholder}
            </CText>
          </View>

          <View style={{ paddingTop: rpm(6), maxHeight: rh(240) }}>
            {
              options.length > 0 ? options.map((item, i) => {
                const isSelected = item.value === value;
                const isDisabled = item.disabled;

                return (
                  <TouchableOpacity
                    key={i}
                    disabled={isDisabled}
                    className={`${isDisabled ? 'opacity-50' : ''}`}
                    style={{
                      paddingHorizontal: isSelected ? rpm(10) : undefined,
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
              }) : <View className="items-center justify-center"
                style={{
                  paddingVertical: rpm(10),
                }}
              >
                <Ionicons name="folder-open-outline" size={rf(38)} color="#9CA3AF" style={{ marginBottom: rpm(10) }} />

                <CText className="font-semibold text-center" style={{ fontSize: rf(13) }}>
                  {
                    emptyInfo?.title ?? "No data found."
                  }
                </CText>

                <CText className="font-regular text-center" style={{ color: colors.textMuted, fontSize: rf(13) }}>
                  {
                    emptyInfo?.message ?? "There no options data to display."
                  }
                </CText>
              </View>
            }
          </View>
        </BaseModal>
      </View>

      {/* SUFFIX GROUP */}
      {suffixGroup && (
        <TouchableOpacity
          className="justify-center border border-gray-300/80"
          activeOpacity={suffixGroup.action !== undefined ? 0.2 : 1}
          onPress={() => { if (suffixGroup.action) suffixGroup.action() }}
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
        </TouchableOpacity>
      )}

    </View>
  );
};

export default Select;