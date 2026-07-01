import { requireOrg } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { org } = await requireOrg();

  return (
    <div dir="rtl" className="flex min-h-screen bg-neutral-100/60 dark:bg-neutral-900">
      <Sidebar orgName={org.name} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
