import type { Question, VocabSeed } from "@/lib/types";

export interface ScriptLine {
  speaker: string;
  voice: "A" | "B"; // alternates browser voices when more than one English voice is available
  text: string;
}

export interface ListeningExercise {
  id: string;
  title: string;
  level: "B1" | "B1+" | "IELTS-style";
  topic: string;
  focusTh: string;
  instructions: string;
  script: ScriptLine[];
  questions: Question[];
  vocab: VocabSeed[];
}

/**
 * All scripts below are ORIGINAL practice material written for this app.
 * They are not taken from IELTS tests. Audio is produced by the browser's
 * text-to-speech voice, so accents and natural speed differ from the real exam.
 */
export const LISTENING: ListeningExercise[] = [
  {
    id: "L1",
    title: "Joining a sports centre",
    level: "B1",
    topic: "Daily life",
    focusTh: "ฟังและจดข้อมูลลงแบบฟอร์ม: การสะกดชื่อ ตัวเลข วันที่ และระวังข้อมูลที่ผู้พูด 'แก้ไข'",
    instructions: "Complete the form. Write ONE WORD AND/OR A NUMBER for each answer.",
    script: [
      { speaker: "Receptionist", voice: "A", text: "Good morning, Riverside Sports Centre. How can I help you?" },
      { speaker: "Caller", voice: "B", text: "Hello. I'd like to become a member, please." },
      { speaker: "Receptionist", voice: "A", text: "Of course. Can I take your surname first?" },
      { speaker: "Caller", voice: "B", text: "Yes, it's Garner. G, A, R, N, E, R." },
      { speaker: "Receptionist", voice: "A", text: "Thank you. And what's your address?" },
      { speaker: "Caller", voice: "B", text: "It's forty-two Hill Road. That's H, I, double L." },
      { speaker: "Receptionist", voice: "A", text: "Lovely. Which type of membership would you like? We have gym only, swimming only, or full membership." },
      { speaker: "Caller", voice: "B", text: "I was thinking about swimming only, but actually I'd like to use the gym too. So full membership, please." },
      { speaker: "Receptionist", voice: "A", text: "Great. Full membership is thirty-five pounds a month. Students pay twenty-eight." },
      { speaker: "Caller", voice: "B", text: "I'm not a student any more, so thirty-five is fine." },
      { speaker: "Receptionist", voice: "A", text: "And when would you like to start?" },
      { speaker: "Caller", voice: "B", text: "Could I start on the fifteenth of March? Oh, wait, that's a Sunday. Let's say the sixteenth." },
      { speaker: "Receptionist", voice: "A", text: "The sixteenth of March. No problem. Finally, how did you hear about us?" },
      { speaker: "Caller", voice: "B", text: "A friend told me. Well, I also saw a poster, but it was really my friend who recommended you." },
      { speaker: "Receptionist", voice: "A", text: "Wonderful. Please bring a photo when you come in on your first day." },
    ],
    questions: [
      { id: "q1", kind: "text", qtype: "form-completion", prompt: "Surname: ______", answer: ["Garner"], limit: "ONE WORD", explanationTh: "ผู้พูดสะกดชื่อทีละตัว G-A-R-N-E-R ต้องสะกดให้ถูกทุกตัว เพราะใน IELTS สะกดผิด = ผิด", evidence: "it's Garner. G, A, R, N, E, R" },
      { id: "q2", kind: "text", qtype: "form-completion", prompt: "Address: ______ Hill Road", answer: ["42", "forty-two", "forty two"], limit: "A NUMBER", explanationTh: "ตัวเลข 42 เขียนเป็นตัวเลขได้เลย ซึ่งเร็วและสะกดผิดยากกว่า", evidence: "It's forty-two Hill Road" },
      { id: "q3", kind: "text", qtype: "form-completion", prompt: "Membership type: ______ membership", answer: ["full"], limit: "ONE WORD", explanationTh: "ตัวลวง (distractor): ผู้พูดพูดถึง swimming only ก่อน แล้วเปลี่ยนใจเป็น full membership ด้วยคำว่า 'but actually'", evidence: "but actually I'd like to use the gym too. So full membership, please." },
      { id: "q4", kind: "text", qtype: "form-completion", prompt: "Monthly fee: £______", answer: ["35", "thirty-five", "thirty five"], limit: "A NUMBER", explanationTh: "£28 เป็นราคานักศึกษา แต่ผู้พูดบอกว่าไม่ใช่นักศึกษาแล้ว จึงจ่าย £35", evidence: "I'm not a student any more, so thirty-five is fine." },
      { id: "q5", kind: "text", qtype: "form-completion", prompt: "Start date: ______ March", answer: ["16", "16th", "sixteenth", "the sixteenth"], limit: "A NUMBER", explanationTh: "ผู้พูดแก้ไขวันที่จาก 15 เป็น 16 ('Oh, wait...') ฟังให้จบประโยคเสมอ", evidence: "Let's say the sixteenth." },
      { id: "q6", kind: "mcq", qtype: "detail", prompt: "How did the caller hear about the centre?", options: ["A poster", "A friend", "A website"], answer: ["A friend"], explanationTh: "ผู้พูดเห็นโปสเตอร์ด้วย แต่บอกว่า 'it was really my friend' จึงตอบ A friend", evidence: "it was really my friend who recommended you" },
    ],
    vocab: [
      { en: "membership", th: "การเป็นสมาชิก", example: "Full membership costs £35 a month.", ipa: "/ˈmem.bə.ʃɪp/", topic: "Daily life", level: "B1" },
      { en: "recommend", th: "แนะนำ", example: "My friend recommended this gym.", ipa: "/ˌrek.əˈmend/", topic: "Daily life", level: "B1" },
      { en: "surname", th: "นามสกุล", example: "Can I take your surname?", ipa: "/ˈsɜː.neɪm/", topic: "Daily life", level: "A2" },
    ],
  },
  {
    id: "L2",
    title: "A university library tour",
    level: "B1",
    topic: "Education",
    focusTh: "ฝึกคำถามแบบเลือกตอบ (multiple choice) และสังเกต 'ตัวลวง' ที่ผู้พูดกล่าวถึงแต่ไม่ใช่คำตอบ",
    instructions: "Questions 1–3: choose the correct answer. Questions 4–6: complete the notes with ONE WORD ONLY.",
    script: [
      { speaker: "Guide", voice: "A", text: "Welcome, everyone, to the university library. I'm Lena, and I'll show you around today." },
      { speaker: "Guide", voice: "A", text: "Let's start here on the ground floor. This is the help desk. Many students think it's only for borrowing books, but most questions we get are actually about printing." },
      { speaker: "Guide", voice: "A", text: "The library is open from eight in the morning until ten at night on weekdays. At the weekend we close earlier, at six." },
      { speaker: "Guide", voice: "A", text: "On the first floor you'll find the quiet study area. Phones must be switched off there, and you can't eat, although drinks in a bottle with a lid are fine." },
      { speaker: "Guide", voice: "A", text: "The second floor has group study rooms. You need to book them online, and you can use a room for a maximum of two hours." },
      { speaker: "Guide", voice: "A", text: "Undergraduate students can borrow up to eight books at a time. You keep them for three weeks, and you can renew them online if nobody else has requested them." },
      { speaker: "Guide", voice: "A", text: "If you return a book late, there's a small fine of twenty pence a day. So please check your account regularly." },
      { speaker: "Guide", voice: "A", text: "Finally, every Wednesday afternoon our staff run a short workshop on how to find academic journals. I really recommend it for first-year students." },
    ],
    questions: [
      { id: "q1", kind: "mcq", qtype: "mcq", prompt: "Most questions at the help desk are about…", options: ["borrowing books", "printing", "opening times"], answer: ["printing"], explanationTh: "ผู้พูดกล่าวถึง borrowing books ก่อน (ตัวลวง) แล้วบอกว่า 'but most questions … are actually about printing'", evidence: "most questions we get are actually about printing" },
      { id: "q2", kind: "mcq", qtype: "mcq", prompt: "At the weekend the library closes at…", options: ["6 pm", "8 pm", "10 pm"], answer: ["6 pm"], explanationTh: "10 โมงเย็นคือวันธรรมดา ส่วนวันหยุดปิด 6 โมง", evidence: "At the weekend we close earlier, at six." },
      { id: "q3", kind: "mcq", qtype: "detail", prompt: "In the quiet study area, students can…", options: ["eat snacks", "use phones quietly", "have drinks with a lid"], answer: ["have drinks with a lid"], explanationTh: "ห้ามใช้โทรศัพท์และห้ามกิน แต่ 'drinks in a bottle with a lid are fine'", evidence: "drinks in a bottle with a lid are fine" },
      { id: "q4", kind: "text", qtype: "note-completion", prompt: "Group study rooms: must be booked ______", answer: ["online"], limit: "ONE WORD", explanationTh: "ต้องจองห้องออนไลน์", evidence: "You need to book them online" },
      { id: "q5", kind: "text", qtype: "note-completion", prompt: "Undergraduates can keep books for three ______", answer: ["weeks"], limit: "ONE WORD", explanationTh: "ระวังเอกพจน์/พหูพจน์: three weeks ต้องมี s", evidence: "You keep them for three weeks" },
      { id: "q6", kind: "text", qtype: "note-completion", prompt: "Workshop on finding academic journals: every ______ afternoon", answer: ["Wednesday"], limit: "ONE WORD", explanationTh: "ชื่อวันต้องสะกดให้ถูก: W-e-d-n-e-s-d-a-y (ตัว d ที่ไม่ออกเสียง)", evidence: "every Wednesday afternoon" },
    ],
    vocab: [
      { en: "borrow", th: "ยืม", example: "Students can borrow up to eight books.", ipa: "/ˈbɒr.əʊ/", topic: "Education", level: "A2" },
      { en: "renew", th: "ต่ออายุ (การยืม)", example: "You can renew books online.", ipa: "/rɪˈnjuː/", topic: "Education", level: "B1" },
      { en: "fine", th: "ค่าปรับ", example: "There is a fine of 20p a day.", ipa: "/faɪn/", topic: "Education", level: "B1" },
      { en: "academic journal", th: "วารสารวิชาการ", example: "The workshop shows you how to find academic journals.", topic: "Education", level: "B2" },
    ],
  },
  {
    id: "L3",
    title: "City transport survey",
    level: "B1",
    topic: "Cities",
    focusTh: "ฟังตัวเลข เปอร์เซ็นต์ และเวลา: ระวังเสียง 13 (thirTEEN) กับ 30 (THIRty)",
    instructions: "Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.",
    script: [
      { speaker: "Researcher", voice: "A", text: "Excuse me, do you have a few minutes to answer a survey about transport in the city?" },
      { speaker: "Resident", voice: "B", text: "Sure, as long as it's quick." },
      { speaker: "Researcher", voice: "A", text: "Thanks. How do you usually travel to work?" },
      { speaker: "Resident", voice: "B", text: "Mostly by bus. I used to drive, but parking became too expensive." },
      { speaker: "Researcher", voice: "A", text: "How long does your journey take?" },
      { speaker: "Resident", voice: "B", text: "About forty minutes. It's only thirteen kilometres, but the traffic is terrible." },
      { speaker: "Researcher", voice: "A", text: "Our data shows that thirty percent of residents now cycle at least once a week. Do you ever cycle?" },
      { speaker: "Resident", voice: "B", text: "Not really. I'd like to, but there aren't enough safe bike lanes near my home." },
      { speaker: "Researcher", voice: "A", text: "That's a common answer. What one change would improve transport for you?" },
      { speaker: "Resident", voice: "B", text: "More frequent buses. At the moment there's only one every twenty minutes in the evening." },
    ],
    questions: [
      { id: "q1", kind: "text", qtype: "note-completion", prompt: "Usual transport to work: ______", answer: ["bus", "by bus"], limit: "ONE WORD", explanationTh: "เคยขับรถ (used to drive) = อดีต ตอนนี้ใช้รถบัส", evidence: "Mostly by bus. I used to drive" },
      { id: "q2", kind: "text", qtype: "note-completion", prompt: "Reason for stopping driving: cost of ______", answer: ["parking"], limit: "ONE WORD", explanationTh: "parking became too expensive = ค่าจอดรถแพง", evidence: "parking became too expensive" },
      { id: "q3", kind: "text", qtype: "note-completion", prompt: "Distance to work: ______ km", answer: ["13", "thirteen"], limit: "A NUMBER", explanationTh: "thirTEEN (เน้นพยางค์หลัง) = 13 ไม่ใช่ 30", evidence: "It's only thirteen kilometres" },
      { id: "q4", kind: "text", qtype: "note-completion", prompt: "Residents who cycle weekly: ______ %", answer: ["30", "thirty"], limit: "A NUMBER", explanationTh: "THIRty (เน้นพยางค์แรก) = 30", evidence: "thirty percent of residents now cycle" },
      { id: "q5", kind: "text", qtype: "note-completion", prompt: "Problem for cycling: not enough safe bike ______", answer: ["lanes"], limit: "ONE WORD", explanationTh: "bike lanes = ช่องทางจักรยาน (พหูพจน์)", evidence: "there aren't enough safe bike lanes" },
      { id: "q6", kind: "text", qtype: "note-completion", prompt: "Evening buses: one every ______ minutes", answer: ["20", "twenty"], limit: "A NUMBER", explanationTh: "ตอนเย็นรถบัสมาทุก 20 นาที", evidence: "only one every twenty minutes in the evening" },
    ],
    vocab: [
      { en: "resident", th: "ผู้อยู่อาศัย", example: "Thirty percent of residents cycle weekly.", ipa: "/ˈrez.ɪ.dənt/", topic: "Cities", level: "B1" },
      { en: "frequent", th: "บ่อย, ถี่", example: "We need more frequent buses.", ipa: "/ˈfriː.kwənt/", topic: "Cities", level: "B1" },
      { en: "journey", th: "การเดินทาง (หนึ่งเที่ยว)", example: "My journey takes forty minutes.", ipa: "/ˈdʒɜː.ni/", topic: "Cities", level: "B1" },
    ],
  },
  {
    id: "L4",
    title: "A short talk on recycling at home",
    level: "B1",
    topic: "Environment",
    focusTh: "ฟังใจความหลัก (main idea) ของการพูดคนเดียว และฟังคำบอกลำดับ: first, another, finally",
    instructions: "Choose the correct answer.",
    script: [
      { speaker: "Speaker", voice: "A", text: "Today I'd like to talk about something we all do, or at least should do: recycling at home." },
      { speaker: "Speaker", voice: "A", text: "Many people believe recycling is complicated. In fact, the biggest problem is not that people don't recycle, but that they put the wrong things in the recycling bin." },
      { speaker: "Speaker", voice: "A", text: "First, always rinse food containers. A dirty yoghurt pot can spoil a whole bag of clean paper." },
      { speaker: "Speaker", voice: "A", text: "Another common mistake involves plastic bags. Most local systems cannot process them, so take them back to the supermarket instead." },
      { speaker: "Speaker", voice: "A", text: "Finally, think before you buy. Reducing what you use is even more effective than recycling it afterwards." },
      { speaker: "Speaker", voice: "A", text: "So, my main message is this: recycle less, but recycle correctly, and reduce first." },
    ],
    questions: [
      { id: "q1", kind: "mcq", qtype: "main-idea", prompt: "What is the speaker's main message?", options: ["Recycling is too complicated for most people.", "People should recycle correctly and reduce what they use.", "Supermarkets should recycle all plastic."], answer: ["People should recycle correctly and reduce what they use."], explanationTh: "ใจความหลักมักสรุปท้าย: 'my main message is this...' ตัวเลือก A เป็นความเชื่อที่ผู้พูดปฏิเสธ", evidence: "recycle less, but recycle correctly, and reduce first" },
      { id: "q2", kind: "mcq", qtype: "detail", prompt: "According to the speaker, the biggest problem is that people…", options: ["don't recycle at all", "recycle the wrong items", "use too many bins"], answer: ["recycle the wrong items"], explanationTh: "'not that people don't recycle, but that they put the wrong things...' โครงสร้าง not X but Y → คำตอบคือ Y", evidence: "they put the wrong things in the recycling bin" },
      { id: "q3", kind: "mcq", qtype: "detail", prompt: "Why should containers be rinsed?", options: ["They smell bad.", "Dirty items can spoil clean paper.", "Supermarkets require it."], answer: ["Dirty items can spoil clean paper."], explanationTh: "spoil = ทำให้เสีย", evidence: "A dirty yoghurt pot can spoil a whole bag of clean paper." },
      { id: "q4", kind: "mcq", qtype: "detail", prompt: "What should people do with plastic bags?", options: ["Put them in the recycling bin", "Take them back to the supermarket", "Throw them away with food waste"], answer: ["Take them back to the supermarket"], explanationTh: "ระบบรีไซเคิลท้องถิ่นส่วนใหญ่ 'cannot process them'", evidence: "take them back to the supermarket instead" },
    ],
    vocab: [
      { en: "rinse", th: "ล้างน้ำ (ล้างคร่าว ๆ)", example: "Always rinse food containers.", ipa: "/rɪns/", topic: "Environment", level: "B2" },
      { en: "spoil", th: "ทำให้เสีย", example: "A dirty pot can spoil clean paper.", ipa: "/spɔɪl/", topic: "Environment", level: "B1" },
      { en: "reduce", th: "ลด", example: "Reducing what you use is more effective.", ipa: "/rɪˈdʒuːs/", topic: "Environment", level: "B1" },
      { en: "effective", th: "ได้ผล, มีประสิทธิผล", example: "Reducing waste is very effective.", ipa: "/ɪˈfek.tɪv/", topic: "Environment", level: "B1" },
    ],
  },
  {
    id: "L5",
    title: "Podcast: students and sleep",
    level: "B1+",
    topic: "Health",
    focusTh: "ฟังรายละเอียดจากบทสนทนา 2 คน และฟังคำที่ถูก paraphrase (พูดความหมายเดียวกันด้วยคำต่างกัน)",
    instructions: "Questions 1–3: choose the correct answer. Questions 4–5: complete the sentences with NO MORE THAN TWO WORDS.",
    script: [
      { speaker: "Host", voice: "A", text: "Welcome back to Campus Health. Today I'm talking to Dr Ahmed about sleep. Doctor, how much sleep do students really need?" },
      { speaker: "Dr Ahmed", voice: "B", text: "Most young adults need between seven and nine hours. But surveys show that many students get fewer than six on weeknights." },
      { speaker: "Host", voice: "A", text: "Why is that?" },
      { speaker: "Dr Ahmed", voice: "B", text: "People often blame coffee, but the main cause is using screens late at night. The light from phones makes the brain feel that it's still daytime." },
      { speaker: "Host", voice: "A", text: "So what do you recommend?" },
      { speaker: "Dr Ahmed", voice: "B", text: "Put your phone in another room for the last hour before bed. And try to wake up at the same time every day, even at weekends. A regular routine matters more than the exact number of hours." },
      { speaker: "Host", voice: "A", text: "What about naps?" },
      { speaker: "Dr Ahmed", voice: "B", text: "Short naps are fine. Twenty minutes can improve concentration. Longer naps can make it harder to sleep at night." },
    ],
    questions: [
      { id: "q1", kind: "mcq", qtype: "detail", prompt: "How much sleep do most young adults need?", options: ["Fewer than six hours", "Six to seven hours", "Seven to nine hours"], answer: ["Seven to nine hours"], explanationTh: "'fewer than six' คือสิ่งที่นักศึกษาได้จริง ไม่ใช่สิ่งที่ต้องการ", evidence: "Most young adults need between seven and nine hours" },
      { id: "q2", kind: "mcq", qtype: "detail", prompt: "According to Dr Ahmed, the main cause of poor sleep is…", options: ["coffee", "late-night screen use", "stress from exams"], answer: ["late-night screen use"], explanationTh: "'People often blame coffee, but the main cause is...' คำว่า but บอกคำตอบจริง", evidence: "the main cause is using screens late at night" },
      { id: "q3", kind: "mcq", qtype: "main-idea", prompt: "Which is MOST important, according to the doctor?", options: ["Sleeping exactly eight hours", "Keeping a regular routine", "Taking long naps"], answer: ["Keeping a regular routine"], explanationTh: "'A regular routine matters more than the exact number of hours' — matters more = สำคัญกว่า", evidence: "A regular routine matters more than the exact number of hours." },
      { id: "q4", kind: "text", qtype: "sentence-completion", prompt: "Keep your phone in ______ for the last hour before bed.", answer: ["another room"], limit: "NO MORE THAN TWO WORDS", explanationTh: "เขียนได้ไม่เกิน 2 คำ: another room", evidence: "Put your phone in another room" },
      { id: "q5", kind: "text", qtype: "sentence-completion", prompt: "A twenty-minute nap can improve ______.", answer: ["concentration"], limit: "NO MORE THAN TWO WORDS", explanationTh: "concentration = สมาธิ (สะกด c-o-n-c-e-n-t-r-a-t-i-o-n)", evidence: "Twenty minutes can improve concentration." },
    ],
    vocab: [
      { en: "concentration", th: "สมาธิ, การจดจ่อ", example: "A short nap can improve concentration.", ipa: "/ˌkɒn.sənˈtreɪ.ʃən/", topic: "Health", level: "B1" },
      { en: "routine", th: "กิจวัตร", example: "A regular routine helps you sleep.", ipa: "/ruːˈtiːn/", topic: "Health", level: "B1" },
      { en: "blame", th: "โทษ (ว่าเป็นสาเหตุ)", example: "People often blame coffee.", ipa: "/bleɪm/", topic: "Health", level: "B1" },
    ],
  },
  {
    id: "L6",
    title: "Lecture: urban heat islands (IELTS-style Part 4)",
    level: "IELTS-style",
    topic: "Environment",
    focusTh: "ฝึกแบบ Part 4 (บรรยายเชิงวิชาการ คนเดียว) — จดโน้ตต่อเนื่อง ฟังคำบอกโครงสร้าง เช่น 'the first reason', 'as a result'",
    instructions: "Complete the notes. Write ONE WORD ONLY for each answer.",
    script: [
      { speaker: "Lecturer", voice: "A", text: "This morning we're looking at a phenomenon called the urban heat island. Put simply, cities are often several degrees warmer than the countryside around them." },
      { speaker: "Lecturer", voice: "A", text: "The first reason is the materials we build with. Concrete and asphalt absorb heat during the day and release it slowly at night. That's why the difference is usually greatest after sunset." },
      { speaker: "Lecturer", voice: "A", text: "The second reason is the lack of vegetation. Trees cool the air through shade and through a process in which water evaporates from their leaves." },
      { speaker: "Lecturer", voice: "A", text: "Thirdly, human activity adds heat directly. Air conditioners, for example, push hot air into the street, which creates a cycle: the hotter the city, the more air conditioning people use." },
      { speaker: "Lecturer", voice: "A", text: "As a result, heat islands increase energy demand and can be dangerous for elderly people during heatwaves." },
      { speaker: "Lecturer", voice: "A", text: "So what can cities do? One effective approach is the cool roof: painting roofs white so that they reflect sunlight rather than absorbing it. Another is planting trees along streets, although this takes years to have an effect." },
    ],
    questions: [
      { id: "q1", kind: "text", qtype: "note-completion", prompt: "Cause 1: building materials such as concrete and ______", answer: ["asphalt"], limit: "ONE WORD", explanationTh: "asphalt = ยางมะตอย คำศัพท์เฉพาะที่ต้องสะกดให้ถูก", evidence: "Concrete and asphalt absorb heat" },
      { id: "q2", kind: "text", qtype: "note-completion", prompt: "The temperature difference is greatest after ______", answer: ["sunset"], limit: "ONE WORD", explanationTh: "ปล่อยความร้อนช้าตอนกลางคืน → ต่างกันมากที่สุดหลังพระอาทิตย์ตก", evidence: "the difference is usually greatest after sunset" },
      { id: "q3", kind: "text", qtype: "note-completion", prompt: "Cause 2: lack of ______", answer: ["vegetation"], limit: "ONE WORD", explanationTh: "vegetation = พืชพรรณ ต้นไม้", evidence: "the lack of vegetation" },
      { id: "q4", kind: "text", qtype: "note-completion", prompt: "Trees cool the air through shade and water evaporating from their ______", answer: ["leaves"], limit: "ONE WORD", explanationTh: "leaf → leaves (พหูพจน์ไม่ปกติ)", evidence: "water evaporates from their leaves" },
      { id: "q5", kind: "text", qtype: "note-completion", prompt: "Effect: higher energy demand and danger for ______ people", answer: ["elderly", "older"], limit: "ONE WORD", explanationTh: "elderly = ผู้สูงอายุ", evidence: "dangerous for elderly people during heatwaves" },
      { id: "q6", kind: "text", qtype: "note-completion", prompt: "Solution: white roofs ______ sunlight", answer: ["reflect"], limit: "ONE WORD", explanationTh: "reflect = สะท้อน ตรงข้ามกับ absorb = ดูดซับ", evidence: "so that they reflect sunlight rather than absorbing it" },
    ],
    vocab: [
      { en: "absorb", th: "ดูดซับ", example: "Concrete absorbs heat during the day.", ipa: "/əbˈzɔːb/", topic: "Environment", level: "B2" },
      { en: "vegetation", th: "พืชพรรณ", example: "A lack of vegetation makes cities hotter.", ipa: "/ˌvedʒ.əˈteɪ.ʃən/", topic: "Environment", level: "B2" },
      { en: "phenomenon", th: "ปรากฏการณ์", example: "The urban heat island is a common phenomenon.", ipa: "/fəˈnɒm.ɪ.nən/", topic: "Environment", level: "B2" },
      { en: "energy demand", th: "ความต้องการพลังงาน", example: "Heat islands increase energy demand.", topic: "Environment", level: "B2" },
    ],
  },
];

export const LISTENING_ERROR_REASONS: { value: string; label: string }[] = [
  { value: "listening-missed-keyword", label: "ฟังคำสำคัญไม่ทัน / ไม่ได้ยิน" },
  { value: "listening-distractor", label: "ถูกตัวลวง (ผู้พูดเปลี่ยนใจ/แก้ไข)" },
  { value: "listening-numbers", label: "ตัวเลข/วันที่ผิด" },
  { value: "spelling", label: "สะกดผิด" },
  { value: "listening-accent", label: "ไม่คุ้นสำเนียง" },
  { value: "vocabulary", label: "ไม่รู้ความหมายคำศัพท์" },
];
