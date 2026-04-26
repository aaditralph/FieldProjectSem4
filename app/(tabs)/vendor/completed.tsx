import { useVendorStore } from '@/src/store/vendorStore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function CompletedScreen() {
  const { pickups: storePickups, isLoading, fetchPickups } = useVendorStore();
  const pickups = storePickups as any[];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPickups();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPickups();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPickup = ({ item }: { item: any }) => {
    const request = item.request || item;
    const items = (request.items && request.items.length > 0) 
      ? request.items 
      : (request.category ? [{ category: request.category, quantity: request.quantity }] : []);
    
    if (!request || items.length === 0) return null;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>
            {items.length > 1 
              ? `Multiple Items (${items.length})` 
              : items[0]?.category}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.detail}>
            Items: {items.map((i: any) => `${i.category} x${i.quantity}`).join(', ')}
          </Text>
          <Text style={styles.detail}>Address: {request.address}</Text>
          <Text style={styles.detail}>Scheduled: {formatDate(request.scheduledTime || request.createdAt)}</Text>
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Completed</Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  const completedPickups = pickups.filter(p => (p.request || p).status === 'COMPLETED');

  return (
    <View style={styles.container}>
      <FlatList
        data={completedPickups}
        renderItem={renderPickup}
        keyExtractor={(item) => (item as any)._id || item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No completed pickups</Text>
            <Text style={styles.emptySubtext}>
              Your completed pickup history will appear here
            </Text>
          </View>
        }
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
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    paddingTop: 12,
    gap: 8,
  },
  detail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  completedBadge: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
  },
});
