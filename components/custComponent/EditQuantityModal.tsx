import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  currentQuantity: number;
  onUpdate: (newQuantity: number) => void;
  onCancel: () => void;
};

export default function EditQuantityModal({ currentQuantity, onUpdate, onCancel }: Props) {
  const [quantity, setQuantity] = useState(String(currentQuantity));

  const handleUpdate = () => {
    if (Number(quantity) < 0) return;
    onUpdate(Number(quantity));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Quantity</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancel} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submit} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff", borderRadius: 12 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D1D6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  cancel: {
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  submit: {
    backgroundColor: "#5D5FEF",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
