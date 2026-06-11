import {
  Bike,
  Mountain,
  Snowflake,
  Footprints,
  Activity as ActivityIcon,
  Dumbbell,
  MountainSnow,
  CircleDot,
  type LucideIcon,
} from 'lucide-react-native';

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  onPrimary: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  heroGradient: [string, string];
  fabGradient: [string, string];
}

const dark: Palette = {
  background: '#0E1116',
  surface: '#171B22',
  surfaceAlt: '#1F242D',
  primary: '#22C55E',
  onPrimary: '#04130A',
  text: '#F4F7FA',
  textMuted: '#9AA4B2',
  border: '#262C36',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',
  heroGradient: ['#10B981', '#06B6D4'],
  fabGradient: ['#22C55E', '#16A34A'],
};

const light: Palette = {
  background: '#F2F5F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF1F5',
  primary: '#16A34A',
  onPrimary: '#FFFFFF',
  text: '#0E1116',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',
  heroGradient: ['#10B981', '#0891B2'],
  fabGradient: ['#16A34A', '#15803D'],
};

export function getColors(scheme: ColorScheme | null | undefined): Palette {
  return scheme === 'light' ? light : dark;
}

export interface CategoryMeta {
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES = [
  'Bikepark',
  'Mountainbike',
  'Skifahren',
  'Rennrad',
  'Laufen',
  'Wandern',
  'Fitnessstudio',
  'Sonstiges',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<string, CategoryMeta> = {
  Bikepark: { icon: Bike, color: '#F97316' },
  Mountainbike: { icon: Mountain, color: '#84CC16' },
  Skifahren: { icon: Snowflake, color: '#38BDF8' },
  Rennrad: { icon: ActivityIcon, color: '#A855F7' },
  Laufen: { icon: Footprints, color: '#F43F5E' },
  Wandern: { icon: MountainSnow, color: '#14B8A6' },
  Fitnessstudio: { icon: Dumbbell, color: '#EAB308' },
  Sonstiges: { icon: CircleDot, color: '#94A3B8' },
};

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] ?? CATEGORY_META.Sonstiges;
}

export const PRIORITIES = ['Hoch', 'Mittel', 'Niedrig'] as const;
export type Priority = (typeof PRIORITIES)[number];

export function priorityColor(priority: string): string {
  switch (priority) {
    case 'Hoch':
      return '#EF4444';
    case 'Mittel':
      return '#F59E0B';
    default:
      return '#22C55E';
  }
}
