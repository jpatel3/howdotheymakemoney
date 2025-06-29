import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple slug generation function
export function generateSlug(name: string): string {
  if (!name) return ""
  return name
    .toLowerCase()
    .replace(/&/g, "and")      // Replace & with 'and'
    .replace(/\s+/g, "-")     // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars except hyphen
    .replace(/\-\-+/g, "-")   // Replace multiple - with single -
    .replace(/^-+/, "")      // Trim - from start of text
    .replace(/-+$/, "")      // Trim - from end of text
}
