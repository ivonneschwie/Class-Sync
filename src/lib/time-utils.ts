/**
 * Formats a 24-hour time string (HH:mm) into a 12-hour AM/PM string (h:mm A).
 * @param time The time string in HH:mm format.
 * @returns The formatted time string.
 */
export function formatTimeToAMPM(time: string): string {
  if (!time) return '';
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}
