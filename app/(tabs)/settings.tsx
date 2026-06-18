import { ScrollView, Text, View, TextInput, Pressable, Share, Platform } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";

export default function SettingsScreen() {
  const colors = useColors();

  // Pass form state
  const [passName, setPassName] = useState("");
  const [passPurchasePrice, setPassPurchasePrice] = useState("");
  const [passYouthPrice, setPassYouthPrice] = useState("");
  const [passAdultPrice, setPassAdultPrice] = useState("");
  const [passUserGroup, setPassUserGroup] = useState<"Youth" | "Adult">("Adult");
  const [passLoading, setPassLoading] = useState(false);

  // Bucket form state
  const [bucketTitle, setBucketTitle] = useState("");
  const [bucketCategory, setBucketCategory] = useState("");
  const [bucketPriority, setBucketPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [bucketLoading, setBucketLoading] = useState(false);

  // Export/Import state
  const [exportLoading, setExportLoading] = useState(false);

  // Queries for export
  const activitiesQuery = trpc.activities.list.useQuery();
  const passesQuery = trpc.passes.list.useQuery();
  const bucketItemsQuery = trpc.bucketItems.list.useQuery();

  // TRPC mutations
  const createPassMutation = trpc.passes.create.useMutation({
    onSuccess: () => {
      setPassName("");
      setPassPurchasePrice("");
      setPassYouthPrice("");
      setPassAdultPrice("");
      alert("Saisonkarte gespeichert!");
    },
  });

  const createBucketMutation = trpc.bucketItems.create.useMutation({
    onSuccess: () => {
      setBucketTitle("");
      setBucketCategory("");
      setBucketPriority("Medium");
      alert("Ziel hinzugefügt!");
    },
  });

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const data = {
        exportDate: new Date().toISOString(),
        activities: activitiesQuery.data || [],
        passes: passesQuery.data || [],
        bucketItems: bucketItemsQuery.data || [],
      };

      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `ridelog-backup-${new Date().toISOString().split("T")[0]}.json`;

      if (Platform.OS === "web") {
        // Web: Use clipboard or download
        try {
          await navigator.clipboard.writeText(jsonString);
          alert("Daten in Zwischenablage kopiert!");
        } catch {
          alert("JSON-Daten:\n\n" + jsonString.substring(0, 200) + "...");
        }
      } else {
        // iOS/Android: Use native Share API
        await Share.share({
          message: jsonString,
          title: fileName,
          url: undefined,
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Fehler beim Exportieren");
    } finally {
      setExportLoading(false);
    }
  };

  const handleSavePass = async () => {
    if (!passName || !passPurchasePrice || !passYouthPrice || !passAdultPrice) {
      alert("Bitte fülle alle Felder aus");
      return;
    }

    setPassLoading(true);
    try {
      await createPassMutation.mutateAsync({
        name: passName,
        purchasePrice: Math.round(parseFloat(passPurchasePrice) * 100),
        youthDayPrice: Math.round(parseFloat(passYouthPrice) * 100),
        adultDayPrice: Math.round(parseFloat(passAdultPrice) * 100),
        userGroup: passUserGroup,
      });
    } catch (error) {
      console.error("Failed to save pass:", error);
      alert("Fehler beim Speichern");
    } finally {
      setPassLoading(false);
    }
  };

  const handleSaveBucketItem = async () => {
    if (!bucketTitle || !bucketCategory) {
      alert("Bitte fülle alle Felder aus");
      return;
    }

    setBucketLoading(true);
    try {
      await createBucketMutation.mutateAsync({
        title: bucketTitle,
        category: bucketCategory,
        priority: bucketPriority,
        completed: 0,
      });
    } catch (error) {
      console.error("Failed to save bucket item:", error);
      alert("Fehler beim Speichern");
    } finally {
      setBucketLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-3xl font-bold text-foreground">Einstellungen</Text>
            <Text className="text-sm text-muted">Verwalte deine Daten</Text>
          </View>

          {/* Export Section */}
          <View className="gap-3 bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="download" size={24} color={colors.primary} />
              <Text className="text-lg font-semibold text-foreground flex-1">Daten exportieren</Text>
            </View>
            <Text className="text-sm text-muted">
              Exportiere alle deine Aktivitäten, Pässe und Ziele als JSON
            </Text>
            <Pressable
              onPress={handleExportData}
              disabled={exportLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text className="text-white font-semibold text-center">
                {exportLoading ? "Wird exportiert..." : "Exportieren"}
              </Text>
            </Pressable>
          </View>

          {/* Add Pass Section */}
          <View className="gap-3 bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="card-giftcard" size={24} color={colors.secondary} />
              <Text className="text-lg font-semibold text-foreground">Neue Saisonkarte</Text>
            </View>

            <TextInput
              placeholder="Name (z.B. Oberammergau)"
              placeholderTextColor={colors.muted}
              value={passName}
              onChangeText={setPassName}
              className="bg-surface2 border border-border rounded-lg p-3 text-foreground"
            />

            <TextInput
              placeholder="Kaufpreis (€)"
              placeholderTextColor={colors.muted}
              value={passPurchasePrice}
              onChangeText={setPassPurchasePrice}
              keyboardType="decimal-pad"
              className="bg-surface2 border border-border rounded-lg p-3 text-foreground"
            />

            <View className="flex-row gap-2">
              <TextInput
                placeholder="Jugend Tagespreis (€)"
                placeholderTextColor={colors.muted}
                value={passYouthPrice}
                onChangeText={setPassYouthPrice}
                keyboardType="decimal-pad"
                className="flex-1 bg-surface2 border border-border rounded-lg p-3 text-foreground"
              />
              <TextInput
                placeholder="Erwachsenen Tagespreis (€)"
                placeholderTextColor={colors.muted}
                value={passAdultPrice}
                onChangeText={setPassAdultPrice}
                keyboardType="decimal-pad"
                className="flex-1 bg-surface2 border border-border rounded-lg p-3 text-foreground"
              />
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setPassUserGroup("Youth")}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: passUserGroup === "Youth" ? colors.primary : colors.surface2,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  className={`text-center font-semibold ${
                    passUserGroup === "Youth" ? "text-white" : "text-foreground"
                  }`}
                >
                  Jugend
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPassUserGroup("Adult")}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: passUserGroup === "Adult" ? colors.primary : colors.surface2,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  className={`text-center font-semibold ${
                    passUserGroup === "Adult" ? "text-white" : "text-foreground"
                  }`}
                >
                  Erwachsener
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleSavePass}
              disabled={passLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.success,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text className="text-white font-semibold text-center">
                {passLoading ? "Wird gespeichert..." : "Saisonkarte speichern"}
              </Text>
            </Pressable>
          </View>

          {/* Add Bucket Item Section */}
          <View className="gap-3 bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="flag" size={24} color={colors.warning} />
              <Text className="text-lg font-semibold text-foreground">Neues Ziel</Text>
            </View>

            <TextInput
              placeholder="Titel (z.B. Backflip lernen)"
              placeholderTextColor={colors.muted}
              value={bucketTitle}
              onChangeText={setBucketTitle}
              className="bg-surface2 border border-border rounded-lg p-3 text-foreground"
            />

            <TextInput
              placeholder="Kategorie (z.B. Tricks)"
              placeholderTextColor={colors.muted}
              value={bucketCategory}
              onChangeText={setBucketCategory}
              className="bg-surface2 border border-border rounded-lg p-3 text-foreground"
            />

            <View className="flex-row gap-2">
              {(["High", "Medium", "Low"] as const).map((priority) => (
                <Pressable
                  key={priority}
                  onPress={() => setBucketPriority(priority)}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor:
                        bucketPriority === priority
                          ? priority === "High"
                            ? colors.error
                            : priority === "Medium"
                              ? colors.warning
                              : colors.success
                          : colors.surface2,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    className={`text-center font-semibold text-xs ${
                      bucketPriority === priority ? "text-white" : "text-foreground"
                    }`}
                  >
                    {priority === "High" ? "Hoch" : priority === "Medium" ? "Mittel" : "Niedrig"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleSaveBucketItem}
              disabled={bucketLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.warning,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text className="text-white font-semibold text-center">
                {bucketLoading ? "Wird gespeichert..." : "Ziel speichern"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
