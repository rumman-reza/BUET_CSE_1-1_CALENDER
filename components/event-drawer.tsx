"use client";

import { X, MapPin, User, Clock, Pencil, Trash2, CalendarDays, Download } from "lucide-react";
import type { AcademicEvent } from "@/lib/types";
import { EVENT_TYPE_META } from "@/lib/types";
import { EventIcon } from "./event-icon";
import { countdown } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useDeleteEvent } from "@/lib/queries";
import { format } from "date-fns";

export function EventDrawer({
  event,
  isAdmin,
  onClose,
  onEdit,
}: {
  event: AcademicEvent | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (e: AcademicEvent) => void;
}) {
  const [tick, setTick] = useState(0);
  const del = useDeleteEvent();

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  if (!event) return null;
  const meta = EVENT_TYPE_META[event.event_type];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] h-full bg-surface border-l border-border shadow-xl overflow-y-auto animate-in slide-in-from-right">
        <div className="p-5 border-b border-border flex items-start justify-between gap-3" style={{ backgroundColor: `${meta.color}14` }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center shrink-0" style={{ backgroundColor: `${meta.color}26` }}>
              <EventIcon type={event.event_type} className="h-5 w-5" style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
                {meta.label}
              </p>
              <h2 className="font-display text-lg font-semibold leading-tight">{event.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-surface-2 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div key={tick} className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            {countdown(event.start_datetime)}
          </div>

          {event.course && (
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.course.course_color }} />
              <span className="font-medium">{event.course.course_code}</span>
              <span className="text-muted">— {event.course.course_name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted">
            <CalendarDays className="h-4 w-4" />
            {format(new Date(event.start_datetime), "EEEE, d MMMM yyyy · h:mm a")}
            {" – "}
            {format(new Date(event.end_datetime), "h:mm a")}
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="h-4 w-4" /> {event.location}
            </div>
          )}

          {event.teacher && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <User className="h-4 w-4" /> {event.teacher}
            </div>
          )}

          {event.description && (
            <p className="text-sm leading-relaxed border-t border-border pt-4">{event.description}</p>
          )}

          <a
            href={`/api/ics?event=${event.id}`}
            className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
          >
            <Download className="h-4 w-4" /> Add to calendar (.ics)
          </a>

          <div className="border-t border-border pt-4 text-xs text-muted">
            Last updated {format(new Date(event.updated_at), "d MMM yyyy, h:mm a")}
          </div>

          {isAdmin && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onEdit(event)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-surface-2"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this event?")) {
                    del.mutate(event.id);
                    onClose();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-300 text-red-600 py-2.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
