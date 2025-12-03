import { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Product = {
  name: string;
  expirationDate?: string;
};

type Recipe = {
  title: string;
  instructions: string;
  ingredients: string[];
  imageUrl?: string;
};

type Props = {
  recipe: Recipe;
  products: Product[]; // pantrende olan ürünler
};

export default function RecipeCard({ recipe, products }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  // Dinamik matchScore hesaplama
  const matchedCount = recipe.ingredients.filter(ing =>
    products.find(p => p.name.toLowerCase() === ing.toLowerCase())
  ).length;
  const matchScore = recipe.ingredients.length > 0
    ? matchedCount / recipe.ingredients.length
    : 0;

  const renderIngredient = (ing: string, idx: number) => {
    const product = products.find(p => p.name.toLowerCase() === ing.toLowerCase());
    let color = "#4B5563"; // default gri
    if (product) {
      if (product.expirationDate) {
        const today = new Date();
        const exp = new Date(product.expirationDate);
        const diffDays = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
        if (diffDays <= 3) color = "#EF4444"; // kırmızı, tarihi yaklaşan
        else color = "#16A34A"; // yeşil, pantrende var
      } else color = "#16A34A"; // yeşil
    }
    return (
      <Text key={`${ing}-${idx}`} style={[styles.listItem, { color }]}>
        • {ing}
      </Text>
    );
  };

  return (
    <>
      <View style={styles.card}>
        <Image
          source={{ uri: recipe.imageUrl || 'https://placehold.co/600x400.png' }}
          style={styles.image}
        />
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Match: {Math.round(matchScore * 100)}%</Text>
          </View>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {recipe.instructions.replace(/<[^>]+>/g, '')}
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>View Recipe</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>{recipe.title}</Text>
          <Text style={styles.modalSubtitle}>A delicious recipe based on your ingredients.</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map(renderIngredient)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructions}>
              {recipe.instructions.replace(/<[^>]+>/g, '')}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { marginTop: 24 }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    height: 160,
    width: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#5D5FEF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    padding: 24,
    backgroundColor: '#FFF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  listItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: '#4B5563',
    whiteSpace: 'pre-wrap',
  },
});
