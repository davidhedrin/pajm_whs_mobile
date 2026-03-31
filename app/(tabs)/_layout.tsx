import useTheme from '@/hooks/use-theme';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabsLayout = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
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
        paddingTop: rpm(3),

        height: rh(50) + insets.bottom,
      },

      tabBarLabelStyle: {
        fontSize: rf(11),
        paddingTop: rpm(2),
        fontWeight: '600',
        fontFamily: "PoppinsMedium"
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarBadge: 2,
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? colors.primary + "25" : "transparent",
                borderRadius: "100%",
                height: rh(30),
                width: rw(30),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={rf(20)}
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
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? colors.primary + "25" : "transparent",
                borderRadius: "100%",
                height: rh(30),
                width: rw(30),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={rf(20)}
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