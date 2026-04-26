import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../../constants/theme';
import { Drive } from '../../types';

interface DriveCardProps {
  drive: Drive;
  onPress?: () => void;
  onJoin?: () => void;
  onComplete?: () => void;
  showOtp?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DriveCard({ drive, onPress, onJoin, onComplete, showOtp }: DriveCardProps) {
  const isFull = drive.registeredCount >= drive.capacity;
  const percentage = (drive.registeredCount / drive.capacity) * 100;
  const spotsLeft = drive.capacity - drive.registeredCount;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={18} color={Colors.light.tint} />
          <Text style={styles.location} numberOfLines={1}>
            {drive.location}
          </Text>
        </View>
        <View style={[
          styles.badge,
          isFull ? styles.badgeFull : styles.badgeAvailable,
        ]}>
          <Text style={styles.badgeText}>
            {isFull ? 'Full' : `${spotsLeft} spots left`}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.light.muted} />
          <Text style={styles.detailText}>{formatDate(drive.date)}</Text>
          <Text style={styles.detailText}> | </Text>
          <Ionicons name="time-outline" size={14} color={Colors.light.muted} />
          <Text style={styles.detailText}>{formatTime(drive.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={14} color={Colors.light.muted} />
          <Text style={styles.detailText}>
            {drive.registeredCount} / {drive.capacity} registered
          </Text>
        </View>
       </View>

      {showOtp && drive.otp && (
        <View style={styles.otpContainer}>
          <Ionicons name="key-outline" size={14} color={Colors.light.tint} />
          <Text style={styles.otpLabel}> OTP: </Text>
          <Text style={styles.otpValue}>{drive.otp}</Text>
          <Text style={styles.otpHint}> (share with vendor)</Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isFull ? Colors.light.error : Colors.light.tint,
              },
            ]}
          />
        </View>
      </View>

      {!isFull && onJoin && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={onJoin}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.joinButtonText}>Join Drive</Text>
        </TouchableOpacity>
      )}

       {isFull && (
         <View style={styles.fullButton}>
           <Text style={styles.fullButtonText}>Drive Full</Text>
         </View>
       )}

       {onComplete && (
         <TouchableOpacity
           style={styles.completeButton}
           onPress={onComplete}
           activeOpacity={0.7}
         >
           <Ionicons name="checkmark-done-outline" size={18} color="#FFFFFF" />
           <Text style={styles.completeButtonText}>Complete Drive</Text>
         </TouchableOpacity>
       )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
  },
  location: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeAvailable: {
    backgroundColor: `${Colors.light.tint}15`,
  },
  badgeFull: {
    backgroundColor: `${Colors.light.error}15`,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.md,
  },
  details: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: FontSizes.sm,
    color: Colors.light.muted,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.light.tint}15`,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  otpLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  otpValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.light.tint,
    letterSpacing: 2,
  },
  otpHint: {
    fontSize: FontSizes.xs,
    color: Colors.light.muted,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  fullButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
   fullButtonText: {
     color: Colors.light.muted,
     fontSize: FontSizes.md,
     fontWeight: '600',
   },
   completeButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: '#10B981',
     paddingVertical: Spacing.md,
     borderRadius: BorderRadius.md,
     marginTop: Spacing.md,
     gap: Spacing.xs,
   },
   completeButtonText: {
     color: '#FFFFFF',
     fontSize: FontSizes.md,
     fontWeight: '600',
   },
 });