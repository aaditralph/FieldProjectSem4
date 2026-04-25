import { useAuthStore } from '@/src/store/authStore';
import { useRequestStore } from '@/src/store/requestStore';
import { Category, RequestStatus } from '@/src/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../../../constants/theme';
import { StatusBadge } from '../../../../src/components/ui/StatusBadge';

const categoryIcons: Record<Category, keyof typeof Ionicons.glyphMap> = {
  [Category.MOBILE]: 'phone-portrait-outline',
  [Category.LAPTOP]: 'laptop-outline',
  [Category.COMPUTER]: 'desktop-outline',
  [Category.TV]: 'tv-outline',
  [Category.PRINTER]: 'print-outline',
  [Category.BATTERY]: 'battery-full-outline',
  [Category.OTHER]: 'cube-outline',
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    currentRequest: request,
    fetchRequestById,
    cancelRequest,
    isLoading,
    clearError,
  } = useRequestStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadRequest = useCallback(async () => {
    if (!id) return;
    try {
      await fetchRequestById(id);
    } catch (error) {
      console.error('Failed to load request:', error);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadRequest();
    }, [loadRequest])
  );

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelRequest(id);
              Alert.alert('Success', 'Request has been cancelled.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to cancel request');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequest();
    setRefreshing(false);
  };

  if (isLoading && !request) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.light.muted} />
        <Text style={styles.errorText}>Request not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = request.category || 'Other Electronics';
  const icon = categoryIcons[category] || 'cube-outline';
  const canCancel = request.status === RequestStatus.CREATED || request.status === RequestStatus.SCHEDULED;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.light.tint}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name={icon} size={32} color={Colors.light.tint} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <Text style={styles.requestId}>Request #{request.id?.slice(-6) || 'N/A'}</Text>
        </View>
        <StatusBadge status={request.status} />
      </View>

      {/* Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Request Details</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color={Colors.light.muted} />
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{request.quantity} item(s)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={Colors.light.muted} />
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={[styles.detailValue, styles.addressText]}>{request.address}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.light.muted} />
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>{formatDateTime(request.createdAt)}</Text>
        </View>

        {request.scheduledTime && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={Colors.light.tint} />
              <Text style={styles.detailLabel}>Scheduled:</Text>
              <Text style={[styles.detailValue, { color: Colors.light.tint }]}>
                {formatDateTime(request.scheduledTime)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* OTP Section (for IN_PROGRESS requests) */}
      {request.status === RequestStatus.IN_PROGRESS && request.otp && (
        <View style={styles.otpCard}>
          <View style={styles.otpHeader}>
            <Ionicons name="key-outline" size={20} color={Colors.light.warning} />
            <Text style={styles.otpTitle}>Share this OTP with vendor</Text>
          </View>
          <View style={styles.otpContainer}>
            <Text style={styles.otpValue}>{request.otp}</Text>
          </View>
          <Text style={styles.otpHint}>
            Show this OTP to the vendor when they arrive for pickup
          </Text>
        </View>
      )}

      {/* Status Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status Timeline</Text>
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.light.success }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Request Created</Text>
              <Text style={styles.timelineTime}>{formatDateTime(request.createdAt)}</Text>
            </View>
          </View>

          {request.status !== RequestStatus.CREATED && request.status !== RequestStatus.CANCELLED && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#3B82F6' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Scheduled</Text>
                <Text style={styles.timelineTime}>
                  {request.scheduledTime ? formatDateTime(request.scheduledTime) : 'Date not set'}
                </Text>
              </View>
            </View>
          )}

          {(request.status === RequestStatus.IN_PROGRESS || request.status === RequestStatus.COMPLETED) && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#8B5CF6' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Pickup In Progress</Text>
                <Text style={styles.timelineTime}>Vendor assigned</Text>
              </View>
            </View>
          )}

          {request.status === RequestStatus.COMPLETED && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.light.success }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Completed</Text>
                <Text style={styles.timelineTime}>
                  {request.updatedAt ? formatDateTime(request.updatedAt) : 'Recently'}
                </Text>
              </View>
            </View>
          )}

          {request.status === RequestStatus.CANCELLED && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.light.error }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: Colors.light.error }]}>Cancelled</Text>
                <Text style={styles.timelineTime}>
                  {request.updatedAt ? formatDateTime(request.updatedAt) : 'Recently'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Cancel Button */}
      {canCancel && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={18} color={Colors.light.error} />
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    gap: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.md,
    color: Colors.light.muted,
    marginTop: Spacing.md,
  },
  backButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.tint,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.light.tint}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
  },
  requestId: {
    fontSize: FontSizes.sm,
    color: Colors.light.muted,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSizes.sm,
    color: Colors.light.muted,
    width: 80,
  },
  detailValue: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
    fontWeight: '500',
    flex: 1,
  },
  addressText: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.md,
  },
  otpCard: {
    backgroundColor: `${Colors.light.warning}15`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.light.warning}30`,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  otpTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.warning,
  },
  otpContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  otpValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.warning,
    letterSpacing: 4,
  },
  otpHint: {
    fontSize: FontSizes.xs,
    color: Colors.light.muted,
    textAlign: 'center',
  },
  timeline: {
    gap: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.text,
  },
  timelineTime: {
    fontSize: FontSizes.xs,
    color: Colors.light.muted,
    marginTop: 2,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: `${Colors.light.error}15`,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.error,
  },
});
