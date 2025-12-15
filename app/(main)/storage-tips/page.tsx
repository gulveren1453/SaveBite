import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChevronDown,
  ChevronUp,
  Leaf,
  Drumstick,
  Beef,
  Fish,
  Wheat,
} from "lucide-react-native";

type CategoryKey =
  | "vegetables"
  | "chicken"
  | "meat"
  | "fish"
  | "legumes";

export default function StorageTipsPage() {
  const [openCategory, setOpenCategory] = useState<CategoryKey | null>(null);

  const toggleCategory = (key: CategoryKey) => {
    setOpenCategory(openCategory === key ? null : key);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Food Storage Tips by Category</Text>
      <Text style={styles.desc}>
        Tap on a food category to learn proper storage conditions, ideal
        temperature ranges, and food safety tips to reduce waste.
      </Text>

      {/* Vegetables */}
      <CategoryCard
        title="Vegetables"
        icon={<Leaf size={22} color="#16A34A" />}
        isOpen={openCategory === "vegetables"}
        onPress={() => toggleCategory("vegetables")}
      >
        <Tip label="Storage Place" value="Refrigerator (crisper drawer)" />
        <Tip label="Temperature" value="4°C – 7°C" />
        <Tip label="Shelf Life" value="3–7 days (depending on type)" />
        <Tip
          label="Tips"
          value="Do not wash before storing. Wrap leafy greens in paper towels to absorb moisture."
        />
      </CategoryCard>

      {/* Chicken */}
      <CategoryCard
        title="Chicken"
        icon={<Drumstick size={22} color="#F97316" />}
        isOpen={openCategory === "chicken"}
        onPress={() => toggleCategory("chicken")}
      >
        <Tip label="Storage Place" value="Refrigerator or Freezer" />
        <Tip label="Temperature" value="0°C – 4°C (fridge), -18°C (freezer)" />
        <Tip label="Shelf Life" value="1–2 days (fridge), up to 9 months (freezer)" />
        <Tip
          label="Tips"
          value="Store in sealed containers and keep raw chicken separate to prevent cross-contamination."
        />
      </CategoryCard>

      {/* Meat */}
      <CategoryCard
        title="Red Meat"
        icon={<Beef size={22} color="#DC2626" />}
        isOpen={openCategory === "meat"}
        onPress={() => toggleCategory("meat")}
      >
        <Tip label="Storage Place" value="Refrigerator or Freezer" />
        <Tip label="Temperature" value="0°C – 4°C (fridge), -18°C (freezer)" />
        <Tip label="Shelf Life" value="2–3 days (fridge), up to 12 months (freezer)" />
        <Tip
          label="Tips"
          value="Freeze in portions and label packages with dates for better food management."
        />
      </CategoryCard>

      {/* Fish */}
      <CategoryCard
        title="Fish"
        icon={<Fish size={22} color="#0EA5E9" />}
        isOpen={openCategory === "fish"}
        onPress={() => toggleCategory("fish")}
      >
        <Tip label="Storage Place" value="Refrigerator or Freezer" />
        <Tip label="Temperature" value="0°C – 2°C (fridge), -18°C (freezer)" />
        <Tip label="Shelf Life" value="1 day (fridge), up to 6 months (freezer)" />
        <Tip
          label="Tips"
          value="Consume as soon as possible. Store in airtight containers or on ice."
        />
      </CategoryCard>

      {/* Legumes */}
      <CategoryCard
        title="Legumes (Beans, Lentils, Chickpeas)"
        icon={<Wheat size={22} color="#A16207" />}
        isOpen={openCategory === "legumes"}
        onPress={() => toggleCategory("legumes")}
      >
        <Tip label="Storage Place" value="Cool, dry pantry" />
        <Tip label="Temperature" value="Below 20°C" />
        <Tip label="Shelf Life" value="Up to 1 year (dry legumes)" />
        <Tip
          label="Tips"
          value="Store in glass jars or airtight containers. Adding bay leaves (defne yaprağı) helps prevent insects and weevils."
        />
        <Tip
          label="Extra Tip"
          value="Avoid moisture exposure. Do not store near heat or sunlight to prevent spoilage."
        />
      </CategoryCard>
    </ScrollView>
  );
}

/* ---------- Components ---------- */

function CategoryCard({
  title,
  icon,
  isOpen,
  onPress,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={onPress}>
        <View style={styles.headerLeft}>
          {icon}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </TouchableOpacity>

      {isOpen && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
}

function Tip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tipRow}>
      <Text style={styles.tipLabel}>{label}:</Text>
      <Text style={styles.tipValue}>{value}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tipRow: {
    marginTop: 8,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  tipValue: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 20,
  },
});
