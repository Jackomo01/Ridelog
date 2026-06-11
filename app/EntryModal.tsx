import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, Chip, Modal, Portal, IconButton } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('ridelog.db');
const CATEGORIES = ['Bikepark', 'Skifahren', 'Mountainbike', 'Rennrad', 'Laufen', 'Wandern', 'Fitnessstudio', 'Sonstiges'];

interface EntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EntryModal({ visible, onClose, onSave }: EntryModalProps) {
  const theme = useTheme();
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Bikepark');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');

  const handleSave = async () => {
    if (!location.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Ort oder Bikepark ein.');
      return;
    }

    try {
      await db.runAsync(
        'INSERT INTO logs (location, category, notes, cost, date) VALUES (?, ?, ?, ?, ?)',
        [location, category, notes, parseFloat(cost) || 0, new Date().toISOString().split('T')[0]]
      );
      
      // Felder leeren
      setLocation('');
      setNotes('');
      setCost('');
      
      onSave(); // Dashboard aktualisieren
      onClose(); // Modal schließen
    } catch (error) {
      console.log('Fehler beim Speichern:', error);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.modalContent, { backgroundColor: '#1E1E1E' }]}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: 'bold' }}>Neuer Eintrag</Text>
          <IconButton icon="close" iconColor="#FFF" onPress={onClose} />
        </View>

        <ScrollView>
          <TextInput
            label="Ort / Bikepark"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            textColor="#FFF"
            theme={{ colors: { onSurfaceVariant: '#8E8E93' } }}
            style={styles.input}
          />

          <Text variant="titleMedium" style={{ color: '#FFF', marginBottom: 10 }}>Kategorie</Text>
          <View style={styles.chipGroup}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
                style={styles.chip}
                selectedColor="#34C759"
              >
                {cat}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Notizen (Tricks, Wetter, Setup...)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            textColor="#FFF"
            multiline
            numberOfLines={3}
            theme={{ colors: { onSurfaceVariant: '#8E8E93' } }}
            style={styles.input}
          />

          <TextInput
            label="Kosten (€)"
            value={cost}
            onChangeText={setCost}
            mode="outlined"
            textColor="#FFF"
            keyboardType="numeric"
            theme={{ colors: { onSurfaceVariant: '#8E8E93' } }}
            style={styles.input}
          />

          <Button mode="contained" onPress={handleSave} buttonColor="#34C759" textColor="white" style={styles.saveButton}>
            Ride speichern
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: { margin: 20, padding: 20, borderRadius: 16, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  input: { marginBottom: 15, backgroundColor: '#2C2C2E' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { backgroundColor: '#2C2C2E' },
  saveButton: { marginTop: 10, paddingVertical: 5, borderRadius: 8 }
});