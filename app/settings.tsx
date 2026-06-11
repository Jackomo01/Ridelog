import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, useTheme, Divider } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const db = SQLite.openDatabaseSync('ridelog.db');

export default function SettingsScreen() {
  const theme = useTheme();
  // Pass Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [youthPrice, setYouthPrice] = useState('');
  const [adultPrice, setAdultPrice] = useState('');
  const [userGroup, setUserGroup] = useState('Erwachsener');

  // Bucket List Form State
  const [bTitle, setBTitle] = useState('');
  const [bCat, setBCat] = useState('Bikepark');
  const [bPrio, setBPrio] = useState('Mittel');

  const savePass = () => {
    if (!name || !price || !youthPrice || !adultPrice) {
      Alert.alert('Fehler', 'Bitte fülle alle Passfelder aus.');
      return;
    }
    db.runSync(
      'INSERT INTO passes (name, price, day_price_youth, day_price_adult, user_group) VALUES (?, ?, ?, ?, ?)',
      [name, parseFloat(price), parseFloat(youthPrice), parseFloat(adultPrice), userGroup]
    );
    Alert.alert('Erfolg', 'Saisonkarte erfolgreich registriert!');
    setName(''); setPrice(''); setYouthPrice(''); setAdultPrice('');
  };

  const saveBucketItem = () => {
    if (!bTitle) return;
    db.runSync(
      'INSERT INTO bucket_list (title, category, priority, created_at, completed) VALUES (?, ?, ?, ?, 0)',
      [bTitle, bCat, bPrio, new Date().toISOString().split('T')[0]]
    );
    Alert.alert('Erfolg', 'Ziel zur Bucket List hinzugefügt!');
    setBTitle('');
  };

  // JSON Daten-Export
  const exportBackup = async () => {
    try {
      const acts = db.getAllSync('SELECT * FROM activities');
      const passes = db.getAllSync('SELECT * FROM passes');
      const bucket = db.getAllSync('SELECT * FROM bucket_list');

      const backupData = JSON.stringify({ acts, passes, bucket }, null, 2);
      const fileUri = `${FileSystem.documentDirectory}ridelog_backup.json`;
      
      await FileSystem.writeAsStringAsync(fileUri, backupData, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      Alert.alert('Fehler', 'Backup-Export fehlgeschlagen.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ padding: 20 }}>
      
      {/* Saisonkarte anlegen */}
      <Text variant="titleLarge" style={styles.title}>Saisonkarte hinzufügen</Text>
      <TextInput label="Name der Karte (z.B. Gravity Card)" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <TextInput label="Kaufpreis (€)" value={price} onChangeText={setPrice} keyboardType="numeric" mode="outlined" style={styles.input} />
      <View style={styles.row}>
        <TextInput label="Tagesticket Jugend (€)" value={youthPrice} onChangeText={setYouthPrice} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 0.48 }]} />
        <TextInput label="Tagesticket Erw. (€)" value={adultPrice} onChangeText={setAdultPrice} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 0.48 }]} />
      </View>
      <SegmentedButtons
        value={userGroup}
        onValueChange={setUserGroup}
        buttons={[{ value: 'Jugend', label: 'Jugend' }, { value: 'Erwachsener', label: 'Erwachsener' }]}
        style={{ marginBottom: 15 }}
      />
      <Button mode="contained" onPress={savePass} style={{ borderRadius: 12 }}>Karte Speichern</Button>

      <Divider style={{ my: 25, marginVertical: 20 }} />

      {/* Ziel anlegen */}
      <Text variant="titleLarge" style={styles.title}>Neues Bucket-List Ziel</Text>
      <TextInput label="Titel (z.B. Whip lernen)" value={bTitle} onChangeText={setBTitle} mode="outlined" style={styles.input} />
      <Button mode="contained" onPress={saveBucketItem} buttonColor="#FF9500" style={{ borderRadius: 12 }}>Ziel Hinzufügen</Button>

      <Divider style={{ marginVertical: 20 }} />

      {/* Backup */}
      <Text variant="titleLarge" style={styles.title}>Datensicherheit</Text>
      <Button mode="outlined" icon="export" onPress={exportBackup} style={{ borderRadius: 12, borderColor: theme.colors.primary }}>
        Lokal als JSON exportieren
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontWeight: 'bold', marginBottom: 15 },
  input: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' }
});