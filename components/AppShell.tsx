"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import StudyTimer from "./StudyTimer";

const NAV: { href: string; label: string; color?: string }[] = [
  { href: "/", label: "แดชบอร์ด" },
  { href: "/plan", label: "แผนการเรียน" },
  { href: "/listening", label: "Listening", color: "var(--listening)" },
  { href: "/reading", label: "Reading", color: "var(--reading)" },
  { href: "/writing", label: "Writing", color: "var(--writing)" },
  { href: "/speaking", label: "Speaking", color: "var(--speaking)" },
  { href: "/vocabulary", label: "สมุดคำศัพท์" },
  { href: "/mistakes", label: "สมุดข้อผิดพลาด" },
  { href: "/progress", label: "ความก้าวหน้า" },
  { href: "/tutor", label: "ติวเตอร์ AI" },
  { href: "/resources", label: "แหล่งเรียนรู้ฟรี" },
  { href: "/settings", label: "ตั้งค่า" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, ready, saveError } = useStore();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!ready) return;
    const t = state.settings.theme;
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
  }, [ready, state.settings.theme]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/" className="brand" style={{ padding: 0 }}>IELTS Prep</Link>
        <button className="btn small" aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen((o) => !o)}>
          {open ? "ปิดเมนู" : "เมนู"}
        </button>
      </header>
      <aside id="sidebar" className={`sidebar${open ? " open" : ""}`} aria-label="เมนูหลัก">
        <Link href="/" className="brand">
          IELTS Academic Prep
          <small>เป้าหมาย 6.5 · ไม่มีทักษะต่ำกว่า 6.0</small>
        </Link>
        <nav className="nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}>
              <span className="dot" style={n.color ? { background: n.color } : undefined} aria-hidden />
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "1rem" }}>
          <StudyTimer compact />
        </div>
      </aside>
      <main className="main" id="main">
        {saveError && <div className="notice bad" role="alert">{saveError}</div>}
        {ready ? children : <p className="muted">กำลังโหลดข้อมูลการเรียน…</p>}
      </main>
    </div>
  );
}
