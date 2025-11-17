export type Tool = "brush" | "cursor";
export type BlurType = "gaussian" | "motion" | "pixelate" | "square";
export type FilterType = "noir" | "fade" | "mono" | "process" | "tonal" | "sepia";

export interface SizePreset {
  name: string;
  width: number;
  height: number;
  icon?: React.ReactNode; // Optional icon
}