import { pricingApi } from '@/src/api/endpoints';
import { Condition, PricingConfig } from '@/src/types';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function PricingScreen() {
  const [pricing, setPricing] = useState<PricingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setIsLoading(true);
      const response = await pricingApi.getAll();
      setPricing(response.data);
    } catch (error) {
      console.error('Failed to load pricing:', error);
      Alert.alert('Error', 'Failed to load pricing configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPricing = ({ item }: { item: PricingConfig }) => (
    <View style={styles.card}>
      <Text style={styles.category}>{item.category}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.label}>Base Rate:</Text>
        <Text style={styles.price}>₹{item.ratePerKg}/kg</Text>
      </View>
      <View style={styles.factors}>
        <Text style={styles.factorsTitle}>Condition Multipliers:</Text>
        <Text style={styles.factor}>
          • Working: {item.conditionFactors[Condition.WORKING] * 100}%
        </Text>
        <Text style={styles.factor}>
          • Partial: {item.conditionFactors[Condition.PARTIAL] * 100}%
        </Text>
        <Text style={styles.factor}>
          • Scrap: {item.conditionFactors[Condition.SCRAP] * 100}%
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e44ad" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pricing}
        renderItem={renderPricing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  factors: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  factor: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
  },
});
