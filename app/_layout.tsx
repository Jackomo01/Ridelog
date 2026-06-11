import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Wallet,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { getColors } from '../lib/theme';
import '../lib/db';

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = getColors(scheme);

  const base = scheme === 'light' ? MD3LightTheme : MD3DarkTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background,
      surface: c.surface,
      surfaceVariant: c.surfaceAlt,
      onSurface: c.text,
      onSurfaceVariant: c.textMuted,
      outline: c.border,
      error: c.danger,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.textMuted,
          tabBarStyle: {
            backgroundColor: c.surface,
            borderTopWidth: 1,
            borderTopColor: c.border,
            elevation: 12,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerStyle: {
            backgroundColor: c.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: 'Logbuch',
            tabBarIcon: ({ color }) => <CalendarDays color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="bucket"
          options={{
            title: 'Ziele',
            tabBarIcon: ({ color }) => <CheckSquare color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="passes"
          options={{
            title: 'Pässe',
            tabBarIcon: ({ color }) => <Wallet color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color }) => <BarChart3 color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Setup',
            tabBarIcon: ({ color }) => <SettingsIcon color={color} size={22} />,
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}
