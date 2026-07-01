import { Card } from "@heroui/react";

// Temporary stub for sections not yet implemented.
export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card className="p-8 text-center text-neutral-500">{note}</Card>
    </div>
  );
}
