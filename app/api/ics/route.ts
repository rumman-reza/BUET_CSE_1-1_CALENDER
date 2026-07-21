import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEvents, type EventAttributes } from "ics";

function toDateArray(iso: string): [number, number, number, number, number] {
  const d = new Date(iso);
  return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event");
  const supabase = await createClient();

  let query = supabase.from("events").select("*, course:courses(*)");
  if (eventId) query = query.eq("id", eventId);

  const { data, error } = await query;
  if (error || !data) {
    return NextResponse.json({ error: "Could not load events" }, { status: 500 });
  }

  const attributes: EventAttributes[] = data.map((e) => ({
    title: `${e.course?.course_code ? e.course.course_code + " — " : ""}${e.title}`,
    description: e.description ?? "",
    location: e.location ?? "",
    start: toDateArray(e.start_datetime),
    end: toDateArray(e.end_datetime),
    uid: e.id,
  }));

  const { error: icsError, value } = createEvents(attributes);
  if (icsError || !value) {
    return NextResponse.json({ error: "Could not generate ICS" }, { status: 500 });
  }

  return new NextResponse(value, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="cse-1-1-calendar.ics"`,
    },
  });
}
