// End-to-end smoke test. Usage: start the app (npm run build && npm start -- -p 3100), then
//   node tests/e2e.mjs [baseUrl] [screenshotDir]
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";

const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.argv[2] ?? "http://localhost:3100";
const SHOTS = process.argv[3] ?? "test-results";
fs.mkdirSync(SHOTS, { recursive: true });

const PAGES = ["/", "/plan", "/assessment", "/lesson/d02", "/listening", "/listening/L1", "/reading", "/reading/R2", "/writing", "/writing?prompt=T1-bar",
  "/speaking", "/speaking?part=2&card=teacher", "/vocabulary", "/mistakes", "/progress", "/tutor", "/resources", "/settings"];

const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
const results = [];
const step = async (name, fn) => {
  console.log("…", name);
  try { await fn(); results.push(["PASS", name]); } catch (e) { results.push(["FAIL", name, e.message.split("\n")[0]]); }
};

// ── Desktop flow ──
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ["microphone"] });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });

await step("dashboard shows empty state honestly", async () => {
  await page.goto(BASE + "/");
  await page.getByRole("heading", { name: "แดชบอร์ด" }).waitFor();
  assert.ok(await page.getByText("ยังไม่ได้ทำแบบประเมินเริ่มต้น").isVisible());
  assert.ok(await page.getByText("ยังไม่มีผลการฝึก", { exact: false }).isVisible());
  await page.getByRole("link", { name: "เริ่มบทเรียนวันนี้" }).waitFor();
});

await step("all pages render with a heading", async () => {
  for (const p of PAGES) {
    await page.goto(BASE + p);
    await page.locator("h1").first().waitFor({ timeout: 8000 });
  }
});

await step("lesson guided practice is graded and recorded", async () => {
  await page.goto(BASE + "/lesson/d02");
  const answers = ["goes", "drink", "doesn't", "Does"];
  const qs = page.locator(".q");
  for (let i = 0; i < 4; i++) await qs.nth(i).getByText(answers[i], { exact: true }).click();
  await qs.nth(4).locator("input").fill("is");
  await qs.nth(5).locator("input").fill("studis"); // near miss → spelling
  await qs.nth(6).locator("input").fill("watches");
  await qs.nth(7).locator("input").fill("am live"); // wrong
  await page.getByRole("button", { name: "ตรวจคำตอบ" }).click();
  await page.getByText("ได้ 6/8 ข้อ").waitFor();
  assert.ok(await page.getByText("สะกดผิด (นับเป็นผิด)").isVisible());
  await page.getByRole("button", { name: "ทำเสร็จแล้ว" }).click();
  await page.getByText("✓ เสร็จแล้ว").waitFor();
});

await step("lesson completion persists after reload", async () => {
  await page.reload();
  await page.getByText("✓ เสร็จแล้ว").waitFor();
});

await step("reschedule a lesson", async () => {
  await page.goto(BASE + "/lesson/d03");
  await page.getByRole("button", { name: "เลื่อนไปวันอื่น" }).click();
  await page.getByLabel("วันใหม่").fill("2026-11-20");
  await page.getByRole("button", { name: "บันทึกวันใหม่" }).click();
  await page.goto(BASE + "/plan");
  await page.getByText("(เลื่อนแล้ว)").first().waitFor();
});

await step("reading TFNG exercise records accuracy by type and mistakes", async () => {
  await page.goto(BASE + "/reading/R2");
  const picks = ["True", "False", "False", "True", "True", "False"]; // q4 is Not Given → 1 wrong
  const qs = page.locator(".q");
  for (let i = 0; i < picks.length; i++) await qs.nth(i).locator("label", { hasText: new RegExp(`^${picks[i]}$`) }).click();
  await page.getByRole("button", { name: "ตรวจคำตอบ" }).click();
  await page.getByText("ได้ 5/6 ข้อ").waitFor();
  await page.goto(BASE + "/reading");
  await page.getByText("True/False/Not Given").first().waitFor();
  await page.goto(BASE + "/mistakes");
  await page.getByText("Reading: T/F/NG", { exact: false }).first().waitFor();
});

