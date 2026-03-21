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
  const [visible, setVisible] = useState(false);

  const selected = options.find((opt) => opt.value === value);

  return (
    <View className={`w-full flex-row items-stretch ${className ?? ''}`}>

      {/* PREFIX GROUP */}
      {prefixGroup && (
        <View className="justify-center px-3 bg-gray-200 rounded-l-lg border border-gray-300/80 border-e-0">
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
          className={`flex-row items-center justify-between px-3 py-3.5 border-gray-300/80 bg-[#f1f4ff] ${visible ? 'border-2' : 'border'} ${!prefixGroup ? 'rounded-l-lg' : ''} ${!suffixGroup ? 'rounded-r-lg' : ''}`}
        >
          <View className="flex-row items-center flex-1">

            {/* PREFIX ICON */}
            {prefixIcon && (
              <TouchableOpacity
                onPress={onPressPrefixIcon}
                disabled={!onPressPrefixIcon}
                className="mr-2"
              >
                <Ionicons name={prefixIcon} size={20} color="#6b7280" />
              </TouchableOpacity>
            )}

            <Text
              className={`text-lg ${selected ? 'text-black' : 'text-gray-400'
                }`}
              style={{ fontFamily: 'PoppinsMedium' }}
            >
              {selected ? selected.label : placeholder}
            </Text>
          </View>

          <Ionicons name="chevron-down" size={20} color="#555" />
        </Pressable>

        {/* Modal */}
        <Modal transparent visible={visible} animationType="fade">
          <Pressable
            className="flex-1 bg-black/20 justify-center px-5"
            onPress={() => setVisible(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-white rounded-xl overflow-hidden">

                {/* Header */}
                <View className="px-4 py-3 border-b border-gray-200">
                  <Text
                    className="text-lg text-gray-700"
                    style={{ fontFamily: 'PoppinsMedium' }}
                  >
                    {placeholder}
                  </Text>
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
                          className={`mx-2 px-3 py-3.5 rounded-lg ${isSelected ? 'bg-blue-50' : '' } ${isDisabled ? 'opacity-50' : ''}`}
                          onPress={() => {
                            if (isDisabled) return;

                            onChange?.(item.value);
                            setVisible(false);
                          }}
                        >
                          <Text
                            className={`text-lg ${isDisabled ? 'text-gray-400' : isSelected ? 'text-blue-600' : 'text-black'}`}
                            style={{ fontFamily: 'PoppinsMedium' }}
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
        <View className="justify-center px-3 bg-gray-200 rounded-r-lg border border-gray-300/80">
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