import { Context } from "hono";

/**
 * Timezone utilities for computing dates in a user's local timezone.
 *
 * All dates in the DB are stored as UTC. These helpers interpret them
 * according to the user's IANA timezone (e.g. "Asia/Kolkata") so that
 * streak counting, "today" detection, and period boundaries align with
 * the user's wall clock.
 */

/**
 * Extract the user's IANA timezone from the request.
 * Reads the `X-Timezone` header, falling back to "UTC".
 */
export function getTimezone(c: Context): string {
    const tz = c.req.header("X-Timezone");
    if (!tz) return "UTC";

    // Quick sanity check: try to use it; if invalid, fall back to UTC
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return tz;
    } catch {
        return "UTC";
    }
}

/**
 * Return the YYYY-MM-DD day key for a given Date, interpreted in the
 * supplied IANA timezone.
 *
 * Example: a Date representing 2026-04-10T01:30:00Z with tz="Asia/Kolkata"
 * yields "2026-04-10" (because 01:30 UTC = 07:00 IST, still Apr 10).
 */
export function dayKeyInTimezone(date: Date, tz: string): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((p) => p.type === "year")!.value;
    const month = parts.find((p) => p.type === "month")!.value;
    const day = parts.find((p) => p.type === "day")!.value;
    return `${year}-${month}-${day}`;
}

/**
 * Return the current YYYY-MM-DD day key in the given timezone.
 */
export function todayKeyInTimezone(tz: string): string {
    return dayKeyInTimezone(new Date(), tz);
}

/**
 * Shift a YYYY-MM-DD day key by `days` (positive = forward, negative = back).
 * The arithmetic is done in the given timezone to handle DST transitions.
 */
export function shiftDayKey(dateStr: string, days: number, tz: string): string {
    // Parse the date string in UTC (noon to avoid edge cases)
    const d = new Date(`${dateStr}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return dayKeyInTimezone(d, tz);
}

/**
 * Return a Date representing midnight (start of day) for a given
 * YYYY-MM-DD key in the given timezone, expressed as a UTC timestamp.
 *
 * This is used when we need to query the DB with a date boundary
 * that corresponds to midnight in the user's timezone.
 */
export function startOfDayInTimezone(dateStr: string, tz: string): Date {
    // We need to find the UTC instant that corresponds to midnight of
    // the given date in the given timezone.
    // Strategy: build a date at noon UTC (safe from DST), then figure out
    // the offset and adjust.
    const noonUTC = new Date(`${dateStr}T12:00:00Z`);

    // Get the timezone offset at that point in time
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const partsAtNoonUTC = formatter.formatToParts(noonUTC);
    const localHour = parseInt(partsAtNoonUTC.find((p) => p.type === "hour")!.value);
    const localMinute = parseInt(partsAtNoonUTC.find((p) => p.type === "minute")!.value);

    // noonUTC shows as localHour:localMinute in the tz.
    // The offset in minutes = (localHour * 60 + localMinute) - (12 * 60 + 0)
    const offsetMinutes = (localHour * 60 + localMinute) - 12 * 60;

    // Midnight in the tz = 00:00 local = -offsetMinutes from midnight UTC on that date
    const midnightUTC = new Date(`${dateStr}T00:00:00Z`);
    midnightUTC.setUTCMinutes(midnightUTC.getUTCMinutes() - offsetMinutes);

    return midnightUTC;
}

/**
 * Get day-of-week (0=Sun, 1=Mon, ..., 6=Sat) for a YYYY-MM-DD key in a timezone.
 */
export function dayOfWeekInTimezone(dateStr: string, _tz: string): number {
    // Since dateStr is already a date string, we just need the day of week
    // for that calendar date. Using noon UTC avoids any timezone shift issues.
    const d = new Date(`${dateStr}T12:00:00Z`);
    return d.getUTCDay();
}

/**
 * Get the first day of the month for a YYYY-MM-DD key.
 */
export function firstOfMonthFromKey(dateStr: string): string {
    return dateStr.slice(0, 8) + "01";
}

/**
 * Get the last day of the month for a YYYY-MM-DD key.
 */
export function lastOfMonthFromKey(dateStr: string): string {
    const [year, month] = dateStr.split("-").map(Number);
    // Day 0 of the next month = last day of current month
    const last = new Date(Date.UTC(year, month, 0));
    return dayKeyInTimezone(last, "UTC");
}

/**
 * Get the Monday of the week for a given YYYY-MM-DD key.
 */
export function mondayOfWeekFromKey(dateStr: string): string {
    const d = new Date(`${dateStr}T12:00:00Z`);
    const dow = d.getUTCDay(); // 0=Sun
    const diff = dow === 0 ? -6 : 1 - dow; // shift to Monday
    d.setUTCDate(d.getUTCDate() + diff);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/**
 * Get the Sunday of the week for a given YYYY-MM-DD key.
 */
export function sundayOfWeekFromKey(dateStr: string): string {
    const d = new Date(`${dateStr}T12:00:00Z`);
    const dow = d.getUTCDay(); // 0=Sun
    const diff = dow === 0 ? 0 : 7 - dow; // shift to Sunday
    d.setUTCDate(d.getUTCDate() + diff);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
