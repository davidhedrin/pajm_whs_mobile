import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ColorValue, StyleProp, TouchableOpacity, TouchableOpacityProps, View, ViewStyle } from 'react-native';
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

  style?: StyleProp<ViewStyle>
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
  style,

  ...props
}: Props) => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const isDisabled = disabled || isLoading;


  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`${className ?? ''} ${isDisabled ? 'bg-blue-300' : 'bg-blue-500'}`}
      disabled={isDisabled}
      style={[
        {
          paddingHorizontal: rpm(8),
          paddingVertical: rpm(10),
          borderRadius: rpm(10)
        },
        style
      ]}
      {...props}
    >
      <View className="flex-row items-center justify-center gap-1">

        {isLoading && (
          <ActivityIndicator size="small" color="#fff" />
        )}

        {prefixIcon && <Ionicons name={prefixIcon} size={rf(17)} color={titleColor} />}
        <CText
          className={`font-regular text-center ${(suffixIcon || prefixIcon) ? "top-0.5" : "top-1"}`}
          style={{ color: titleColor, fontSize: rf(13) }}
        >
          {isLoading ? loadingTitle : title}
        </CText>
        {suffixIcon && <Ionicons name={suffixIcon} size={rf(17)} color="#fff" />}

      </View>
    </TouchableOpacity>
  );
};

export default Button;