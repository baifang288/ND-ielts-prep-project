"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ScriptLine } from "@/data/listening";

interface Props {
  script: ScriptLine[];
  rate: number;
  onRateChange?: (r: number) => void;
  /** null = unlimited plays */
  maxPlays: number | null;
  onLineChange?: (index: number | null) => void;
  /** Called when there is no speech synthesis in this browser. */
  onUnsupported?: () => void;
}

function pickVoices(): { A?: SpeechSynthesisVoice; B?: SpeechSynthesisVoice } {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  const rank = (v: SpeechSynthesisVoice) => (v.lang === "en-GB" ? 0 : v.lang === "en-AU" ? 1 : v.lang === "en-US" ? 2 : 3);
  const sorted = [...voices].sort((a, b) => rank(a) - rank(b));
  const A = sorted[0];
  const B = sorted.find((v) => v !== A && v.lang !== A?.lang) ?? sorted.find((v) => v !== A) ?? A;
  return { A, B };
}

export default function TTSPlayer({ script, rate, onRateChange, maxPlays, onLineChange, onUnsupported }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [plays, setPlays] = useState(0);
  const [voiceInfo, setVoiceInfo] = useState("");
  const cancelled = useRef(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSupported(ok);
    if (!ok) {
      onUnsupported?.();
      return;
    }
    const update = () => {
      const { A, B } = pickVoices();
      setVoiceInfo(A ? `${A.name} (${A.lang})${B && B !== A ? ` + ${B.name} (${B.lang})` : ""}` : "ไม่พบเสียงภาษาอังกฤษในเครื่อง");
    };
    update();
    window.speechSynthesis.addEventListener?.("voiceschanged", update);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", update);
      window.speechSynthesis.cancel();
    };
  }, [onUnsupported]);

  const speakFrom = useCallback(
    (start: number) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      cancelled.current = false;
      const { A, B } = pickVoices();
      setPlaying(true);
      setPaused(false);
      const run = (i: number) => {
        if (cancelled.current || i >= script.length) {
          setPlaying(false);
          onLineChange?.(null);
          return;
        }
        const line = script[i];
        const u = new SpeechSynthesisUtterance(line.text);
        const v = line.voice === "A" ? A : B;
        if (v) u.voice = v;
        u.lang = v?.lang ?? "en-GB";
        u.rate = rate;
        u.pitch = line.voice === "B" && v === A ? 0.85 : 1; // differentiate speakers when only one voice exists
        u.onstart = () => onLineChange?.(i);
        u.onend = () => setTimeout(() => run(i + 1), 350);
        u.onerror = (e) => {
          if (e.error !== "interrupted" && e.error !== "canceled") run(i + 1);
        };
        synth.speak(u);
      };
      run(start);
    },
    [script, rate, onLineChange],
  );

  const playAll = () => {
    if (maxPlays !== null && plays >= maxPlays) return;
    setPlays((p) => p + 1);
    speakFrom(0);
  };
  const pause = () => { window.speechSynthesis.pause(); setPaused(true); };
  const resume = () => { window.speechSynthesis.resume(); setPaused(false); };
  const stop = () => {
    cancelled.current = true;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    onLineChange?.(null);
  };

  if (supported === false) {
    return (
      <div className="notice warn">
        <b>เบราว์เซอร์นี้เล่นเสียงสังเคราะห์ไม่ได้</b> — ใช้โหมดข้อความ (อ่านสคริปต์แทนการฟัง) ซึ่งจะถูกบันทึกเป็น &quot;ฝึกแบบข้อความ&quot;
        หรือฝึกฟังจากเสียงจริงที่ British Council / BBC ในหน้า แหล่งเรียนรู้ฟรี
      </div>
    );
  }

  const remaining = maxPlays === null ? null : Math.max(0, maxPlays - plays);
  return (
    <div className="card skill-listening" style={{ background: "var(--listening-soft)" }}>
      <div className="row">
        {!playing ? (
          <button className="btn primary" onClick={playAll} disabled={remaining === 0}>
            ▶ {plays ? "เล่นซ้ำ" : "เล่นเสียง"}
          </button>
        ) : paused ? (
          <button className="btn primary" onClick={resume}>▶ เล่นต่อ</button>
        ) : (
          <button className="btn" onClick={pause}>❚❚ หยุดชั่วคราว</button>
        )}
        <button className="btn" onClick={stop} disabled={!playing}>■ หยุด</button>
        <label className="row small" style={{ fontWeight: 400, margin: 0 }}>
          ความเร็ว
          <select value={rate} onChange={(e) => onRateChange?.(Number(e.target.value))} style={{ width: "auto", minHeight: 36 }} aria-label="ความเร็วเสียง">
            <option value={0.75}>0.75×</option>
            <option value={0.9}>0.9×</option>
            <option value={1}>1.0×</option>
          </select>
        </label>
      </div>
      <p className="small muted" style={{ margin: "0.5rem 0 0" }}>
        {remaining === null ? `เล่นแล้ว ${plays} ครั้ง` : `เล่นได้อีก ${remaining} ครั้ง`} · เสียงสังเคราะห์ของเบราว์เซอร์ (สำเนียงและความเร็วต่างจากข้อสอบจริง)
        {voiceInfo && <> · {voiceInfo}</>}
      </p>
      <span className="sr-only" aria-live="polite">{playing ? (paused ? "หยุดชั่วคราว" : "กำลังเล่น") : ""}</span>
    </div>
  );
}

/** Speak a single phrase (vocabulary pronunciation). */
export function speak(text: string, rate = 0.9) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const { A } = pickVoices();
  if (A) u.voice = A;
  u.lang = A?.lang ?? "en-GB";
  u.rate = rate;
  window.speechSynthesis.speak(u);
  return true;
}
