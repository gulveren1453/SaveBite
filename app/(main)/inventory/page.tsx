import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Alert } from "react-native";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { firestore as db, auth } from "../../../firebase/firebase-config";
import { format } from "date-fns";

import AddItemModal, { NewItem } from "../../../components/custComponent/AddItemModal";
import EditQuantityModal from "../../../components/custComponent/EditQuantityModal";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "products"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const today = new Date();
      const data = snapshot.docs.map((doc) => {
        const product = doc.data();
        const createdAt = product.createdAt?.toDate?.() || new Date();
        const consumed = (product.initialQuantity ?? product.quantity) - product.quantity;
        const daysPassed = Math.max(1, Math.round((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
        const avgConsumption = consumed > 0 ? daysPassed / consumed : undefined;

        return {
          id: doc.id,
          ...product,
          createdAt,
          avgConsumptionDays: avgConsumption,
        };
      });

      setProducts(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleAddItem = async (item: NewItem) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "products"), {
        ...item,
        initialQuantity: item.quantity, // 🔥 referans miktar
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      setShowAddModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditQuantity = async (newQuantity: number) => {
    if (!editingProduct) return;
    try {
      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, { quantity: newQuantity });
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleConsume = async (productId: string, consumedAmount: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newQuantity = product.quantity - consumedAmount;

    try {
      if (newQuantity <= 0) {
        await deleteDoc(doc(db, "products", productId));
      } else {
        await updateDoc(doc(db, "products", productId), {
          quantity: newQuantity,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }: any) => {
    const createdAt = item.createdAt ? format(item.createdAt, "dd/MM/yyyy") : "N/A";
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₺{item.price || 0}</Text>
        <Text>Quantity: {item.quantity || 0}</Text>
        <Text style={styles.itemDate}>Created: {createdAt}</Text>
        <Text style={styles.itemDate}>Avg cons.: {item.avgConsumptionDays?.toFixed(1) ?? "-"}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              setEditingProduct(item);
              setShowEditModal(true);
            }}
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.consumeBtn}
            onPress={() => {
              Alert.prompt(
                "Consume Product",
                `How many units of "${item.name}" did you consume?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: (amount) => {
                      const num = Number(amount);
                      if (isNaN(num) || num < 0) {
                        Alert.alert("Invalid input", "Please enter a valid number.");
                        return;
                      }
                      handleConsume(item.id, num);
                    },
                  },
                ],
                "plain-text",
                "0"
              );
            }}
          >
            <Text style={styles.actionText}>Consume</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+ Add Item</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <AddItemModal onAdd={handleAddItem} onCancel={() => setShowAddModal(false)} />
        </View>
      </Modal>

      {/* Edit Quantity Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          {editingProduct && (
            <EditQuantityModal
              currentQuantity={editingProduct.quantity || 0}
              onUpdate={handleEditQuantity}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  itemContainer: { backgroundColor: "#f5f5f5", padding: 12, borderRadius: 8, marginBottom: 10 },
  itemName: { fontSize: 18, fontWeight: "600" },
  itemPrice: { fontSize: 16, color: "#444" },
  itemDate: { fontSize: 14, color: "#666", marginTop: 4 },
  actionRow: { flexDirection: "row", marginTop: 8 },
  editBtn: { backgroundColor: "#5D5FEF", padding: 8, borderRadius: 8, marginRight: 8 },
  consumeBtn: { backgroundColor: "#F59E0B", padding: 8, borderRadius: 8, marginRight: 8 },
  deleteBtn: { backgroundColor: "#EF4444", padding: 8, borderRadius: 8 },
  actionText: { color: "#fff", fontWeight: "600" },
  addButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#007bff", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 50, elevation: 3 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 16 },
});