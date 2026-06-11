import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
} from 'react-native';
import { TextInput, Text, Modal, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, MapPin, Wallet } from 'lucide-react-native';
import { db, type Pass } from '../lib/db';
import { CATEGORIES, categoryMeta, getColors } from '../lib/theme';

interface EntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EntryModal({ visible, onClose, onSave }: EntryModalProps) {
  const c = getColors(useColorScheme());
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<string>('Bikepark');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [passId, setPassId] = useState<number | null>(null);
  const [passes, setPasses] = useState<Pass[]>([]);

  useEffect(() => {
    if (visible) {
      setPasses(db.getAllSync<Pass>('SELECT * FROM passes ORDER BY name ASC'));
    }
  }, [visible]);

  const reset = () => {
    setTitle('');
    setLocation('');
    setCategory('Bikepark');
    setNotes('');
    setCost('');
    setPassId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Titel ein.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Ort oder Bikepark ein.');
      return;
    }
    try {
      const parsedCost = cost ? parseFloat(cost.replace(',', '.')) : null;
      db.runSync(
        `INSERT INTO activities (date, category, title, note, cost, location, pass_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          new Date().toISOString().split('T')[0],
          category,
          title.trim(),
          notes.trim() || null,
          parsedCost && !Number.isNaN(parsedCost) ? parsedCost : null,
          location.trim(),
          passId,
        ]
      );
      reset();
      onSave();
      onClose();
    } catch (error) {
      Alert.alert('Fehler', 'Eintrag konnte nicht gespeichert werden.');
      console.warn('Failed to save activity:', error);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modal: { margin: 0, justifyContent: 'flex-end', flex: 1 },
        sheet: {
          backgroundColor: c.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 8,
          maxHeight: '90%',
        },
        grabber: {
          alignSelf: 'center',
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: c.border,
          marginBottom: 8,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingBottom: 12,
        },
        title: { color: c.text, fontWeight: '800', fontSize: 20 },
        closeBtn: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: c.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        },
        body: { paddingHorizontal: 20, paddingBottom: 28, gap: 18 },
        label: { color: c.textMuted, fontWeight: '700', fontSize: 13, marginBottom: 8 },
        input: { backgroundColor: c.surfaceAlt },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        chip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 9,
          borderRadius: 14,
          borderWidth: 1.5,
          backgroundColor: c.surfaceAlt,
          borderColor: c.border,
        },
        chipText: { color: c.text, fontWeight: '600', fontSize: 13 },
        saveBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
        saveInner: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 15,
        },
        saveText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
      }),
    [c]
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modal}
        style={styles.modal}
      >
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <Text style={styles.title}>Neuer Eintrag</Text>
            <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={8}>
              <X color={c.text} size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <View>
              <Text style={styles.label}>TITEL / AKTIVITÄT</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                placeholder="z.B. Enduro-Tour, Sprung-Session"
                outlineColor={c.border}
                activeOutlineColor={c.primary}
                textColor={c.text}
                style={styles.input}
              />
            </View>

            <View>
              <Text style={styles.label}>ORT / BIKEPARK</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                placeholder="z.B. Gravity Park Winterberg"
                left={<TextInput.Icon icon={() => <MapPin size={18} color={c.textMuted} />} />}
                outlineColor={c.border}
                activeOutlineColor={c.primary}
                textColor={c.text}
                style={styles.input}
              />
            </View>

            <View>
              <Text style={styles.label}>SPORTART</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => {
                  const meta = categoryMeta(cat);
                  const Icon = meta.icon;
                  const selected = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.chip,
                        selected && {
                          backgroundColor: meta.color + '22',
                          borderColor: meta.color,
                        },
                      ]}
                    >
                      <Icon size={15} color={meta.color} />
                      <Text style={[styles.chipText, selected && { color: meta.color }]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {passes.length > 0 && (
              <View>
                <Text style={styles.label}>SAISONKARTE (OPTIONAL)</Text>
                <View style={styles.chipRow}>
                  <Pressable
                    onPress={() => setPassId(null)}
                    style={[
                      styles.chip,
                      passId === null && { backgroundColor: c.primary + '22', borderColor: c.primary },
                    ]}
                  >
                    <Text style={[styles.chipText, passId === null && { color: c.primary }]}>Keine</Text>
                  </Pressable>
                  {passes.map((p) => {
                    const selected = passId === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setPassId(p.id)}
                        style={[
                          styles.chip,
                          selected && { backgroundColor: c.primary + '22', borderColor: c.primary },
                        ]}
                      >
                        <Wallet size={15} color={c.primary} />
                        <Text style={[styles.chipText, selected && { color: c.primary }]}>{p.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <View>
              <Text style={styles.label}>NOTIZEN (TRICKS, WETTER, SETUP …)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Optionale Notizen"
                outlineColor={c.border}
                activeOutlineColor={c.primary}
                textColor={c.text}
                style={styles.input}
              />
            </View>

            <View>
              <Text style={styles.label}>KOSTEN (€)</Text>
              <TextInput
                value={cost}
                onChangeText={setCost}
                mode="outlined"
                keyboardType="numeric"
                placeholder="0,00"
                left={<TextInput.Icon icon={() => <Text style={{ color: c.textMuted, fontSize: 16 }}>€</Text>} />}
                outlineColor={c.border}
                activeOutlineColor={c.primary}
                textColor={c.text}
                style={styles.input}
              />
            </View>

            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <LinearGradient
                colors={c.fabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveInner}
              >
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.saveText}>Ride speichern</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );
}
