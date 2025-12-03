import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export type NewItem = {
  name: string;
  price: number;
  quantity: number;
  initialQuantity?: number; // 🔥 yeni
  expiryDate: Date;
};

type Props = {
  onAdd: (item: NewItem) => void;
  onCancel: () => void;
};

export default function AddItemModal({ onAdd, onCancel }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || Number(price) < 0 || Number(quantity) < 1) return;

    onAdd({
      name,
      price: Number(price),
      quantity: Number(quantity),
      initialQuantity: Number(quantity), // 🔥 burası
      expiryDate,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios"); 
    if (selectedDate) setExpiryDate(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Item</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter product name, e.g., Milk"
        placeholderTextColor="#666666"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter price, e.g., 12.50"
        placeholderTextColor="#666666"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter quantity, e.g., 2"
        placeholderTextColor="#666666"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>
          Expires: {expiryDate?.toDateString?.() || "Select Date"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={expiryDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancel} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
          <Text style={styles.submitText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D1D6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  cancelText: {
    color: "#111",
    fontWeight: "600",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
});
