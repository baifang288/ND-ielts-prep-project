export type Visual =
  | { type: "bar"; title: string; unit: string; categories: string[]; series: { name: string; values: number[] }[] }
  | { type: "line"; title: string; unit: string; xLabels: string[]; series: { name: string; values: number[] }[] }
  | { type: "table"; title: string; headers: string[]; rows: (string | number)[][] }
  | { type: "process"; title: string; steps: string[] }
  | { type: "map"; title: string; before: { label: string; items: string[] }; after: { label: string; items: string[] } };

export interface WritingPrompt {
  id: string;
  task: 0 | 1 | 2;
  kind: string; // e.g. "paragraph", "bar chart", "opinion"
  title: string;
  prompt: string;
  minWords: number;
  suggestedMinutes: number;
  visual?: Visual;
  planningTh: string[];
  usefulLanguage: string[];
}

/** All prompts and data are original practice material, not taken from IELTS tests. */
export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: "P1",
    task: 0,
    kind: "paragraph",
    title: "My daily routine",
    prompt: "Write one paragraph (80–100 words) about your daily routine on a weekday. Include a topic sentence, at least three supporting details, and a concluding sentence about one thing you would like to change.",
    minWords: 80,
    suggestedMinutes: 20,
    planningTh: ["เขียน topic sentence 1 ประโยคที่บอกภาพรวม", "เรียงกิจกรรมตามเวลา: first, then, after that, in the evening", "ใช้ present simple (I get up / she works) และอย่าลืม -s กับ he/she/it", "ปิดด้วยประโยคที่บอกสิ่งที่อยากเปลี่ยน: I would like to…"],
    usefulLanguage: ["On weekdays, I usually…", "After that, …", "Most evenings, I…", "One thing I would like to change is…"],
  },
  {
    id: "P2",
    task: 0,
    kind: "paragraph",
    title: "A memorable learning experience",
    prompt: "Write a paragraph (100–120 words) about a time when you learned something important, at school or outside school. Use past simple and time expressions.",
    minWords: 100,
    suggestedMinutes: 25,
    planningTh: ["บอกว่าเกิดขึ้นเมื่อไร ที่ไหน (When I was…, Last year…)", "เล่าลำดับเหตุการณ์ด้วย past simple (learned, went, felt)", "บอกว่าสิ่งนั้นสำคัญอย่างไรต่อคุณในปัจจุบัน"],
    usefulLanguage: ["When I was in…, I…", "At first, I found it difficult to…", "Eventually, I…", "Since then, I have…"],
  },
  {
    id: "T1-bar",
    task: 1,
    kind: "bar chart",
    title: "How students travel to a college",
    prompt: "The chart below shows how students travelled to a college in 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words. (For your first attempt in Week 3, write an overview plus two comparisons of about 80 words.)",
    minWords: 150,
    suggestedMinutes: 20,
    visual: {
      type: "bar",
      title: "Students' main way of travelling to college (%) — invented data",
      unit: "%",
      categories: ["Car", "Bus", "Bicycle", "Walk"],
      series: [
        { name: "2015", values: [45, 30, 10, 15] },
        { name: "2025", values: [25, 35, 25, 15] },
      ],
    },
    planningTh: ["อย่าเขียนทุกตัวเลข เลือก 'จุดเด่น' (key features)", "Overview: แนวโน้มใหญ่ 1–2 ข้อ เช่น car ลดลง bicycle เพิ่มขึ้น (ไม่ต้องใส่ตัวเลข)", "Body 1: car vs bus | Body 2: bicycle และ walk (ไม่เปลี่ยน)", "ห้ามใส่ความคิดเห็นหรือเหตุผลที่ไม่มีในกราฟ"],
    usefulLanguage: ["Overall, it is clear that…", "The proportion of students who… fell from 45% to 25%.", "…rose significantly, from 10% to 25%.", "…remained unchanged at 15%.", "By contrast, …"],
  },
  {
    id: "T1-line",
    task: 1,
    kind: "line graph",
    title: "Visitors to three museums",
    prompt: "The graph shows the number of visitors (in thousands) to three museums between 2018 and 2026. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    minWords: 150,
    suggestedMinutes: 20,
    visual: {
      type: "line",
      title: "Annual visitors (thousands) — invented data",
      unit: "k",
      xLabels: ["2018", "2020", "2022", "2024", "2026"],
      series: [
        { name: "Science Museum", values: [120, 60, 110, 150, 170] },
        { name: "Art Gallery", values: [90, 40, 70, 80, 85] },
        { name: "History Museum", values: [60, 30, 55, 60, 58] },
      ],
    },
    planningTh: ["Overview: ทั้งสามแห่งลดลงในปี 2020 แล้วฟื้นตัว; Science Museum สูงสุดตลอด", "แบ่งย่อหน้าตามช่วงเวลา (2018–2020 / 2020–2026) หรือตามพิพิธภัณฑ์", "ใช้ past simple สำหรับข้อมูลในอดีต"],
    usefulLanguage: ["…dropped sharply to… in 2020", "…recovered steadily", "…peaked at… in 2026", "…remained relatively stable at around…"],
  },
  {
    id: "T1-table",
    task: 1,
    kind: "table",
    title: "Household spending in two countries",
    prompt: "The table shows the percentage of household income spent on four categories in Country A and Country B in 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    minWords: 150,
    suggestedMinutes: 20,
    visual: {
      type: "table",
      title: "Share of household income (%) in 2025 — invented data",
      headers: ["Category", "Country A", "Country B"],
      rows: [["Housing", 35, 22], ["Food", 15, 30], ["Transport", 12, 14], ["Leisure", 10, 6]],
    },
    planningTh: ["หาค่าสูงสุดของแต่ละประเทศ (A: housing, B: food)", "เปรียบเทียบข้ามประเทศ ไม่ใช่อธิบายทีละช่อง", "Transport ใกล้เคียงกัน — ใช้ 'similar'"],
    usefulLanguage: ["…accounted for the largest share of…", "…twice as much as…", "…was similar in both countries (12% and 14%).", "…whereas…"],
  },
  {
    id: "T1-process",
    task: 1,
    kind: "process",
    title: "How paper is recycled",
    prompt: "The diagram shows the stages in recycling used paper. Summarise the information by selecting and reporting the main features. Write at least 150 words.",
    minWords: 150,
    suggestedMinutes: 20,
    visual: {
      type: "process",
      title: "Paper recycling (simplified, original diagram)",
      steps: ["Used paper is collected", "Paper is sorted by type", "Paper is mixed with water to make pulp", "Ink is removed", "Pulp is pressed and dried", "New paper is rolled and sent to shops"],
    },
    planningTh: ["Overview: กี่ขั้นตอน เริ่มและจบอย่างไร", "ใช้ passive voice: is collected, is sorted", "ใช้คำบอกลำดับ: first, next, after that, finally"],
    usefulLanguage: ["The process consists of six stages, beginning with… and ending with…", "First, used paper is collected…", "Once…, it is…", "In the final stage, …"],
  },
  {
    id: "T1-map",
    task: 1,
    kind: "map",
    title: "Changes to a town centre",
    prompt: "The maps show a town centre in 2010 and today. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    minWords: 150,
    suggestedMinutes: 20,
    visual: {
      type: "map",
      title: "Town centre (described, original data)",
      before: { label: "2010", items: ["Car park in the north", "Two-lane road through the centre", "Small shops along the road", "Factory in the south-east"] },
      after: { label: "Today", items: ["Car park replaced by a park", "Road is now a pedestrian street", "Shops remain, plus a new café area", "Factory converted into apartments", "New bus station in the west"] },
    },
    planningTh: ["Overview: เมืองเป็นมิตรกับคนเดินเท้ามากขึ้น/มีที่อยู่อาศัยมากขึ้น", "ใช้ passive + present perfect: has been replaced, was converted", "ใช้ทิศ: in the north, to the west of"],
    usefulLanguage: ["…has been replaced by…", "…was converted into…", "A new… has been built in the west.", "…remained unchanged."],
  },
  {
    id: "T2-opinion",
    task: 2,
    kind: "opinion (agree/disagree)",
    title: "Online learning",
    prompt: "Some people believe that online courses will soon replace traditional classroom learning. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
    minWords: 250,
    suggestedMinutes: 40,
    planningTh: ["ตัดสินจุดยืนก่อนเขียน (agree / disagree / partly) และใช้จุดยืนเดียวตลอด", "Intro: paraphrase โจทย์ + thesis (ความเห็นชัดเจน)", "Body 1–2: แต่ละย่อหน้า 1 ความคิดหลัก + อธิบาย + ตัวอย่าง", "Conclusion: สรุปความเห็นซ้ำด้วยคำใหม่ ไม่เพิ่มความคิดใหม่"],
    usefulLanguage: ["It is often argued that…", "I partly agree with this view because…", "One major reason is that…", "For example, …", "In conclusion, although…, I believe…"],
  },
  {
    id: "T2-discussion",
    task: 2,
    kind: "discussion (both views + opinion)",
    title: "City or countryside",
    prompt: "Some people think it is better to grow up in a city, while others believe the countryside is a better place for children. Discuss both views and give your own opinion. Write at least 250 words.",
    minWords: 250,
    suggestedMinutes: 40,
    planningTh: ["ต้องพูดถึงทั้งสองมุมมอง และบอกความเห็นตัวเองชัด ๆ", "Body 1: ข้อดีของเมือง | Body 2: ข้อดีของชนบท + ความเห็น"],
    usefulLanguage: ["On the one hand, …", "On the other hand, …", "Supporters of this view argue that…", "Personally, I believe…"],
  },
  {
    id: "T2-advdis",
    task: 2,
    kind: "advantages/disadvantages",
    title: "Working from home",
    prompt: "More and more people are working from home. What are the advantages and disadvantages of this trend? Write at least 250 words.",
    minWords: 250,
    suggestedMinutes: 40,
    planningTh: ["Body 1: ข้อดี 2 ข้อ | Body 2: ข้อเสีย 2 ข้อ", "ถ้าโจทย์ถาม 'Do the advantages outweigh…?' ต้องตอบความเห็น แต่โจทย์นี้ไม่ได้ถาม"],
    usefulLanguage: ["The main advantage is that…", "Another benefit is…", "However, there are also drawbacks.", "A further disadvantage is…"],
  },
  {
    id: "T2-problem",
    task: 2,
    kind: "problem/solution",
    title: "Traffic in big cities",
    prompt: "Traffic congestion is a serious problem in many large cities. What are the causes of this problem, and what measures could be taken to solve it? Write at least 250 words.",
    minWords: 250,
    suggestedMinutes: 40,
    planningTh: ["Body 1: สาเหตุ 2 ข้อ | Body 2: วิธีแก้ที่ตรงกับสาเหตุ", "ใช้ตัวอย่างจากเมืองที่รู้จัก เช่น กรุงเทพฯ"],
    usefulLanguage: ["One of the main causes is…", "This is largely because…", "One effective solution would be to…", "If governments…, people would…"],
  },
];

