// app/(main)/statistics.tsx
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PieChart,
  StackedBarChart,
} from "react-native-chart-kit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import dayjs from "dayjs";

const screenWidth = Dimensions.get("window").width - 48;

export default function StatisticsPage() {
  const [selectedTab, setSelectedTab] = useState<"weekly" | "monthly">("monthly");
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Firestore'dan ürünleri çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        processData(list);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Verileri işle (haftalık, aylık, kategori)
  const processData = (products: any[]) => {
    const now = dayjs();
    const startOfWeek = now.startOf("week");
    const startOfMonth = now.startOf("month");

    // Haftalık istatistik
    const weeklyCounts: any = {};
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, "day").format("ddd");
      weeklyCounts[day] = { saved: 0, wasted: 0 };
    }

    // Aylık istatistik
    const monthlyCounts: any = {};
    for (let i = 0; i < 6; i++) {
      const month = now.subtract(i, "month").format("MMM");
      monthlyCounts[month] = { saved: 0, wasted: 0 };
    }

    // Kategori istatistik
    const categoryCounts: any = {};

    products.forEach((p) => {
      const expiry = dayjs(p.expiryDate);
      const isWasted = expiry.isBefore(now);
      const category = p.category || "Other";

      // Haftalık hesap
      const day = expiry.format("ddd");
      if (weeklyCounts[day]) {
        if (isWasted) weeklyCounts[day].wasted++;
        else weeklyCounts[day].saved++;
      }

      // Aylık hesap
      const month = expiry.format("MMM");
      if (monthlyCounts[month]) {
        if (isWasted) monthlyCounts[month].wasted++;
        else monthlyCounts[month].saved++;
      }

      // Kategori hesap
      if (!categoryCounts[category]) categoryCounts[category] = { saved: 0, wasted: 0 };
      if (isWasted) categoryCounts[category].wasted++;
      else categoryCounts[category].saved++;
    });

    // State'e aktar
    setWeeklyData(
      Object.keys(weeklyCounts).map((day) => ({
        day,
        saved: weeklyCounts[day].saved,
        wasted: weeklyCounts[day].wasted,
      }))
    );

    setMonthlyData(
      Object.keys(monthlyCounts)
        .reverse()
        .map((month) => ({
          month,
          saved: monthlyCounts[month].saved,
          wasted: monthlyCounts[month].wasted,
        }))
    );

    setCategoryData(
      Object.keys(categoryCounts).map((cat) => ({
        name: cat,
        value: categoryCounts[cat].wasted + categoryCounts[cat].saved,
        color: getRandomColor(),
      }))
    );
  };

  const stackedData = {
    labels:
      selectedTab === "weekly"
        ? weeklyData.map((item) => item.day)
        : monthlyData.map((item) => item.month),
    data:
      selectedTab === "weekly"
        ? weeklyData.map((item) => [item.saved, item.wasted])
        : monthlyData.map((item) => [item.saved, item.wasted]),
    barColors: ["#5D5FEF", "#EF4444"],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      <Text style={styles.subtitle}>Visualize your food consumption habits</Text>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "weekly" && styles.tabActive]}
          onPress={() => setSelectedTab("weekly")}
        >
          <Text style={selectedTab === "weekly" ? styles.tabTextActive : styles.tabText}>
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "monthly" && styles.tabActive]}
          onPress={() => setSelectedTab("monthly")}
        >
          <Text style={selectedTab === "monthly" ? styles.tabTextActive : styles.tabText}>
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bar Chart */}
      <Text style={styles.sectionTitle}>
        {selectedTab === "weekly" ? "Weekly Waste vs. Saved" : "Monthly Waste vs. Saved"}
      </Text>
      {stackedData.labels.length > 0 && (
        <StackedBarChart
          data={stackedData}
          width={screenWidth}
          height={250}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}

      {/* Pie Chart */}
      <Text style={styles.sectionTitle}>Waste by Category</Text>
      {categoryData.length > 0 && (
        <PieChart
          data={categoryData.map((item) => ({
            name: item.name,
            population: item.value,
            color: item.color,
            legendFontColor: "#4B5563",
            legendFontSize: 12,
          }))}
          width={screenWidth}
          height={250}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}
    </ScrollView>
  );
}

// 🔹 Rastgele renk üretici (kategori renkleri için)
function getRandomColor() {
  const colors = ["#5D5FEF", "#EF4444", "#10B981", "#F59E0B", "#3B82F6", "#EC4899"];
  return colors[Math.floor(Math.random() * colors.length)];
}

const chartConfig = {
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  labelColor: () => "#6B7280",
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#5D5FEF",
  },
  tabText: {
    color: "#1F2937",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    marginTop: 16,
  },
  chart: {
    borderRadius: 12,
    marginBottom: 32,
  },
});