// app/(main)/shopping-list/page.tsx
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import { firestore as db, auth } from "../../../firebase/firebase-config";

type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  initialQuantity: number;
  createdAt: any;
  daysLeft?: number;
  avgConsumptionDays?: number;
  checked?: boolean;
};

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "products"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const today = new Date();
      const products = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        const consumed = (data.initialQuantity ?? 0) - (data.quantity ?? 0);
        const daysPassed = Math.max(1, Math.round((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
        const avgConsumption = consumed > 0 ? daysPassed / consumed : undefined;
        const daysLeft = avgConsumption ? avgConsumption * data.quantity : undefined;

        return {
          id: docSnap.id,
          name: data.name,
          quantity: data.quantity,
          initialQuantity: data.initialQuantity,
          createdAt,
          avgConsumptionDays: avgConsumption,
          daysLeft,
          checked: false,
        };
      });

      // 7 gün veya altı kalan ürünleri göster
      const shoppingList = products.filter(p => (p.daysLeft ?? 0) <= 7 || p.quantity === 0);
      setItems(shoppingList);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const toggleCheck = (id: string) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const renderItem = ({ item }: { item: ShoppingListItem }) => (
    <TouchableOpacity
      style={[styles.itemRow, item.checked && styles.checkedRow]}
      onPress={() => toggleCheck(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.checkbox}>
        {item.checked && <View style={styles.innerBox} />}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.itemText, item.checked && styles.strikeText]}>{item.name}</Text>
        <Text style={styles.statsText}>
          Qty: {item.quantity}, Days left: {item.daysLeft?.toFixed(1) ?? "-"}, Avg cons.: {item.avgConsumptionDays?.toFixed(1) ?? "-"} days
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color="#000" /></View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nothing to buy yet!</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  itemRow: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#f3f4f6", borderRadius: 8, marginBottom: 10 },
  checkedRow: { opacity: 0.6 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: "#5D5FEF", borderRadius: 4, justifyContent: "center", alignItems: "center", marginRight: 12 },
  innerBox: { width: 12, height: 12, backgroundColor: "#5D5FEF" },
  itemText: { fontSize: 18, fontWeight: "600" },
  strikeText: { textDecorationLine: "line-through", color: "#9CA3AF" },
  statsText: { fontSize: 14, color: "#555", marginTop: 2 },
  empty: { marginTop: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#666" },
  centered: { flex:1, justifyContent:'center', alignItems:'center' },
});
