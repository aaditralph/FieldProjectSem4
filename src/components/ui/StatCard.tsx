import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../../constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  change?: string;
  color?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  change,
  color = Colors.light.tint,
  style,
  onPress,
}: StatCardProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {change && (
        <View style={styles.changeContainer}>
          <Ionicons name="trending-up" size={12} color={Colors.light.success} />
          <Text style={styles.changeText}>{change}</Text>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xs,
    color: Colors.light.muted,
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.xs,
    color: Colors.light.muted,
    marginTop: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 2,
  },
  changeText: {
    fontSize: FontSizes.xs,
    color: Colors.light.success,
    fontWeight: '500',
  },
});