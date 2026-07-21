"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { useProfile } from "@/lib/use-profile";
import {
  useAnnouncements,
  useCourses,
  useDeleteAnnouncement,
  useDeleteCourse,
  useDeleteEvent,
  useEvents,
  useSaveAnnouncement,
  useSaveCourse,
} from "@/lib/queries";
import { EventFormModal } from "@/components/event-form-modal";
import { EVENT_TYPE_META, type AcademicEvent, type Course } from "@/lib/types";
import { Plus, Trash2, Pencil, ShieldAlert, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminPage() {
  const { profile, isAdmin, loading } = useProfile();
  const [tab, setTab] = useState<"events" | "courses" | "announcements">("events");

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile || !isAdmin) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="mx-auto max-w-md text-center py-24 px-4">
          <ShieldAlert className="h-10 w-10 text-accent mx-auto mb-4" />
          <h1 className="font-display text-xl font-semibold">Admins only</h1>
          <p className="text-sm text-muted mt-2">
            You need CR/Admin access to view this page. Ask an existing admin to promote your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-semibold mb-1">Admin panel</h1>
        <p className="text-sm text-muted mb-6">Manage events, courses and announcements.</p>

        <div className="flex gap-2 mb-6 border-b border-border">
          {(["events", "courses", "announcements"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition ${
                tab === t ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "events" && <EventsTab />}
        {tab === "courses" && <CoursesTab />}
        {tab === "announcements" && <AnnouncementsTab />}
      </main>
    </div>
  );
}

function EventsTab() {
  const { data: events = [] } = useEvents();
  const { data: courses = [] } = useCourses();
  const del = useDeleteEvent();
  const [editing, setEditing] = useState<AcademicEvent | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="mb-4 inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> Add event
      </button>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs text-muted uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{e.title}</td>
                <td className="px-4 py-3 text-muted">{e.course?.course_code ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{EVENT_TYPE_META[e.event_type].label}</td>
                <td className="px-4 py-3 text-muted">{format(new Date(e.start_datetime), "d MMM yyyy, h:mm a")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditing(e); setShowForm(true); }} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-surface-2">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirm("Delete this event?") && del.mutate(e.id)}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No events yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <EventFormModal courses={courses} initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function CoursesTab() {
  const { data: courses = [] } = useCourses();
  const save = useSaveCourse();
  const del = useDeleteCourse();
  const [form, setForm] = useState({ course_code: "", course_name: "", course_color: "#0f5132" });

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display font-semibold mb-4">Add course</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await save.mutateAsync(form as Partial<Course>);
            setForm({ course_code: "", course_name: "", course_color: "#0f5132" });
          }}
          className="space-y-3"
        >
          <input required placeholder="Course code (e.g. CSE 101)" value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" />
          <input required placeholder="Course name" value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" />
          <div className="flex items-center gap-3">
            <input type="color" value={form.course_color} onChange={(e) => setForm({ ...form, course_color: e.target.value })} className="h-10 w-14 rounded-lg border border-border bg-bg" />
            <span className="text-xs text-muted">Course color</span>
          </div>
          <button type="submit" className="w-full rounded-xl bg-accent text-accent-foreground py-2.5 text-sm font-semibold hover:opacity-90">
            Add course
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display font-semibold mb-4">Existing courses</h3>
        <ul className="space-y-2">
          {courses.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 text-sm border-b border-border last:border-0 pb-2 last:pb-0">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.course_color }} />
                <span className="font-medium">{c.course_code}</span>
                <span className="text-muted">— {c.course_name}</span>
              </span>
              <button onClick={() => confirm("Delete this course?") && del.mutate(c.id)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AnnouncementsTab() {
  const { data: announcements = [] } = useAnnouncements();
  const save = useSaveAnnouncement();
  const del = useDeleteAnnouncement();
  const [form, setForm] = useState({ title: "", body: "" });

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display font-semibold mb-4">Publish announcement</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await save.mutateAsync(form);
            setForm({ title: "", body: "" });
          }}
          className="space-y-3"
        >
          <input required placeholder="Title (e.g. Tomorrow's CT postponed)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" />
          <textarea required rows={4} placeholder="Details…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" />
          <button type="submit" className="w-full rounded-xl bg-accent text-accent-foreground py-2.5 text-sm font-semibold hover:opacity-90">
            Publish
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display font-semibold mb-4">Recent</h3>
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-2 text-sm border-b border-border last:border-0 pb-3 last:pb-0">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-muted text-xs mt-0.5">{a.body}</p>
              </div>
              <button onClick={() => confirm("Delete this announcement?") && del.mutate(a.id)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
