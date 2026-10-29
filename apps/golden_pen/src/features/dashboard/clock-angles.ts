import { toPersianDigits } from "@repo/jalali";

import { tehranTime } from "./dashboard-dates";

export type ClockAngles = { hour: number; minute: number; second: number };

/** Degrees clockwise from 12 o'clock for each hand; hour/minute include the smaller units (smooth). */
export function clockAngles(date: Date): ClockAngles {
  const { hour, minute, second } = tehranTime(date);
  return {
    hour: ((hour % 12) + minute / 60 + second / 3600) * 30,
    minute: (minute + second / 60) * 6,
    second: second * 6,
  };
}

/**
 * The first angle at or after `previous` that points where `target` (0–360) points: a hand
 * crossing 59 → 0 keeps turning forward (360 + …) instead of spinning back with the transition.
 */
export function continueAngle(previous: number, target: number): number {
  return previous + ((((target - previous) % 360) + 360) % 360);
}

/** Moves every hand forward to `target`; with no `previous` the target is used as is. */
export function advanceAngles(previous: ClockAngles | null, target: ClockAngles): ClockAngles {
  if (!previous) return target;
  return {
    hour: continueAngle(previous.hour, target.hour),
    minute: continueAngle(previous.minute, target.minute),
    second: continueAngle(previous.second, target.second),
  };
}

const CENTER = 100;

/** A point on a circle around the centre of the 200×200 face; `degrees` clockwise from the top. */
function pointAt(degrees: number, radius: number) {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: Number((CENTER + radius * Math.sin(radians)).toFixed(2)),
    y: Number((CENTER - radius * Math.cos(radians)).toFixed(2)),
  };
}

/** The 60 minute ticks (every fifth is a major one), as line ends. */
export const CLOCK_TICKS = Array.from({ length: 60 }, (_, index) => {
  const isMajor = index % 5 === 0;
  const degrees = index * 6;
  return {
    index,
    isMajor,
    from: pointAt(degrees, 90),
    to: pointAt(degrees, isMajor ? 81 : 86),
  };
});

/** The numerals ۱–۱۲; 12 sits at the top (an analog face is not mirrored in RTL). */
export const CLOCK_NUMERALS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1;
  return { hour, text: toPersianDigits(hour), ...pointAt(hour * 30, 66) };
});
