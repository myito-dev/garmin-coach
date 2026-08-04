"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { springSnappy } from "@/lib/motion";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className={`brand-mark flex shrink-0 items-center justify-center rounded-xl text-white ${compact ? "h-7 w-7" : "h-9 w-9"}`}>
        <ActivityIcon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="wordmark text-[15px]">Garmin Coach</span>
        <span className="mt-0.5 text-[10px] font-medium tracking-wide text-ink-muted">by Mario Galindo</span>
      </span>
    </Link>
  );
}

const LINKS = [
  { href: "/", label: "Panel", icon: HomeIcon },
  { href: "/plan", label: "Plan", icon: CalendarIcon },
  { href: "/entrenamientos", label: "Entrenamientos", icon: ActivityIcon },
  { href: "/salud", label: "Salud", icon: HeartIcon },
  { href: "/configuracion", label: "Configuración", icon: SettingsIcon },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop icon sidebar */}
      <aside className="sticky top-0 z-40 hidden h-screen w-16 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-4 sm:flex">
        <Link
          href="/"
          aria-label="Garmin Coach — Panel"
          className="brand-mark mb-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
        >
          <ActivityIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill-sidebar"
                    className="absolute inset-0 rounded-xl bg-sidebar-accent"
                    transition={springSnappy}
                  />
                )}
                <Icon
                  className={`relative z-10 h-5 w-5 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/55"}`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline glass px-4 py-3 sm:hidden">
        <Logo compact />
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-hairline glass px-2 pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="flex items-center justify-around py-1.5">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill-mobile"
                    className="absolute inset-0 rounded-xl bg-accent/10"
                    transition={springSnappy}
                  />
                )}
                <Icon className={`relative z-10 h-5 w-5 ${active ? "text-accent" : "text-ink-muted"}`} />
                <span className={`relative z-10 text-[10px] font-medium ${active ? "text-accent" : "text-ink-muted"}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}
