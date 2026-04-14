import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ColorValue,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type GroupProps = {
  content?: React.ReactNode;
  bgColor?: ColorValue | undefined;
};

type InputProps = TextInputProps & {
  className?: string;

  // group (kotak)
  prefixGroup?: GroupProps;
  suffixGroup?: GroupProps;

  // icon (simple)
  prefixIcon?: keyof typeof Ionicons.glyphMap;
  suffixIcon?: keyof typeof Ionicons.glyphMap;

  onPressPrefixIcon?: () => void;
  onPressSuffixIcon?: () => void;
  
  style?: StyleProp<ViewStyle>
};

const Input: React.FC<InputProps> = ({
  className,
  prefixGroup,
  suffixGroup,
  prefixIcon,
  suffixIcon,
  onPressPrefixIcon,
  onPressSuffixIcon,
  style,
  ...props
}) => {
  const { rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View className={`w-full flex-row items-stretch ${className ?? ''}`}>

      {/* PREFIX GROUP */}
      {prefixGroup && (
        <View className="justify-center border border-gray-300/80 focus:border-2 border-e-0"
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

      {/* MAIN INPUT CONTAINER */}
      <View
        className="flex-1 flex-row items-center border border-gray-300/80 focus:border-2"
        style={{
          paddingStart: rpm(6),
          paddingEnd: rpm(10),
          borderTopLeftRadius: !prefixGroup ? 10 : undefined,
          borderBottomLeftRadius: !prefixGroup ? 10 : undefined,
          borderTopRightRadius: !suffixGroup ? 10 : undefined,
          borderBottomRightRadius: !suffixGroup ? 10 : undefined,
          backgroundColor: colors.surface
        }}
      >
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

        {/* INPUT */}
        <TextInput
          {...props}
          className={`flex-1`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.backgrounds.placeholder}
          style={[
            {
              fontFamily: 'PoppinsMedium',
              color: colors.text,
              fontSize: rf(13),
              paddingTop: rpm(11),
              paddingBottom: rpm(9),
              // minHeight: rpm(42),
            },
            style
          ]}
        />

        {/* SUFFIX ICON */}
        {suffixIcon && (
          <TouchableOpacity
            onPress={onPressSuffixIcon}
            disabled={!onPressSuffixIcon}
            style={{
              marginLeft: rpm(6)
            }}
          >
            <Ionicons name={suffixIcon} size={rf(17)} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* SUFFIX GROUP */}
      {suffixGroup && (
        <View className="justify-center border border-gray-300/80 focus:border-2 border-s-0"
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

export default Input;