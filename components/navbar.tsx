"use client";

import Link from "next/link";
import { GraduationCap, ShieldCheck, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useProfile } from "@/lib/use-profile";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function Navbar() {
  const { profile, isAdmin } = useProfile();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#calendar", label: "Calendar" },
    { href: "/#announcements", label: "Announcements" },
    { href: "/#courses", label: "Courses" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent grid place-items-center shrink-0">
            <GraduationCap className="h-4 w-4 text-accent-foreground" />
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="font-display font-semibold text-sm">CSE 1-1 Calendar</p>
            <p className="text-[11px] text-muted -mt-0.5">BUET · Level-1 Term-1</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg text-sm text-muted hover:text-ink hover:bg-surface-2 transition"
            >
              {l.label}
            </a>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-2 rounded-lg text-sm font-medium text-accent hover:bg-surface-2 transition flex items-center gap-1"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {profile ? (
            <button
              onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-border pl-1 pr-3 py-1 hover:bg-surface-2 transition"
              title="Sign out"
            >
              <span className="h-7 w-7 rounded-full bg-accent/15 text-accent grid place-items-center text-xs font-semibold">
                {profile.name?.[0]?.toUpperCase() ?? "U"}
              </span>
              <span className="text-sm">{profile.name?.split(" ")[0]}</span>
              <LogOut className="h-3.5 w-3.5 text-muted" />
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
            >
              Login
            </Link>
          )}
          <button className="md:hidden h-9 w-9 grid place-items-center rounded-lg border border-border" onClick={() => setOpen(!open)}>
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-4 py-2 flex flex-col">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="py-2 text-sm text-muted" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          {isAdmin && (
            <Link href="/admin" className="py-2 text-sm font-medium text-accent">
              Admin panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
