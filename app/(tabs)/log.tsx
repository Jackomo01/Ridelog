import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { EditActivityModal } from "@/components/edit-activity-modal";
import { SwipeableActivityItem } from "@/components/swipeable-activity-item";
import { trpc } from "@/lib/trpc";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { View, Text, ScrollView, Pressable } from "react-native";

interface Activity {
  id: number;
  date: Date;
  location: string;
  category: string;
  notes?: string;
  cost?: number;
}

const CATEGORIES = ["Bikepark", "Mountainbike", "Skifahren", "Laufen", "Sonstiges"];

export default function LogScreen() {
  const colors = useColors();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>();
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Use TRPC hooks
  const activitiesQuery = trpc.activities.list.useQuery();
  const updateActivityMutation = trpc.activities.update.useMutation();
  const deleteActivityMutation = trpc.activities.delete.useMutation();

  // Update local state when query data changes
  useEffect(() => {
    console.log("Activities query data updated:", activitiesQuery.data);
    if (activitiesQuery.data) {
      const sorted = (activitiesQuery.data as Activity[]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      console.log("Setting activities:", sorted);
      setActivities(sorted);
    }
  }, [activitiesQuery.data]);

  // Refetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log("Log screen focused, refetching activities...");
      activitiesQuery.refetch();
    }, [activitiesQuery])
  );

  const handleActivityPress = (activity: Activity) => {
    setEditingActivity(activity);
    setEditModalVisible(true);
  };

  const handleSaveActivity = async (data: {
    id: number;
    location: string;
    category: string;
    notes?: string;
    cost?: number;
  }) => {
    try {
      await updateActivityMutation.mutateAsync(data);
      activitiesQuery.refetch();
    } catch (error) {
      console.error("Failed to update activity:", error);
      throw error;
    }
  };

  const handleDeleteActivity = async (id: number) => {
    try {
      await deleteActivityMutation.mutateAsync(id);
      activitiesQuery.refetch();
    } catch (error) {
      console.error("Failed to delete activity:", error);
      throw error;
    }
  };

  const filteredActivities = selectedCategory
    ? activities.filter((a) => a.category === selectedCategory)
    : activities;

  return (
    <>
      <ScreenContainer className="p-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4">
            {/* Header */}
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-bold text-foreground">Logbuch</Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setViewMode("list")}
                  style={({ pressed }) => [
                    {
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor:
                        viewMode === "list" ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="list"
                    size={20}
                    color={viewMode === "list" ? colors.background : colors.foreground}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setViewMode("calendar")}
                  style={({ pressed }) => [
                    {
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor:
                        viewMode === "calendar" ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="calendar-month"
                    size={20}
                    color={viewMode === "calendar" ? colors.background : colors.foreground}
                  />
                </Pressable>
              </View>
            </View>

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <Pressable
                onPress={() => setSelectedCategory(null)}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      selectedCategory === null ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      selectedCategory === null ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color:
                      selectedCategory === null
                        ? colors.background
                        : colors.foreground,
                  }}
                >
                  Alle
                </Text>
              </Pressable>
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

            {/* Activities List */}
            {filteredActivities.length > 0 ? (
              <View>
                {filteredActivities.map((activity) => (
                  <SwipeableActivityItem
                    key={activity.id}
                    activity={activity}
                    onPress={() => handleActivityPress(activity)}
                    onDelete={() => handleDeleteActivity(activity.id)}
                    onUndo={() => activitiesQuery.refetch()}
                  />
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-lg p-6 border border-border items-center">
                <MaterialIcons name="inbox" size={48} color={colors.muted} />
                <Text className="text-muted text-center mt-4">
                  {selectedCategory
                    ? `Keine ${selectedCategory}-Aktivitäten`
                    : "Noch keine Aktivitäten"}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* Edit Activity Modal */}
      <EditActivityModal
        visible={editModalVisible}
        activity={editingActivity}
        onClose={() => {
          setEditModalVisible(false);
          setEditingActivity(undefined);
        }}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
      />
    </>
  );
}
