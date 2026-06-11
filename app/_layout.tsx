import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { openDatabaseSync } from 'expo-sqlite';
import { LayoutDashboard, CalendarDays, CheckSquare, Wallet, BarChart3, Settings } from 'lucide-react-native';

export const db = openDatabaseSync('ridelog.db');

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const theme =
    colorScheme === 'dark'
      ? {
          ...MD3DarkTheme,
          colors: {
            ...MD3DarkTheme.colors,
            primary: '#34C759',
            background: '#121212',
            surface: '#1E1E1E',
          },
        }
      : {
          ...MD3LightTheme,
          colors: {
            ...MD3LightTheme.colors,
            primary: '#007AFF',
            background: '#F2F2F7',
            surface: '#FFFFFF',
          },
        };

  useEffect(() => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        note TEXT,
        cost REAL,
        location TEXT,
        pass_id INTEGER
      );
      CREATE TABLE IF NOT EXISTS bucket_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL,
        created_at TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS passes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        day_price_youth REAL NOT NULL,
        day_price_adult REAL NOT NULL,
        user_group TEXT NOT NULL
      );
    `);
  }, []);

  return (
    <PaperProvider theme={theme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            elevation: 10,
            height: 65,
            paddingBottom: 10,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: 'Logbuch',
            tabBarIcon: ({ color }) => <CalendarDays color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="bucket"
          options={{
            title: 'Ziele',
            tabBarIcon: ({ color }) => <CheckSquare color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="passes"
          options={{
            title: 'Pass-Rechner',
            tabBarIcon: ({ color }) => <Wallet color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Setup',
            tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="entryModal"
          options={{
            href: null,
            presentation: 'modal',
            title: 'Neuer Eintrag',
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}