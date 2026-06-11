import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { Flame, Trophy } from 'lucide-react-native';
import { db } from '../lib/db';
import { getColors, categoryMeta } from '../lib/theme';

type CatCount = { category: string; count: number };

export default function StatsScreen() {
  const c = getColors(useColorScheme());
  const [catCounts, setCatCounts] = useState<CatCount[]>([]);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});

  const loadStats = useCallback(() => {
    setCatCounts(
      db.getAllSync<CatCount>(
        'SELECT category, COUNT(*) as count FROM activities GROUP BY category ORDER BY count DESC'
      )
    );
    const dates = db.getAllSync<{ date: string }>('SELECT date FROM activities');
    const map: Record<string, number> = {};
    dates.forEach((d) => {
      map[d.date] = (map[d.date] || 0) + 1;
    });
    setHeatmap(map);
  }, []);

  useFocusEffect(useCallback(() => loadStats(), [loadStats]));

  const maxCount = catCounts.reduce((m, x) => Math.max(m, x.count), 0) || 1;

  const cells = [] as React.ReactNode[];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = heatmap[key] || 0;
    const intensity = count === 0 ? 0 : count === 1 ? 0.45 : count === 2 ? 0.7 : 1;
    cells.push(
      <View
        key={key}
        style={[
          styles.cell,
          {
            backgroundColor: count === 0 ? c.surfaceAlt : c.primary,
            opacity: count === 0 ? 1 : intensity,
          },
        ]}
      />
    );
  }

  const totalActivities = catCounts.reduce((s, x) => s + x.count, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <Flame size={20} color={c.primary} />
        <Text style={[styles.title, { color: c.text }]}>Aktivitäts-Heatmap</Text>
      </View>
      <View style={[styles.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.panelSub, { color: c.textMuted }]}>Letzte 14 Tage</Text>
        <View style={styles.grid}>{cells}</View>
        <View style={styles.legend}>
          <Text style={[styles.legendText, { color: c.textMuted }]}>weniger</Text>
          <View style={[styles.cell, { backgroundColor: c.surfaceAlt }]} />
          <View style={[styles.cell, { backgroundColor: c.primary, opacity: 0.45 }]} />
          <View style={[styles.cell, { backgroundColor: c.primary, opacity: 0.7 }]} />
          <View style={[styles.cell, { backgroundColor: c.primary }]} />
          <Text style={[styles.legendText, { color: c.textMuted }]}>mehr</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Trophy size={20} color={c.warning} />
        <Text style={[styles.title, { color: c.text }]}>Häufigkeit nach Sportart</Text>
      </View>
      {catCounts.length === 0 ? (
        <View style={[styles.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={{ color: c.textMuted, textAlign: 'center' }}>
            Noch keine Daten. Logge ein paar Rides!
          </Text>
        </View>
      ) : (
        catCounts.map((item, idx) => {
          const meta = categoryMeta(item.category);
          const Icon = meta.icon;
          return (
            <View key={item.category} style={[styles.rankRow, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={[styles.rankBadge, { backgroundColor: meta.color + '22' }]}>
                <Icon size={18} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rankHeader}>
                  <Text style={[styles.rankName, { color: c.text }]}>
                    {idx === 0 ? '🥇 ' : ''}
                    {item.category}
                  </Text>
                  <Text style={[styles.rankCount, { color: meta.color }]}>{item.count}x</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: c.surfaceAlt }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(item.count / maxCount) * 100}%`, backgroundColor: meta.color },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })
      )}

      {totalActivities > 0 && (
        <Text style={[styles.footer, { color: c.textMuted }]}>
          Insgesamt {totalActivities} Aktivitäten erfasst.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 12 },
  title: { fontWeight: '800', fontSize: 18 },
  panel: { borderRadius: 18, borderWidth: 1, padding: 18 },
  panelSub: { fontSize: 13, marginBottom: 12 },
  grid: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  cell: { width: 18, height: 18, borderRadius: 5 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14 },
  legendText: { fontSize: 11 },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  rankBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rankHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rankName: { fontWeight: '700', fontSize: 15 },
  rankCount: { fontWeight: '800', fontSize: 15 },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  footer: { textAlign: 'center', fontSize: 13, marginTop: 16 },
});
