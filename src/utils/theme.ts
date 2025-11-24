const primary = "#0C154C";
const secondaryLight = "#E8E9F1";
const secondaryDark = "#1F2937";
const accent = "#3B4897";
const error = "#F04438";
const backgroundLight = "#F5F7FB";
const backgroundDark = "#0F172A";
const cardLight = "#FFFFFF";
const cardDark = "#111827";
const textLight = "#0F172A";
const textDark = "#F9FAFB";
const borderLight = "#E5E7EB";
const borderDark = "#374151";
const placeholderLight = "#9CA3AF";
const placeholderDark = "#9CA3AF";
const mutedLight = "#6B7280";
const mutedDark = "#9CA3AF";
const tintColorLight = primary;
const tintColorDark = primary;

export type ITheme = "light" | "dark";
export type IVariant = "primary" | "secondary" | "accent" | "error";
interface IColor extends Record<IVariant, string> {
  text: string;
  background: string;
  card: string;
  border: string;
  placeholder: string;
  muted: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export const colors: Record<ITheme, IColor> = {
  light: {
    primary,
    secondary: secondaryLight,
    accent,
    error,
    text: textLight,
    background: backgroundLight,
    card: cardLight,
    border: borderLight,
    placeholder: placeholderLight,
    muted: mutedLight,
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
  dark: {
    primary,
    secondary: secondaryDark,
    accent,
    error,
    text: textDark,
    background: backgroundDark,
    card: cardDark,
    border: borderDark,
    placeholder: placeholderDark,
    muted: mutedDark,
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
  },
};
export const getColor = (theme: "light" | "dark" = "light") => {
  return colors[theme];
};
export default colors;
