import React, { useState } from "react"; // Removed useMemo
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemeText } from "@/src/components";
import { wp } from "@/src/utils";

export type DevotionalMonth = {
  id: string;
  name: string;
  days: number;
};

interface DevotionalsSidebarProps {
  visible: boolean;
  onClose: () => void;
  onSelectDay: (payload: { month: DevotionalMonth; day: number }) => void;
  surfaceColor?: string;
  textColor?: string;
  accentColor?: string;
}

const MONTHS: DevotionalMonth[] = [
  { id: "1", name: "January", days: 31 },
  { id: "2", name: "February", days: 28 },
  { id: "3", name: "March", days: 31 },
  { id: "4", name: "April", days: 30 },
  { id: "5", name: "May", days: 31 },
  { id: "6", name: "June", days: 30 },
  { id: "7", name: "July", days: 31 },
  { id: "8", name: "August", days: 31 },
  { id: "9", name: "September", days: 30 },
  { id: "10", name: "October", days: 31 },
  { id: "11", name: "November", days: 30 },
  { id: "12", name: "December", days: 31 },
];

export function DevotionalsSidebar({
  visible,
  onClose,
  onSelectDay,
  surfaceColor = "#fff",
  textColor = "#000",
  accentColor = "#EE8F5C",
}: DevotionalsSidebarProps) {
  const [selectedMonth, setSelectedMonth] = useState<DevotionalMonth | null>(null);

  const handleBack = () => setSelectedMonth(null);

  const renderList = () => {
    if (!selectedMonth) {
      return MONTHS.map((month) => (
        <SidebarRow
          key={month.id}
          label={month.name}
          onPress={() => setSelectedMonth(month)}
          textColor={textColor}
          accentColor={accentColor}
        />
      ));
    }

    const days = Array.from({ length: selectedMonth.days }, (_, i) => i + 1);
    return (
      <View style={styles.daysGrid}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayCircle, { borderColor: `${accentColor}40` }]}
            onPress={() => {
              onSelectDay({ month: selectedMonth, day });
              onClose();
              setSelectedMonth(null);
            }}
          >
            <Text style={{ color: textColor, fontWeight: "600" }}>{day}</Text>
          </TouchableOpacity>
        ))}
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
              {selectedMonth ? selectedMonth.name : "Months"}
            </ThemeText>

            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Feather name="x" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list}>{renderList()}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Fixed 'any' in SidebarRow
interface SidebarRowProps {
  label: string;
  onPress: () => void;
  textColor: string;
  accentColor: string;
}

const SidebarRow = ({ label, onPress, textColor, accentColor }: SidebarRowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
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
  rowLabel: { fontSize: 16, fontWeight: "500" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  dayCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});