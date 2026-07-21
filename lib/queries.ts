"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { AcademicEvent, Announcement, Course } from "@/lib/types";

export function useCourses() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("course_code");
      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useEvents() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, course:courses(*)")
        .order("start_datetime");
      if (error) throw error;
      return data as AcademicEvent[];
    },
  });
}

export function useAnnouncements() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*, author:profiles(*)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useSaveEvent() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AcademicEvent> & { id?: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (payload.id) {
        const { id, course, ...rest } = payload;
        const { error } = await supabase
          .from("events")
          .update({ ...rest, updated_by: user.id })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { course, ...rest } = payload;
        const { error } = await supabase
          .from("events")
          .insert({ ...rest, created_by: user.id, updated_by: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useSaveCourse() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Course> & { id?: string }) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("courses").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useSaveAnnouncement() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; body: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("announcements")
        .insert({ ...payload, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}
