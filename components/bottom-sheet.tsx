import useTheme from "@/hooks/use-theme";
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
import { StyleSheet, View } from "react-native";
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
        <View className="px-4 pb-1">
          {
            title !== undefined && <View>
              <CText className="text-xl text-center">{title}</CText>
              <View className="border-b border-gray-300 mt-2 mb-4" />
            </View>
          }
        </View>
        <BottomSheetScrollView
          style={styles.content}
        // showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

export default AppBottomSheet;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
});