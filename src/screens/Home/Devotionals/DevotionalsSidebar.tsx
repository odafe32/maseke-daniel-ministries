import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemeText } from "@/src/components";
import { wp } from "@/src/utils";
import { useDevotionalList, useDevotionalDetail } from "@/src/hooks/useDevotionals";

export type DevotionalMonth = {
  id: string;
  name: string;
  days: number;
  devotionalId?: number;
  entries_count?: number;
  start_date?: string;
};

interface DevotionalsSidebarProps {
  visible: boolean;
  onClose: () => void;
  onSelectDay: (payload: { month: DevotionalMonth; day: number; devotionalId?: number }) => void;
  surfaceColor?: string;
  textColor?: string;
  accentColor?: string;
  onOpenNotes?: () => void;
}

export function DevotionalsSidebar({
  visible,
  onClose,
  onSelectDay,
  surfaceColor = "#fff",
  textColor = "#000",
  accentColor = "#EE8F5C",
  onOpenNotes,
}: DevotionalsSidebarProps) {
  const [selectedMonth, setSelectedMonth] = useState<DevotionalMonth | null>(null);
  const { devotionals, isLoading, loadDevotionals } = useDevotionalList();
  const { entries, isLoading: isLoadingEntries, loadDevotional } = useDevotionalDetail();

  useEffect(() => {
    if (visible && devotionals.length === 0) {
      loadDevotionals().catch(console.error);
    }
  }, [visible, devotionals.length, loadDevotionals]);

  useEffect(() => {
    if (selectedMonth?.devotionalId) {
      loadDevotional(selectedMonth.devotionalId).catch(console.error);
    }
  }, [selectedMonth?.devotionalId, loadDevotional]);

  const handleBack = () => setSelectedMonth(null);

  const renderList = () => {
    // Loading devotionals list
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading devotionals...</Text>
        </View>
      );
    }

    // Showing devotionals list
    if (!selectedMonth) {
      return devotionals.map((dev) => {
        const monthData: DevotionalMonth = {
          id: dev.id.toString(),
          name: dev.title,
          days: dev.duration_days || dev.entries_count || 30,
          devotionalId: dev.id,
          entries_count: dev.entries_count,
          start_date: dev.start_date,
        };
        return (
          <SidebarRow
            key={dev.id}
            label={dev.title}
            subtitle={dev.description}
            onPress={() => setSelectedMonth(monthData)}
            textColor={textColor}
            accentColor={accentColor}
          />
        );
      });
    }

    // Loading days for selected devotional
    if (isLoadingEntries) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading days...</Text>
        </View>
      );
    }

    // Showing days grid
    const days = entries.length > 0
      ? entries.map((e) => e.day_number)
      : Array.from({ length: selectedMonth.days }, (_, i) => i + 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <View style={styles.daysGrid}>
        {days.map((day) => {
          // Calculate the date for this day
          const dayDate = selectedMonth.start_date
            ? new Date(selectedMonth.start_date)
            : new Date();
          dayDate.setDate(dayDate.getDate() + (day - 1));
          dayDate.setHours(0, 0, 0, 0);

          const isFuture = dayDate > today;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCircle,
                { borderColor: `${accentColor}40` },
                isFuture ? { opacity: 0.5 } : {},
              ]}
              onPress={() => {
                if (isFuture) return; 
                onSelectDay({
                  month: selectedMonth,
                  day,
                  devotionalId: selectedMonth.devotionalId,
                });
                onClose();
                setSelectedMonth(null);
              }}
              disabled={isFuture}
            >
              <Text
                style={{
                  color: isFuture ? `${textColor}40` : textColor,
                  fontWeight: "600",
                }}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.sidebar, { backgroundColor: surfaceColor }]}>
          <View style={styles.header}>
            {selectedMonth ? (
              <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
                <Feather name="chevron-left" size={20} color={textColor} />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconSpacer} />
            )}

            <ThemeText variant="h3" style={[styles.headerTitle, { color: textColor }]}>
              {selectedMonth ? selectedMonth.name : "Devotionals"}
            </ThemeText>

            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Feather name="x" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list}>{renderList()}</ScrollView>

          {onOpenNotes && (
            <TouchableOpacity
              onPress={() => {
                onOpenNotes();
                onClose();
              }}
              style={[styles.notesRow, { borderTopColor: `${textColor}10` }]}
              activeOpacity={0.8}
            >
              <View style={styles.notesLeft}>
                <Feather name="bookmark" size={18} color={textColor} />
                <Text style={[styles.notesLabel, { color: textColor }]}>Notes</Text>
              </View>
              <Feather name="chevron-right" size={18} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

interface SidebarRowProps {
  label: string;
  subtitle?: string;
  onPress: () => void;
  textColor: string;
  accentColor: string;
}

const SidebarRow = ({ label, subtitle, onPress, textColor, accentColor }: SidebarRowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.rowContent}>
      <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
      {subtitle && (
        <Text style={[styles.rowSubtitle, { color: `${textColor}80` }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
    <Feather name="chevron-right" size={18} color={accentColor} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sidebar: { width: "75%", height: "100%", padding: wp(20) },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerTitle: { fontWeight: "bold", fontSize: 18 },
  iconButton: { padding: 8 },
  iconSpacer: { width: 36 },
  list: { paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  rowContent: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: { fontSize: 16, fontWeight: "500" },
  rowSubtitle: { fontSize: 13, marginTop: 4 },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "flex-start", paddingHorizontal: 8 },
  dayCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notesRow: {
    marginTop: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  notesLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});