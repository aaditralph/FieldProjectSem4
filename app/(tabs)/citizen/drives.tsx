import { useRequestStore } from '@/src/store/requestStore';
import { useAuthStore } from '@/src/store/authStore';
import { Drive } from '@/src/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../../constants/theme';
import { DriveCard } from '../../../src/components/ui/DriveCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';

type FilterType = 'UPCOMING' | 'ALL';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'ALL', label: 'All Drives' },
];

export default function DrivesScreen() {
  const { drives, fetchDrives, joinDrive, isLoading } = useRequestStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('UPCOMING');
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadDrives();
    }, [])
  );

  const loadDrives = async () => {
    try {
      await fetchDrives();
    } catch (error) {
      console.error('Failed to load drives:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrives();
    setRefreshing(false);
  };

  const handleJoinDrive = async (driveId: string) => {
    try {
      await joinDrive(driveId);
      Alert.alert(
        'Success!',
        'You have successfully joined the drive. See you there!',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join drive');
    }
  };

  const filteredDrives = drives.filter(drive => {
    // Only show drives that are in the future
    const driveDate = new Date(drive.date);
    const now = new Date();
    return driveDate > now;
  });

  if (isLoading && drives.length === 0) {
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

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.light.tint} />
        <Text style={styles.infoText}>
          Join community drives to drop off your e-waste at designated collection points
        </Text>
      </View>

      {/* Drives List */}
      <FlatList
        data={filteredDrives}
        renderItem={({ item }) => {
          const creatorId = typeof item.creatorId === 'object' ? item.creatorId.id : item.creatorId;
          return (
            <DriveCard
              drive={item}
              showOtp={user ? creatorId === user.id : false}
              onJoin={() => handleJoinDrive(item.id || item._id)}
            />
          );
        }}
        keyExtractor={(item) => item.id || item._id}
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
              icon="calendar-outline"
              title={
                activeFilter === 'UPCOMING'
                  ? 'No upcoming drives'
                  : `No ${activeFilter.toLowerCase().replace('_', ' ')} drives`
              }
              description={
                activeFilter === 'UPCOMING'
                  ? 'Check back later for community e-waste collection drives in your area!'
                  : `You haven't joined any drives yet.`
              }
              actionLabel={activeFilter === 'UPCOMING' ? 'Check Back Later' : undefined}
              onAction={activeFilter === 'UPCOMING' ? onRefresh : undefined}
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.light.tint}10`,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.light.tint,
    lineHeight: 18,
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