await step("listening exercise: transcript hidden until submitted", async () => {
  await page.goto(BASE + "/listening/L1");
  assert.equal(await page.getByRole("heading", { name: "สคริปต์ (Transcript)" }).count(), 0);
  const qs = page.locator(".q");
  await qs.nth(0).locator("input").fill("Garner");
  await qs.nth(1).locator("input").fill("42");
  await qs.nth(2).locator("input").fill("swimming");
  await page.getByRole("button", { name: "ตรวจคำตอบ" }).click();
  await page.getByRole("heading", { name: "สคริปต์ (Transcript)" }).waitFor();
  await page.locator("select[id^=why-]").first().selectOption("listening-distractor");
  await page.locator("td button", { hasText: "+ สมุดคำศัพท์" }).first().click();
  await page.locator("td button", { hasText: "อยู่ในสมุดแล้ว" }).first().waitFor();
});

await step("mistake practice loop", async () => {
  await page.goto(BASE + "/mistakes?practice=1");
  await page.getByRole("heading", { name: "ฝึกจากข้อผิดพลาดของฉัน" }).waitFor();
  const opt = page.locator(".option").first();
  if (await opt.count()) await opt.click(); else await page.getByLabel("คำตอบ").fill("test");
  await page.getByRole("button", { name: "ตรวจ", exact: true }).click();
  await page.getByRole("button", { name: "ข้อถัดไป →" }).waitFor();
});

await step("vocabulary add + review", async () => {
  await page.goto(BASE + "/vocabulary");
  if (!(await page.getByLabel("คำ/วลีภาษาอังกฤษ *").isVisible())) await page.getByText("+ เพิ่มคำศัพท์เอง").click();
  await page.getByLabel("คำ/วลีภาษาอังกฤษ *").fill("sustainable");
  await page.getByLabel("ความหมายภาษาไทย *").fill("ยั่งยืน");
  await page.getByRole("button", { name: "เพิ่มลงสมุด" }).click();
  await page.getByText('เพิ่ม "sustainable" แล้ว', { exact: false }).waitFor();
  await page.reload();
  await page.locator("td", { hasText: "sustainable" }).first().waitFor();
});

await step("writing editor autosaves, rule-checks and keeps revisions", async () => {
  await page.goto(BASE + "/writing?prompt=P1");
  const text = "On weekdays my routine is busy. He go to work at 8. People is very friendly in my office. I am agree that I should sleep earlier because I don't get enough rest.";
  await page.getByLabel("งานเขียนของฉัน").fill(text);
  await page.getByRole("button", { name: "ตรวจเบื้องต้น (ไม่ใช้ AI)" }).click();
  await page.getByText("people เป็นพหูพจน์", { exact: false }).waitFor();
  await page.getByRole("button", { name: "บันทึกเป็นฉบับใหม่" }).click();
  await page.waitForTimeout(800);
  await page.reload();
  assert.equal(await page.getByLabel("งานเขียนของฉัน").inputValue(), text);
  await page.getByText("ประวัติการแก้ไข (1 ฉบับ)").waitFor();
  await page.getByText("ยังไม่ได้ตั้งค่า AI บนเซิร์ฟเวอร์").waitFor();
});

await step("speaking: record with fake mic, type transcript, save", async () => {
  await page.goto(BASE + "/speaking?part=1&topic=home");
  await page.getByRole("button", { name: /เริ่มบันทึกเสียง/ }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /หยุด/ }).click();
  await page.getByText("คำตอบของฉัน", { exact: false }).waitFor();
  await page.getByLabel(/Transcript/).fill("My hometown is Khon Kaen. It is quiet and friendly because people know each other.");
  await page.getByRole("button", { name: "บันทึกการฝึก" }).click();
  await page.getByText("บันทึกการฝึกแล้ว").waitFor();
});

await step("settings: change exam date, dashboard updates; invalid order rejected", async () => {
  await page.goto(BASE + "/settings");
  await page.getByLabel("วันสอบเป้าหมาย (ชั่วคราว)").fill("2026-10-01");
  await page.getByRole("button", { name: "บันทึกวันที่" }).click();
  await page.getByText("วันสอบต้องอยู่หลังวันเริ่มเรียน").waitFor();
  await page.getByLabel("วันสอบเป้าหมาย (ชั่วคราว)").fill("2027-08-21");
  await page.getByRole("button", { name: "บันทึกวันที่" }).click();
  await page.getByText("บันทึกแล้ว", { exact: false }).first().waitFor();
  await page.goto(BASE + "/");
  await page.getByText("21 ส.ค. 2027", { exact: false }).waitFor();
});

