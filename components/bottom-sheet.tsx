import useTheme from "@/hooks/use-theme";
import { useResposiveScale } from "@/lib/resposive";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useRef
} from "react";
import { View } from "react-native";
import { CText } from "./text";

export type BottomSheetRef = {
  open: (snapIndex?: number) => void;
  close: () => void;
};

type Props = {
  children?: ReactNode;
  title?: string;
  snapPoints?: string[];
  enableGesture?: boolean;
};

const AppBottomSheet = forwardRef<BottomSheetRef, Props>(
  ({ children, title, snapPoints = ["25%", "50%", "75%"], enableGesture = true }, ref) => {
    const { rw, rh, rpm, rf } = useResposiveScale();
    const { colors } = useTheme();
    const sheetRef = useRef<BottomSheet>(null);

    // Backdrop component
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      []
    );

    // expose method open/close ke parent
    useImperativeHandle(ref, () => ({
      open: (snapIndex = 0) => {
        sheetRef.current?.snapToIndex(snapIndex);
      },
      close: () => {
        sheetRef.current?.close();
      },
    }));

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={enableGesture}
        backgroundStyle={{ backgroundColor: colors.surface }}
      >
        <View style={{ paddingHorizontal: rpm(14), paddingBottom: rpm(2) }}>
          {
            title !== undefined && <View>
              <CText className="text-center" style={{ fontSize: rf(14) }}>{title}</CText>
              <View className="border-b border-gray-300" style={{ marginTop: rpm(6), marginBottom: rpm(14) }} />
            </View>
          }
        </View>
        <BottomSheetScrollView
          style={{
            flex: 1,
            paddingHorizontal: rpm(13),
          }}
        // showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

export default AppBottomSheet;