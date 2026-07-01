// Consistent label + control + hint wrapper used across forms.
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      {label && <span className="text-xs font-medium text-neutral-500">{label}</span>}
      {children}
      {hint && <span className="text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}
