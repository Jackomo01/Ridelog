import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Checkbox, IconButton, useTheme } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('ridelog.db');

type Goal = {
  id: number;
  title: string;
  category: string;
  description?: string;
  priority: string;
  created_at: string;
  completed: number;
};

export default function BucketList() {
  const theme = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = useCallback(() => {
    const rows = db.getAllSync<Goal>(
      'SELECT * FROM bucket_list ORDER BY completed ASC, priority DESC'
    );
    setGoals(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const toggleComplete = (id: number, currentStatus: number) => {
    db.runSync('UPDATE bucket_list SET completed = ? WHERE id = ?', [
      currentStatus === 1 ? 0 : 1,
      id,
    ]);
    loadGoals();
  };

  const deleteGoal = (id: number) => {
    db.runSync('DELETE FROM bucket_list WHERE id = ?', [id]);
    loadGoals();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#8E8E93', marginTop: 30 }}>
            Noch keine Ziele vorhanden. Füge im Setup-Tab neue Ziele hinzu.
          </Text>
        }
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface, opacity: item.completed ? 0.6 : 1 },
            ]}
          >
            <Card.Content style={styles.cardContent}>
              <Checkbox
                status={item.completed ? 'checked' : 'unchecked'}
                onPress={() => toggleComplete(item.id, item.completed)}
                color={theme.colors.primary}
              />
              <View style={styles.textContainer}>
                <Text
                  variant="titleMedium"
                  style={[styles.title, item.completed && styles.strikeThrough]}
                >
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={{ color: '#8E8E93' }}>
                  {item.category} • Prio: {item.priority}
                </Text>
                {item.description ? (
                  <Text variant="bodyMedium" style={{ marginTop: 4 }}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <IconButton
                icon="trash-can-outline"
                iconColor="#FF3B30"
                onPress={() => deleteGoal(item.id)}
              />
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 10, borderRadius: 14 },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: { flex: 1, marginLeft: 8 },
  title: { fontWeight: 'bold' },
  strikeThrough: { textDecorationLine: 'line-through', color: '#8E8E93' },
});