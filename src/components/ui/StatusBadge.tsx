import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../../constants/theme';
import { RequestStatus } from '../../types';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<RequestStatus, { label: string; color: string; icon?: keyof typeof Ionicons.glyphMap }> = {
  [RequestStatus.CREATED]: {
    label: 'Pending',
    color: '#F59E0B',
    icon: 'time-outline',
  },
  [RequestStatus.SCHEDULED]: {
    label: 'Scheduled',
    color: '#3B82F6',
    icon: 'calendar-outline',
  },
  [RequestStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#8B5CF6',
    icon: 'car-outline',
  },
  [RequestStatus.COMPLETED]: {
    label: 'Completed',
    color: '#10B981',
    icon: 'checkmark-circle-outline',
  },
  [RequestStatus.CANCELLED]: {
    label: 'Cancelled',
    color: '#EF4444',
    icon: 'close-circle-outline',
  },
  [RequestStatus.APPROVED]: {
    label: 'Approved',
    color: '#10B981',
    icon: 'checkmark-done-outline',
  },
  [RequestStatus.REJECTED]: {
    label: 'Rejected',
    color: '#EF4444',
    icon: 'close-circle-outline',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: Colors.light.muted };
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.container,
      { backgroundColor: `${config.color}15` },
      isSmall && styles.containerSmall,
    ]}>
      {config.icon && (
        <Ionicons
          name={config.icon}
          size={isSmall ? 10 : 12}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text style={[
        styles.label,
        { color: config.color },
        isSmall && styles.labelSmall,
      ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 10,
  },
});