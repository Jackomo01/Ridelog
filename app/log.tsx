import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Pressable, useColorScheme } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { MapPin } from 'lucide-react-native';
import { db, type Activity } from '../lib/db';
import { CATEGORIES, categoryMeta, getColors } from '../lib/theme';

type MarkedDates = { [date: string]: { marked: boolean; dotColor: string } };

export default function Logbuch() {
  const c = getColors(useColorScheme());
  const [viewMode, setViewMode] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const loadActivities = useCallback(() => {
    const rows = selectedCategory
      ? db.getAllSync<Activity>(
          'SELECT * FROM activities WHERE category = ? ORDER BY date DESC, id DESC',
          [selectedCategory]
        )
      : db.getAllSync<Activity>('SELECT * FROM activities ORDER BY date DESC, id DESC');
    setActivities(rows);

    const marked: MarkedDates = {};
    rows.forEach((a) => {
      marked[a.date] = { marked: true, dotColor: categoryMeta(a.category).color };
    });
    setMarkedDates(marked);
  }, [selectedCategory]);

  useFocusEffect(useCallback(() => loadActivities(), [loadActivities]));

  const chips = ['Alle', ...CATEGORIES];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.headerControl}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          density="small"
          buttons={[
            { value: 'list', label: 'Liste', icon: 'format-list-bulleted' },
            { value: 'cal', label: 'Kalender', icon: 'calendar' },
          ]}
        />
      </View>

      <View style={{ maxHeight: 48 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {chips.map((label) => {
            const value = label === 'Alle' ? null : label;
            const selected = selectedCategory === value;
            const color = label === 'Alle' ? c.primary : categoryMeta(label).color;
            return (
              <Pressable
                key={label}
                onPress={() => setSelectedCategory(selected ? null : value)}
                style={[
                  styles.chip,
                  { backgroundColor: c.surface, borderColor: c.border },
                  selected && { backgroundColor: color + '22', borderColor: color },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? color : c.textMuted }]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              Noch keine Einträge vorhanden.
            </Text>
          }
          renderItem={({ item }) => {
            const meta = categoryMeta(item.category);
            const Icon = meta.icon;
            return (
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.cardIcon, { backgroundColor: meta.color + '22' }]}>
                  <Icon size={22} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.dateBadge, { color: c.textMuted }]}>{item.date}</Text>
                  </View>
                  <View style={styles.catRow}>
                    <View style={[styles.catTag, { backgroundColor: meta.color + '22' }]}>
                      <Text style={[styles.catTagText, { color: meta.color }]}>{item.category}</Text>
                    </View>
                    {item.location ? (
                      <View style={styles.locRow}>
                        <MapPin size={12} color={c.textMuted} />
                        <Text style={[styles.locText, { color: c.textMuted }]} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {item.note ? (
                    <Text style={[styles.noteText, { color: c.textMuted }]}>{item.note}</Text>
                  ) : null}
                  {item.cost ? (
                    <Text style={[styles.costText, { color: c.primary }]}>Kosten: {item.cost}€</Text>
                  ) : null}
                </View>
              </View>
            );
          }}
        />
      ) : (
        <ScrollView style={{ padding: 16 }}>
          <View style={{ borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: c.border }}>
            <RNCalendar
              theme={{
                calendarBackground: c.surface,
                textSectionTitleColor: c.textMuted,
                selectedDayBackgroundColor: c.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: c.primary,
                dayTextColor: c.text,
                monthTextColor: c.text,
                textDisabledColor: c.border,
                arrowColor: c.primary,
              }}
              markedDates={markedDates}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerControl: { padding: 16, paddingBottom: 8 },
  chipContainer: { alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  chipText: { fontWeight: '600', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  cardIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontWeight: '800', fontSize: 16, flex: 1 },
  dateBadge: { fontSize: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  catTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  catTagText: { fontSize: 12, fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1 },
  locText: { fontSize: 12 },
  noteText: { marginTop: 8, fontStyle: 'italic', fontSize: 13 },
  costText: { marginTop: 8, fontWeight: '700', fontSize: 13 },
});
