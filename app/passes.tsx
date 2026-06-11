import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ProgressBar, useTheme } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('ridelog.db');

type Pass = {
  id: number;
  name: string;
  price: number;
  day_price_youth: number;
  day_price_adult: number;
  user_group: string;
};

type PassStat = Pass & {
  visitCount: number;
  savings: number;
  breakEven: number;
  progress: number;
};

export default function PassRechner() {
  const theme = useTheme();
  const [passStats, setPassStats] = useState<PassStat[]>([]);

  const calculatePasses = useCallback(() => {
    const passesList = db.getAllSync<Pass>('SELECT * FROM passes');
    const computed: PassStat[] = passesList.map((pass) => {
      const usage = db.getFirstSync<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM activities WHERE pass_id = ?',
        [pass.id]
      );
      const visitCount = usage?.cnt ?? 0;
      const ticketPrice =
        pass.user_group === 'Jugend' ? pass.day_price_youth : pass.day_price_adult;
      const totalValueWithoutPass = visitCount * ticketPrice;
      const savings = totalValueWithoutPass - pass.price;
      const breakEven = Math.ceil(pass.price / ticketPrice);
      const progress = Math.min(visitCount / breakEven, 1);

      return { ...pass, visitCount, savings, breakEven, progress };
    });
    setPassStats(computed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      calculatePasses();
    }, [calculatePasses])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: 15 }}
    >
      {passStats.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 30, color: '#8E8E93' }}>
          Noch keine Saisonkarten angelegt. Füge sie im Setup-Tab hinzu.
        </Text>
      ) : (
        passStats.map((pass) => (
          <Card
            key={pass.id}
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            mode="elevated"
          >
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                {pass.name}
              </Text>
              <Text variant="bodySmall" style={{ color: '#8E8E93', marginBottom: 12 }}>
                Kaufpreis: {pass.price}€ ({pass.user_group})
              </Text>

              <View style={styles.row}>
                <Text variant="bodyMedium">
                  Besuche:{' '}
                  <Text style={{ fontWeight: 'bold' }}>{pass.visitCount}</Text> /{' '}
                  {pass.breakEven}
                </Text>
                <Text variant="bodyMedium">
                  Lohnt sich ab:{' '}
                  <Text style={{ fontWeight: 'bold' }}>{pass.breakEven}x</Text>
                </Text>
              </View>

              <ProgressBar
                progress={pass.progress}
                color={pass.progress >= 1 ? '#34C759' : theme.colors.primary}
                style={styles.bar}
              />

              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor:
                      pass.savings >= 0
                        ? 'rgba(52,199,89,0.15)'
                        : 'rgba(142,142,147,0.1)',
                  },
                ]}
              >
                <Text
                  variant="titleMedium"
                  style={{
                    color: pass.savings >= 0 ? '#34C759' : theme.colors.onSurface,
                    fontWeight: 'bold',
                  }}
                >
                  {pass.savings >= 0
                    ? `Ersparnis: +${Math.round(pass.savings)}€`
                    : `Noch offen: ${Math.round(Math.abs(pass.savings))}€`}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 15, borderRadius: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  bar: { height: 8, borderRadius: 4, marginVertical: 10 },
  resultBox: { padding: 12, borderRadius: 8, marginTop: 5, alignItems: 'center' },
});