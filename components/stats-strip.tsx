"use client";

import type { AcademicEvent } from "@/lib/types";
import { isToday, isThisWeek } from "date-fns";
import { countdown } from "@/lib/utils";
import { CalendarClock, CalendarDays, FileText, PenLine, Timer } from "lucide-react";

export function StatsStrip({ events }: { events: AcademicEvent[] }) {
  const now = Date.now();
  const future = events.filter((e) => new Date(e.start_datetime).getTime() > now);
  const todayCount = events.filter((e) => isToday(new Date(e.start_datetime))).length;
  const weekCount = events.filter((e) => isThisWeek(new Date(e.start_datetime), { weekStartsOn: 6 })).length;
  const cts = future.filter((e) => e.event_type === "class_test").length;
  const assignments = future.filter((e) => e.event_type === "assignment").length;
  const next = future[0];

  const stats = [
    { icon: CalendarDays, label: "Today", value: todayCount },
    { icon: CalendarClock, label: "This week", value: weekCount },
    { icon: FileText, label: "Upcoming CTs", value: cts },
    { icon: PenLine, label: "Upcoming assignments", value: assignments },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <s.icon className="h-4 w-4 text-accent mb-2" />
          <p className="font-display text-2xl font-semibold">{s.value}</p>
          <p className="text-xs text-muted">{s.label}</p>
        </div>
      ))}
      <div className="col-span-2 sm:col-span-4 rounded-2xl border border-border bg-accent/10 p-4 flex items-center gap-3">
        <Timer className="h-5 w-5 text-accent shrink-0" />
        {next ? (
          <p className="text-sm">
            <span className="font-semibold">{next.title}</span>{" "}
            <span className="text-muted">— {countdown(next.start_datetime)}</span>
          </p>
        ) : (
          <p className="text-sm text-muted">No upcoming events on the calendar yet.</p>
        )}
      </div>
    </div>
  );
}
