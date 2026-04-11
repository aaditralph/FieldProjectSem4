import { useColorScheme } from './use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
): string {
  const theme = useColorScheme() ?? 'light';
  const color = props[theme as 'light' | 'dark'];
  
  if (color) {
    return color;
  }
  
  // Default theme colors
  const defaultColors = {
    light: {
      text: '#000',
      background: '#fff',
      tint: '#27ae60',
      icon: '#687076',
      tabIconDefault: '#687076',
      tabIconSelected: '#27ae60',
    },
    dark: {
      text: '#fff',
      background: '#000',
      tint: '#27ae60',
      icon: '#9BA1A6',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: '#27ae60',
    },
  };
  
  return (defaultColors[theme as 'light' | 'dark'] as any)[colorName] || '#000';
}
