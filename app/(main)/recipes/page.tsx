// app/(main)/recipes/page.tsx
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import RecipeCard from "@/components/custComponent/RecipeCard";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore as db, auth } from "../../../firebase/firebase-config";

export default function RecipesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);

  // 1️⃣ SADECE GİRİŞ YAPAN KULLANICININ ÜRÜNLERİ
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "products"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    });

    return () => unsub();
  }, []);

  // 2️⃣ TARİFLERİ ÇEK + MATCH SCORE HESAPLA
  useEffect(() => {
    if (products.length === 0) {
      setRecipes([]);
      return;
    }

    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
      .then((res) => res.json())
      .then((data) => {
        if (!data.meals) return;

        const recipesProcessed = data.meals.map((r: any) => {
          const ingredients: string[] = [];

          for (let i = 1; i <= 20; i++) {
            const ing = r[`strIngredient${i}`];
            if (ing && ing.trim() !== "") {
              ingredients.push(ing.trim());
            }
          }

          // 🔥 MATCH SCORE (USER INVENTORY BASED)
          const total = ingredients.length;
          const matched = ingredients.filter((ing) =>
            products.some(
              (p) => p.name?.toLowerCase() === ing.toLowerCase()
            )
          ).length;

          const matchScore = total === 0 ? 0 : matched / total;

          return {
            id: r.idMeal,
            title: r.strMeal,
            imageUrl: r.strMealThumb,
            instructions: r.strInstructions,
            ingredients,
            matchScore,
          };
        });

        // ⭐ En uygun tarifler üstte
        recipesProcessed.sort((a: any, b: any) => b.matchScore - a.matchScore);

        setRecipes(recipesProcessed);
      })
      .catch((err) => console.error(err));
  }, [products]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested Recipes</Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} products={products} />
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
});
