import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ColorValue, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { CText } from './text';

type Props = TouchableOpacityProps & {
  title: string;
  titleColor?: ColorValue | undefined;
  className?: string;
  isLoading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;

  prefixIcon?: keyof typeof Ionicons.glyphMap;
  suffixIcon?: keyof typeof Ionicons.glyphMap;
};

const Button = ({
  title,
  titleColor = "#fff",
  className,
  isLoading = false,
  loadingTitle = "Loading...",
  disabled,

  prefixIcon,
  suffixIcon,

  ...props
}: Props) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`${className ?? ''} px-4 py-3.5 rounded-xl w-full ${isDisabled ? 'bg-blue-300' : 'bg-blue-500' }`}
      disabled={isDisabled}
      {...props}
    >
      <View className="flex-row items-center justify-center gap-2">

        {isLoading && (
          <ActivityIndicator size="small" color="#fff" />
        )}

        {prefixIcon && <Ionicons name={prefixIcon} size={20} color={titleColor} />}
        <CText
          className="font-regular text-center text-lg"
          style={{ color: titleColor }}
        >
          {isLoading ? loadingTitle : title}
        </CText>
        {suffixIcon && <Ionicons name={suffixIcon} size={20} color="#fff" />}

      </View>
    </TouchableOpacity>
  );
};

export default Button;