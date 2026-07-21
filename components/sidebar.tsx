"use client";

import { Search } from "lucide-react";
import type { AcademicEvent, Course } from "@/lib/types";
import { EVENT_TYPE_META } from "@/lib/types";
import { EventIcon } from "./event-icon";
import { format, isToday } from "date-fns";
import { countdown } from "@/lib/utils";

export function Sidebar({
  courses,
  events,
  search,
  setSearch,
  courseFilter,
  setCourseFilter,
  typeFilter,
  setTypeFilter,
  onSelectEvent,
}: {
  courses: Course[];
  events: AcademicEvent[];
  search: string;
  setSearch: (v: string) => void;
  courseFilter: string;
  setCourseFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  onSelectEvent: (e: AcademicEvent) => void;
}) {
  const today = events.filter((e) => isToday(new Date(e.start_datetime)));
  const upcoming = events
    .filter((e) => new Date(e.start_datetime).getTime() > Date.now())
    .slice(0, 6);

  return (
    <aside className="space-y-5">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course, event, teacher, room…"
            className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <label className="text-xs font-medium text-muted">Course</label>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="mt-1 mb-3 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.course_code}</option>
          ))}
        </select>

        <label className="text-xs font-medium text-muted">Event type</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All types</option>
          {Object.entries(EVENT_TYPE_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <h3 className="font-display font-semibold text-sm mb-3">Today's schedule</h3>
        {today.length === 0 ? (
          <p className="text-sm text-muted">Nothing scheduled today. Breathe easy.</p>
        ) : (
          <ul className="space-y-2">
            {today.map((e) => (
              <EventRow key={e.id} e={e} onClick={() => onSelectEvent(e)} />
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <h3 className="font-display font-semibold text-sm mb-3">Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">No upcoming events yet.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((e) => (
              <EventRow key={e.id} e={e} onClick={() => onSelectEvent(e)} showCountdown />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function EventRow({ e, onClick, showCountdown }: { e: AcademicEvent; onClick: () => void; showCountdown?: boolean }) {
  const meta = EVENT_TYPE_META[e.event_type];
  return (
    <li>
      <button onClick={onClick} className="w-full flex items-start gap-2.5 text-left rounded-xl px-2 py-2 hover:bg-surface-2 transition">
        <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0 mt-0.5" style={{ backgroundColor: `${meta.color}22` }}>
          <EventIcon type={e.event_type} className="h-3.5 w-3.5" style={{ color: meta.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{e.title}</p>
          <p className="text-xs text-muted">
            {e.course?.course_code ?? "—"} · {format(new Date(e.start_datetime), "d MMM, h:mm a")}
          </p>
          {showCountdown && <p className="text-xs text-accent font-medium">{countdown(e.start_datetime)}</p>}
        </div>
      </button>
    </li>
  );
}
