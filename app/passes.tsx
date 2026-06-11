import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Ticket, PiggyBank } from 'lucide-react-native';
import { db, type Pass } from '../lib/db';
import { getColors } from '../lib/theme';

type PassStat = Pass & {
  visitCount: number;
  savings: number;
  breakEven: number;
  progress: number;
};

export default function PassRechner() {
  const c = getColors(useColorScheme());
  const [passStats, setPassStats] = useState<PassStat[]>([]);

  const calculatePasses = useCallback(() => {
    const list = db.getAllSync<Pass>('SELECT * FROM passes ORDER BY name ASC');
    setPassStats(
      list.map((pass) => {
        const visitCount =
          db.getFirstSync<{ cnt: number }>(
            'SELECT COUNT(*) as cnt FROM activities WHERE pass_id = ?',
            [pass.id]
          )?.cnt ?? 0;
        const ticket = pass.user_group === 'Jugend' ? pass.day_price_youth : pass.day_price_adult;
        const savings = visitCount * ticket - pass.price;
        const breakEven = ticket > 0 ? Math.ceil(pass.price / ticket) : 0;
        const progress = breakEven > 0 ? Math.min(visitCount / breakEven, 1) : 0;
        return { ...pass, visitCount, savings, breakEven, progress };
      })
    );
  }, []);

  useFocusEffect(useCallback(() => calculatePasses(), [calculatePasses]));

  const deletePass = (id: number) => {
    db.runSync('DELETE FROM passes WHERE id = ?', [id]);
    calculatePasses();
  };

  const totalSavings = passStats.reduce((sum, p) => sum + Math.max(0, p.savings), 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {passStats.length > 0 && (
        <LinearGradient
          colors={c.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summary}
        >
          <View style={styles.summaryIcon}>
            <PiggyBank size={26} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Gesamtersparnis</Text>
            <Text style={styles.summaryValue}>{Math.round(totalSavings)}€</Text>
          </View>
        </LinearGradient>
      )}

      {passStats.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ticket size={32} color={c.textMuted} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Keine Saisonkarten</Text>
          <Text style={[styles.emptySub, { color: c.textMuted }]}>
            Lege im Setup-Tab eine Karte an und verknüpfe sie beim Loggen mit deinen Rides.
          </Text>
        </View>
      ) : (
        passStats.map((pass) => {
          const worthIt = pass.savings >= 0;
          return (
            <View key={pass.id} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.passName, { color: c.text }]}>{pass.name}</Text>
                  <Text style={[styles.passSub, { color: c.textMuted }]}>
                    Kaufpreis: {pass.price}€ • {pass.user_group}
                  </Text>
                </View>
                <Pressable onPress={() => deletePass(pass.id)} hitSlop={8} style={{ padding: 4 }}>
                  <Trash2 size={18} color={c.danger} />
                </Pressable>
              </View>

              <View style={styles.row}>
                <Text style={[styles.rowText, { color: c.textMuted }]}>
                  Besuche: <Text style={{ color: c.text, fontWeight: '800' }}>{pass.visitCount}</Text> / {pass.breakEven}
                </Text>
                <Text style={[styles.rowText, { color: c.textMuted }]}>
                  Lohnt sich ab <Text style={{ color: c.text, fontWeight: '800' }}>{pass.breakEven}x</Text>
                </Text>
              </View>

              <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.round(pass.progress * 100)}%`, backgroundColor: worthIt ? c.success : c.primary },
                  ]}
                />
              </View>

              <View
                style={[
                  styles.resultBox,
                  { backgroundColor: worthIt ? c.success + '1F' : c.surfaceAlt },
                ]}
              >
                <Text style={[styles.resultText, { color: worthIt ? c.success : c.textMuted }]}>
                  {worthIt
                    ? `Ersparnis: +${Math.round(pass.savings)}€`
                    : `Noch ${Math.round(Math.abs(pass.savings))}€ bis zum Break-Even`}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: { color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: 13 },
  summaryValue: { color: '#FFFFFF', fontWeight: '900', fontSize: 26 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  passName: { fontWeight: '800', fontSize: 18 },
  passSub: { fontSize: 13, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowText: { fontSize: 13 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  fill: { height: '100%', borderRadius: 5 },
  resultBox: { padding: 12, borderRadius: 12, alignItems: 'center' },
  resultText: { fontWeight: '800', fontSize: 15 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 28, alignItems: 'center', gap: 8 },
  emptyTitle: { fontWeight: '700', fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: 'center' },
});
