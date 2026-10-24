import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "IELTS Academic Prep",
  description: "แผนเตรียมสอบ IELTS Academic ส่วนตัว: เป้าหมาย Overall 6.5 ไม่มีทักษะใดต่ำกว่า 6.0",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171b21" },
  ],
};

// Applies the saved theme before first paint to avoid a light/dark flash.
const themeScript = `try{var s=JSON.parse(localStorage.getItem("ielts-prep-v1")||"{}");var t=s.settings&&s.settings.theme;if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
