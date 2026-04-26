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
import { MotiView } from 'moti';

const COLORS = {
  background: '#0B0F19',
  surface: 'rgba(255, 255, 255, 0.05)',
  primary: '#10B981',
  text: '#FFFFFF',
  textDim: '#9CA3AF',
  border: 'rgba(255, 255, 255, 0.1)',
  vendorSurface: 'rgba(16, 185, 129, 0.1)',
  otpSurface: 'rgba(245, 158, 11, 0.1)',
  otpBorder: 'rgba(245, 158, 11, 0.3)',
  otpText: '#FBBF24',
};

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
        return '#F59E0B'; // Amber
      case RequestStatus.SCHEDULED:
        return '#3B82F6'; // Blue
      case RequestStatus.IN_PROGRESS:
        return '#8B5CF6'; // Purple
      case RequestStatus.COMPLETED:
        return '#10B981'; // Green
      case RequestStatus.CANCELLED:
        return '#EF4444'; // Red
      default:
        return '#9CA3AF'; // Gray
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

  const renderRequest = ({ item, index }: { item: Request; index: number }) => {
    // Handle both _id (from backend) and id (from mock)
    const itemId = (item as any)._id || item.id;
    const items = (item.items && item.items.length > 0)
      ? item.items
      : ((item as any).category ? [{ category: (item as any).category, quantity: (item as any).quantity }] : []);

    if (items.length === 0 && item.type !== 'DRIVE') return null;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 100 }}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.category}>
              {item.type === 'DRIVE' ? 'Community Drive' : (items.length > 1
                ? `Multiple Items (${items.length})`
                : items[0]?.category)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
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
      </MotiView>
    );
  };

  if (isLoading && requests.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MotiView 
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.header}
      >
        <Text style={styles.greeting}>Hello, {user?.name}!</Text>
        <Text style={styles.subtext}>Your e-waste requests history</Text>
      </MotiView>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => (item as any)._id || item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary} 
            colors={[COLORS.primary]} 
          />
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
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    gap: 8,
  },
  detail: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  vendorCard: {
    backgroundColor: COLORS.vendorSurface,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  vendorLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  vendorPhone: {
    fontSize: 13,
    color: COLORS.textDim,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 8,
  },
  otpCard: {
    backgroundColor: COLORS.otpSurface,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.otpBorder,
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 12,
    color: COLORS.otpText,
    fontWeight: '700',
    marginBottom: 8,
  },
  otpValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.otpText,
    letterSpacing: 6,
  },
  otpHelper: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 8,
    textAlign: 'center',
  },
});
