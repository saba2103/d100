import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely, resolving conflicts.
 * Uses clsx for conditional logic + tailwind-merge to dedupe.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
