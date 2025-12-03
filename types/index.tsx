export type InventoryItem = {
  id: string;
  name: string;
  category: 'Dairy' | 'Vegetables' | 'Grains' | 'Protein' | 'Fruits' | 'Other';
  quantity: number;
  expiryDate: Date;
};

export type Recipe = {
  title: string;
  ingredients: string[];
  instructions: string;
  matchScore: number;
  imageUrl?: string;
};

export type ShoppingListItem = {
  id: string;
  name: string;
  checked: boolean;
};
