export interface ThemeColorPalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surface2: string;
  foreground: string;
  muted: string;
  muted2: string;
  border: string;
  border2: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
}

export interface ThemeColors {
  light: ThemeColorPalette;
  dark: ThemeColorPalette;
}

declare const Colors: ThemeColors;
export default Colors;
