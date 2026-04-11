import { useRequestStore } from '@/src/store/requestStore';
import { RequestStatus } from '@/src/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentRequest, fetchRequestById, cancelRequest, isLoading, error } = useRequestStore();
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    }
  }, [id]);

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

  const getStatusLabel = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.CREATED:
        return 'Pending';
      case RequestStatus.SCHEDULED:
        return 'Scheduled';
      case RequestStatus.IN_PROGRESS:
        return 'In Progress';
      case RequestStatus.COMPLETED:
        return 'Completed';
      case RequestStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this pickup request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await cancelRequest(id);
              Alert.alert('Cancelled', 'Your request has been cancelled successfully');
              router.back();
            } catch (err: any) {
              Alert.alert('Error', error || 'Failed to cancel request');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const canCancel = (status: RequestStatus) => {
    return status === RequestStatus.CREATED || status === RequestStatus.SCHEDULED;
  };

  if (isLoading && !currentRequest) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  if (!currentRequest) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Request not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Request Details</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentRequest.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(currentRequest.status)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            {['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((status, index) => {
              const isActive = ['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].indexOf(currentRequest.status) >= index;
              const isCurrent = currentRequest.status === status;
              return (
                <View key={status} style={styles.timelineItem}>
                  <View style={[
                    styles.timelineDot,
                    isActive && styles.timelineDotActive,
                    isCurrent && styles.timelineDotCurrent,
                  ]} />
                  {index < 3 && (
                    <View style={[
                      styles.timelineLine,
                      isActive && styles.timelineLineActive,
                    ]} />
                  )}
                  <Text style={[
                    styles.timelineLabel,
                    isActive && styles.timelineLabelActive,
                  ]}>
                    {status.replace('_', ' ')}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pickup Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Preferred Date</Text>
            <Text style={styles.detailValue}>{formatDate(currentRequest.preferredDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Preferred Time</Text>
            <Text style={styles.detailValue}>{currentRequest.preferredTimeSlot}</Text>
          </View>

          {currentRequest.scheduledDate && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Scheduled Date</Text>
                <Text style={styles.detailValue}>{formatDate(currentRequest.scheduledDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Scheduled Time</Text>
                <Text style={styles.detailValue}>{currentRequest.scheduledTimeSlot}</Text>
              </View>
            </>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{currentRequest.address}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact</Text>
            <Text style={styles.detailValue}>{currentRequest.contactPhone}</Text>
          </View>

          {currentRequest.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{currentRequest.notes}</Text>
            </View>
          )}
        </View>

        {/* Image */}
        {currentRequest.imageUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uploaded Image</Text>
            <Image source={{ uri: currentRequest.imageUrl }} style={styles.requestImage} />
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Info</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Request ID</Text>
            <Text style={[styles.detailValue, styles.mono]}>{currentRequest.id.slice(-8)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted</Text>
            <Text style={styles.detailValue}>{formatDateTime(currentRequest.createdAt)}</Text>
          </View>
          {currentRequest.completedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completed</Text>
              <Text style={styles.detailValue}>{formatDateTime(currentRequest.completedAt)}</Text>
            </View>
          )}
          {currentRequest.completedNotes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completion Notes</Text>
              <Text style={styles.detailValue}>{currentRequest.completedNotes}</Text>
            </View>
          )}
        </View>

        {/* Cancel Button */}
        {canCancel(currentRequest.status) && (
          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator color="#e74c3c" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            )}
          </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dee2e6',
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  timelineDotActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  timelineDotCurrent: {
    backgroundColor: '#fff',
    borderColor: '#27ae60',
    borderWidth: 4,
  },
  timelineLine: {
    position: 'absolute',
    top: 7,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#dee2e6',
  },
  timelineLineActive: {
    backgroundColor: '#27ae60',
  },
  timelineLabel: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#27ae60',
    fontWeight: '600',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  mono: {
    fontFamily: 'monospace',
  },
  requestImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e74c3c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
