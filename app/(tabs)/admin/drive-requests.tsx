import { useAdminStore } from '@/src/store/adminStore';
import { Request, Role, User } from '@/src/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../../constants/theme';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { EmptyState } from '../../../src/components/ui/EmptyState';

type FilterType = 'ALL' | 'PENDING';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
];

export default function AdminDriveRequestsScreen() {
  const {
    driveRequests,
    vendors,
    isLoading,
    fetchDriveRequests,
    fetchVendors,
    approveDriveRequest,
    rejectDriveRequest,
  } = useAdminStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('PENDING');
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      await Promise.all([fetchDriveRequests(), fetchVendors()]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprovePress = (request: Request) => {
    setSelectedRequest(request);
    setSelectedVendorId('');
    setApproveModalVisible(true);
  };

  const handleRejectPress = async (request: Request) => {
    Alert.alert(
      'Reject Drive Request',
      'Are you sure you want to reject this drive request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const requestId = request.id || request._id;
              await rejectDriveRequest(requestId);
              await fetchDriveRequests(); // Refresh list
              Alert.alert('Success', 'Drive request rejected');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject drive request');
            }
          },
        },
      ]
    );
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest || !selectedVendorId) {
      Alert.alert('Error', 'Please select a vendor');
      return;
    }

    try {
      const requestId = selectedRequest.id || selectedRequest._id;
      await approveDriveRequest(requestId, selectedVendorId);
      await fetchDriveRequests(); // Refresh list
      Alert.alert(
        'Drive Approved',
        'Drive created and vendor assigned successfully!',
        [{ text: 'OK', onPress: () => setApproveModalVisible(false) }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve drive request');
    }
  };

  const filteredRequests = driveRequests.filter(request => {
    if (activeFilter === 'PENDING') {
      return request.status === 'CREATED';
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderRequest = ({ item }: { item: Request }) => {
    const isPending = item.status === 'CREATED';
    const isRejected = item.status === 'REJECTED';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.location} numberOfLines={1}>
            {item.address}
          </Text>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={14} color={Colors.light.muted} />
            <Text style={styles.detail}>
              {formatDate(item.scheduledTime || item.createdAt)}
            </Text>
          </View>
          {item.userId && (
            <View style={styles.row}>
              <Ionicons name="person-outline" size={14} color={Colors.light.muted} />
              <Text style={styles.detail}>{item.userId.name || 'N/A'}</Text>
            </View>
          )}

          {item.driveId && (
            <View style={[styles.badge, styles.approvedBadge]}>
              <Text style={styles.badgeText}>Drive Created</Text>
            </View>
          )}

          {isPending && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={() => handleApprovePress(item)}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>Approve & Assign Vendor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleRejectPress(item)}
              >
                <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {isRejected && (
            <View style={[styles.badge, styles.rejectedBadge]}>
              <Text style={styles.badgeText}>Rejected</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const vendorOptions = vendors.filter(v => v.role === 'VENDOR');

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

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={item => item.id || item._id}
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
              icon="folder-outline"
              title={
                activeFilter === 'PENDING'
                  ? 'No pending drive requests'
                  : 'No drive requests'
              }
              description={
                activeFilter === 'PENDING'
                  ? 'Citizen drive requests will appear here'
                  : 'No drive requests found'
              }
            />
          </View>
        }
      />

      {/* Approve Modal with Vendor Selection */}
      <Modal
        visible={approveModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setApproveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Approve Drive Request</Text>

            {selectedRequest && (
              <View style={styles.requestInfo}>
                <Text style={styles.requestInfoText}>Location: {selectedRequest.address}</Text>
                <Text style={styles.requestInfoText}>
                  Date: {formatDate(selectedRequest.scheduledTime || selectedRequest.createdAt)}
                </Text>
                <Text style={styles.requestInfoText}>
                  Citizen: {selectedRequest.userId?.name || 'N/A'}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Assign Vendor</Text>
            {vendorOptions.length === 0 ? (
              <Text style={styles.noVendorsText}>No vendors available</Text>
            ) : (
              <View style={styles.vendorList}>
                {vendorOptions.map(vendor => {
                  const vendorId = vendor.id || vendor._id;
                  return (
                    <TouchableOpacity
                      key={vendorId}
                      style={[
                        styles.vendorOption,
                        (selectedVendorId === vendorId) && styles.vendorOptionSelected,
                      ]}
                      onPress={() => setSelectedVendorId(vendorId)}
                    >
                      <View style={styles.vendorInfo}>
                        <Text style={[
                          styles.vendorName,
                          selectedVendorId === vendorId && styles.vendorNameSelected,
                        ]}>
                          {vendor.name}
                        </Text>
                        <Text style={styles.vendorPhone}>{vendor.phone}</Text>
                      </View>
                      {selectedVendorId === vendorId && (
                        <Ionicons name="checkmark-circle" size={24} color={Colors.light.tint} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setApproveModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  (!selectedVendorId || vendors.length === 0) && styles.buttonDisabled,
                ]}
                onPress={handleApproveConfirm}
                disabled={!selectedVendorId || vendors.length === 0}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Approve & Assign</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  },
  emptyContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  location: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  cardBody: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detail: {
    fontSize: FontSizes.sm,
    color: Colors.light.muted,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  approvedBadge: {
    backgroundColor: `${Colors.light.tint}15`,
  },
  rejectedBadge: {
    backgroundColor: `${Colors.light.error}15`,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  approveButton: {
    backgroundColor: Colors.light.tint,
  },
  rejectButton: {
    backgroundColor: Colors.light.error,
  },
  buttonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  requestInfo: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  requestInfoText: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  noVendorsText: {
    fontSize: FontSizes.sm,
    color: Colors.light.muted,
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
  },
  vendorList: {
    maxHeight: 200,
    marginBottom: Spacing.lg,
  },
  vendorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vendorOptionSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: `${Colors.light.tint}10`,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
  },
  vendorNameSelected: {
    color: Colors.light.tint,
  },
  vendorPhone: {
    fontSize: FontSizes.sm,
    color: Colors.light.muted,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  cancelButton: {
    backgroundColor: Colors.light.muted,
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
