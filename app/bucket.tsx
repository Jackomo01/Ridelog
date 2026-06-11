import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, useColorScheme } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { Check, Trash2, Target } from 'lucide-react-native';
import { db, type Goal } from '../lib/db';
import { getColors, priorityColor } from '../lib/theme';

export default function BucketList() {
  const c = getColors(useColorScheme());
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = useCallback(() => {
    setGoals(
      db.getAllSync<Goal>(
        `SELECT * FROM bucket_list
         ORDER BY completed ASC,
           CASE priority WHEN 'Hoch' THEN 0 WHEN 'Mittel' THEN 1 ELSE 2 END ASC,
           id DESC`
      )
    );
  }, []);

  useFocusEffect(useCallback(() => loadGoals(), [loadGoals]));

  const toggleComplete = (id: number, current: number) => {
    db.runSync('UPDATE bucket_list SET completed = ? WHERE id = ?', [current === 1 ? 0 : 1, id]);
    loadGoals();
  };

  const deleteGoal = (id: number) => {
    db.runSync('DELETE FROM bucket_list WHERE id = ?', [id]);
    loadGoals();
  };

  const openCount = goals.filter((g) => g.completed === 0).length;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          goals.length > 0 ? (
            <Text style={[styles.header, { color: c.textMuted }]}>
              {openCount} offen • {goals.length - openCount} erledigt
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Target size={32} color={c.textMuted} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Noch keine Ziele</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Lege im Setup-Tab neue Meilensteine an (z.B. "Whip lernen").
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const done = item.completed === 1;
          const pColor = priorityColor(item.priority);
          return (
            <View
              style={[
                styles.card,
                { backgroundColor: c.surface, borderColor: c.border, opacity: done ? 0.6 : 1 },
              ]}
            >
              <Pressable
                onPress={() => toggleComplete(item.id, item.completed)}
                style={[
                  styles.checkbox,
                  { borderColor: done ? c.primary : c.border, backgroundColor: done ? c.primary : 'transparent' },
                ]}
                hitSlop={8}
              >
                {done ? <Check size={16} color="#FFFFFF" /> : null}
              </Pressable>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.title,
                    { color: c.text },
                    done && { textDecorationLine: 'line-through', color: c.textMuted },
                  ]}
                >
                  {item.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.category, { color: c.textMuted }]}>{item.category}</Text>
                  <View style={[styles.prioTag, { backgroundColor: pColor + '22' }]}>
                    <Text style={[styles.prioText, { color: pColor }]}>{item.priority}</Text>
                  </View>
                </View>
                {item.description ? (
                  <Text style={[styles.description, { color: c.textMuted }]}>{item.description}</Text>
                ) : null}
              </View>

              <Pressable onPress={() => deleteGoal(item.id)} hitSlop={8} style={styles.deleteBtn}>
                <Trash2 size={18} color={c.danger} />
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontWeight: '600', fontSize: 13, marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', fontSize: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  category: { fontSize: 13 },
  prioTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  prioText: { fontSize: 12, fontWeight: '700' },
  description: { marginTop: 6, fontSize: 13 },
  deleteBtn: { padding: 4 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 28, alignItems: 'center', gap: 8, marginTop: 20 },
  emptyTitle: { fontWeight: '700', fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: 'center' },
});
