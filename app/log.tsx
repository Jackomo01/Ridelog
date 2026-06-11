import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons, useTheme, Chip } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { openDatabaseSync } from 'expo-sqlite';
import { Calendar as RNCalendar } from 'react-native-calendars';

const db = openDatabaseSync('ridelog.db');

const CATEGORIES = [
  'Bikepark',
  'Skifahren',
  'Mountainbike',
  'Rennrad',
  'Laufen',
  'Wandern',
  'Fitnessstudio',
  'Sonstiges',
];

type Activity = {
  id: number;
  date: string;
  category: string;
  title: string;
  note?: string;
  cost?: number;
  location?: string;
};

type MarkedDates = {
  [date: string]: { marked: boolean; dotColor: string };
};

export default function Logbuch() {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const loadActivities = useCallback(() => {
    let rows: Activity[];
    if (selectedCategory) {
      rows = db.getAllSync<Activity>(
        'SELECT * FROM activities WHERE category = ? ORDER BY date DESC',
        [selectedCategory]
      );
    } else {
      rows = db.getAllSync<Activity>('SELECT * FROM activities ORDER BY date DESC');
    }
    setActivities(rows);

    const marked: MarkedDates = {};
    rows.forEach((act) => {
      marked[act.date] = { marked: true, dotColor: theme.colors.primary };
    });
    setMarkedDates(marked);
  }, [selectedCategory, theme.colors.primary]);

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [loadActivities])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerControl}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: 'list', label: 'Liste' },
            { value: 'cal', label: 'Kalender' },
          ]}
        />
      </View>

      <View style={{ height: 50, paddingLeft: 15 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          <Chip
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
            style={styles.chip}
          >
            Alle
          </Chip>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              style={styles.chip}
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#8E8E93', marginTop: 30 }}>
              Noch keine Einträge vorhanden.
            </Text>
          }
          renderItem={({ item }) => (
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              mode="elevated"
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.dateBadge}>
                    {item.date}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.catText}>
                  {item.category}
                  {item.location ? ` 📍 ${item.location}` : ''}
                </Text>
                {item.note ? (
                  <Text variant="bodySmall" style={styles.noteText}>
                    {item.note}
                  </Text>
                ) : null}
                {item.cost ? (
                  <Text variant="labelMedium" style={styles.costText}>
                    Kosten: {item.cost}€
                  </Text>
                ) : null}
              </Card.Content>
            </Card>
          )}
        />
      ) : (
        <ScrollView style={{ padding: 15 }}>
          <RNCalendar
            theme={{
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.onSurface,
              monthTextColor: theme.colors.onSurface,
            }}
            markedDates={markedDates}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerControl: { padding: 15 },
  chipContainer: { alignItems: 'center', paddingRight: 20 },
  chip: { marginRight: 8, height: 34 },
  card: { marginBottom: 12, borderRadius: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBadge: { color: '#8E8E93' },
  catText: { color: '#8E8E93', marginTop: 4 },
  noteText: { marginTop: 8, fontStyle: 'italic', opacity: 0.8 },
  costText: { marginTop: 8, fontWeight: '600' },
});