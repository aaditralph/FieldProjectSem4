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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const STATUS_OPTIONS = [
  { value: 'CREATED', label: 'Pending' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentRequest, fetchRequestById, updateRequestStatus, isLoading, error } = useRequestStore();
  
  const [newStatus, setNewStatus] = useState<RequestStatus | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('');
  const [completedNotes, setCompletedNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentRequest) {
      setNewStatus(currentRequest.status);
      setScheduledDate(currentRequest.scheduledDate ? currentRequest.scheduledDate.split('T')[0] : '');
      setScheduledTimeSlot(currentRequest.scheduledTimeSlot || '');
    }
  }, [currentRequest]);

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

  const handleUpdateStatus = async () => {
    if (!newStatus) return;

    try {
      setIsUpdating(true);
      
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'SCHEDULED') {
        if (!scheduledDate) {
          Alert.alert('Missing Date', 'Please enter a scheduled date');
          return;
        }
        updateData.scheduledDate = scheduledDate;
        updateData.scheduledTimeSlot = scheduledTimeSlot || currentRequest?.preferredTimeSlot;
      }
      
      if (newStatus === 'COMPLETED' && completedNotes.trim()) {
        updateData.completedNotes = completedNotes.trim();
      }

      await updateRequestStatus(id, updateData);
      Alert.alert('Success', 'Status updated successfully');
    } catch (err: any) {
      Alert.alert('Error', error || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && !currentRequest) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e44ad" />
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
        <Text style={styles.title}>Ticket Details</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentRequest.status) }]}>
          <Text style={styles.statusText}>{currentRequest.status}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Status Update Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          
          <TouchableOpacity
            style={styles.statusDropdown}
            onPress={() => setShowStatusMenu(!showStatusMenu)}
          >
            <Text style={styles.statusDropdownText}>
              {newStatus ? STATUS_OPTIONS.find(s => s.value === newStatus)?.label : 'Select Status'}
            </Text>
            <Text style={styles.dropdownArrow}>{showStatusMenu ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showStatusMenu && (
            <View style={styles.statusMenu}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    newStatus === option.value && styles.statusOptionActive,
                  ]}
                  onPress={() => {
                    setNewStatus(option.value as RequestStatus);
                    setShowStatusMenu(false);
                  }}
                >
                  <Text style={[
                    styles.statusOptionText,
                    newStatus === option.value && styles.statusOptionTextActive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Schedule fields - show when status is SCHEDULED */}
          {newStatus === 'SCHEDULED' && (
            <>
              <Text style={styles.label}>Scheduled Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={scheduledDate}
                onChangeText={setScheduledDate}
              />
              <Text style={styles.label}>Scheduled Time Slot</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 09:00 AM - 12:00 PM"
                value={scheduledTimeSlot}
                onChangeText={setScheduledTimeSlot}
              />
            </>
          )}

          {/* Completion notes - show when status is COMPLETED */}
          {newStatus === 'COMPLETED' && (
            <>
              <Text style={styles.label}>Completion Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add notes about the pickup completion..."
                value={completedNotes}
                onChangeText={setCompletedNotes}
                multiline
                numberOfLines={3}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
            onPress={handleUpdateStatus}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Status</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Request Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Request ID</Text>
            <Text style={[styles.detailValue, styles.mono]}>{currentRequest.id?.slice?.(-8) || 'N/A'}</Text>
          </View>

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
            <Text style={styles.detailLabel}>Contact Phone</Text>
            <Text style={styles.detailValue}>{currentRequest.contactPhone}</Text>
          </View>

          {currentRequest.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{currentRequest.notes}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted</Text>
            <Text style={styles.detailValue}>{formatDateTime(currentRequest.createdAt)}</Text>
          </View>

          {currentRequest.completedAt && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Completed</Text>
                <Text style={styles.detailValue}>{formatDateTime(currentRequest.completedAt)}</Text>
              </View>
              {currentRequest.completedNotes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Completion Notes</Text>
                  <Text style={styles.detailValue}>{currentRequest.completedNotes}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Image */}
        {currentRequest.imageUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uploaded Image</Text>
            <Image source={{ uri: currentRequest.imageUrl }} style={styles.requestImage} />
          </View>
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
    backgroundColor: '#8e44ad',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  statusDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  statusDropdownText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  statusMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  statusOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusOptionActive: {
    backgroundColor: '#8e44ad',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  statusOptionTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#8e44ad',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
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
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#8e44ad',
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
