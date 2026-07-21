import { Navbar } from "@/components/navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-4">About this calendar</h1>
        <p className="text-muted leading-relaxed mb-4">
          The BUET CSE 1-1 Academic Calendar is a shared, single source of truth for every
          class test, quiz, assignment, lab, presentation, viva, project deadline and exam
          for CSE Level-1 Term-1.
        </p>
        <p className="text-muted leading-relaxed mb-4">
          Every student can view, search, filter, and subscribe to the calendar. Only your
          section&apos;s CR or an admin can add, edit, or delete events — so the calendar stays
          accurate without becoming a free-for-all.
        </p>
        <p className="text-muted leading-relaxed">
          Built by students, for students. Not an official BUET publication — always confirm
          critical deadlines with your course teacher.
        </p>
      </main>
    </div>
  );
}
