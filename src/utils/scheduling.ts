import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const TIME_SLOTS = [
  { label: '9:00 AM - 12:00 PM', value: '09:00' },
  { label: '12:00 PM - 3:00 PM', value: '12:00' },
  { label: '3:00 PM - 6:00 PM', value: '15:00' },
];

/**
 * Get available dates (next 7 days)
 */
export const getAvailableDates = () => {
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const date = dayjs().add(i, 'day');
    dates.push({
      label: date.format('ddd, MMM DD'),
      value: date.format('YYYY-MM-DD'),
      disabled: false,
    });
  }
  return dates;
};

/**
 * Get available time slots for a given date
 */
export const getAvailableTimeSlots = (date: string, bookedSlots: string[] = []) => {
  return TIME_SLOTS.map(slot => ({
    ...slot,
    disabled: bookedSlots.includes(slot.value),
  }));
};

/**
 * Check if a request can be rescheduled (before cutoff time)
 */
export const canReschedule = (scheduledTime: string): boolean => {
  const now = dayjs();
  const scheduled = dayjs(scheduledTime);
  const cutoff = scheduled.subtract(2, 'hour');
  return now.isBefore(cutoff);
};

/**
 * Check if a request can be cancelled (before cutoff time)
 */
export const canCancel = (scheduledTime: string): boolean => {
  const now = dayjs();
  const scheduled = dayjs(scheduledTime);
  const cutoff = scheduled.subtract(24, 'hour');
  return now.isBefore(cutoff);
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateTime: string): string => {
  return dayjs(dateTime).format('MMM DD, YYYY hh:mm A');
};

/**
 * Format date for display
 */
export const formatDate = (date: string): string => {
  return dayjs(date).format('MMM DD, YYYY');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateTime: string): string => {
  return dayjs(dateTime).fromNow();
};
