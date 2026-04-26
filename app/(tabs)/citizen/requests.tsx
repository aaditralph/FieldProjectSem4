import { useRequestStore } from '@/src/store/requestStore';
import { Request, RequestStatus } from '@/src/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../../constants/theme';
import { RequestCard } from '../../../src/components/ui/RequestCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';

type FilterType = 'ALL' | 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function RequestsScreen() {
  const { requests, fetchRequests, isLoading } = useRequestStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const router = useRouter();
  const { filter } = useLocalSearchParams<{ filter?: string }>();

  // Set filter from navigation params
  useEffect(() => {
    if (filter && ['ALL', 'ACTIVE', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(filter)) {
      setActiveFilter(filter as FilterType);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

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

  const filteredRequests = requests.filter(req => {
    // Only show home pickup requests, exclude drive requests
    if (req.type && req.type !== 'HOME_PICKUP') return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ACTIVE') {
      return req.status === RequestStatus.CREATED || req.status === RequestStatus.SCHEDULED || req.status === RequestStatus.IN_PROGRESS;
    }
    return req.status === activeFilter;
  });

  const handleCreateRequest = () => {
    router.push('/(tabs)/create');
  };

  const handleRequestPress = (requestId: string) => {
    router.push(`/(tabs)/citizen/request/${requestId}`);
  };

  if (isLoading && requests.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                activeFilter === filter.key && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onPress={() => handleRequestPress(item.id)}
          />
        )}
        keyExtractor={(item, index) => item.id || `request-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="document-text-outline"
              title={
                activeFilter === 'ALL'
                  ? 'No requests yet'
                  : `No ${activeFilter.toLowerCase()} requests`
              }
              description={
                activeFilter === 'ALL'
                  ? 'Create your first e-waste recycling request and start making a difference!'
                  : `You don't have any ${activeFilter.toLowerCase()} requests.`
              }
              actionLabel={activeFilter === 'ALL' ? 'Create Request' : undefined}
              onAction={activeFilter === 'ALL' ? handleCreateRequest : undefined}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
  },
  filterTabActive: {
    backgroundColor: Colors.light.tint,
  },
  filterText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.light.muted,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
  },
});