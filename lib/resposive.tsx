import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export const useResposiveScale = () => {
  return {
    /**
     * Responsive Width
     */
    rw: (size: number) => scale(size),

    /**
     * Responsive Height
     */
    rh: (size: number) => verticalScale(size),

    /**
     * Responsive Padding, Margin and Border Radius
     */
    rpm: (size: number) => moderateScale(size),

    /**
     * Responsive Font
     */
    rf: (size: number) => RFValue(size),
    rfp: (size: number) => RFPercentage(size),
  };
};