import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable, Platform, useColorScheme } from 'react-native';
import { TextInput, Text, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ticket, Target, Download } from 'lucide-react-native';
import { db } from '../lib/db';
import { CATEGORIES, PRIORITIES, getColors, priorityColor, categoryMeta } from '../lib/theme';

export default function SettingsScreen() {
  const c = getColors(useColorScheme());

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [youthPrice, setYouthPrice] = useState('');
  const [adultPrice, setAdultPrice] = useState('');
  const [userGroup, setUserGroup] = useState('Erwachsener');

  const [bTitle, setBTitle] = useState('');
  const [bCat, setBCat] = useState<string>('Bikepark');
  const [bPrio, setBPrio] = useState<string>('Mittel');

  const num = (v: string) => parseFloat(v.replace(',', '.'));

  const savePass = () => {
    if (!name || !price || !youthPrice || !adultPrice) {
      Alert.alert('Fehler', 'Bitte fülle alle Passfelder aus.');
      return;
    }
    db.runSync(
      'INSERT INTO passes (name, price, day_price_youth, day_price_adult, user_group) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), num(price), num(youthPrice), num(adultPrice), userGroup]
    );
    Alert.alert('Erfolg', 'Saisonkarte erfolgreich registriert!');
    setName('');
    setPrice('');
    setYouthPrice('');
    setAdultPrice('');
  };

  const saveBucketItem = () => {
    if (!bTitle.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Titel ein.');
      return;
    }
    db.runSync(
      'INSERT INTO bucket_list (title, category, priority, created_at, completed) VALUES (?, ?, ?, ?, 0)',
      [bTitle.trim(), bCat, bPrio, new Date().toISOString().split('T')[0]]
    );
    Alert.alert('Erfolg', 'Ziel zur Bucket-List hinzugefügt!');
    setBTitle('');
  };

  const exportBackup = async () => {
    try {
      const data = JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          activities: db.getAllSync('SELECT * FROM activities'),
          passes: db.getAllSync('SELECT * FROM passes'),
          bucket_list: db.getAllSync('SELECT * FROM bucket_list'),
        },
        null,
        2
      );

      if (Platform.OS === 'web') {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ridelog_backup.json';
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}ridelog_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, data, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Gespeichert', `Backup abgelegt unter:\n${fileUri}`);
      }
    } catch (err) {
      Alert.alert('Fehler', 'Backup-Export fehlgeschlagen.');
      console.warn('Export failed:', err);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1 },
        section: {
          backgroundColor: c.surface,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: 20,
          padding: 18,
          marginBottom: 16,
        },
        sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
        sectionIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
        sectionTitle: { fontWeight: '800', fontSize: 17, color: c.text },
        label: { color: c.textMuted, fontWeight: '700', fontSize: 12, marginBottom: 8, marginTop: 4 },
        input: { backgroundColor: c.surfaceAlt, marginBottom: 12 },
        row: { flexDirection: 'row', gap: 12 },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
        chip: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1.5,
          backgroundColor: c.surfaceAlt,
          borderColor: c.border,
        },
        chipText: { fontWeight: '600', fontSize: 13, color: c.text },
        primaryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
        primaryInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
        primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
        outlineBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: c.primary,
        },
        outlineText: { color: c.primary, fontWeight: '800', fontSize: 15 },
      }),
    [c]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Saisonkarte */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <View style={[styles.sectionIcon, { backgroundColor: c.primary + '22' }]}>
            <Ticket size={20} color={c.primary} />
          </View>
          <Text style={styles.sectionTitle}>Saisonkarte hinzufügen</Text>
        </View>

        <TextInput
          label="Name (z.B. Gravity Card)"
          value={name}
          onChangeText={setName}
          mode="outlined"
          outlineColor={c.border}
          activeOutlineColor={c.primary}
          textColor={c.text}
          style={styles.input}
        />
        <TextInput
          label="Kaufpreis (€)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          mode="outlined"
          outlineColor={c.border}
          activeOutlineColor={c.primary}
          textColor={c.text}
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            label="Tagesticket Jugend (€)"
            value={youthPrice}
            onChangeText={setYouthPrice}
            keyboardType="numeric"
            mode="outlined"
            outlineColor={c.border}
            activeOutlineColor={c.primary}
            textColor={c.text}
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput
            label="Tagesticket Erw. (€)"
            value={adultPrice}
            onChangeText={setAdultPrice}
            keyboardType="numeric"
            mode="outlined"
            outlineColor={c.border}
            activeOutlineColor={c.primary}
            textColor={c.text}
            style={[styles.input, { flex: 1 }]}
          />
        </View>
        <Text style={styles.label}>BENUTZERGRUPPE</Text>
        <SegmentedButtons
          value={userGroup}
          onValueChange={setUserGroup}
          density="small"
          buttons={[
            { value: 'Jugend', label: 'Jugend' },
            { value: 'Erwachsener', label: 'Erwachsener' },
          ]}
          style={{ marginBottom: 16 }}
        />
        <Pressable style={styles.primaryBtn} onPress={savePass}>
          <LinearGradient colors={c.fabGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryInner}>
            <Text style={styles.primaryText}>Karte speichern</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Bucket-List Ziel */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <View style={[styles.sectionIcon, { backgroundColor: c.warning + '22' }]}>
            <Target size={20} color={c.warning} />
          </View>
          <Text style={styles.sectionTitle}>Neues Bucket-List Ziel</Text>
        </View>

        <TextInput
          label="Titel (z.B. Whip lernen)"
          value={bTitle}
          onChangeText={setBTitle}
          mode="outlined"
          outlineColor={c.border}
          activeOutlineColor={c.primary}
          textColor={c.text}
          style={styles.input}
        />

        <Text style={styles.label}>KATEGORIE</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => {
            const meta = categoryMeta(cat);
            const selected = bCat === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setBCat(cat)}
                style={[styles.chip, selected && { backgroundColor: meta.color + '22', borderColor: meta.color }]}
              >
                <Text style={[styles.chipText, selected && { color: meta.color }]}>{cat}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>PRIORITÄT</Text>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => {
            const pColor = priorityColor(p);
            const selected = bPrio === p;
            return (
              <Pressable
                key={p}
                onPress={() => setBPrio(p)}
                style={[styles.chip, selected && { backgroundColor: pColor + '22', borderColor: pColor }]}
              >
                <Text style={[styles.chipText, selected && { color: pColor }]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.primaryBtn} onPress={saveBucketItem}>
          <LinearGradient
            colors={[c.warning, '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryInner}
          >
            <Text style={styles.primaryText}>Ziel hinzufügen</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Backup */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <View style={[styles.sectionIcon, { backgroundColor: c.info + '22' }]}>
            <Download size={20} color={c.info} />
          </View>
          <Text style={styles.sectionTitle}>Datensicherheit</Text>
        </View>
        <Pressable style={styles.outlineBtn} onPress={exportBackup}>
          <Download size={18} color={c.primary} />
          <Text style={styles.outlineText}>Lokal als JSON exportieren</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
