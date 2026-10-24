import type { MistakeCategory } from "./types";

export const MISTAKE_LABEL: Record<string, string> = {
  "verb-tense": "Tense ของกริยา",
  "subject-verb-agreement": "ประธาน-กริยาไม่สอดคล้อง (-s)",
  articles: "Articles (a/an/the)",
  prepositions: "คำบุพบท",
  "word-form": "รูปคำ (noun/adj/adv)",
  "sentence-structure": "โครงสร้างประโยค",
  vocabulary: "คำศัพท์",
  collocation: "Collocation",
  spelling: "การสะกด",
  punctuation: "เครื่องหมายวรรคตอน",
  "listening-missed-keyword": "Listening: ฟังคำสำคัญไม่ทัน",
  "listening-accent": "Listening: สำเนียง",
  "listening-distractor": "Listening: ตัวลวง",
  "listening-numbers": "Listening: ตัวเลข/วันที่",
  "reading-paraphrase": "Reading: ไม่จับ paraphrase / ใจความ",
  "reading-tfng": "Reading: T/F/NG, Y/N/NG",
  "reading-scanning": "Reading: scanning",
  "writing-task-response": "Writing: ตอบโจทย์ไม่ครบ",
  "writing-coherence": "Writing: ความต่อเนื่อง/การเชื่อม",
  "speaking-fluency": "Speaking: ความต่อเนื่อง",
  pronunciation: "การออกเสียง",
  other: "อื่น ๆ",
};

export const MISTAKE_CATEGORIES = Object.keys(MISTAKE_LABEL) as MistakeCategory[];
