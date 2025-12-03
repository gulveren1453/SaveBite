// app/(main)/layout.tsx
import { Tabs } from 'expo-router';
import {
  BarChart3,
  LayoutDashboard,
  ShoppingCart,
  Soup,
  Warehouse,
} from 'lucide-react-native';
import { StyleSheet } from 'react-native';

export default function MainLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Warehouse size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => <Soup size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: 'Shopping List',
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D1D6',       // border
    backgroundColor: '#F5F5F5',      // background
  },
});