export const CHECKLISTS: Record<0 | 1 | 2, { id: string; label: string; hintTh: string }[]> = {
  0: [
    { id: "topic", label: "Clear topic sentence", hintTh: "ประโยคแรกบอกใจความหลักของย่อหน้า" },
    { id: "support", label: "3+ supporting details", hintTh: "มีรายละเอียดสนับสนุนอย่างน้อย 3 จุด" },
    { id: "linkers", label: "Linking words used correctly", hintTh: "first, then, because, however ใช้ถูกที่" },
    { id: "tense", label: "Correct verb tense throughout", hintTh: "ตรวจ -s / -ed / tense ทุกประโยค" },
    { id: "concluding", label: "Concluding sentence", hintTh: "ปิดย่อหน้าด้วยประโยคสรุป" },
  ],
  1: [
    { id: "ta-overview", label: "Task Achievement: clear overview", hintTh: "มี overview บอกแนวโน้ม/จุดเด่นหลัก" },
    { id: "ta-key", label: "Task Achievement: key features with data", hintTh: "เลือกข้อมูลสำคัญและอ้างตัวเลขถูกต้อง" },
    { id: "ta-compare", label: "Task Achievement: comparisons made", hintTh: "เปรียบเทียบ ไม่ใช่แค่ไล่ตัวเลข" },
    { id: "ta-noopinion", label: "No personal opinion or reasons", hintTh: "ไม่ใส่ความเห็นหรือสาเหตุที่ไม่มีในภาพ" },
    { id: "cc", label: "Coherence & Cohesion: logical paragraphs", hintTh: "แบ่งย่อหน้าเป็นกลุ่มข้อมูลที่สมเหตุสมผล" },
    { id: "lr", label: "Lexical Resource: varied trend/data words", hintTh: "ไม่ใช้ increase ซ้ำทุกประโยค" },
    { id: "gra", label: "Grammar: accurate tenses & comparatives", hintTh: "tense ตรงกับเวลาในข้อมูล, comparatives ถูก" },
    { id: "words", label: "150+ words", hintTh: "ต่ำกว่า 150 คำจะถูกลดคะแนน" },
  ],
  2: [
    { id: "tr-all", label: "Task Response: all parts of the question answered", hintTh: "ตอบครบทุกส่วนของโจทย์" },
    { id: "tr-position", label: "Task Response: clear position throughout", hintTh: "จุดยืนชัดเจนและสม่ำเสมอ" },
    { id: "tr-develop", label: "Task Response: ideas explained with examples", hintTh: "อธิบายความคิดและยกตัวอย่าง" },
    { id: "cc-para", label: "Coherence & Cohesion: one main idea per paragraph", hintTh: "หนึ่งย่อหน้า หนึ่งความคิดหลัก" },
    { id: "cc-link", label: "Coherence & Cohesion: linking not overused", hintTh: "ไม่ใส่ Moreover/Furthermore ทุกประโยค" },
    { id: "lr", label: "Lexical Resource: topic vocabulary & collocations", hintTh: "ใช้คำศัพท์ตามหัวข้อและ collocation ถูก" },
    { id: "gra", label: "Grammatical Range & Accuracy: mix of simple and complex sentences", hintTh: "มีทั้งประโยคง่ายและซับซ้อน ผิดน้อย" },
    { id: "words", label: "250+ words", hintTh: "ต่ำกว่า 250 คำจะถูกลดคะแนน" },
  ],
};
