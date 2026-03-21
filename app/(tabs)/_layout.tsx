import useTheme from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabsLayout = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      // tabBarShowLabel: false,
      headerShown: false,

      tabBarStyle: {
        backgroundColor: colors.surface,
        paddingTop: 5,

        height: 60 + insets.bottom,
      },

      tabBarLabelStyle: {
        fontSize: 13,
        paddingTop: 3,
        fontWeight: '600',
        fontFamily: "PoppinsMedium"
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarBadge: 2,
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.primary + "25" : "transparent",
                borderRadius: "100%",
                height: 36,
                width: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={focused ? colors.primary : color}
              />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={{
                backgroundColor: focused ? colors.primary + "25" : "transparent",
                borderRadius: "100%",
                height: 36,
                width: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size}
                color={focused ? colors.primary : color}
              />
            </View>
          )
        }}
      />
    </Tabs>
  )
}

export default TabsLayout