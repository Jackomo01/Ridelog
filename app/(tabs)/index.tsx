import { ScrollView, Text, View, Pressable, Platform } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { EntryModal } from "@/components/entry-modal";
import { PassSuggestionModal } from "@/components/pass-suggestion-modal";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const colors = useColors();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedPasses, setSuggestedPasses] = useState<any[]>([]);
  const [showPassSuggestion, setShowPassSuggestion] = useState(false);
  const [currentActivityData, setCurrentActivityData] = useState<any>(null);

  const activitiesQuery = trpc.activities.list.useQuery();
  const passesQuery = trpc.passes.list.useQuery();
  
  const createActivityMutation = trpc.activities.create.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      activitiesQuery.refetch();
    },
  });

  const updatePassMutation = trpc.passes.updateVisits.useMutation({
    onSuccess: () => {
      passesQuery.refetch();
    },
  });

  // Refetch on screen focus
  useFocusEffect(
    useCallback(() => {
      activitiesQuery.refetch();
      passesQuery.refetch();
    }, [activitiesQuery, passesQuery])
  );

  const handleLocationChange = (location: string) => {
    if (!location || location.length < 2) {
      setSuggestedPasses([]);
      return;
    }
    const passes = passesQuery.data || [];
    const matching = passes.filter((pass: any) =>
      pass.name.toLowerCase().includes(location.toLowerCase())
    );
    setSuggestedPasses(matching);
  };

  const handleSaveActivity = async (data: any) => {
    try {
      const activityData = {
        date: new Date(data.date || Date.now()),
        location: data.location,
        category: data.category,
        notes: data.notes,
        cost: data.cost ? Math.round(parseFloat(data.cost) * 100) : undefined,
      };

      setCurrentActivityData(activityData);

      const matchingPasses = (passesQuery.data || []).filter((pass: any) =>
        pass.name.toLowerCase().includes(activityData.location.toLowerCase())
      );

      if (matchingPasses.length > 0) {
        setSuggestedPasses(matchingPasses);
        setShowPassSuggestion(true);
      } else {
        await createActivityMutation.mutateAsync(activityData);
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Aktivität:", error);
      alert("Fehler beim Speichern der Aktivität");
    }
  };

  const handleConfirmPass = async (passId: number) => {
    try {
      // BUGFIX: Schließe auch die Haupt-Modal und setze States zurück
      setIsModalOpen(false); 
      await createActivityMutation.mutateAsync(currentActivityData);
      await updatePassMutation.mutateAsync({ passId, increment: 1 });
      setShowPassSuggestion(false);
      setSuggestedPasses([]);
      setCurrentActivityData(null);
      
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Aktivität mit Pass:", error);
      alert("Fehler beim Speichern der Aktivität");
    }
  };

  const thisMonthCount = (activitiesQuery.data || []).filter((a: any) => {
    const actDate = new Date(a.date);
    const now = new Date();
    return actDate.getMonth() === now.getMonth() && actDate.getFullYear() === now.getFullYear();
  }).length;

  const thisYearCount = (activitiesQuery.data || []).filter((a: any) => {
    return new Date(a.date).getFullYear() === new Date().getFullYear();
  }).length;

  // BUGFIX: Nutze den tatsächlichen Nutzertyp (Youth/Adult) für korrekte Ersparnisberechnung
  const totalSavings = (passesQuery.data || []).reduce((sum: number, pass: any) => {
    const dayPrice = (pass.userGroup === "Youth" ? pass.youthDayPrice : pass.adultDayPrice) / 100;
    const savings = pass.visits * dayPrice - pass.purchasePrice / 100;
    return sum + Math.max(0, savings);
  }, 0);

  const recentActivities = (activitiesQuery.data || []).slice(0, 3);

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6 pb-4">
          <Text className="text-4xl font-bold text-foreground">Willkommen!</Text>
          <Text className="text-sm text-muted mt-1">Hier ist dein Überblick</Text>
        </View>

        <View className="px-4 gap-3 mb-6">
          <View className="flex-row gap-3">
            <View style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 16, padding: 16 }}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="calendar-today" size={18} color="white" />
                <Text className="text-xs font-semibold text-white opacity-90">Diesen Monat</Text>
              </View>
              <Text className="text-3xl font-bold text-white mt-2">{thisMonthCount}</Text>
            </View>

            <View style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 16, padding: 16 }}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="calendar-month" size={18} color="white" />
                <Text className="text-xs font-semibold text-white opacity-90">Dieses Jahr</Text>
              </View>
              <Text className="text-3xl font-bold text-white mt-2">{thisYearCount}</Text>
            </View>
          </View>

          <View style={{ backgroundColor: colors.success, borderRadius: 16, padding: 16 }} className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold text-white opacity-90">Gesamte Ersparnis</Text>
              <Text className="text-3xl font-bold text-white mt-1">€{totalSavings.toFixed(2)}</Text>
            </View>
            <MaterialIcons name="trending-up" size={40} color="white" style={{ opacity: 0.8 }} />
          </View>
        </View>

        {/* Recent Activities Section */}
        {recentActivities.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Letzte Aktivitäten</Text>
            <View className="gap-2">
              {recentActivities.map((activity: any) => (
                <View key={activity.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderLeftWidth: 4, borderLeftColor: colors.primary }}>
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{activity.location}</Text>
                      <Text className="text-xs text-muted mt-1">{activity.category}</Text>
                    </View>
                    <Text className="text-xs text-muted">{new Date(activity.date).toLocaleDateString("de-DE")}</Text>
                  </View>
                  {activity.notes && <Text className="text-xs text-muted mt-2 italic">{activity.notes}</Text>}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={async () => {
          if (Platform.OS !== "web") {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          setIsModalOpen(true);
        }}
        style={({ pressed }) => [
          {
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <MaterialIcons name="add" size={32} color="white" />
      </Pressable>

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveActivity}
        onLocationChange={handleLocationChange}
      />

      <PassSuggestionModal
        isOpen={showPassSuggestion}
        onClose={() => {
          setShowPassSuggestion(false);
          setSuggestedPasses([]);
        }}
        passes={suggestedPasses}
        onConfirm={handleConfirmPass}
        onSkip={async () => {
          if (currentActivityData) {
            await createActivityMutation.mutateAsync(currentActivityData);
            if (Platform.OS !== "web") {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
          setShowPassSuggestion(false);
          setSuggestedPasses([]);
          setCurrentActivityData(null);
        }}
      />
    </ScreenContainer>
  );
}
