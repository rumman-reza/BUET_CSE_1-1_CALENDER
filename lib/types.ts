export type UserRole = "student" | "admin";

export type EventType =
  | "class_test"
  | "lab_exam"
  | "quiz"
  | "assignment"
  | "presentation"
  | "project_deadline"
  | "viva"
  | "mid_term"
  | "final_exam"
  | "lab_report"
  | "holiday"
  | "registration"
  | "department_notice"
  | "seminar"
  | "workshop"
  | "other";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo: string | null;
  batch: string | null;
}

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  course_color: string;
  semester: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  course_id: string | null;
  event_type: EventType;
  teacher: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  reminder_minutes: number[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  course?: Course | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  created_by: string | null;
  created_at: string;
  author?: Profile | null;
}

export const EVENT_TYPE_META: Record<
  EventType,
  { label: string; icon: string; color: string }
> = {
  class_test: { label: "Class Test", icon: "FileText", color: "#ef4444" },
  lab_exam: { label: "Lab Exam", icon: "FlaskConical", color: "#f97316" },
  quiz: { label: "Quiz", icon: "HelpCircle", color: "#eab308" },
  assignment: { label: "Assignment", icon: "PenLine", color: "#3b82f6" },
  presentation: { label: "Presentation", icon: "Presentation", color: "#8b5cf6" },
  project_deadline: { label: "Project Deadline", icon: "Rocket", color: "#dc2626" },
  viva: { label: "Viva", icon: "Mic", color: "#d946ef" },
  mid_term: { label: "Mid Term", icon: "BookOpenCheck", color: "#b91c1c" },
  final_exam: { label: "Final Exam", icon: "GraduationCap", color: "#991b1b" },
  lab_report: { label: "Lab Report", icon: "ClipboardList", color: "#0891b2" },
  holiday: { label: "Holiday", icon: "PalmTree", color: "#22c55e" },
  registration: { label: "Registration", icon: "UserPlus", color: "#14b8a6" },
  department_notice: { label: "Department Notice", icon: "Megaphone", color: "#64748b" },
  seminar: { label: "Seminar", icon: "Users", color: "#6366f1" },
  workshop: { label: "Workshop", icon: "Wrench", color: "#0ea5e9" },
  other: { label: "Other", icon: "Calendar", color: "#94a3b8" },
};
