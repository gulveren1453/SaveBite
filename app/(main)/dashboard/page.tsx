// app/(main)/dashboard/page.tsx
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart, StackedBarChart } from "react-native-chart-kit";
import { ArrowRight, Soup, Warehouse, Plus } from "lucide-react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore as db, auth } from "../../../firebase/firebase-config";
import dayjs from "dayjs";

// Firestore’dan ürün tipi
type Product = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate: any;
};

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const screenWidth = Dimensions.get("window").width - 48;

  // 🔥 Firestore: Sadece giriş yapan kullanıcının ürünleri
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "products"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
    });

    return () => unsub();
  }, []);

  // Gün farkı hesaplama
  const daysLeft = (expiry: any) => {
    if (!expiry) return 0;
    const date = expiry.toDate ? expiry.toDate() : expiry;
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  // Etiketler
  const getBadge = (expiry: any) => {
    const d = daysLeft(expiry);
    const badgeText = d < 0 ? "Expired" : `Expires in ${d}d`;
    const badgeColor = d < 0 ? "#DC2626" : d <= 5 ? "#F97316" : "#6B7280";
    return { badgeText, badgeColor };
  };

  // Ürün render
  const renderExpiry = ({ item }: { item: Product }) => {
    const { badgeText, badgeColor } = getBadge(item.expiryDate);

    return (
      <View style={styles.expiryRow}>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCat}>{item.category}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      </View>
    );
  };

  // Waste Stats
  const savedCount = products.filter((p) => daysLeft(p.expiryDate) >= 0).length;
  const wastedCount = products.filter((p) => daysLeft(p.expiryDate) < 0).length;

  const wasteData = [
    { name: "Saved", value: savedCount, color: "#7F5AF0" },
    { name: "Wasted", value: wastedCount, color: "#EF4444" },
  ];

  // Monthly Waste Trend
  const monthlyWaste = (() => {
    const months = Array.from({ length: 6 }, (_, i) =>
      dayjs().subtract(5 - i, "month")
    );

    return months.map((m) => {
      const monthName = m.format("MMM");

      const saved = products.filter(
        (p) =>
          dayjs(p.expiryDate.toDate ? p.expiryDate.toDate() : p.expiryDate).month() ===
            m.month() &&
          daysLeft(p.expiryDate) >= 0
      ).length;

      const wasted = products.filter(
        (p) =>
          dayjs(p.expiryDate.toDate ? p.expiryDate.toDate() : p.expiryDate).month() ===
            m.month() &&
          daysLeft(p.expiryDate) < 0
      ).length;

      return { month: monthName, saved, wasted };
    });
  })();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Upcoming Expirations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Expirations</Text>
        <Text style={styles.cardDesc}>Items in your pantry that are expiring soon.</Text>

        <FlatList
          data={products.sort((a, b) => daysLeft(a.expiryDate) - daysLeft(b.expiryDate))}
          keyExtractor={(i) => i.id}
          renderItem={renderExpiry}
          contentContainerStyle={{ paddingVertical: 8 }}
          scrollEnabled={false}
        />
      </View>

      {/* Waste Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Waste Stats This Month</Text>
        <Text style={styles.cardDesc}>Your food saving progress based on expiry dates.</Text>

        {products.length === 0 ? (
          <Text style={{ color: "#6B7280", textAlign: "center", marginVertical: 20 }}>
            No data yet — add some items to see stats.
          </Text>
        ) : (
          <PieChart
            data={wasteData.map((w) => ({
              name: w.name,
              population: w.value,
              color: w.color,
              legendFontColor: "#374151",
              legendFontSize: 12,
            }))}
            width={screenWidth}
            height={200}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            chartConfig={chartConfig}
            style={{ alignSelf: "center" }}
          />
        )}
      </View>

      {/* Monthly Waste Trend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Waste Trend</Text>
        <Text style={styles.cardDesc}>Saved vs. wasted items over past months.</Text>

        {products.length === 0 ? (
          <Text style={{ color: "#6B7280", textAlign: "center", marginVertical: 20 }}>
            No data yet — add some items to see monthly trend.
          </Text>
        ) : (
          <StackedBarChart
            data={{
              labels: monthlyWaste.map((m) => m.month),
              data: monthlyWaste.map((m) => [m.saved, m.wasted]),
              barColors: ["#7F5AF0", "#EF4444"],
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            style={{ marginTop: 8 }}
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={[styles.card, { flexDirection: "row", flexWrap: "wrap" }]}>
        {/* Inventory */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(main)/inventory/page")}
        >
          <View style={styles.iconCircle}>
            <Warehouse size={24} color="#7F5AF0" />
          </View>
          <Text style={styles.actionTitle}>Manage Inventory</Text>
          <Text style={styles.actionDesc}>View, add, or edit pantry items.</Text>
          <View style={styles.actionFooter}>
            <Text style={styles.actionLink}>Go to Inventory</Text>
            <ArrowRight size={16} color="#7F5AF0" />
          </View>
        </TouchableOpacity>

        {/* Recipes */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(main)/recipes/page")}
        >
          <View style={styles.iconCircle}>
            <Soup size={24} color="#7F5AF0" />
          </View>
          <Text style={styles.actionTitle}>Find Recipes</Text>
          <Text style={styles.actionDesc}>Discover recipes for your ingredients.</Text>
          <View style={styles.actionFooter}>
            <Text style={styles.actionLink}>Suggest Recipes</Text>
            <ArrowRight size={16} color="#7F5AF0" />
          </View>
        </TouchableOpacity>

        {/* Shopping List */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(main)/shopping-list/page")}
        >
          <View style={styles.iconCircle}>
            <Plus size={24} color="#7F5AF0" />
          </View>
          <Text style={styles.actionTitle}>Shopping List</Text>
          <Text style={styles.actionDesc}>See recommended items to buy next.</Text>
          <View style={styles.actionFooter}>
            <Text style={styles.actionLink}>Go to List</Text>
            <ArrowRight size={16} color="#7F5AF0" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  labelColor: () => "#6B7280",
};

// SAME STYLES — değişiklik yok
const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#FFFFFF" },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  expiryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  itemName: { fontSize: 16, fontWeight: "500", color: "#111827" },
  itemCat: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "500" },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    margin: "1%",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(127, 90, 240,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { marginTop: 12, fontSize: 16, fontWeight: "600", color: "#111827" },
  actionDesc: { marginTop: 4, fontSize: 14, color: "#6B7280" },
  actionFooter: { marginTop: 12, flexDirection: "row", alignItems: "center" },
  actionLink: { color: "#7F5AF0", fontWeight: "500", marginRight: 4 },
});
