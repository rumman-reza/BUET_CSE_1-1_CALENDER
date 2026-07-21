"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import type { AcademicEvent, Course, EventType } from "@/lib/types";
import { EVENT_TYPE_META } from "@/lib/types";
import { useSaveEvent } from "@/lib/queries";
import { useEffect } from "react";

const schema = z
  .object({
    title: z.string().min(2, "Title is required"),
    course_id: z.string().min(1, "Pick a course"),
    event_type: z.string().min(1),
    teacher: z.string().optional(),
    location: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    description: z.string().optional(),
  })
  .refine((d) => d.end_time > d.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

type FormValues = z.infer<typeof schema>;

function toParts(iso?: string | null) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function EventFormModal({
  courses,
  initial,
  defaultDate,
  onClose,
}: {
  courses: Course[];
  initial?: AcademicEvent | null;
  defaultDate?: string | null;
  onClose: () => void;
}) {
  const save = useSaveEvent();
  const startParts = toParts(initial?.start_datetime ?? defaultDate);
  const endParts = toParts(initial?.end_datetime);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      course_id: initial?.course_id ?? courses[0]?.id ?? "",
      event_type: initial?.event_type ?? "class_test",
      teacher: initial?.teacher ?? "",
      location: initial?.location ?? "",
      date: startParts.date,
      start_time: startParts.time || "10:00",
      end_time: endParts.time || "11:00",
      description: initial?.description ?? "",
    },
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function onSubmit(values: FormValues) {
    const start_datetime = new Date(`${values.date}T${values.start_time}`).toISOString();
    const end_datetime = new Date(`${values.date}T${values.end_time}`).toISOString();

    await save.mutateAsync({
      id: initial?.id,
      title: values.title,
      course_id: values.course_id,
      event_type: values.event_type as EventType,
      teacher: values.teacher ?? "",
      location: values.location ?? "",
      description: values.description ?? "",
      start_datetime,
      end_datetime,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl">
        <div className="sticky top-0 bg-surface flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display text-lg font-semibold">
            {initial ? "Edit event" : "Add event"}
          </h3>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Title</label>
            <input {...register("title")} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" placeholder="e.g. CSE 101 Class Test 3" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Course</label>
              <select {...register("course_id")} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent">
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.course_code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Event type</label>
              <select {...register("event_type")} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent">
                {Object.entries(EVENT_TYPE_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Teacher</label>
              <input {...register("teacher")} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Room</label>
              <input {...register("location")} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" placeholder="e.g. Room 302" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted">Date</label>
            <input type="date" {...register("date")} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Start time</label>
              <input type="time" {...register("start_time")} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">End time</label>
              <input type="time" {...register("end_time")} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" />
              {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted">Description</label>
            <textarea {...register("description")} rows={3} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent" placeholder="Syllabus, chapters, notes…" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-accent text-accent-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition"
          >
            {isSubmitting ? "Saving…" : initial ? "Save changes" : "Add event"}
          </button>
        </form>
      </div>
    </div>
  );
}
