import { requestApi, pricingApi } from '@/src/api/endpoints';
import { useAuthStore } from '@/src/store/authStore';
import { Condition, Request, RequestStatus, PricingConfig } from '@/src/types';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

export default function VendorHomeScreen() {
  const [pickups, setPickups] = useState<Request[]>([]);
  const [pricing, setPricing] = useState<PricingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch both pickups and pricing configuration
      const [pickupRes, pricingRes] = await Promise.all([
        requestApi.getAll({ status: RequestStatus.SCHEDULED }),
        pricingApi.getAll()
      ]);
      
      setPickups(pickupRes.data);
      setPricing(pricingRes.data);
    } catch (error) {
      console.error('Failed to load vendor data:', error);
      Alert.alert('Error', 'Could not sync with BMC server');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderPickup = ({ item }: { item: Request }) => {
    // FIX: Using Optional Chaining (?.) to prevent "WORKING of undefined"
    const categoryPricing = pricing.find(p => p.category === item.category);
    const baseRate = categoryPricing?.ratePerKg || 0;
    const workingMultiplier = categoryPricing?.conditionFactors?.[Condition.WORKING] || 0;

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{new Date(item.scheduledDate!).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.address}>{item.address}</Text>
        <View style={styles.footer}>
          <Text style={styles.phone}>📞 {item.contactPhone}</Text>
          <Text style={styles.estPrice}>
            Est: ₹{(baseRate * item.quantity * workingMultiplier).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={styles.loadingText}>Syncing pickups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pickups}
        renderItem={renderPickup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No assigned pickups</Text>
            <Text style={styles.emptySubtext}>New requests from Mumbai citizens will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#7f8c8d' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  category: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  date: { fontSize: 14, color: '#2980b9', fontWeight: '600' },
  address: { fontSize: 14, color: '#7f8c8d', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  phone: { fontSize: 14, color: '#2c3e50' },
  estPrice: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  emptySubtext: { color: '#7f8c8d', marginTop: 8, textAlign: 'center' },
});