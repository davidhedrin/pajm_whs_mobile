import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AnimatableNumericValue } from "react-native";

export interface ColorScheme {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  gradients: {
    background: [string, string];
    surface: [string, string];
    primary: [string, string];
    success: [string, string];
    warning: [string, string];
    danger: [string, string];
    muted: [string, string];
    empty: [string, string];
  };
  backgrounds: {
    input: string;
    placeholder: string;
    editInput: string;
  };
  statusBarStyle: "light-content" | "dark-content";

  // Customization
  opacity: AnimatableNumericValue;
  bg_primary: string;
  bg_success: string;
  bg_warning: string;
  bg_danger: string;
  bg_shadow: string;
}

const lightColors: ColorScheme = {
  bg: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#8b9cb3",
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  shadow: "#000000",
  gradients: {
    background: ["#EBEBEB", "#3b82f644"],
    surface: ["#ffffff", "#f8fafc"],
    primary: ["#3b82f6", "#1d4ed8"],
    success: ["#22c55e33", "#22c55e0D"],
    warning: ["#f59e0b", "#d97706"],
    danger: ["#ef4444", "#dc2626"],
    muted: ["#9ca3af", "#6b7280"],
    empty: ["#f3f4f6", "#e5e7eb"],
  },
  backgrounds: {
    input: "#ffffff",
    placeholder: "#9ca3af",
    editInput: "#ebebeb",
  },
  statusBarStyle: "dark-content" as const,

  bg_primary: "#3b82f633",
  bg_success: "#22c55e33",
  bg_warning: "#f59e0b33",
  bg_danger: "#ef444433",
  bg_shadow: "#00000014",
  opacity: 0.1,
};

const darkColors: ColorScheme = {
  bg: "#394059",
  surface: "#394059",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  border: "#3a495e",
  primary: "#60a5fa",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  shadow: "#000000",
  gradients: {
    background: ["#262A38", "#0a0f17"],
    surface: ["#394059", "#3a495e"],
    primary: ["#3b82f6", "#1d4ed8"],
    success: ["#16a34a66", "#16a34a1A"],
    warning: ["#f59e0b", "#d97706"],
    danger: ["#ef4444", "#dc2626"],
    muted: ["#374151", "#4b5563"],
    empty: ["#374151", "#4b5563"],
  },
  backgrounds: {
    input: "#131821",
    placeholder: "#9ca3af",
    editInput: "#292f45",
  },
  statusBarStyle: "light-content" as const,

  bg_primary: "#3b82f655",
  bg_success: "#22c55e55",
  bg_warning: "#f59e0b55",
  bg_danger: "#ef444455",
  bg_shadow: "#00000066",
  opacity: 0.2,
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: (value: boolean) => void;
  colors: ColorScheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // get the user's choice
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value) setIsDarkMode(JSON.parse(value));
    });
  }, []);

  const toggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem("darkMode", JSON.stringify(value));
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("Use Theme must be used within a Theme Provider");
  }

  return context;
}

export default useTheme