await step("progress: mock entry validation and approximate band label", async () => {
  await page.goto(BASE + "/progress");
  await page.getByText("+ บันทึกผลสอบฝึก / mock test").click();
  await page.getByLabel("คะแนนดิบ (/40)").fill("41");
  await page.getByRole("button", { name: "บันทึกผล" }).click();
  await page.getByText("คะแนนดิบต้องเป็นจำนวนเต็ม 0–40").waitFor();
  await page.getByLabel("คะแนนดิบ (/40)").fill("26");
  await page.getByText("~6.5", { exact: false }).first().waitFor();
  await page.getByRole("button", { name: "บันทึกผล" }).click();
  await page.locator("td", { hasText: "26/40" }).waitFor();
});

await step("study timer logs minutes", async () => {
  await page.goto(BASE + "/");
  // fast-forward: write a running timer that started 2 minutes ago
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("ielts-prep-v1"));
    s.timer = { running: true, startedAt: Date.now() - 125000, accumulatedSec: 0, area: "reading", label: "" };
    localStorage.setItem("ielts-prep-v1", JSON.stringify(s));
  });
  await page.reload();
  const btn = page.locator("main").getByRole("button", { name: "จบและบันทึก" });
  await btn.waitFor().catch(async (e) => { await page.screenshot({ path: `${SHOTS}/timer-fail.png` }); throw e; });
  await btn.click();
  await page.getByText("บันทึก 2 นาที", { exact: false }).first().waitFor();
});

await step("export works", async () => {
  await page.goto(BASE + "/settings");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "ส่งออกข้อมูล (.json)" }).click()]);
  const p = await dl.path();
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  assert.equal(data.version, 1);
  assert.ok(data.attempts.length >= 3);
});

await page.goto(BASE + "/");
await page.screenshot({ path: `${SHOTS}/desktop-dashboard.png`, fullPage: true });
await page.goto(BASE + "/lesson/d02");
await page.screenshot({ path: `${SHOTS}/desktop-lesson.png`, fullPage: false });
const relevantErrors = errors.filter((e) => !/favicon|speechSynthesis/i.test(e));
results.push([relevantErrors.length ? "FAIL" : "PASS", "no console/page errors", relevantErrors.slice(0, 5).join(" | ")]);

// ── Mobile layout ──
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, storageState: await ctx.storageState() });
const m = await mctx.newPage();
await step("mobile: no horizontal overflow on any page", async () => {
  const bad = [];
  for (const p of PAGES) {
    await m.goto(BASE + p);
    await m.locator("h1").first().waitFor();
    const w = await m.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    if (w[0] > w[1] + 1) bad.push(`${p} (${w[0]}>${w[1]})`);
  }
  assert.deepEqual(bad, []);
});
await step("mobile: menu opens and navigates", async () => {
  await m.goto(BASE + "/");
  await m.getByRole("button", { name: "เมนู" }).click();
  await m.locator("#sidebar").getByRole("link", { name: "Reading" }).click();
  await m.getByRole("heading", { name: "Reading" }).waitFor();
});
for (const [name, p] of [["dashboard", "/"], ["lesson", "/lesson/d02"], ["reading", "/reading/R1"], ["writing", "/writing?prompt=T1-bar"], ["plan", "/plan"]]) {
  await m.goto(BASE + p);
  await m.screenshot({ path: `${SHOTS}/mobile-${name}.png`, fullPage: false });
}
const dctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark", storageState: await ctx.storageState() });
const dp = await dctx.newPage();
dp.on("pageerror", (e) => console.log("dark pageerror:", e.message));
await step("dark mode renders", async () => {
  await dp.goto(BASE + "/progress");
  await dp.locator("h1").waitFor({ timeout: 10000 });
  const bg = await dp.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.notEqual(bg, "rgb(246, 247, 249)");
  await dp.screenshot({ path: `${SHOTS}/mobile-dark-progress.png`, fullPage: false });
});

await browser.close();
for (const r of results) console.log(r.join("  "));
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
