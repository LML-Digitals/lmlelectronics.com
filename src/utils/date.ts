import { format } from 'date-fns';

/**
 * Format a date into a string with a standardized format
 * @param date The date to format
 * @param formatString Optional custom format string
 * @returns Formatted date string
 */
export function formattedDateString (
  date: Date,
  formatString = 'PPP',
): string {
  return format(date, formatString);
}
