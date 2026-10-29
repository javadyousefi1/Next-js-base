"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { MoonIcon, SunIcon, SunriseIcon, SunsetIcon } from "lucide-react";
import { useId } from "react";

import { CLOCK_NUMERALS, CLOCK_TICKS } from "../clock-angles";
import type { GreetingPart } from "../dashboard-dates";
import { useWallClock } from "../hooks/use-wall-clock";

const PART_ICONS = {
  morning: SunriseIcon,
  noon: SunIcon,
  afternoon: SunsetIcon,
  night: MoonIcon,
} satisfies Record<GreetingPart, typeof SunIcon>;

const FACE_SIZE = "size-24 sm:size-28";

// A hand is drawn pointing up from the centre (100, 100) and turned by an inline CSS rotation.
const handClass = "transition-transform duration-1000 ease-linear motion-reduce:transition-none";
const handStyle = (degrees: number) => ({
  transform: `rotate(${degrees}deg)`,
  transformOrigin: "100px 100px",
});

/** Analog Tehran wall clock (pure SVG, upright in RTL) with the digital time and the part of the day. */
export function WallClock() {
  const clock = useWallClock();
  const gradientId = useId();
  const PartIcon = clock ? PART_ICONS[clock.part] : SunIcon;

  if (clock === null) {
    return (
      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-2">
        <Skeleton className={cn("rounded-full", FACE_SIZE)} />
        <Skeleton className="h-9 w-32" />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-2">
      <svg
        role="img"
        aria-label={clock.ariaLabel}
        data-testid="wall-clock"
        viewBox="0 0 200 200"
        className={cn("drop-shadow-sm", FACE_SIZE)}
      >
        <defs>
          <radialGradient id={`${gradientId}-face`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" className="[stop-color:var(--card)]" />
            <stop offset="100%" className="[stop-color:var(--muted)]" />
          </radialGradient>
          <radialGradient id={`${gradientId}-inner`} cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopOpacity="0" className="[stop-color:var(--foreground)]" />
            <stop offset="100%" stopOpacity="0.14" className="[stop-color:var(--foreground)]" />
          </radialGradient>
        </defs>
        <g aria-hidden>
          <circle cx="100" cy="100" r="98" className="fill-muted-foreground/40" />
          <circle cx="100" cy="100" r="95" className="fill-card" />
          <circle cx="100" cy="100" r="93" fill={`url(#${gradientId}-face)`} />
          <circle cx="100" cy="100" r="93" fill={`url(#${gradientId}-inner)`} />
          {CLOCK_TICKS.map((tick) => (
            <line
              key={tick.index}
              x1={tick.from.x}
              y1={tick.from.y}
              x2={tick.to.x}
              y2={tick.to.y}
              strokeLinecap="round"
              strokeWidth={tick.isMajor ? 2.4 : 1}
              className={cn(tick.isMajor ? "stroke-foreground" : "stroke-muted-foreground/60")}
            />
          ))}
          {CLOCK_NUMERALS.map((numeral) => (
            <text
              key={numeral.hour}
              x={numeral.x}
              y={numeral.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground font-heading text-[15px] font-medium"
            >
              {numeral.text}
            </text>
          ))}
          <g className={handClass} style={handStyle(clock.angles.hour)}>
            <line
              x1="100"
              y1="110"
              x2="100"
              y2="58"
              strokeWidth="6"
              strokeLinecap="round"
              className="stroke-foreground"
            />
          </g>
          <g className={handClass} style={handStyle(clock.angles.minute)}>
            <line
              x1="100"
              y1="112"
              x2="100"
              y2="34"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-foreground"
            />
          </g>
          <g className={handClass} style={handStyle(clock.angles.second)}>
            <line
              x1="100"
              y1="124"
              x2="100"
              y2="22"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="stroke-rose-500"
            />
            <line
              x1="100"
              y1="104"
              x2="100"
              y2="124"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-rose-500"
            />
          </g>
          <circle cx="100" cy="100" r="6" className="fill-foreground" />
          <circle cx="100" cy="100" r="2.4" className="fill-rose-500" />
        </g>
      </svg>
      <div className="flex items-center gap-3">
        <time
          dir="ltr"
          data-testid="clock"
          className="font-heading text-xl font-semibold tabular-nums"
        >
          {clock.time}
        </time>
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <PartIcon className="size-3.5" aria-hidden />
          {clock.partLabel}
        </span>
      </div>
    </div>
  );
}
