import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const CATEGORIES = ["Bikepark", "Mountainbike", "Skifahren", "Laufen", "Sonstiges"];

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    location: string;
    category: string;
    notes?: string;
    cost?: number;
  }) => Promise<void>;
  onLocationChange?: (location: string) => void;
}

export function EntryModal({ isOpen, onClose, onSave, onLocationChange }: EntryModalProps) {
  const colors = useColors();
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Bikepark");
  const [notes, setNotes] = useState("");
  const [costInput, setCostInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!location.trim()) {
      alert("Bitte gib einen Ort ein");
      return;
    }

    setLoading(true);
    try {
      const cost = costInput ? Math.round(parseFloat(costInput) * 100) : undefined;
      await onSave({
        location: location.trim(),
        category: selectedCategory,
        notes: notes.trim() || undefined,
        cost,
      });

      // Reset form
      setLocation("");
      setSelectedCategory("Bikepark");
      setNotes("");
      setCostInput("");

      // Haptic feedback
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern der Aktivität:", error);
      alert("Fehler beim Speichern der Aktivität");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setLocation("");
    setSelectedCategory("Bikepark");
    setNotes("");
    setCostInput("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
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
          onPress={handleClose}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />

        {/* Modal Content - Simple View structure */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
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
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              Neue Aktivität
            </Text>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 16,
            }}
          >
            {/* Location Input */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                Ort
              </Text>
              <TextInput
                placeholder="z.B. Gravity Park"
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
                  onLocationChange?.(text);
                }}
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Category Selection */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                Sportart
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={({ pressed }) => [
                      {
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor:
                          selectedCategory === cat ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor:
                          selectedCategory === cat ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color:
                          selectedCategory === cat
                            ? colors.background
                            : colors.foreground,
                      }}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Notes Input */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                Notizen (optional)
              </Text>
              <TextInput
                placeholder="z.B. Großartig! Neue Tricks gelernt"
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 16,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Cost Input */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                Kosten (optional, in €)
              </Text>
              <TextInput
                placeholder="z.B. 25.50"
                value={costInput}
                onChangeText={setCostInput}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={handleClose}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: pressed || loading ? 0.7 : 1,
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  Abbrechen
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={loading || !location.trim()}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    opacity:
                      pressed || loading || !location.trim() ? 0.7 : 1,
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.background,
                  }}
                >
                  {loading ? "Speichern..." : "Speichern"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
