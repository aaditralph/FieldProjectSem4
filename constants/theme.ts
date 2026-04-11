export type Theme = {
  light: {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
  };
  dark: {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
  };
};

export const Colors: Theme = {
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
