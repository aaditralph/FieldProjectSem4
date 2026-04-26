import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '@/src/theme/Theme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export function AnimatedButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon,
  disabled = false,
  style,
  textStyle
}: AnimatedButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  let colors = isPrimary ? [COLORS.primary, COLORS.secondary] : [COLORS.surface, COLORS.surfaceHighlight];
  if (isDanger) colors = ['#F43F5E', '#E11D48'];

  return (
    <MotiView
      transition={{ type: 'spring', damping: 15 }}
      style={[{ marginHorizontal: 4 }, style, disabled && { opacity: 0.6 }]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled}>
        {isPrimary || variant === 'secondary' || isDanger ? (
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, isOutline && styles.buttonOutline]}
          >
            {icon && <Ionicons name={icon} size={20} color={isPrimary ? '#000' : COLORS.text} style={{ marginRight: 8 }} />}
            <Text style={[styles.buttonText, { color: isPrimary ? '#000' : COLORS.text }, textStyle]}>{title}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.button, styles.buttonOutline]}>
            {icon && <Ionicons name={icon} size={20} color={COLORS.text} style={{ marginRight: 8 }} />}
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});
