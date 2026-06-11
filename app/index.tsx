import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Pressable, useColorScheme } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, TrendingUp, Flame, CalendarDays, Plus, PiggyBank } from 'lucide-react-native';
import { db, type Activity, type Pass } from '../lib/db';
import { getColors, categoryMeta } from '../lib/theme';
import EntryModal from '../components/EntryModal';

function computeStreak(): number {
  const rows = db.getAllSync<{ date: string }>(
    'SELECT DISTINCT date FROM activities ORDER BY date DESC'
  );
  if (rows.length === 0) return 0;
  const dates = new Set(rows.map((r) => r.date));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to count even if today has no entry yet (start from today,
  // but if today is missing, begin counting from yesterday).
  if (!dates.has(cursor.toISOString().split('T')[0])) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dates.has(cursor.toISOString().split('T')[0])) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Dashboard() {
  const c = getColors(useColorScheme());
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({ monthCount: 0, yearCount: 0, totalSavings: 0, streak: 0 });
  const [recent, setRecent] = useState<Activity[]>([]);

  const loadDashboardData = useCallback(() => {
    const year = new Date().getFullYear().toString();
    const month = `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const monthCount =
      db.getFirstSync<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM activities WHERE date LIKE ?',
        [`${month}%`]
      )?.cnt ?? 0;
    const yearCount =
      db.getFirstSync<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM activities WHERE date LIKE ?',
        [`${year}%`]
      )?.cnt ?? 0;

    setRecent(db.getAllSync<Activity>('SELECT * FROM activities ORDER BY date DESC, id DESC LIMIT 3'));

    let savings = 0;
    const passes = db.getAllSync<Pass>('SELECT * FROM passes');
    passes.forEach((pass) => {
      const usage =
        db.getFirstSync<{ cnt: number }>(
          'SELECT COUNT(*) as cnt FROM activities WHERE pass_id = ?',
          [pass.id]
        )?.cnt ?? 0;
      const ticket = pass.user_group === 'Jugend' ? pass.day_price_youth : pass.day_price_adult;
      const diff = usage * ticket - pass.price;
      if (diff > 0) savings += diff;
    });

    setStats({ monthCount, yearCount, totalSavings: Math.round(savings), streak: computeStreak() });
  }, []);

  useFocusEffect(useCallback(() => loadDashboardData(), [loadDashboardData]));

  const statCards = [
    { label: 'Diesen Monat', value: `${stats.monthCount}`, sub: 'Aktivitäten', icon: CalendarDays, color: c.info },
    { label: 'Dieses Jahr', value: `${stats.yearCount}`, sub: 'Aktivitäten', icon: Zap, color: c.warning },
    { label: 'Aktiv-Streak', value: `${stats.streak}`, sub: 'Tage in Folge', icon: Flame, color: '#FB7185' },
    { label: 'Pass-Ersparnis', value: `${stats.totalSavings}€`, sub: 'Gesamt', icon: PiggyBank, color: c.success },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={c.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEyebrow}>RIDELOG</Text>
          <Text style={styles.heroTitle}>Servus! 🤙</Text>
          <Text style={styles.heroSub}>Bereit für deinen nächsten Eintrag.</Text>
          <View style={styles.heroBadge}>
            <TrendingUp size={16} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>
              {stats.yearCount} Aktivitäten dieses Jahr
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.grid}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <View key={s.label} style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.iconBadge, { backgroundColor: s.color + '22' }]}>
                  <Icon size={20} color={s.color} />
                </View>
                <Text style={[styles.statValue, { color: c.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: c.text }]}>{s.label}</Text>
                <Text style={[styles.statSub, { color: c.textMuted }]}>{s.sub}</Text>
              </View>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Letzte Einträge</Text>
        {recent.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.emptyTitle, { color: c.text }]}>Noch keine Einträge</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Tippe auf den Plus-Button, um deinen ersten Ride zu loggen.
            </Text>
          </View>
        ) : (
          recent.map((item) => {
            const meta = categoryMeta(item.category);
            const Icon = meta.icon;
            return (
              <View key={item.id} style={[styles.entry, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.entryIcon, { backgroundColor: meta.color + '22' }]}>
                  <Icon size={20} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.entryTitle, { color: c.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.entryMeta, { color: c.textMuted }]}>
                    {item.category} • {item.date}
                  </Text>
                </View>
                {item.cost ? (
                  <Text style={[styles.entryCost, { color: c.primary }]}>{item.cost}€</Text>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <LinearGradient
          colors={c.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <Plus size={28} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>

      <EntryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={loadDashboardData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 110 },
  hero: { borderRadius: 24, padding: 22, marginBottom: 18 },
  heroEyebrow: { color: 'rgba(255,255,255,0.8)', fontWeight: '800', letterSpacing: 2, fontSize: 12 },
  heroTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 28, marginTop: 6 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 2 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginTop: 16,
  },
  heroBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statCard: {
    width: '47.5%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 0,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  statSub: { fontSize: 12, marginTop: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 26, marginBottom: 12 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 22, alignItems: 'center' },
  emptyTitle: { fontWeight: '700', fontSize: 15 },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 6 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  entryIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  entryTitle: { fontWeight: '700', fontSize: 15 },
  entryMeta: { fontSize: 12, marginTop: 2 },
  entryCost: { fontWeight: '800', fontSize: 15 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabInner: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
