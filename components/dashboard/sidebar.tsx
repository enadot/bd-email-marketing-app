"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SequenceIcon,
  TemplateIcon,
  ContactsIcon,
  AnalyticsIcon,
  SettingsIcon,
  LogoutIcon,
} from "./icons";

const NAV = [
  { href: "/", label: "סקירה", Icon: HomeIcon, exact: true },
  { href: "/sequences", label: "סדרות", Icon: SequenceIcon },
  { href: "/templates", label: "תבניות", Icon: TemplateIcon },
  { href: "/contacts", label: "אנשי קשר", Icon: ContactsIcon },
  { href: "/analytics", label: "אנליטיקס", Icon: AnalyticsIcon },
  { href: "/settings", label: "הגדרות", Icon: SettingsIcon },
];

export function Sidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  const initials = orgName.trim().slice(0, 2).toUpperCase();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-l border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
          ✉
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">Edri Mail</p>
          <p className="text-[11px] text-neutral-400">Marketing</p>
        </div>
      </div>

      {/* Org chip */}
      <div className="mx-3 mb-2 flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-neutral-900">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{orgName}</p>
          <p className="text-[11px] text-neutral-400">ארגון</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-blue-600 dark:text-blue-300" : "text-neutral-400"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <form action="/auth/signout" method="post" className="border-t border-neutral-200/70 p-3 dark:border-neutral-800">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <LogoutIcon className="h-5 w-5 text-neutral-400" />
          התנתקות
        </button>
      </form>
    </aside>
  );
}
