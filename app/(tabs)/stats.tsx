import { ScrollView, View, Text } from "react-native";
import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

interface Activity {
  id: number;
  date: Date;
  category: string;
}

export default function StatsScreen() {
  const colors = useColors();
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [categoryRanking, setCategoryRanking] = useState<
    Array<{ category: string; count: number }>
  >([]);

  // Use TRPC hook for activities
  const activitiesQuery = trpc.activities.list.useQuery();

  // Calculate stats when data changes
  useEffect(() => {
    if (!activitiesQuery.data) return;

    try {
      const activities = activitiesQuery.data as Activity[];

      // Build heatmap data for last 14 days
      const heatmap: Record<string, number> = {};
      activities.forEach((a) => {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        const dateStr = d.toISOString().split("T")[0];
        heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
      });
      setHeatmapData(heatmap);

      // Build category ranking
      const categoryCount: Record<string, number> = {};
      activities.forEach((a) => {
        categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
      });

      const ranking = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      setCategoryRanking(ranking);
    } catch (error) {
      console.error("Failed to calculate stats:", error);
    }
  }, [activitiesQuery.data]);

  // Refetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      activitiesQuery.refetch();
    }, [activitiesQuery])
  );

  // Render heatmap grid for last 14 days
  const renderHeatmapGrid = () => {
    const cells = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = heatmapData[dateStr] || 0;

      const intensity = Math.min(count, 3); // Max 3 for color intensity
      
      // BUGFIX: Fortschrittliche Opacity/Farb-Abstufung statt Einheitsfarbe
      let backgroundColor = colors.border;
      let opacity = 1;
      
      if (intensity === 1) {
        backgroundColor = colors.primary;
        opacity = 0.4;
      } else if (intensity === 2) {
        backgroundColor = colors.primary;
        opacity = 0.7;
      } else if (intensity >= 3) {
        backgroundColor = colors.primary;
        opacity = 1;
      }

      cells.push(
        <View
          key={dateStr}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: backgroundColor,
            opacity: opacity,
            margin: 2,
          }}
        />
      );
    }

    return cells;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <Text className="text-2xl font-bold text-foreground">Statistiken</Text>

          {/* Heatmap Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Aktivität (letzte 14 Tage)
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {renderHeatmapGrid()}
            </View>
          </View>

          {/* Category Ranking */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Sportarten Ranking
            </Text>
            {categoryRanking.length > 0 ? (
              <View className="gap-2">
                {categoryRanking.map((item, index) => (
                  <View
                    key={item.category}
                    className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {index + 1}. {item.category}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.background,
                        }}
                      >
                        {item.count}x
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-lg p-6 border border-border items-center">
                <Text className="text-sm text-muted">Keine Daten vorhanden</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
