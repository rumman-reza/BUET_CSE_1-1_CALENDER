"use client";

import { useAnnouncements } from "@/lib/queries";
import { Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AnnouncementList() {
  const { data, isLoading } = useAnnouncements();

  return (
    <div id="announcements" className="rounded-2xl border border-border bg-surface p-5 shadow-soft scroll-mt-20">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-4 w-4 text-accent" />
        <h3 className="font-display font-semibold">Announcements</h3>
      </div>

      {isLoading && <p className="text-sm text-muted">Loading…</p>}
      {!isLoading && (!data || data.length === 0) && (
        <p className="text-sm text-muted">No announcements yet. Check back soon.</p>
      )}

      <ul className="space-y-4">
        {data?.map((a) => (
          <li key={a.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
            <p className="text-sm font-semibold">{a.title}</p>
            <p className="text-sm text-muted mt-0.5">{a.body}</p>
            <p className="text-xs text-muted mt-1.5">
              {a.author?.name ?? "Admin"} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
