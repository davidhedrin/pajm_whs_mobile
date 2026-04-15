import useTheme from "@/hooks/use-theme";
import { useResposiveScale } from "@/lib/resposive";
import React, { useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { CText } from "./text";

export type DropdownItem = {
  label: string;
  value: string;
};

type Props = {
  data: DropdownItem[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;

  itemRender?: (item: DropdownItem) => React.ReactNode;
};

export default function CustomDropdown({
  data,
  value,
  onChange,
  placeholder = "Choose Option",
  style,

  itemRender
}: Props) {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const [isFocus, setIsFocus] = useState(false);

  return (
    <Dropdown
      data={data}
      labelField="label"
      valueField="value"
      value={value}
      placeholder={placeholder}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item: DropdownItem) => {
        if (onChange) onChange(item.value);
        setIsFocus(false);
      }}
      style={[
        {
          paddingVertical: rpm(10),
          paddingHorizontal: rpm(10),
          borderWidth: isFocus ? rpm(2) : rpm(1),
          borderColor: "#D1D5DBCC",
          borderRadius: rpm(10),
          backgroundColor: colors.surface,
        },
        style
      ]}
      placeholderStyle={{
        fontFamily: 'PoppinsMedium',
        fontSize: rf(13),
        color: colors.backgrounds.placeholder,
      }}
      selectedTextStyle={{
        fontFamily: 'PoppinsMedium',
        fontSize: rf(13),
        color: colors.text,
      }}
      activeColor={colors.backgrounds.editInput}
      containerStyle={{
        borderRadius: rpm(10),
        overflow: 'hidden',
        backgroundColor: colors.surface
      }}
      renderItem={(item) => (
        <View
          style={{
            paddingHorizontal: rpm(10),
            paddingVertical: rpm(9),
          }}
        >
          {
            itemRender ? itemRender(item) : <CText className="font-medium" style={{ fontSize: rf(13) }}>{item.label}</CText>
          }
        </View>
      )}
    />
  );
}