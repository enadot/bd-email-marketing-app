export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 p-4 dark:bg-neutral-950">
      {/* Soft brand glows */}
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-700/20" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-700/20" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl text-white shadow-lg shadow-blue-500/20">
            ✉
          </div>
          <p className="text-lg font-bold">Edri Mail Marketing</p>
        </div>
        {children}
      </div>
    </div>
  );
}
