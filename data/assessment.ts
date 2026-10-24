import type { Question } from "@/lib/types";
import type { ScriptLine } from "./listening";

/**
 * Initial diagnostic. It shows strengths and weaknesses to personalise the plan.
 * It is NOT an IELTS test and does not produce a band score.
 */
export const ASSESSMENT_GRAMMAR: Question[] = [
  { id: "g1", kind: "mcq", qtype: "grammar", prompt: "My sister ______ in a bank.", options: ["work", "works", "working"], answer: ["works"], explanationTh: "ประธานเอกพจน์บุรุษที่ 3 (my sister) + present simple ต้องเติม -s" },
  { id: "g2", kind: "mcq", qtype: "grammar", prompt: "I ______ to Chiang Mai last year.", options: ["go", "have gone", "went"], answer: ["went"], explanationTh: "last year = เวลาในอดีตที่ระบุชัด ใช้ past simple" },
  { id: "g3", kind: "mcq", qtype: "grammar", prompt: "She has lived here ______ 2020.", options: ["for", "since", "from"], answer: ["since"], explanationTh: "since + จุดเวลาเริ่มต้น / for + ระยะเวลา" },
  { id: "g4", kind: "mcq", qtype: "grammar", prompt: "This city is ______ than my hometown.", options: ["more big", "bigger", "biggest"], answer: ["bigger"], explanationTh: "คำพยางค์เดียว big → bigger (ซ้ำตัวสะกด g)" },
  { id: "g5", kind: "mcq", qtype: "grammar", prompt: "There ______ a lot of information online.", options: ["is", "are", "have"], answer: ["is"], explanationTh: "information เป็นนามนับไม่ได้ ใช้กริยาเอกพจน์ is" },
  { id: "g6", kind: "mcq", qtype: "grammar", prompt: "If it rains tomorrow, we ______ at home.", options: ["stay", "will stay", "stayed"], answer: ["will stay"], explanationTh: "First conditional: If + present simple, will + V1" },
  { id: "g7", kind: "mcq", qtype: "grammar", prompt: "The report ______ by the manager yesterday.", options: ["wrote", "was written", "has written"], answer: ["was written"], explanationTh: "Passive voice อดีต: was/were + V3" },
  { id: "g8", kind: "mcq", qtype: "grammar", prompt: "______ it was raining, we went for a walk.", options: ["Because", "Although", "So"], answer: ["Although"], explanationTh: "Although = แม้ว่า (แสดงความขัดแย้ง)" },
  { id: "g9", kind: "mcq", qtype: "grammar", prompt: "The student ______ won the prize is from Thailand.", options: ["which", "who", "where"], answer: ["who"], explanationTh: "who ใช้กับคน, which ใช้กับสิ่งของ" },
  { id: "g10", kind: "mcq", qtype: "grammar", prompt: "I am interested ______ learning English.", options: ["in", "on", "at"], answer: ["in"], explanationTh: "interested in เป็น collocation ที่ต้องจำ" },
];

export const ASSESSMENT_VOCAB: Question[] = [
  { id: "v1", kind: "mcq", qtype: "vocabulary", prompt: "'Increase' means…", options: ["go up", "go down", "stay the same"], answer: ["go up"], explanationTh: "increase = เพิ่มขึ้น" },
  { id: "v2", kind: "mcq", qtype: "vocabulary", prompt: "Choose the correct collocation: ______ a decision", options: ["do", "make", "take up"], answer: ["make"], explanationTh: "make a decision = ตัดสินใจ" },
  { id: "v3", kind: "mcq", qtype: "vocabulary", prompt: "A word with a similar meaning to 'significant' is…", options: ["important", "small", "quick"], answer: ["important"], explanationTh: "significant = สำคัญ/มีนัยสำคัญ" },
  { id: "v4", kind: "mcq", qtype: "vocabulary", prompt: "'However' is used to show…", options: ["a result", "a contrast", "an example"], answer: ["a contrast"], explanationTh: "However แสดงความขัดแย้ง" },
  { id: "v5", kind: "mcq", qtype: "vocabulary", prompt: "Pollution is mainly a problem for the…", options: ["environment", "equipment", "experiment"], answer: ["environment"], explanationTh: "environment = สิ่งแวดล้อม (ระวังคำที่หน้าตาคล้ายกัน)" },
];

