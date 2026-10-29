"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { MoonIcon, SunIcon, SunriseIcon, SunsetIcon } from "lucide-react";

import { CLOCK_TICKS } from "../clock-angles";
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

/** Minimal Tehran clock: two hands and an orbiting seconds marker, with digital time below. */
export function WallClock() {
  const clock = useWallClock();
  const PartIcon = clock ? PART_ICONS[clock.part] : SunIcon;

  if (clock === null) {
    return (
      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-2">
        <Skeleton className={cn("rounded-3xl", FACE_SIZE)} />
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
        className={cn("shrink-0", FACE_SIZE)}
      >
        <g aria-hidden>
          <rect
            x="2"
            y="2"
            width="196"
            height="196"
            rx="48"
            strokeWidth="2"
            className="fill-card stroke-border"
          />
          <circle cx="100" cy="100" r="83" className="fill-muted/30" />
          {CLOCK_TICKS.map((tick) =>
            tick.isMajor ? (
              <line
                key={tick.index}
                x1={tick.from.x}
                y1={tick.from.y}
                x2={tick.to.x}
                y2={tick.to.y}
                transform="translate(100 100) scale(0.83) translate(-100 -100)"
                strokeLinecap="round"
                strokeWidth="3"
                className="stroke-muted-foreground/50"
              />
            ) : null,
          )}
          <g className={handClass} style={handStyle(clock.angles.hour)}>
            <line
              x1="100"
              y1="104"
              x2="100"
              y2="62"
              strokeWidth="5"
              strokeLinecap="round"
              className="stroke-foreground"
            />
          </g>
          <g className={handClass} style={handStyle(clock.angles.minute)}>
            <line
              x1="100"
              y1="104"
              x2="100"
              y2="43"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-foreground"
            />
          </g>
          <g className={handClass} style={handStyle(clock.angles.second)}>
            <circle cx="100" cy="17" r="3" className="fill-muted-foreground" />
          </g>
          <circle
            cx="100"
            cy="100"
            r="4"
            strokeWidth="2.5"
            className="fill-card stroke-foreground"
          />
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
