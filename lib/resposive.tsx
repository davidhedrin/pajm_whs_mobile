import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

/**
 * Base design size
 * biasanya design figma dibuat di 375x812
 */
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Responsive Width
 */
export const rw = (size: number) => {
  return (width / guidelineBaseWidth) * size;
};

/**
 * Responsive Height
 */
export const rh = (size: number) => {
  return (height / guidelineBaseHeight) * size;
};

/**
 * Responsive Font
 */
export const rf = (size: number) => {
  const scale = width / guidelineBaseWidth;
  return size * scale;
};