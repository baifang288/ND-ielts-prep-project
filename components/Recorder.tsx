"use client";

import { useEffect, useRef, useState } from "react";

export interface RecordingResult {
  audioUrl: string | null;
  transcript: string;
  transcriptSource: "speech-recognition" | "typed";
  durationSec: number;
}

// Minimal typing for the (prefixed) Web Speech recognition API.
interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

function getRecognition(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function recordingSupport() {
  const media = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
  return { media, stt: !!getRecognition() };
}

export default function Recorder({ maxSec, onFinish }: { maxSec?: number; onFinish: (r: RecordingResult) => void }) {
  const [support, setSupport] = useState({ media: false, stt: false });
  const [recording, setRecording] = useState(false);
  const [sec, setSec] = useState(0);
  const [live, setLive] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const recog = useRef<RecognitionLike | null>(null);
  const chunks = useRef<Blob[]>([]);
  const finalText = useRef("");
  const started = useRef(0);
  const active = useRef(false);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => setSupport(recordingSupport()), []);

  useEffect(() => {
    if (!recording) return;
    const i = setInterval(() => {
      const s = Math.floor((Date.now() - started.current) / 1000);
      setSec(s);
      if (maxSec && s >= maxSec) stop();
    }, 250);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, maxSec]);

  useEffect(() => () => { active.current = false; stream.current?.getTracks().forEach((t) => t.stop()); }, []);

  const start = async () => {
    setError(null);
    finalText.current = "";
    setLive("");
    chunks.current = [];
    try {
      if (support.media) {
        stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream.current);
        mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
        mr.start();
        rec.current = mr;
      }
    } catch {
      setError("ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน — อนุญาตในการตั้งค่าเบราว์เซอร์ หรือพิมพ์สิ่งที่พูดแทน");
      return;
    }
    const R = getRecognition();
    if (R) {
      const r = new R();
      r.lang = "en-GB";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalText.current += res[0].transcript.trim() + " ";
          else interim += res[0].transcript;
        }
        setLive((finalText.current + interim).trim());
      };
      // Chrome ends recognition after silence; restart while still recording.
      r.onend = () => { if (active.current) { try { r.start(); } catch { /* already started */ } } };
      r.onerror = (e) => { if (e.error === "not-allowed") setError("ไม่ได้รับอนุญาตให้ถอดเสียง — จะบันทึกเฉพาะเสียง"); };
      try { r.start(); recog.current = r; } catch { /* ignore */ }
    }
    active.current = true;
    started.current = Date.now();
    setSec(0);
    setRecording(true);
  };

  const stop = () => {
    if (!active.current) return;
    active.current = false;
    const duration = Math.round((Date.now() - started.current) / 1000);
    recog.current?.stop();
    const finish = (audioUrl: string | null) => {
      stream.current?.getTracks().forEach((t) => t.stop());
      setRecording(false);
      const transcript = (finalText.current || live).trim();
      onFinish({ audioUrl, transcript, transcriptSource: transcript ? "speech-recognition" : "typed", durationSec: duration });
    };
    const mr = rec.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => finish(chunks.current.length ? URL.createObjectURL(new Blob(chunks.current, { type: mr.mimeType })) : null);
      mr.stop();
    } else finish(null);
    // give recognition a moment to deliver its last final result
  };

  return (
    <div>
      {!support.media && (
        <div className="notice warn small">เบราว์เซอร์นี้บันทึกเสียงไม่ได้ ฝึกพูดออกเสียงจริงแล้วพิมพ์สิ่งที่พูดลงในช่อง transcript แทน</div>
      )}
      {support.media && !support.stt && (
        <div className="notice small">เบราว์เซอร์นี้บันทึกเสียงได้ แต่ถอดเสียงเป็นข้อความไม่ได้ (Chrome/Edge/Safari รองรับการถอดเสียง) — หลังพูด ให้ฟังเสียงตัวเองแล้วพิมพ์ transcript เอง</div>
      )}
      {error && <div className="notice bad small" role="alert">{error}</div>}
      <div className="row">
        {!recording ? (
          <button className="btn primary" onClick={start}>● {support.media ? "เริ่มบันทึกเสียง" : "เริ่มจับเวลาพูด"}</button>
        ) : (
          <button className="btn danger" onClick={stop}>■ หยุด ({sec}s{maxSec ? ` / ${maxSec}s` : ""})</button>
        )}
      </div>
      {recording && live && <p className="small en muted" aria-live="polite" style={{ marginTop: 8 }}>{live}</p>}
    </div>
  );
}
