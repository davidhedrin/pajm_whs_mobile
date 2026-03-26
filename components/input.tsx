import useTheme from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

type InputProps = TextInputProps & {
  className?: string;

  // group (kotak)
  prefixGroup?: React.ReactNode;
  suffixGroup?: React.ReactNode;

  // icon (simple)
  prefixIcon?: keyof typeof Ionicons.glyphMap;
  suffixIcon?: keyof typeof Ionicons.glyphMap;

  onPressPrefixIcon?: () => void;
  onPressSuffixIcon?: () => void;
};

const Input: React.FC<InputProps> = ({
  className,
  prefixGroup,
  suffixGroup,
  prefixIcon,
  suffixIcon,
  onPressPrefixIcon,
  onPressSuffixIcon,
  ...props
}) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View className={`w-full flex-row items-stretch ${className ?? ''}`}>

      {/* PREFIX GROUP */}
      {prefixGroup && (
        <View className="justify-center px-3 rounded-l-xl border border-gray-300/80 focus:border-2 border-e-0" style={{ backgroundColor: colors.surface }}>
          {typeof prefixGroup === 'string' ? (
            <Text className="text-gray-700">{prefixGroup}</Text>
          ) : (
            prefixGroup
          )}
        </View>
      )}

      {/* MAIN INPUT CONTAINER */}
      <View
        className={`flex-1 flex-row items-center ps-2 pe-3 border border-gray-300/80 focus:border-2 ${!prefixGroup ? 'rounded-l-xl' : ''} ${!suffixGroup ? 'rounded-r-xl' : ''}`}
        style={{ backgroundColor: colors.surface }}
      >
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

        {/* INPUT */}
        <TextInput
          {...props}
          className={`flex-1 text-lg pt-4 pb-3`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.backgrounds.placeholder}
          style={{ fontFamily: 'PoppinsMedium', color: colors.text }}
        />

        {/* SUFFIX ICON */}
        {suffixIcon && (
          <TouchableOpacity
            onPress={onPressSuffixIcon}
            disabled={!onPressSuffixIcon}
            className="ml-2"
          >
            <Ionicons name={suffixIcon} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* SUFFIX GROUP */}
      {suffixGroup && (
        <View className="justify-center px-3 rounded-r-xl border border-gray-300/80 focus:border-2 border-s-0" style={{ backgroundColor: colors.surface }}>
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

export default Input;