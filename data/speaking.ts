export interface Part1Topic {
  id: string;
  topic: string;
  questions: string[];
}

export interface CueCard {
  id: string;
  title: string;
  points: string[];
  part3: string[];
}

/** Original practice questions in the style of IELTS Speaking; not taken from real tests. */
export const PART1: Part1Topic[] = [
  { id: "home", topic: "Home & hometown", questions: ["Where is your hometown?", "What do you like most about your hometown?", "Do you live in a house or an apartment?", "Would you like to move to a different area in the future? Why?"] },
  { id: "routine", topic: "Daily routine", questions: ["What time do you usually get up?", "What is the busiest part of your day?", "Do you prefer mornings or evenings? Why?", "Has your daily routine changed recently?"] },
  { id: "study", topic: "Work or study", questions: ["Do you work or are you a student?", "Why did you choose that job or subject?", "What do you find most difficult about it?", "What would you like to do in the future?"] },
  { id: "tech", topic: "Technology", questions: ["How often do you use your phone?", "What apps do you use most?", "Was there any technology you didn't like as a child?", "Do you think you spend too much time online?"] },
  { id: "food", topic: "Food", questions: ["What is your favourite food?", "Do you prefer eating at home or eating out?", "Is there any food you didn't like as a child but like now?", "Do you think people in your country eat healthily?"] },
  { id: "weather", topic: "Weather", questions: ["What's the weather like in your country?", "Do you prefer hot or cool weather?", "Does the weather affect your mood?", "What do you usually do on rainy days?"] },
];

export const CUE_CARDS: CueCard[] = [
  {
    id: "teacher",
    title: "Describe a teacher who helped you.",
    points: ["who this teacher was", "what subject he or she taught", "what this teacher did to help you", "and explain why you remember this teacher"],
    part3: ["What makes a good teacher?", "Do you think teachers will be replaced by technology?", "Should teachers be paid more? Why or why not?"],
  },
  {
    id: "relax-place",
    title: "Describe a place where you like to relax.",
    points: ["where it is", "how often you go there", "what you do there", "and explain why it helps you relax"],
    part3: ["Why do people find it hard to relax nowadays?", "Do you think cities should have more green spaces?", "How do relaxation activities differ between young and old people?"],
  },
  {
    id: "skill",
    title: "Describe a skill you would like to learn.",
    points: ["what the skill is", "how you would learn it", "how long it might take", "and explain why you want to learn it"],
    part3: ["Is it better to learn skills from a teacher or online?", "What skills will be important in the future?", "Why do some adults stop learning new things?"],
  },
  {
    id: "tech-device",
    title: "Describe a piece of technology you find useful.",
    points: ["what it is", "when you got it", "how you use it", "and explain why it is useful to you"],
    part3: ["How has technology changed the way people communicate?", "Are there any disadvantages of relying on technology?", "Should children have smartphones?"],
  },
  {
    id: "journey",
    title: "Describe a memorable journey you made.",
    points: ["where you went", "who you went with", "how you travelled", "and explain why it was memorable"],
    part3: ["Why do people enjoy travelling?", "How has tourism changed your country?", "Is public transport in your city good enough?"],
  },
];

export const SPEAKING_SELF_CHECK: { id: string; label: string; hintTh: string }[] = [
  { id: "answered", label: "I answered the question directly", hintTh: "ตอบตรงคำถามในประโยคแรก" },
  { id: "extended", label: "I gave a reason or an example", hintTh: "ใช้สูตร A-R-E: Answer → Reason → Example" },
  { id: "length", label: "Part 1: 2–4 sentences / Part 2: close to 2 minutes", hintTh: "ไม่สั้นเกินไปและไม่ยาวเกินไป" },
  { id: "tense", label: "I used the right tenses", hintTh: "เรื่องอดีตใช้ past simple" },
  { id: "noscript", label: "I did not read from a script", hintTh: "พูดจากความคิด ไม่ท่องจำ" },
  { id: "fillers", label: "I used natural fillers instead of long silence", hintTh: "เช่น Well, … / Let me think… แทนการเงียบ" },
];
