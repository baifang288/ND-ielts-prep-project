"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AppState } from "./types";

export const STORAGE_KEY = "ielts-prep-v1";

export function defaultState(): AppState {
  return {
    version: 1,
    settings: {
      startDate: "2026-11-09",
      examDate: "2027-08-01",
      dailyMinutes: 60,
      planMonths: 9,
      theme: "system",
      accessCode: "",
      ttsRate: 0.9,
    },
    lessons: {},
    reschedule: {},
    guided: {},
    attempts: [],
    studyLog: {},
    timer: { running: false, accumulatedSec: 0, area: "review", label: "" },
    vocab: [],
    mistakes: [],
    drafts: [],
    speaking: [],
    mocks: [],
    phase: { current: 1, advancedAt: {} },
    tutorChat: [],
  };
}

/** Merge a loaded/imported object onto defaults so older saves keep working. */
export function migrate(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AppState>;
  if (r.version !== 1) throw new Error("ไฟล์นี้ไม่ใช่ข้อมูลของแอปนี้ (version ไม่ตรง)");
  return {
    ...base,
    ...r,
    settings: { ...base.settings, ...(r.settings ?? {}) },
    timer: { ...base.timer, ...(r.timer ?? {}) },
    phase: { ...base.phase, ...(r.phase ?? {}) },
  };
}

interface Store {
  state: AppState;
  ready: boolean;
  saveError: string | null;
  /** Mutate a copy of the state; the copy becomes the new state and is saved. */
  update: (fn: (draft: AppState) => void) => void;
  replace: (next: AppState) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(migrate(JSON.parse(raw)));
    } catch (e) {
      try {
        if (raw) localStorage.setItem(STORAGE_KEY + "-unreadable-backup", raw);
      } catch {
        /* storage unavailable */
      }
      setSaveError(`อ่านข้อมูลที่บันทึกไว้ไม่ได้ เริ่มด้วยข้อมูลว่าง (สำเนาเดิมเก็บไว้ที่ ${STORAGE_KEY}-unreadable-backup): ` + String(e));
    }
    setReady(true);
  }, []);

  // Save on every change so nothing is lost if the tab is closed right after an action.
  useEffect(() => {
    if (!ready) return; // never overwrite saved data with the defaults used before loading
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveError(null);
    } catch (e) {
      setSaveError("บันทึกข้อมูลไม่สำเร็จ (พื้นที่เบราว์เซอร์อาจเต็ม) — กรุณาสำรองข้อมูลในหน้า ตั้งค่า: " + String(e));
    }
  }, [state, ready]);

  // Keep several tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(migrate(JSON.parse(e.newValue)));
        } catch {
          /* ignore malformed */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (draft: AppState) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const replace = useCallback((next: AppState) => setState(next), []);

  return <Ctx.Provider value={{ state, ready, saveError, update, replace }}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export function uid(prefix = ""): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
