import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  PanResponder,
  Platform,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface SwipeableActivityItemProps {
  activity: {
    id: number;
    date: Date;
    location: string;
    category: string;
    notes?: string;
    cost?: number;
  };
  onPress: () => void;
  onDelete: () => void;
  onUndo: () => void;
}

export function SwipeableActivityItem({
  activity,
  onPress,
  onDelete,
  onUndo,
}: SwipeableActivityItemProps) {
  const colors = useColors();
  const [isDeleted, setIsDeleted] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const swipeX = useRef(new Animated.Value(0)).current;
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, { dx }) => Math.abs(dx) > 10,
      onPanResponderMove: (evt, { dx }) => {
        // Only allow swiping left (negative dx)
        if (dx < 0) {
          swipeX.setValue(Math.max(dx, -100));
        }
      },
      onPanResponderRelease: (evt, { dx, vx }) => {
        // If swiped more than 50px or with velocity, show delete
        if (dx < -50 || vx < -0.5) {
          Animated.timing(swipeX, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.timing(swipeX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = async () => {
    if (Platform.OS !== "web") {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {
        // Haptics not available on web
      }
    }

    setIsDeleted(true);
    setShowUndo(true);

    // Clear previous timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Set new timeout for auto-delete (3 seconds)
    undoTimeoutRef.current = setTimeout(() => {
      onDelete();
    }, 3000);
  };

  const handleUndo = () => {
    if (undoTimeoutRef.current !== null) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    setIsDeleted(false);
    setShowUndo(false);

    Animated.timing(swipeX, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    onUndo();
  };

  if (isDeleted) {
    return (
      <View
        style={{
          backgroundColor: colors.error,
          borderRadius: 12,
          padding: 16,
          marginBottom: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: colors.background, fontWeight: "500" }}>
          Aktivität gelöscht
        </Text>
        <Pressable
          onPress={handleUndo}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={{ fontSize: 14, color: colors.background, fontWeight: "600" }}>
            Rückgängig
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 8, overflow: "hidden", borderRadius: 12 }}>
      {/* Delete Background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 100,
          backgroundColor: colors.error,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
        }}
      >
        <MaterialIcons name="delete" size={24} color={colors.background} />
      </View>

      {/* Swipeable Content */}
      <Animated.View
        style={{
          transform: [{ translateX: swipeX }],
        }}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                  {activity.location}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                  {activity.category} • {new Date(activity.date).toLocaleDateString("de-DE")}
                </Text>
                {activity.notes && (
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
                    {activity.notes}
                  </Text>
                )}
              </View>
              {activity.cost && (
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary, marginLeft: 12 }}>
                  €{(activity.cost / 100).toFixed(2)}
                </Text>
              )}
            </View>

            {/* Swipe Hint */}
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 8, textAlign: "right" }}>
              Wischen zum Löschen
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Delete Button (visible when swiped) */}
      <Animated.View
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 100,
          justifyContent: "center",
          alignItems: "center",
          opacity: swipeX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
          }),
        }}
      >
        <Pressable
          onPress={handleDelete}
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons name="delete" size={24} color={colors.background} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
