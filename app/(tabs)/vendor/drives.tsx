import { useVendorStore } from '@/src/store/vendorStore';
import { Drive } from '@/src/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../../constants/theme';
import { DriveCard } from '../../../src/components/ui/DriveCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';

export default function VendorDrivesScreen() {
  const { drives, fetchDrives, completeDrive, isLoading } = useVendorStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchDrives();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDrives();
    setRefreshing(false);
  };

  const handleCompletePress = (drive: Drive) => {
    setSelectedDrive(drive);
    setOtp('');
    setShowOtpModal(true);
  };

  const confirmComplete = async () => {
    if (!selectedDrive) return;

    if (!otp.trim() || otp.length !== 4) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
      return;
    }

    try {
      await completeDrive(selectedDrive.id || selectedDrive._id, otp.trim());
      Alert.alert('Success', 'Drive completed successfully!');
      setShowOtpModal(false);
      setSelectedDrive(null);
      setOtp('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete drive');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderDrive = ({ item }: { item: Drive }) => {
    return (
      <DriveCard
        drive={item}
        showOtp={false} // Vendor does NOT see OTP on card
        onPress={() => handleCompletePress(item)}
      />
    );
  };

  if (isLoading && drives.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drives}
        renderItem={renderDrive}
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
              icon="calendar-outline"
              title="No upcoming drives"
              description="Drives assigned to you will appear here"
            />
          </View>
        }
      />

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Drive</Text>

            {selectedDrive && (
              <View style={styles.driveInfo}>
                <Text style={styles.driveInfoText}>Location: {selectedDrive.location}</Text>
                <Text style={styles.driveInfoText}>Date: {formatDate(selectedDrive.date)}</Text>
                <Text style={styles.driveInfoText}>
                  Participants: {selectedDrive.registeredCount}/{selectedDrive.capacity}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Enter OTP from Citizen</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 4-digit OTP"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
              textAlign="center"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowOtpModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, !otp.trim() && styles.buttonDisabled]}
                onPress={confirmComplete}
                disabled={!otp.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Complete</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  emptyContainer: {
    flex: 1,
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
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  driveInfo: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  driveInfoText: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  otpHint: {
    fontSize: FontSizes.sm,
    color: Colors.light.muted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  otpInput: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: Colors.light.tint,
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
