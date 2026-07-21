import {
  FileText, FlaskConical, HelpCircle, PenLine, Presentation, Rocket, Mic,
  BookOpenCheck, GraduationCap, ClipboardList, Palmtree, UserPlus, Megaphone,
  Users, Wrench, Calendar, type LucideProps,
} from "lucide-react";
import type { EventType } from "@/lib/types";
import { EVENT_TYPE_META } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  FileText, FlaskConical, HelpCircle, PenLine, Presentation, Rocket, Mic,
  BookOpenCheck, GraduationCap, ClipboardList, PalmTree: Palmtree, UserPlus, Megaphone,
  Users, Wrench, Calendar,
};

export function EventIcon({ type, ...props }: { type: EventType } & LucideProps) {
  const meta = EVENT_TYPE_META[type];
  const Icon = ICONS[meta.icon] ?? Calendar;
  return <Icon {...props} />;
}
