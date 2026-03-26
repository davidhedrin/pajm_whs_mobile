import useTheme from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CText } from './text';

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;

  // ✅ tambahan
  prefixGroup?: React.ReactNode;
  suffixGroup?: React.ReactNode;
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
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const selected = options.find((opt) => opt.value === value);

  return (
    <View className={`w-full flex-row items-stretch ${className ?? ''}`}>

      {/* PREFIX GROUP */}
      {prefixGroup && (
        <View className="justify-center px-3 rounded-l-xl border border-gray-300/80 border-e-0" style={{ backgroundColor: colors.surface }}>
          {typeof prefixGroup === 'string' ? (
            <Text className="text-gray-700">{prefixGroup}</Text>
          ) : (
            prefixGroup
          )}
        </View>
      )}

      {/* MAIN SELECT */}
      <View className="flex-1">

        {/* Select Box */}
        <Pressable
          onPress={() => setVisible(true)}
          className={`flex-row items-center justify-between px-3 py-3.5 border-gray-300/80 ${visible ? 'border-2' : 'border'} ${!prefixGroup ? 'rounded-l-xl' : ''} ${!suffixGroup ? 'rounded-r-xl' : ''}`}
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row items-center flex-1">

            {/* PREFIX ICON */}
            {prefixIcon && (
              <TouchableOpacity
                onPress={onPressPrefixIcon}
                disabled={!onPressPrefixIcon}
                className="mr-2"
              >
                <Ionicons name={prefixIcon} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            <Text
              className="text-lg"
              style={{
                fontFamily: 'PoppinsMedium',
                color: selected ? colors.text : colors.backgrounds.placeholder
              }}
            >
              {selected ? selected.label : placeholder}
            </Text>
          </View>

          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </Pressable>

        {/* Modal */}
        <Modal transparent visible={visible} animationType="fade">
          <Pressable
            className="flex-1 bg-black/20 justify-center px-5"
            onPress={() => setVisible(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.surface }}>

                {/* Header */}
                <View className="px-4 py-3 border-b border-gray-200">
                  <CText
                    className="text-lg text-gray-700"
                    style={{ fontFamily: 'PoppinsMedium' }}
                  >
                    {placeholder}
                  </CText>
                </View>

                {/* List */}
                <View className="py-2 max-h-[250px]">
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => {
                      const isSelected = item.value === value;
                      const isDisabled = item.disabled;

                      return (
                        <TouchableOpacity
                          disabled={isDisabled}
                          className={`mx-2 px-3 py-3.5 rounded-xl ${isDisabled ? 'opacity-50' : ''}`}
                          style={isSelected && {
                            backgroundColor: colors.bg_primary
                          }}
                          onPress={() => {
                            if (isDisabled) return;

                            onChange?.(item.value);
                            setVisible(false);
                          }}
                        >
                          <Text
                            className="text-lg"
                            style={{ 
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
        <View className="justify-center px-3 rounded-r-xl border border-gray-300/80" style={{ backgroundColor: colors.surface }}>
          {typeof suffixGroup === 'string' ? (
            <Text className="text-gray-700">{suffixGroup}</Text>
          ) : (
            suffixGroup
          )}
        </View>
      )}

    </View>
  );
};

export default Select;