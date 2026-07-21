"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AcademicCalendar } from "@/components/academic-calendar";
import { Sidebar } from "@/components/sidebar";
import { EventDrawer } from "@/components/event-drawer";
import { EventFormModal } from "@/components/event-form-modal";
import { AnnouncementList } from "@/components/announcement-list";
import { StatsStrip } from "@/components/stats-strip";
import { useCourses, useEvents } from "@/lib/queries";
import { useProfile } from "@/lib/use-profile";
import type { AcademicEvent } from "@/lib/types";
import { Plus, Sparkles } from "lucide-react";

export default function HomePage() {
  const { data: events = [] } = useEvents();
  const { data: courses = [] } = useCourses();
  const { isAdmin } = useProfile();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<AcademicEvent | null>(null);
  const [editing, setEditing] = useState<AcademicEvent | null>(null);
  const [creatingAt, setCreatingAt] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (courseFilter !== "all" && e.course_id !== courseFilter) return false;
      if (typeFilter !== "all" && e.event_type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${e.title} ${e.course?.course_code ?? ""} ${e.teacher} ${e.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, courseFilter, typeFilter, search]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Slim hero strip — supports the calendar, doesn't compete with it */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" /> Level-1 Term-1 · 2029 Batch
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-1">
              Every CT, quiz and deadline — in one place.
            </h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditing(null); setCreatingAt(new Date().toISOString().slice(0, 10)); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition self-start"
            >
              <Plus className="h-4 w-4" /> Add event
            </button>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 space-y-6">
        <StatsStrip events={events} />

        {/* Calendar-first: ~75/25 split on desktop */}
        <div id="calendar" className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 scroll-mt-20">
          <AcademicCalendar
            events={filtered}
            isAdmin={isAdmin}
            onSelectEvent={setSelected}
            onCreateAt={(dateISO) => { setEditing(null); setCreatingAt(dateISO); setShowForm(true); }}
          />
          <Sidebar
            courses={courses}
            events={filtered}
            search={search}
            setSearch={setSearch}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            onSelectEvent={setSelected}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <AnnouncementList />
          <div id="courses" className="rounded-2xl border border-border bg-surface p-5 shadow-soft scroll-mt-20">
            <h3 className="font-display font-semibold mb-4">Courses</h3>
            <ul className="space-y-2">
              {courses.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.course_color }} />
                  <span className="font-medium">{c.course_code}</span>
                  <span className="text-muted truncate">— {c.course_name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-6">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 text-xs text-muted flex flex-col sm:flex-row justify-between gap-2">
          <p>Built by CSE 1-1 students, for CSE 1-1 students.</p>
          <p>Not an official BUET publication.</p>
        </div>
      </footer>

      {selected && (
        <EventDrawer
          event={selected}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onEdit={(e) => { setEditing(e); setSelected(null); setShowForm(true); }}
        />
      )}

      {showForm && (
        <EventFormModal
          courses={courses}
          initial={editing}
          defaultDate={creatingAt}
          onClose={() => { setShowForm(false); setEditing(null); setCreatingAt(null); }}
        />
      )}
    </div>
  );
}
