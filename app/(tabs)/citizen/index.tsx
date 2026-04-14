import { requestApi } from '@/src/api/endpoints';
import { useAuthStore } from '@/src/store/authStore';
import { Request, RequestStatus } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuthStore();
  const router = useRouter();

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const response = await requestApi.getAll();
      
      // FIX: Normalize MongoDB _id to id to prevent 'undefined' crashes
      const normalizedData = response.data.map((req: any) => ({
        ...req,
        id: req.id || req._id,
      }));
      
      setRequests(normalizedData);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.CREATED: return '#f39c12';
      case RequestStatus.SCHEDULED: return '#3498db';
      case RequestStatus.IN_PROGRESS: return '#9b59b6';
      case RequestStatus.COMPLETED: return '#27ae60';
      case RequestStatus.CANCELLED: return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(tabs)/citizen/request/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.category}>{item.category || 'Electronic Item'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.address} numberOfLines={1}>📍 {item.address}</Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'N/A'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hello, {user?.name?.split(' ')[0] || 'Citizen'}</Text>
          <Text style={styles.subtitle}>Your E-Waste Requests</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/citizen/create')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        // FIX: Safe key extraction with fallback to index
        keyExtractor={(item, index) => (item.id || (item as any)._id || index).toString()} 
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#27ae60" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No requests yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to schedule your first pickup</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  date: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
  },
});