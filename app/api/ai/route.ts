import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SPEAKING_SYSTEM, TUTOR_SYSTEM, WRITING_SYSTEM } from "@/lib/ai-prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const MAX_INPUT_CHARS = 12_000;

// Very small in-memory rate limit (per server instance). Good enough for a single-learner app.
const hits: number[] = [];
function rateLimited(): boolean {
  const now = Date.now();
  while (hits.length && now - hits[0] > 60_000) hits.shift();
  if (hits.length >= 12) return true;
  hits.push(now);
  return false;
}

function configured() {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export async function GET() {
  return NextResponse.json({ configured: configured(), needsCode: !!process.env.APP_ACCESS_CODE, model: configured() ? MODEL : undefined });
}

type Msg = { role: "user" | "assistant"; content: string };

function str(v: unknown, max = MAX_INPUT_CHARS): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

function buildRequest(body: Record<string, unknown>): { system: string; messages: Msg[] } | { error: string } {
  const task = body.task;
  if (task === "writing-feedback") {
    const text = str(body.text);
    if (text.trim().split(/\s+/).length < 20) return { error: "ข้อความสั้นเกินไปสำหรับการให้ feedback (ต้องมีอย่างน้อย 20 คำ)" };
    const taskNo = Number(body.taskNo);
    return {
      system: WRITING_SYSTEM,
      messages: [{
        role: "user",
        content: `Writing type: ${taskNo === 1 ? "IELTS Academic Writing Task 1" : taskNo === 2 ? "IELTS Writing Task 2" : "Paragraph practice (not a full IELTS task)"}
Prompt: ${str(body.prompt, 2000)}
${body.visualSummary ? `Data in the visual (as given to the learner): ${str(body.visualSummary, 2000)}\n` : ""}Word count: ${Number(body.words) || 0}

Learner's text:
"""
${text}
"""`,
      }],
    };
  }
  if (task === "speaking-feedback") {
    const transcript = str(body.transcript, 6000);
    if (transcript.trim().split(/\s+/).length < 8) return { error: "transcript สั้นเกินไปสำหรับการให้ feedback (ต้องมีอย่างน้อย 8 คำ)" };
    return {
      system: SPEAKING_SYSTEM,
      messages: [{
        role: "user",
        content: `IELTS Speaking Part ${Number(body.part) || 1}
Question: ${str(body.question, 1000)}
Transcript source: ${body.source === "speech-recognition" ? "browser speech-to-text (may contain recognition errors)" : "typed by the learner"}
Speaking time: ${Number(body.durationSec) || 0} seconds

Transcript:
"""
${transcript}
"""`,
      }],
    };
  }
  if (task === "tutor") {
    const raw = Array.isArray(body.messages) ? body.messages : [];
    const messages: Msg[] = raw
      .filter((m): m is Msg => !!m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));
    if (!messages.length || messages[messages.length - 1].role !== "user") return { error: "ไม่มีคำถาม" };
    // Context goes into the first user turn so the system prompt stays stable.
    const context = str(body.context, 4000);
    if (context) messages[0] = { role: "user", content: `[Learner progress summary from the app]\n${context}\n\n[Question]\n${messages[0].content}` };
    return { system: TUTOR_SYSTEM, messages };
  }
  return { error: "unknown task" };
}

export async function POST(req: Request) {
  if (!configured()) {
    return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า AI บนเซิร์ฟเวอร์ (ANTHROPIC_API_KEY) — ใช้โหมดไม่ใช้ AI ได้ตามปกติ" }, { status: 503 });
  }
  const code = process.env.APP_ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) {
    return NextResponse.json({ error: "รหัสเข้าใช้ AI ไม่ถูกต้อง — ใส่รหัสในหน้า ตั้งค่า" }, { status: 401 });
  }
  if (rateLimited()) return NextResponse.json({ error: "ส่งคำขอถี่เกินไป รอสักครู่แล้วลองใหม่" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }
  const built = buildRequest(body);
  if ("error" in built) return NextResponse.json({ error: built.error }, { status: 400 });

  const client = new Anthropic();
  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: built.system,
      messages: built.messages,
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") {
      return NextResponse.json({ error: "AI ไม่สามารถตอบคำขอนี้ได้ ลองเปลี่ยนคำถาม" }, { status: 422 });
    }
    const text = msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    if (!text) return NextResponse.json({ error: "AI ไม่ได้ส่งคำตอบกลับมา ลองใหม่อีกครั้ง" }, { status: 502 });
    const truncated = msg.stop_reason === "max_tokens" ? "\n\n(คำตอบถูกตัดเพราะยาวเกินไป)" : "";
    return NextResponse.json({ text: text + truncated, model: msg.model });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "API key ไม่ถูกต้อง ตรวจการตั้งค่าบนเซิร์ฟเวอร์" }, { status: 502 });
    if (e instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "บริการ AI ถูกใช้งานเกินโควตา ลองใหม่ภายหลัง" }, { status: 429 });
    if (e instanceof Anthropic.APIConnectionError) return NextResponse.json({ error: "เชื่อมต่อบริการ AI ไม่ได้ ลองใหม่อีกครั้ง" }, { status: 502 });
    if (e instanceof Anthropic.APIError) return NextResponse.json({ error: `บริการ AI ตอบกลับผิดพลาด (${e.status ?? "?"})` }, { status: 502 });
    return NextResponse.json({ error: "เกิดข้อผิดพลาดที่ไม่คาดคิด" }, { status: 500 });
  }
}
