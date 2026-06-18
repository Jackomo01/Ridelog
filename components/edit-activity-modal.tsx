import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const CATEGORIES = ["Bikepark", "Mountainbike", "Skifahren", "Laufen", "Sonstiges"];

interface EditActivityModalProps {
  visible: boolean;
  activity?: {
    id: number;
    date: Date;
    location: string;
    category: string;
    notes?: string;
    cost?: number;
  };
  onClose: () => void;
  onSave: (data: {
    id: number;
    location: string;
    category: string;
    notes?: string;
    cost?: number;
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function EditActivityModal({
  visible,
  activity,
  onClose,
  onSave,
  onDelete,
}: EditActivityModalProps) {
  const colors = useColors();
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Bikepark");
  const [notes, setNotes] = useState("");
  const [costInput, setCostInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (activity && visible) {
      setLocation(activity.location);
      setSelectedCategory(activity.category);
      setNotes(activity.notes || "");
      setCostInput(activity.cost ? (activity.cost / 100).toString() : "");
    }
  }, [activity, visible]);

  const handleSave = async () => {
    if (!location.trim()) {
      alert("Bitte gib einen Ort ein");
      return;
    }

    setLoading(true);
    try {
      const cost = costInput ? Math.round(parseFloat(costInput) * 100) : undefined;
      await onSave({
        id: activity!.id,
        location: location.trim(),
        category: selectedCategory,
        notes: notes.trim() || undefined,
        cost,
      });

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save activity:", error);
      alert("Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(activity!.id);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete activity:", error);
      alert("Fehler beim Löschen");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Overlay */}
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onPress={handleClose}
        />

        {/* Modal Content */}
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "85%",
            paddingTop: 16,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground }}>
              Aktivität bearbeiten
            </Text>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialIcons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            {/* Location Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Ort *
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 16,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                }}
                placeholder="z.B. Bikepark Oberammergau"
                placeholderTextColor={colors.muted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Category Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Kategorie
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={({ pressed }) => [
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor:
                          selectedCategory === cat ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: selectedCategory === cat ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: selectedCategory === cat ? colors.background : colors.foreground,
                      }}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Notes Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Notizen (optional)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 16,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
                placeholder="Notizen zur Aktivität..."
                placeholderTextColor={colors.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* Cost Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Kosten (optional)
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: colors.foreground, marginRight: 8 }}>€</Text>
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={costInput}
                  onChangeText={setCostInput}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>
              {/* Save Button */}
              <Pressable
                onPress={handleSave}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    opacity: pressed || loading ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.background }}>
                  {loading ? "Speichern..." : "Speichern"}
                </Text>
              </Pressable>

              {/* Delete Button */}
              <Pressable
                onPress={() => setShowDeleteConfirm(true)}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.error,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    opacity: pressed || loading ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.background }}>
                  Löschen
                </Text>
              </Pressable>

              {/* Cancel Button */}
              <Pressable
                onPress={handleClose}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
                  Abbrechen
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal visible={showDeleteConfirm} transparent animationType="fade">
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowDeleteConfirm(false)}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 16,
                padding: 20,
                width: "80%",
                maxWidth: 300,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
                Aktivität löschen?
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 20 }}>
                Diese Aktion kann nicht rückgängig gemacht werden.
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      backgroundColor: colors.surface,
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                    Abbrechen
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDelete}
                  disabled={loading}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      backgroundColor: colors.error,
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: "center",
                      opacity: pressed || loading ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.background }}>
                    {loading ? "Löschen..." : "Löschen"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
}
