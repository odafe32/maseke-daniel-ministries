const primary = "#1F2B5E";
const tintColorLight = primary;
const tintColorDark = primary;

const text = "#000000";
const background = "#fff";

export type ITheme = "light" | "dark";
export type IVariant = "primary" | "secondary" | "accent" | "error";
interface IColor extends Record<IVariant, string> {
  text: string;
  background: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
}
export const colors: Record<ITheme, IColor> = {
  light: {
    primary,
    secondary: "",
    accent: "",
    text,
    background,
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
    error: "",
  },
  dark: {
    primary,
    secondary: "",
    accent: "",
    text,
    background,
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
    error: "",
  },
};
export const getColor = (theme: "light" | "dark" = "light") => {
  return colors[theme];
};
export default colors;
