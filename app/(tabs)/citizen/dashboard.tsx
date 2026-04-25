import { useAuthStore } from '@/src/store/authStore';
import { useRequestStore } from '@/src/store/requestStore';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing } from '../../../constants/theme';
import { StatCard } from '../../../src/components/ui/StatCard';
import { QuickActionButton } from '../../../src/components/ui/QuickActionButton';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { 
    requests, 
    totalRecycled, 
    co2Saved, 
    activeCount, 
    completedCount,
    fetchRequests, 
    isLoading 
  } = useRequestStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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

  const recentRequests = requests.slice(0, 3);
  const userName = user?.name || 'User';

const handleNewRequest = () => {
    router.push('/(tabs)/citizen/create');
  };

  const handleViewRequests = () => {
    router.push({ pathname: '/(tabs)/citizen/requests', params: { filter: 'ALL' } });
  };

  const handleTrackPickup = () => {
    router.push({ pathname: '/(tabs)/citizen/requests', params: { filter: 'ACTIVE' } });
  };

  const handleViewDrives = () => {
    router.push('/(tabs)/citizen/drives');
  };

  if (isLoading && requests.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.tint}
          />
        }
      >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}!</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="leaf-outline" size={28} color={Colors.light.tint} />
        </View>
      </View>

{/* Stats Grid - First Row */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Recycled"
          value={`${totalRecycled || 0} kg`}
          icon="fitness-outline"
          color={Colors.light.tint}
          onPress={handleViewRequests}
        />
        <StatCard
          title="CO2 Saved"
          value={`${(co2Saved || 0).toFixed(1)} kg`}
          icon="leaf-outline"
          color={Colors.light.success}
          subtitle="Environmental impact"
        />
      </View>
      {/* Stats Grid - Second Row */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Active"
          value={activeCount}
          icon="car-outline"
          color="#8B5CF6"
          subtitle="Pickups in progress"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon="checkmark-circle-outline"
          color="#10B981"
          subtitle="Successful pickups"
        />
      </View>

      {/* Eco Impact Banner */}
      <View style={styles.impactBanner}>
        <View style={styles.impactContent}>
          <Ionicons name="planet-outline" size={40} color="#FFFFFF" />
          <View style={styles.impactText}>
            <Text style={styles.impactTitle}>Your Eco Impact</Text>
             <Text style={styles.impactSubtitle}>
               Together we&apos;re making a difference!
             </Text>
          </View>
        </View>
        <View style={styles.impactStats}>
          <View style={styles.impactStat}>
            <Text style={styles.impactStatValue}>{totalRecycled || 0}</Text>
            <Text style={styles.impactStatLabel}>kg Recycled</Text>
          </View>
          <View style={styles.impactStatDivider} />
          <View style={styles.impactStat}>
            <Text style={styles.impactStatValue}>{(co2Saved || 0).toFixed(1)}</Text>
            <Text style={styles.impactStatLabel}>kg CO2 Saved</Text>
          </View>
        </View>
      </View>

{/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="add-circle-outline"
            label="New Request"
            onPress={handleNewRequest}
            color={Colors.light.tint}
          />
          <QuickActionButton
            icon="list-outline"
            label="My Requests"
            onPress={handleViewRequests}
            color="#3B82F6"
          />
        </View>
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="people-outline"
            label="Join Drive"
            onPress={handleViewDrives}
            color="#8B5CF6"
          />
          <QuickActionButton
            icon="car-outline"
            label="Track Pickup"
            onPress={handleTrackPickup}
            color="#F59E0B"
          />
        </View>
      </View>

{/* Recent Activity */}
      {recentRequests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={handleViewRequests}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentRequests.map((req, index) => (
              <TouchableOpacity
                key={req.id || `request-${index}`}
                style={styles.activityItem}
                onPress={() => router.push(`/(tabs)/citizen/request/${req.id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.activityIcon, {
                  backgroundColor: req.status === 'COMPLETED'
                    ? `${Colors.light.success}15`
                    : `${Colors.light.tint}15`
                }]}>
                  <Ionicons
                    name={req.status === 'COMPLETED' ? 'checkmark-outline' : 'time-outline'}
                    size={16}
                    color={req.status === 'COMPLETED' ? Colors.light.success : Colors.light.tint}
                  />
                </View>
<View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {req.category}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {req.quantity} item(s) • Request #{req.id?.slice(-4)}
                    </Text>
                  </View>
                <StatusBadge status={req.status} size="sm" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Empty State if no requests */}
      {requests.length === 0 && (
        <View style={styles.emptySection}>
          <EmptyState
            icon="leaf-outline"
            title="Start Your Eco Journey"
            description="Create your first e-waste pickup request and join the movement for a cleaner environment!"
            actionLabel="Create Request"
            onAction={handleNewRequest}
/>
      </View>
    )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.light.muted,
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.light.text,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.tint}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  impactBanner: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    padding: Spacing.xl,
    marginVertical: Spacing.md,
  },
  impactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  impactText: {
    marginLeft: Spacing.md,
  },
  impactTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  impactSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactStatValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  impactStatLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  impactStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSizes.sm,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  activityList: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  activityTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.light.text,
  },
  activitySubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.light.muted,
    marginTop: 1,
  },
  activityStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  activityStatusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  emptySection: {
    marginTop: Spacing.xl,
  },
});