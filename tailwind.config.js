/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        regular: ["PoppinsRegular"],
        medium: ["PoppinsMedium"],
        semibold: ["PoppinsSemiBold"],
        bolds: ["PoppinsBold"],

        "regular-i": ["PoppinsItalic"],
        "medium-i": ["PoppinsMediumItalic"],
        "semibold-i": ["PoppinsSemiBoldItalic"],
        "bolds-i": ["PoppinsBoldItalic"],
      }
    },
  },
  plugins: [],
}