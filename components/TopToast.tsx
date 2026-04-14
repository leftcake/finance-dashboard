'use client';

export default function TopToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-4 z-[100] max-w-[min(90vw,24rem)] -translate-x-1/2 px-3"
    >
      <div className="animate-top-toast rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-primary)] shadow-lg">
        {message}
      </div>
    </div>
  );
}
