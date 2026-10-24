"use client";

import { useEffect, useState } from "react";

export type AiTask = "writing-feedback" | "speaking-feedback" | "tutor";

export interface AiStatus {
  configured: boolean;
  needsCode: boolean;
  model?: string;
  checked: boolean;
  error?: string;
}

let cached: AiStatus | null = null;

export function useAiStatus(): AiStatus {
  const [s, setS] = useState<AiStatus>(cached ?? { configured: false, needsCode: false, checked: false });
  useEffect(() => {
    if (cached) return;
    fetch("/api/ai", { method: "GET", cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        cached = { configured: !!j.configured, needsCode: !!j.needsCode, model: j.model, checked: true };
        setS(cached);
      })
      .catch(() => {
        cached = { configured: false, needsCode: false, checked: true, error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" };
        setS(cached);
      });
  }, []);
  return s;
}

export async function askAI(
  task: AiTask,
  payload: Record<string, unknown>,
  accessCode: string,
): Promise<{ ok: true; text: string; model: string } | { ok: false; error: string }> {
  try {
    const r = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessCode ? { "x-access-code": accessCode } : {}) },
      body: JSON.stringify({ task, ...payload }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error ?? `เกิดข้อผิดพลาด (${r.status})` };
    return { ok: true, text: j.text, model: j.model };
  } catch {
    return { ok: false, error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่" };
  }
}
