import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function CompletedAssignmentsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const token = await require('@/src/utils/storage').getItemAsync('auth_token');
      const response = await fetch('http://192.168.1.45:5000/api/admin/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const getStatusColor = (status: string) => {
    return '#27ae60'; // Always green for completed
  };

  if (isLoadingRequests) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading Completed Assignments...</Text>
      </View>
    );
  }

  const completedRequests = requests.filter(r => r.status === 'COMPLETED');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Completed Assignments</Text>
        <Text style={styles.subtitle}>{completedRequests.length} Assignment{completedRequests.length !== 1 ? 's' : ''} Finished</Text>
      </View>

      <View style={styles.section}>
        {completedRequests.length === 0 ? (
          <Text style={styles.emptyText}>No completed requests</Text>
        ) : (
          completedRequests.map((request) => {
            const items = (request.items && request.items.length > 0)
              ? request.items
              : (request.category ? [{ category: request.category, quantity: request.quantity }] : []);
            if (items.length === 0) return null;

            return (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestCategory}>
                    {items.length > 1
                      ? `Multiple Items (${items.length})`
                      : items[0]?.category}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={styles.statusText}>{request.status}</Text>
                  </View>
                </View>
                <Text style={styles.requestDetail}>
                  Items: {items.map((i: any) => `${i.category} x${i.quantity}`).join(', ')}
                </Text>
                <Text style={styles.requestDetail}>Customer: {request.userId?.name || 'N/A'}</Text>
                <Text style={styles.requestDetail}>Final Price: ₹{request.finalPrice || 0}</Text>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorText}>Completed By: {request.assignedVendorId?.name || 'Unknown'}</Text>
                </View>
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  requestCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestCategory: {
    fontSize: 16,
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
  requestDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  vendorInfo: {
    backgroundColor: '#d5f5e3',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  vendorText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 20,
  },
});