export const ASSESSMENT_READING = {
  title: "A Morning Market",
  text: "Every Saturday, the small town of Ban Rim holds a morning market. It starts at six o'clock and finishes before eleven, when the weather becomes too hot. Most sellers are local farmers who grow their own vegetables. In recent years, the market has also attracted young people who sell handmade products such as bags and soap. The town council believes the market is good for tourism, but some residents complain about the traffic it creates.",
  questions: [
    { id: "r1", kind: "mcq", qtype: "detail", prompt: "When does the market finish?", options: ["At six o'clock", "Before eleven", "In the afternoon"], answer: ["Before eleven"], explanationTh: "finishes before eleven" },
    { id: "r2", kind: "mcq", qtype: "tfng", prompt: "All the sellers are farmers.", options: ["True", "False", "Not Given"], answer: ["False"], explanationTh: "'Most sellers' ไม่ใช่ทั้งหมด และมีคนหนุ่มสาวขายสินค้าทำมือด้วย" },
    { id: "r3", kind: "mcq", qtype: "tfng", prompt: "The handmade products are cheaper than in shops.", options: ["True", "False", "Not Given"], answer: ["Not Given"], explanationTh: "ไม่มีข้อมูลเรื่องราคา" },
    { id: "r4", kind: "mcq", qtype: "main-idea", prompt: "What do some residents dislike?", options: ["The tourists", "The traffic", "The early start"], answer: ["The traffic"], explanationTh: "complain about the traffic" },
  ] as Question[],
};

export const ASSESSMENT_LISTENING: { script: ScriptLine[]; questions: Question[] } = {
  script: [
    { speaker: "Woman", voice: "A", text: "Hi Tom. Are you coming to the study group this week?" },
    { speaker: "Man", voice: "B", text: "I think so. Is it still on Tuesday?" },
    { speaker: "Woman", voice: "A", text: "No, we moved it to Thursday, because the library is closed on Tuesday. We're meeting at half past four in room twelve." },
    { speaker: "Man", voice: "B", text: "Room twelve, half past four. Should I bring anything?" },
    { speaker: "Woman", voice: "A", text: "Just your notes from the last lecture. Oh, and Maria is bringing snacks, so you don't need to." },
  ],
  questions: [
    { id: "l1", kind: "mcq", qtype: "detail", prompt: "Which day is the study group?", options: ["Tuesday", "Thursday", "Saturday"], answer: ["Thursday"], explanationTh: "ย้ายจากวันอังคารเป็นวันพฤหัสฯ (ตัวลวง: Tuesday)" },
    { id: "l2", kind: "text", qtype: "note-completion", prompt: "Time: ______ (e.g. 3.15)", answer: ["4.30", "4:30", "half past four", "16.30", "16:30"], explanationTh: "half past four = 4.30" },
    { id: "l3", kind: "text", qtype: "note-completion", prompt: "Room number: ______", answer: ["12", "twelve"], explanationTh: "room twelve" },
    { id: "l4", kind: "mcq", qtype: "detail", prompt: "What should Tom bring?", options: ["Snacks", "His lecture notes", "A textbook"], answer: ["His lecture notes"], explanationTh: "Maria นำขนมมาแล้ว Tom ต้องนำโน้ตมา" },
  ],
};

export const ASSESSMENT_WRITING_PROMPT =
  "In 60–100 words, introduce yourself and explain why you want to take IELTS. Write in full sentences. Do not use a translator — this is to see your real starting point.";

export const ASSESSMENT_SPEAKING_QUESTIONS = [
  "Tell me about your hometown.",
  "What do you usually do at the weekend?",
  "Why are you learning English?",
];
