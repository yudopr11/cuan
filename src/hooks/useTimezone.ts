import { useState, useEffect, useCallback } from 'react';

const TIMEZONE_KEY = 'timezone';

export default function useTimezone() {
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem(TIMEZONE_KEY) || 'UTC'
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TIMEZONE_KEY && e.newValue) {
        setTimezone(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: tz,
    });
  }, [timezone]);

  const toLocalDateString = useCallback((dateString: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    // en-CA reliably produces YYYY-MM-DD required by HTML date inputs
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(dateString));
  }, [timezone]);

  const getTodayString = useCallback((): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  }, [timezone]);

  // Combines the user-selected date with the current wall-clock time in their timezone,
  // then converts the result to a UTC ISO string for the API.
  const toUTCISOString = useCallback((dateStr: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    const now = new Date();

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const h = (parts.find(p => p.type === 'hour')?.value ?? '00').padStart(2, '0');
    const m = (parts.find(p => p.type === 'minute')?.value ?? '00').padStart(2, '0');
    const s = (parts.find(p => p.type === 'second')?.value ?? '00').padStart(2, '0');

    // Derive UTC offset by comparing what "now" looks like in each zone
    const refUtc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const refTz = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const offsetMs = refUtc.getTime() - refTz.getTime();

    const naiveUtc = new Date(`${dateStr}T${h}:${m}:${s}Z`);
    return new Date(naiveUtc.getTime() + offsetMs).toISOString();
  }, [timezone]);

  const getHourInTimezone = useCallback((dateString: string): number => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date(dateString));
    return parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
  }, [timezone]);

  const getWeekdayInTimezone = useCallback((dateString: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', timeZone: tz });
  }, [timezone]);

  const getMonthInTimezone = useCallback((dateString: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', timeZone: tz });
  }, [timezone]);

  const getDayOfMonthInTimezone = useCallback((dateString: string): number => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      day: 'numeric',
    }).formatToParts(new Date(dateString));
    return parseInt(parts.find(p => p.type === 'day')?.value ?? '1', 10);
  }, [timezone]);

  return {
    timezone,
    formatDate,
    toLocalDateString,
    getTodayString,
    toUTCISOString,
    getHourInTimezone,
    getWeekdayInTimezone,
    getMonthInTimezone,
    getDayOfMonthInTimezone,
  };
}
