import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a palette of blue shades for charts
// Uses a single blue hue and varies lightness to produce distinct shades
export function generateBlueShades(count: number): string[] {
  const baseHue = 217; // ~Tailwind blue-500 hue
  const saturation = 90;
  const minLightness = 30;
  const maxLightness = 80;

  if (count <= 1) {
    return [`hsl(${baseHue}, ${saturation}%, 55%)`];
  }

  const step = (maxLightness - minLightness) / Math.max(1, count - 1);
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = maxLightness - i * step;
    shades.push(`hsl(${baseHue}, ${saturation}%, ${lightness}%)`);
  }
  return shades;
}
