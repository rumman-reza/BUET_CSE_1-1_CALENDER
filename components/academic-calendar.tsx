"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { useMemo, useRef } from "react";
import type { AcademicEvent } from "@/lib/types";
import { EVENT_TYPE_META } from "@/lib/types";
import { useSaveEvent } from "@/lib/queries";

export function AcademicCalendar({
  events,
  isAdmin,
  onSelectEvent,
  onCreateAt,
}: {
  events: AcademicEvent[];
  isAdmin: boolean;
  onSelectEvent: (ev: AcademicEvent) => void;
  onCreateAt: (dateISO: string) => void;
}) {
  const saveEvent = useSaveEvent();
  const calRef = useRef<FullCalendar>(null);

  const fcEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start_datetime,
        end: e.end_datetime,
        backgroundColor: e.course?.course_color ?? EVENT_TYPE_META[e.event_type].color,
        extendedProps: { raw: e },
      })),
    [events]
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 sm:p-5 shadow-soft">
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        height="auto"
        editable={isAdmin}
        eventStartEditable={isAdmin}
        eventDurationEditable={isAdmin}
        selectable={isAdmin}
        dayMaxEvents={3}
        events={fcEvents}
        eventClick={(info) => {
          const raw = info.event.extendedProps.raw as AcademicEvent;
          onSelectEvent(raw);
        }}
        dateClick={(info) => {
          if (isAdmin) onCreateAt(info.dateStr);
        }}
        eventDrop={(info) => {
          const raw = info.event.extendedProps.raw as AcademicEvent;
          if (!info.event.start) return;
          const duration =
            new Date(raw.end_datetime).getTime() - new Date(raw.start_datetime).getTime();
          saveEvent.mutate({
            id: raw.id,
            start_datetime: info.event.start.toISOString(),
            end_datetime: new Date(info.event.start.getTime() + duration).toISOString(),
          });
        }}
        eventResize={(info) => {
          const raw = info.event.extendedProps.raw as AcademicEvent;
          if (!info.event.start || !info.event.end) return;
          saveEvent.mutate({
            id: raw.id,
            start_datetime: info.event.start.toISOString(),
            end_datetime: info.event.end.toISOString(),
          });
        }}
      />
    </div>
  );
}
