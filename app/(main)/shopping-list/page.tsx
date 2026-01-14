import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore as db, auth } from "../../../firebase/firebase-config";

type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  initialQuantity: number;
  createdAt: Date;
  expiryDate?: Date;
  expiryDaysLeft?: number;
  avgConsumptionDays?: number;
  daysLeft?: number;
  checked?: boolean;
  isExpired?: boolean;
};

export default function ShoppingListPage() {
  const [allItems, setAllItems] = useState<ShoppingListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "SHOPPING">("SHOPPING");
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ShoppingListItem | null>(null);
  const [restockQty, setRestockQty] = useState("1");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "products"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const today = new Date();

      const products: ShoppingListItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        const createdAt = data.createdAt?.toDate?.() || new Date();
        const expiryDate = data.expiryDate?.toDate?.();

        // 🔹 TÜKETİM HESABI
        const consumed =
          (data.initialQuantity ?? 0) - (data.quantity ?? 0);

        const daysPassed = Math.max(
          1,
          Math.round(
            (today.getTime() - createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );

        const avgConsumption =
          consumed > 0 ? daysPassed / consumed : undefined;

        const daysLeft = avgConsumption
          ? avgConsumption * data.quantity
          : undefined;

        // 🔹 TARİH HESABI
        const expiryDaysLeft = expiryDate
          ? Math.ceil(
              (expiryDate.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : undefined;

        const isExpired =
          expiryDaysLeft !== undefined && expiryDaysLeft < 0;

        return {
          id: docSnap.id,
          name: data.name,
          quantity: data.quantity,
          initialQuantity: data.initialQuantity,
          createdAt,
          expiryDate,
          expiryDaysLeft,
          avgConsumptionDays: avgConsumption,
          daysLeft,
          isExpired,
          checked: false,
        };
      });

      // 🔹 SIRALAMA
      const sorted = products.sort((a, b) => {
        if (a.quantity === 0 && b.quantity !== 0) return -1;
        if (a.quantity !== 0 && b.quantity === 0) return 1;
        if (a.expiryDaysLeft !== undefined && b.expiryDaysLeft !== undefined) {
          return a.expiryDaysLeft - b.expiryDaysLeft;
        }
        return 0;
      });

      setAllItems(sorted);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🔹 SHOPPING LIST FİLTRESİ
  const displayedItems =
    activeTab === "ALL"
      ? allItems
      : allItems.filter(
          (p) =>
            p.quantity === 0 ||
            p.isExpired ||
            (p.expiryDaysLeft !== undefined && p.expiryDaysLeft <= 7)
        );

  const toggleCheck = (id: string) => {
    setAllItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const openRestockModal = (item: ShoppingListItem) => {
    setSelectedItem(item);

    const recommendedQty =
      item.avgConsumptionDays && item.daysLeft !== undefined
        ? Math.max(
            1,
            Math.ceil((7 - item.daysLeft) / item.avgConsumptionDays)
          )
        : 1;

    setRestockQty(recommendedQty.toString());
    setModalVisible(true);
  };

  const handleRestock = async () => {
    if (!selectedItem) return;

    const qty = parseInt(restockQty) || 1;

    const ref = doc(db, "products", selectedItem.id);
    await updateDoc(ref, {
      quantity: selectedItem.quantity + qty,
      initialQuantity:
        (selectedItem.initialQuantity ?? selectedItem.quantity) +
        qty,
    });

    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: ShoppingListItem }) => {
    const recommendedQty =
      item.avgConsumptionDays && item.daysLeft !== undefined
        ? Math.max(
            1,
            Math.ceil((7 - item.daysLeft) / item.avgConsumptionDays)
          )
        : 1;

    // 🔹 STATUS = SADECE STOK
    const status =
      item.quantity === 0
        ? "OUT"
        : (item.daysLeft ?? 0) <= 3
        ? "LOW"
        : "OK";

    return (
      <TouchableOpacity
        style={[styles.itemRow, item.checked && styles.checkedRow]}
        onPress={() => toggleCheck(item.id)}
      >
        <View style={styles.checkbox}>
          {item.checked && <View style={styles.innerBox} />}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.itemText,
              item.checked && styles.strikeText,
            ]}
          >
            {item.name}
          </Text>

          <Text style={styles.statsText}>
            Qty: {item.quantity} | Buy: {recommendedQty}
          </Text>

          {/* 🔹 TARİH BİLGİSİ (AYRI) */}
          <Text
            style={[
              styles.expiryText,
              item.isExpired && styles.expiredText,
            ]}
          >
            {item.isExpired
              ? "Expired"
              : item.expiryDaysLeft !== undefined
              ? `Expires in ${item.expiryDaysLeft} days`
              : "No expiry date"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.restockBtn}
          onPress={() => openRestockModal(item)}
        >
          <Text style={styles.restockText}>Restock</Text>
        </TouchableOpacity>

        <View style={[styles.badge, styles[status]]}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>

      {/* 🔹 TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "SHOPPING" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("SHOPPING")}
        >
          <Text style={styles.tabText}>Shopping List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "ALL" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("ALL")}
        >
          <Text style={styles.tabText}>All Products</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items</Text>
        }
      />

      {/* 🔹 MODAL */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Restock {selectedItem?.name}
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={restockQty}
              onChangeText={setRestockQty}
            />

            <Button title="Update" onPress={handleRestock} />
            <Button
              title="Cancel"
              color="#999"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },

  tabs: { flexDirection: "row", marginBottom: 12 },
  tabBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeTab: { backgroundColor: "#5D5FEF" },
  tabText: { color: "#000", fontWeight: "bold" },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 10,
  },
  checkedRow: { opacity: 0.6 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#5D5FEF",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  innerBox: { width: 12, height: 12, backgroundColor: "#5D5FEF" },

  itemText: { fontSize: 17, fontWeight: "600" },
  strikeText: { textDecorationLine: "line-through", color: "#9CA3AF" },
  statsText: { fontSize: 13, color: "#555" },

  expiryText: {
    fontSize: 12,
    marginTop: 2,
    color: "#374151",
  },
  expiredText: {
    color: "#EF4444",
    fontWeight: "bold",
  },

  restockBtn: {
    backgroundColor: "#5D5FEF",
    padding: 6,
    borderRadius: 4,
    marginRight: 6,
  },
  restockText: { color: "#fff", fontSize: 12 },

  badge: { padding: 4, borderRadius: 4 },
  OUT: { backgroundColor: "#EF4444" },
  LOW: { backgroundColor: "#F59E0B" },
  OK: { backgroundColor: "#10B981" },
  badgeText: { color: "#fff", fontWeight: "bold" },

  emptyText: { textAlign: "center", marginTop: 40, color: "#777" },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
  },
});
