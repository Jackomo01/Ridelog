import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('ridelog.db');

export default function StatsScreen() {
  const theme = useTheme();
  const [catCounts, setCatCounts] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any>({});

  const loadStats = useCallback(() => {
    // Top Kategorien abfragen
    const rows: any[] = db.getAllSync('SELECT category, COUNT(*) as count FROM activities GROUP BY category ORDER BY count DESC');
    setCatCounts(rows);

    // Heatmap generieren (Simulierter Kalender-Map-Lookup)
    const dates: any[] = db.getAllSync('SELECT date FROM activities');
    const map: any = {};
    dates.forEach(d => { map[d.date] = (map[d.date] || 0) + 1; });
    setHeatmapData(map);
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  // Render-Hilfe für die Grid-Quadrate (Letzte 14 Tage als repräsentative Minikarte)
  const renderHeatmapGrid = () => {
    const cells = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const count = heatmapData[str] || 0;
      let bg = '#2C2C2E'; // Empty State Dark Mode Standard
      if (count > 0) bg = theme.colors.primary;
      cells.push(<View key={str} style={[styles.gridCell, { backgroundColor: bg }]} />);
    }
    return cells;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ padding: 20 }}>
      <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 15 }}>Aktivitäts-Heatmap (Letzte 2 Wochen)</Text>
      <Surface style={[styles.heatmapContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.gridRow}>{renderHeatmapGrid()}</View>
        <Text variant="bodySmall" style={{ color: '#8E8E93', marginTop: 8, textAlign: 'center' }}>Jedes farbige Quadrat steht für einen Aktivitätstag.</Text>
      </Surface>

      <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 25, marginBottom: 15 }}>Häufigkeit nach Sportart</Text>
      {catCounts.map(item => (
        <Surface key={item.category} style={[styles.rankRow, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{item.category}</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{item.count}x</Text>
        </Surface>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heatmapContainer: { padding: 20, borderRadius: 16, alignItems: 'center' },
  gridRow: { flexDirection: 'row', gap: 6 },
  gridCell: { width: 18, height: 18, borderRadius: 4 },
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8 }
});