import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface PassSuggestion {
  id: number;
  name: string;
  purchasePrice: number;
  youthDayPrice: number;
  adultDayPrice: number;
  userGroup: string;
  visits: number;
  breakEvenVisits: number;
}

interface PassSuggestionModalProps {
  isOpen: boolean;
  passes: PassSuggestion[];
  onConfirm: (passId: number) => Promise<void>;
  onSkip: () => void;
  onClose: () => void;
}

export function PassSuggestionModal({
  isOpen,
  passes,
  onConfirm,
  onSkip,
  onClose,
}: PassSuggestionModalProps) {
  const colors = useColors();
  const [selectedPassId, setSelectedPassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedPassId) return;

    setLoading(true);
    try {
      await onConfirm(selectedPassId);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setSelectedPassId(null);
      onClose();
    } catch (error) {
      console.error("Fehler beim Bestätigen der Saisonkarte:", error);
      alert("Fehler beim Speichern der Saisonkarte");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await onSkip();
      setSelectedPassId(null);
      onClose();
    } catch (error) {
      console.error("Fehler beim Überspringen:", error);
      alert("Fehler beim Speichern der Aktivität");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 20,
            width: "100%",
            maxWidth: 400,
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground }}>
              Saisonkarte erkannt! 🎉
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
              Wir haben Saisonkarten gefunden. Möchtest du die Besuche hinzurechnen?
            </Text>
          </View>

          {/* Suggested Passes */}
          <ScrollView style={{ maxHeight: 300, marginBottom: 16 }}>
            {(passes || []).map((pass: any) => {
              const isSelected = selectedPassId === pass?.id;
              const savings = (pass?.visits || 0) * (pass?.adultDayPrice || 0) - (pass?.purchasePrice || 0);
              const isBroken = (pass?.visits || 0) >= (pass?.breakEvenVisits || 0);

              return (
                <Pressable
                  key={pass.id}
                  onPress={() => setSelectedPassId(pass.id)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: isSelected ? colors.background : colors.foreground,
                        }}
                      >
                        {pass.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: isSelected ? colors.background : colors.muted,
                          marginTop: 4,
                        }}
                      >
                        {pass.visits + 1} Besuche nach dieser Aktivität
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: isSelected ? colors.background : colors.muted,
                          marginTop: 2,
                        }}
                      >
                        Break-Even: {pass.breakEvenVisits} Besuche
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
                      {isBroken && (
                        <View
                          style={{
                            backgroundColor: colors.success,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontSize: 10, color: colors.background, fontWeight: "600" }}>
                            ✓ Break-Even
                          </Text>
                        </View>
                      )}
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: isSelected ? colors.background : colors.primary,
                        }}
                      >
                        €{(savings / 100).toFixed(2)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: isSelected ? colors.background : colors.muted,
                        }}
                      >
                        Ersparnis
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={handleSkip}
              disabled={loading}
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor: colors.surface,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed || loading ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                {loading ? "Lädt..." : "Überspringen"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={!selectedPassId || loading}
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor: selectedPassId ? colors.primary : colors.muted,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: pressed || loading || !selectedPassId ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.background }}>
                {loading ? "Speichert..." : "Bestätigen"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
