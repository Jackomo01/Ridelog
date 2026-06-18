import { ScrollView, View, Text, Pressable } from "react-native";
import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";

interface Pass {
  id: number;
  name: string;
  purchasePrice: number;
  youthDayPrice: number;
  adultDayPrice: number;
  userGroup: "Youth" | "Adult";
  visits: number;
}

export default function PassesScreen() {
  const colors = useColors();
  const [passes, setPasses] = useState<Pass[]>([]);

  // TRPC queries and mutations
  const passesQuery = trpc.passes.list.useQuery();
  const updateVisitsMutation = trpc.passes.updateVisits.useMutation({
    onSuccess: () => passesQuery.refetch(),
  });
  const deletePassMutation = trpc.passes.delete.useMutation({
    onSuccess: () => passesQuery.refetch(),
  });

  // Update local state when query data changes
  useEffect(() => {
    if (passesQuery.data) {
      setPasses(passesQuery.data as Pass[]);
    }
  }, [passesQuery.data]);

  // Refetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      passesQuery.refetch();
    }, [passesQuery])
  );

  const handleIncrement = async (id: number, visits: number) => {
    try {
      await updateVisitsMutation.mutateAsync({ id, visits: visits + 1 });
    } catch (error) {
      console.error("Failed to update visits:", error);
    }
  };

  const handleDecrement = async (id: number, visits: number) => {
    if (visits > 0) {
      try {
        await updateVisitsMutation.mutateAsync({ id, visits: visits - 1 });
      } catch (error) {
        console.error("Failed to update visits:", error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePassMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete pass:", error);
    }
  };

  const calculateStats = (pass: Pass) => {
    const dayPrice =
      pass.userGroup === "Youth" ? pass.youthDayPrice : pass.adultDayPrice;
    const breakEven = Math.ceil(pass.purchasePrice / dayPrice);
    const savings = Math.max(0, pass.visits * dayPrice - pass.purchasePrice);
    const progress = Math.min(100, (pass.visits / breakEven) * 100);

    return { breakEven, savings, progress };
  };

  const totalSavings = passes.reduce((sum, pass) => {
    return sum + calculateStats(pass).savings;
  }, 0);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-2xl font-bold text-foreground">Pass-Rechner</Text>
            <Text className="text-sm text-muted">
              Gesamtersparnis: €{(totalSavings / 100).toFixed(2)}
            </Text>
          </View>

          {/* Passes List */}
          {passes.length > 0 ? (
            <View className="gap-3">
              {passes.map((pass) => {
                const { breakEven, savings, progress } = calculateStats(pass);
                const dayPrice =
                  pass.userGroup === "Youth"
                    ? pass.youthDayPrice
                    : pass.adultDayPrice;

                return (
                  <View
                    key={pass.id}
                    className="bg-surface rounded-lg p-4 border border-border gap-3"
                  >
                    {/* Pass Header */}
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {pass.name}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {pass.userGroup === "Youth" ? "Jugend" : "Erwachsener"} •{" "}
                          €{(pass.purchasePrice / 100).toFixed(2)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDelete(pass.id)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      >
                        <MaterialIcons
                          name="delete"
                          size={20}
                          color={colors.error}
                        />
                      </Pressable>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row gap-2">
                      <View className="flex-1 bg-background rounded-lg p-2 items-center">
                        <Text className="text-xs text-muted">Besuche</Text>
                        <Text className="text-lg font-bold text-primary">
                          {pass.visits}
                        </Text>
                      </View>
                      <View className="flex-1 bg-background rounded-lg p-2 items-center">
                        <Text className="text-xs text-muted">Break-Even</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {breakEven}
                        </Text>
                      </View>
                      <View className="flex-1 bg-background rounded-lg p-2 items-center">
                        <Text className="text-xs text-muted">Ersparnis</Text>
                        <Text className="text-lg font-bold text-success">
                          €{(savings / 100).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="gap-1">
                      <View
                        style={{
                          height: 8,
                          backgroundColor: colors.border,
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            height: "100%",
                            width: `${progress}%`,
                            backgroundColor: colors.primary,
                          }}
                        />
                      </View>
                      <Text className="text-xs text-muted text-center">
                        {progress.toFixed(0)}% zum Break-Even
                      </Text>
                    </View>

                    {/* Visit Controls */}
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleDecrement(pass.id, pass.visits)}
                        disabled={pass.visits === 0}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 8,
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: "center",
                            opacity: pressed || pass.visits === 0 ? 0.6 : 1,
                          },
                        ]}
                      >
                        <MaterialIcons name="remove" size={20} color={colors.foreground} />
                      </Pressable>

                      <View
                        style={{
                          flex: 2,
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor: colors.background,
                          borderWidth: 1,
                          borderColor: colors.border,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text className="font-semibold text-foreground">
                          {pass.visits} Besuche
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => handleIncrement(pass.id, pass.visits)}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 8,
                            backgroundColor: colors.primary,
                            alignItems: "center",
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <MaterialIcons name="add" size={20} color={colors.background} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-sm text-muted">Keine Saisonkarten vorhanden</Text>
              <Text className="text-xs text-muted mt-1">
                Füge eine neue Saisonkarte in den Einstellungen hinzu
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
