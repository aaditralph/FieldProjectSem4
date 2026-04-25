import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../../constants/theme';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  selected: boolean;
  onPress: () => void;
}

const categoryIcons: Record<Category, keyof typeof Ionicons.glyphMap> = {
  [Category.MOBILE]: 'phone-portrait-outline',
  [Category.LAPTOP]: 'laptop-outline',
  [Category.COMPUTER]: 'desktop-outline',
  [Category.TV]: 'tv-outline',
  [Category.PRINTER]: 'print-outline',
  [Category.BATTERY]: 'battery-full-outline',
  [Category.OTHER]: 'cube-outline',
};

const categoryColors: Record<Category, string> = {
  [Category.MOBILE]: '#3B82F6',
  [Category.LAPTOP]: '#8B5CF6',
  [Category.COMPUTER]: '#EC4899',
  [Category.TV]: '#EF4444',
  [Category.PRINTER]: '#F59E0B',
  [Category.BATTERY]: '#10B981',
  [Category.OTHER]: '#6B7280',
};

export function CategoryCard({ category, selected, onPress }: CategoryCardProps) {
  const icon = categoryIcons[category] || 'cube-outline';
  const color = categoryColors[category] || Colors.light.tint;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
        selected && { borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: selected ? `${color}15` : Colors.light.background },
      ]}>
        <Ionicons
          name={icon}
          size={24}
          color={selected ? color : Colors.light.muted}
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: selected ? Colors.light.text : Colors.light.muted },
        ]}
        numberOfLines={1}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  containerSelected: {
    backgroundColor: Colors.light.surface,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
});