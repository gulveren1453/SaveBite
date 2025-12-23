import { Link } from 'expo-router';
import { CheckCircle, PieChart, Soup, Warehouse } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const features = [
    {
      icon: <Warehouse size={40} color="#5D5FEF" />,
      title: 'Track Your Pantry',
      description: 'Easily add items to your digital pantry and never lose track of what you have.',
    },
    {
      icon: <Soup size={40} color="#5D5FEF" />,
      title: 'Discover Recipes',
      description: 'Get smart recipe suggestions based on the ingredients you already own.',
    },
    {
      icon: <PieChart size={40} color="#5D5FEF" />,
      title: 'Reduce Waste',
      description: 'Monitor your consumption, reduce waste, and see your positive impact over time.',
    },
    {
      icon: <CheckCircle size={40} color="#5D5FEF" />,
      title: 'Save Money',
      description: 'By buying only what you need and using what you have, you save money effortlessly.',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Waste Less, Live More.</Text>
        <Text style={styles.heroSubtitle}>
          SaveBite helps you keep track of your kitchen inventory, suggests delicious recipes, and empowers you to fight food waste right from your home.
        </Text>
        <Link href="/(auth)/login/page">
          <Text style={styles.button}>Get Started for Free</Text>
        </Link>
      </View>

      {/* Feature Box */}
      <View style={styles.featureBox}>
        <View style={styles.featureText}>
          <Text style={styles.featureTitle}>Your kitchen, organized.</Text>
          <Text style={styles.featureDescription}>
            From a chaotic pantry to a clear overview. Know what you have, what's expiring, and what to cook next.
          </Text>
          <Link href="/(auth)/login/page">
            <Text style={styles.button}>Go to Dashboard</Text>
          </Link>
        </View>
      </View>

      {/* Features List */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Everything You Need in One Place</Text>
        <Text style={styles.featuresSubtitle}>
          SaveBite is packed with features to make your life easier and more sustainable.
        </Text>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.iconContainer}>{feature.icon}</View>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1C1C1E',
  },
  heroSubtitle: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
    color: '#6E6E73',
  },
  button: {
    marginTop: 16,
    fontSize: 16,
    backgroundColor: '#5D5FEF',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
  },
  featureBox: {
    backgroundColor: '#F6F6FD',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  featureText: {
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  featureDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#6E6E73',
  },
  featuresSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  featuresSubtitle: {
    fontSize: 16,
    color: '#6E6E73',
    textAlign: 'center',
    marginVertical: 8,
  },
  featuresGrid: {
    marginTop: 16,
  },
  card: {
    backgroundColor: '#F9F9FB',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6E6E73',
    textAlign: 'center',
  },
});
