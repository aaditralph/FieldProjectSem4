import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../../constants/theme';
import { Request, RequestStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface RequestCardProps {
  request: Request;
  onPress: () => void;
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Mobile Phone': 'phone-portrait-outline',
  'Laptop': 'laptop-outline',
  'Desktop Computer': 'desktop-outline',
  'Television': 'tv-outline',
  'Printer': 'print-outline',
  'Battery': 'battery-full-outline',
  'Other Electronics': 'cube-outline',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RequestCard({ request, onPress }: RequestCardProps) {
  const category = request.category || 'Other Electronics';
  const icon = categoryIcons[category] || 'cube-outline';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color={Colors.light.tint} />
          </View>
          <View style={styles.categoryText}>
            <Text style={styles.category}>{category}</Text>
            <Text style={styles.quantity}>Quantity: {request.quantity} item(s)</Text>
          </View>
        </View>
        <StatusBadge status={request.status} size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={Colors.light.muted} />
          <Text style={styles.detailText} numberOfLines={1}>
            {request.address}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.light.muted} />
          <Text style={styles.detailText}>
            {request.createdAt ? formatDate(request.createdAt) : 'Today'}
          </Text>
        </View>
        {request.scheduledTime && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color={Colors.light.tint} />
            <Text style={[styles.detailText, { color: Colors.light.tint }]}>
              Scheduled: {formatDate(request.scheduledTime)}
            </Text>
          </View>
        )}
      </View>

      {request.status === RequestStatus.IN_PROGRESS && request.otp && (
        <View style={styles.otpContainer}>
          <Ionicons name="key-outline" size={14} color={Colors.light.warning} />
          <Text style={styles.otpLabel}> OTP: </Text>
          <Text style={styles.otpValue}>{request.otp}</Text>
          <Text style={styles.otpHint}> (Share with vendor)</Text>
        </View>
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
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.light.tint}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  categoryText: {
    flex: 1,
  },
  category: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
  },
  quantity: {
    fontSize: FontSizes.sm,
    color: Colors.light.muted,
    marginTop: 2,
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
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.light.warning}15`,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  otpLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.warning,
  },
  otpValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.light.warning,
    letterSpacing: 2,
  },
  otpHint: {
    fontSize: FontSizes.xs,
    color: Colors.light.muted,
  },
});