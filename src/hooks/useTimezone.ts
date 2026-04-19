import { useState, useEffect, useCallback } from 'react';

const TIMEZONE_KEY = 'timezone';

// Cache formatters to avoid expensive Intl.DateTimeFormat instantiation on every call
const formattersCache = {
  date: new Map<string, Intl.DateTimeFormat>(),
  localDate: new Map<string, Intl.DateTimeFormat>(),
  timeParts: new Map<string, Intl.DateTimeFormat>(),
  hour: new Map<string, Intl.DateTimeFormat>(),
  weekday: new Map<string, Intl.DateTimeFormat>(),
  month: new Map<string, Intl.DateTimeFormat>(),
  dayOfMonth: new Map<string, Intl.DateTimeFormat>(),
  fullDateTime: new Map<string, Intl.DateTimeFormat>(),
};

function getFormatter(type: keyof typeof formattersCache, tz: string): Intl.DateTimeFormat {
  let cache = formattersCache[type];
  if (!cache.has(tz)) {
    switch (type) {
      case 'date':
        cache.set(tz, new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: tz }));
        break;
      case 'localDate':
        cache.set(tz, new Intl.DateTimeFormat('en-CA', { timeZone: tz }));
        break;
      case 'timeParts':
        cache.set(tz, new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        break;
      case 'hour':
        cache.set(tz, new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }));
        break;
      case 'weekday':
        cache.set(tz, new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }));
        break;
      case 'month':
        cache.set(tz, new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: tz }));
        break;
      case 'dayOfMonth':
        cache.set(tz, new Intl.DateTimeFormat('en-US', { timeZone: tz, day: 'numeric' }));
        break;
      case 'fullDateTime':
        cache.set(tz, new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: tz }));
        break;
    }
  }
  return cache.get(tz)!;
}

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
    return getFormatter('date', tz).format(new Date(dateString));
  }, [timezone]);

  const toLocalDateString = useCallback((dateString: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    // en-CA reliably produces YYYY-MM-DD required by HTML date inputs
    return getFormatter('localDate', tz).format(new Date(dateString));
  }, [timezone]);

  const getTodayString = useCallback((): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    return getFormatter('localDate', tz).format(new Date());
  }, [timezone]);

  // Combines the user-selected date with the current wall-clock time in their timezone,
  // then converts the result to a UTC ISO string for the API.
  const toUTCISOString = useCallback((dateStr: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    const now = new Date();

    const parts = getFormatter('timeParts', tz).formatToParts(now);
    const h = (parts.find(p => p.type === 'hour')?.value ?? '00').padStart(2, '0');
    const m = (parts.find(p => p.type === 'minute')?.value ?? '00').padStart(2, '0');
    const s = (parts.find(p => p.type === 'second')?.value ?? '00').padStart(2, '0');

    // Derive UTC offset by comparing what "now" looks like in each zone
    const refUtc = new Date(getFormatter('fullDateTime', 'UTC').format(now));
    const refTz = new Date(getFormatter('fullDateTime', tz).format(now));
    const offsetMs = refUtc.getTime() - refTz.getTime();

    const naiveUtc = new Date(`${dateStr}T${h}:${m}:${s}Z`);
    return new Date(naiveUtc.getTime() + offsetMs).toISOString();
  }, [timezone]);

  const getHourInTimezone = useCallback((dateString: string): number => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    const parts = getFormatter('hour', tz).formatToParts(new Date(dateString));
    return parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
  }, [timezone]);

  const getWeekdayInTimezone = useCallback((dateString: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    return getFormatter('weekday', tz).format(new Date(dateString));
  }, [timezone]);

  const getMonthInTimezone = useCallback((dateString: string): string => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    return getFormatter('month', tz).format(new Date(dateString));
  }, [timezone]);

  const getDayOfMonthInTimezone = useCallback((dateString: string): number => {
    const tz = localStorage.getItem(TIMEZONE_KEY) || timezone;
    const parts = getFormatter('dayOfMonth', tz).formatToParts(new Date(dateString));
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
