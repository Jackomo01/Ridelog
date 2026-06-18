import { ScrollView, View, Text, Pressable, Platform } from "react-native";
import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface BucketItem {
  id: number;
  title: string;
  category?: string;
  priority: "High" | "Medium" | "Low";
  completed: number;
}

const getPriorityColor = (priority: string, colors: any) => {
  switch (priority) {
    case "High":
      return colors.error;
    case "Medium":
      return colors.warning;
    case "Low":
      return colors.success;
    default:
      return colors.primary;
  }
};

export default function BucketScreen() {
  const colors = useColors();
  const [items, setItems] = useState<BucketItem[]>([]);

  // TRPC queries and mutations
  const bucketQuery = trpc.bucketItems.list.useQuery();
  const updateItemMutation = trpc.bucketItems.update.useMutation({
    onSuccess: () => bucketQuery.refetch(),
  });
  const deleteItemMutation = trpc.bucketItems.delete.useMutation({
    onSuccess: () => bucketQuery.refetch(),
  });

  // Update local state when query data changes
  useEffect(() => {
    if (bucketQuery.data) {
      setItems(bucketQuery.data as BucketItem[]);
    }
  }, [bucketQuery.data]);

  // Refetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      bucketQuery.refetch();
    }, [bucketQuery])
  );

  const handleToggleComplete = async (id: number, completed: number) => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await updateItemMutation.mutateAsync({
        id,
        data: { completed: completed === 1 ? 0 : 1 },
      });
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      await deleteItemMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const completedItems = items.filter((i) => i.completed === 1);
  const pendingItems = items.filter((i) => i.completed === 0);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground">Ziele</Text>
            <Text className="text-sm text-muted mt-1">
              {completedItems.length} von {items.length} erledigt
            </Text>
          </View>

          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <View className="gap-2">
              <Text className="text-lg font-semibold text-foreground">Offen</Text>
              {pendingItems.map((item) => (
                <View
                  key={item.id}
                  className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between"
                >
                  <Pressable
                    onPress={() => handleToggleComplete(item.id, item.completed)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: getPriorityColor(item.priority, colors),
                        backgroundColor: "transparent",
                      }}
                    />
                  </Pressable>

                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-semibold text-foreground">
                      {item.title}
                    </Text>
                    {item.category && (
                      <Text className="text-xs text-muted mt-1">{item.category}</Text>
                    )}
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: getPriorityColor(item.priority, colors),
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: colors.background,
                      }}
                    >
                      {item.priority === "High"
                        ? "Hoch"
                        : item.priority === "Medium"
                        ? "Mittel"
                        : "Niedrig"}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <MaterialIcons name="close" size={20} color={colors.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <View className="gap-2">
              <Text className="text-lg font-semibold text-foreground">Erledigt</Text>
              {completedItems.map((item) => (
                <View
                  key={item.id}
                  className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between opacity-60"
                >
                  <Pressable
                    onPress={() => handleToggleComplete(item.id, item.completed)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: colors.success,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MaterialIcons name="check" size={16} color={colors.background} />
                    </View>
                  </Pressable>

                  <View className="flex-1 ml-3">
                    <Text
                      className="text-sm font-semibold text-foreground"
                      style={{ textDecorationLine: "line-through" }}
                    >
                      {item.title}
                    </Text>
                    {item.category && (
                      <Text className="text-xs text-muted mt-1">{item.category}</Text>
                    )}
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: getPriorityColor(item.priority, colors),
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: colors.background,
                      }}
                    >
                      {item.priority === "High"
                        ? "Hoch"
                        : item.priority === "Medium"
                        ? "Mittel"
                        : "Niedrig"}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <MaterialIcons name="close" size={20} color={colors.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-sm text-muted">Keine Ziele vorhanden</Text>
              <Text className="text-xs text-muted mt-1">
                Füge ein neues Ziel in den Einstellungen hinzu
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
