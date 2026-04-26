import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS } from '@/src/theme/Theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
});
