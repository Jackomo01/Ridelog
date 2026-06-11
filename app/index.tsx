import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Surface, useTheme, FAB } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { openDatabaseSync } from 'expo-sqlite';
import { Zap, TrendingUp, Award, Calendar } from 'lucide-react-native';

const db = openDatabaseSync('ridelog.db');

type Activity = {
  id: number;
  date: string;
  category: string;
  title: string;
  note?: string;
  cost?: number;
  location?: string;
  pass_id?: number;
};

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState({
    monthCount: 0,
    yearCount: 0,
    totalSavings: 0,
    streak: 0,
  });
  const [recent, setRecent] = useState<Activity[]>([]);

  const loadDashboardData = useCallback(() => {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const monthStr = `${currentYear}-${currentMonth}`;

    const mRes = db.getFirstSync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM activities WHERE date LIKE ?`,
      [`${monthStr}%`]
    );
    const yRes = db.getFirstSync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM activities WHERE date LIKE ?`,
      [`${currentYear}%`]
    );

    const recentRows = db.getAllSync<Activity>(
      `SELECT * FROM activities ORDER BY date DESC LIMIT 3`
    );
    setRecent(recentRows);

    let savings = 0;
    const passes = db.getAllSync<{
      id: number;
      price: number;
      day_price_youth: number;
      day_price_adult: number;
      user_group: string;
    }>(`SELECT * FROM passes`);

    passes.forEach((pass) => {
      const usage = db.getFirstSync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM activities WHERE pass_id = ?`,
        [pass.id]
      );
      const activePrice =
        pass.user_group === 'Jugend' ? pass.day_price_youth : pass.day_price_adult;
      const normalCost = (usage?.cnt ?? 0) * activePrice;
      if (normalCost > pass.price) {
        savings += normalCost - pass.price;
      }
    });

    const monthCount = mRes?.cnt ?? 0;
    setStats({
      monthCount,
      yearCount: yRes?.cnt ?? 0,
      totalSavings: Math.round(savings),
      streak: monthCount > 0 ? monthCount + 2 : 0,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Servus! ⚡
        </Text>
        <Text variant="bodyMedium" style={styles.subGreeting}>
          Dein RideLog ist bereit für den nächsten Eintrag.
        </Text>

        <View style={styles.grid}>
          <Surface
            style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            elevation={1}
          >
            <Calendar color={theme.colors.primary} size={24} />
            <Text variant="titleMedium" style={styles.statLabel}>
              Diesen Monat
            </Text>
            <Text variant="headlineMedium" style={styles.statVal}>
              {stats.monthCount}
            </Text>
          </Surface>

          <Surface
            style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            elevation={1}
          >
            <Zap color="#FFCC00" size={24} />
            <Text variant="titleMedium" style={styles.statLabel}>
              Dieses Jahr
            </Text>
            <Text variant="headlineMedium" style={styles.statVal}>
              {stats.yearCount}
            </Text>
          </Surface>
        </View>

        <View style={styles.grid}>
          <Surface
            style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            elevation={1}
          >
            <TrendingUp color="#34C759" size={24} />
            <Text variant="titleMedium" style={styles.statLabel}>
              Pass Ersparnis
            </Text>
            <Text variant="headlineMedium" style={[styles.statVal, { color: '#34C759' }]}>
              {stats.totalSavings}€
            </Text>
          </Surface>

          <Surface
            style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            elevation={1}
          >
            <Award color="#FF9500" size={24} />
            <Text variant="titleMedium" style={styles.statLabel}>
              Aktiv-Streak
            </Text>
            <Text variant="headlineMedium" style={styles.statVal}>
              {stats.streak} Tage
            </Text>
          </Surface>
        </View>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Letzte Einträge
        </Text>
        {recent.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text>Noch keine Einträge vorhanden. Leg direkt los!</Text>
            </Card.Content>
          </Card>
        ) : (
          recent.map((item) => (
            <Card
              key={item.id}
              style={[styles.entryCard, { backgroundColor: theme.colors.surface }]}
              mode="elevated"
            >
              <Card.Title
                title={item.title}
                subtitle={`${item.date} • ${item.category}${item.location ? ` • ${item.location}` : ''}`}
                left={() => (
                  <View
                    style={[styles.categoryDot, { backgroundColor: theme.colors.primary }]}
                  />
                )}
              />
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => router.push('/entryModal')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  greeting: { fontWeight: 'bold' },
  subGreeting: { color: '#8E8E93', marginBottom: 20 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { flex: 0.48, padding: 15, borderRadius: 16, alignItems: 'center' },
  statLabel: { color: '#8E8E93', marginTop: 8, fontSize: 13 },
  statVal: { fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  emptyCard: { padding: 10, alignItems: 'center', opacity: 0.6 },
  entryCard: { marginBottom: 10, borderRadius: 12 },
  categoryDot: { width: 12, height: 12, borderRadius: 6, marginLeft: 10 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 28 },
});