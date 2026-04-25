import { useAuthStore } from '@/src/store/authStore';
import { useRequestStore } from '@/src/store/requestStore';
import { Request, RequestStatus } from '@/src/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CitizenHomeScreen() {
  const { user } = useAuthStore();
  const { requests, fetchRequests, isLoading } = useRequestStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      await fetchRequests();
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.CREATED:
        return '#f39c12';
      case RequestStatus.SCHEDULED:
        return '#3498db';
      case RequestStatus.IN_PROGRESS:
        return '#9b59b6';
      case RequestStatus.COMPLETED:
        return '#27ae60';
      case RequestStatus.CANCELLED:
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

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

  const renderRequest = ({ item }: { item: Request }) => {
    // Handle both _id (from backend) and id (from mock)
    const itemId = (item as any)._id || item.id;
    const items = (item.items && item.items.length > 0)
      ? item.items
      : ((item as any).category ? [{ category: (item as any).category, quantity: (item as any).quantity }] : []);

    if (items.length === 0 && item.type !== 'DRIVE') return null;

    return (
      <TouchableOpacity
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.category}>
            {item.type === 'DRIVE' ? 'Community Drive' : (items.length > 1
              ? `Multiple Items (${items.length})`
              : items[0]?.category)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.detail}>
            Items: {item.type === 'DRIVE' ? 'N/A' : items.map(i => `${i.category} x${i.quantity}`).join(', ')}
          </Text>
          <Text style={styles.detail}>Address: {item.address}</Text>
          <Text style={styles.detail}>Created: {formatDate(item.createdAt)}</Text>
          {item.scheduledTime && (
            <Text style={styles.detail}>
              Scheduled: {formatDate(item.scheduledTime)}
            </Text>
          )}

          {/* Show assigned vendor info */}
          {(item as any).assignedVendorId && (
            <View style={styles.vendorCard}>
              <Text style={styles.vendorLabel}>📦 Assigned Pick Up Everywhere</Text>
              <Text style={styles.vendorName}>
                {(item as any).assignedVendorId.name || 'Pick Up Everywhere'}
              </Text>
              {!!(item as any).assignedVendorId.phone && (
                <Text style={styles.vendorPhone}>
                  📞 {(item as any).assignedVendorId.phone}
                </Text>
              )}
            </View>
          )}

          {/* Show OTP only for strictly IN_PROGRESS requests */}
          {item.status === RequestStatus.IN_PROGRESS && !!item.otp && (
            <View style={styles.otpCard}>
              <Text style={styles.otpLabel}>🔑 Verification OTP</Text>
              <Text style={styles.otpValue}>{item.otp}</Text>
              <Text style={styles.otpHelper}>Share with Pick Up Everywhere to complete pickup</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && requests.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name}!</Text>
        <Text style={styles.subtext}>Your e-waste requests</Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => (item as any)._id || item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No requests yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first e-waste recycling request
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
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
    gap: 6,
  },
  detail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  vendorCard: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#27ae60',
  },
  vendorLabel: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  vendorPhone: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
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
  otpCard: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffb74d',
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '600',
    marginBottom: 4,
  },
  otpValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e65100',
    letterSpacing: 4,
  },
  otpHelper: {
    fontSize: 11,
    color: '#f57c00',
    marginTop: 4,
  },
});
