```json
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  image: string;
  duration: string;
  level: string;
  students: number;
  rating: number;
  price: number;
  originalPrice: number;
  category: string;
  featured: boolean;
  softwareIncluded: boolean;
  instructor: {
    name: string;
    role: string;
    image: string;
  };
  syllabus: {
    id: string;
    title: string;
    itemCount: number;
    duration: string;
    items: SyllabusItem[];
  }[];
  features: string[];
  software: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  certification: string;
  projects: string[];
}
```

```json
const russianCourse :Course = [
  {
    "id": "russian-a1-a2-001",
    "title": "Russian A1-A2 Comprehensive Language Course",
    "slug": "russian-a1-a2-comprehensive-language-course",
    "subtitle": "From Zero to Everyday Conversations",
    "description": "A complete course for beginners to reach a confident elementary level, covering the fundamentals of Russian grammar and vocabulary for everyday communication.",
    "fullDescription": "This course provides a structured path from complete beginner (A1) to elementary (A2) proficiency in Russian. You will master the Cyrillic alphabet, essential grammar (including all six cases and basic verb aspects), and a core vocabulary of over 1000 words. The course focuses on practical communication skills, enabling you to navigate daily life, discuss familiar topics, and understand simple texts.",
    "image": "https://example.com/russian-course-cover.jpg",
    "previewVideoUrl": "https://example.com/preview-a1-a2.mp4",
    "duration": "30.1 hrs",
    "level": "beginner",
    "students": 5000,
    "rating": 4.8,
    "price": 299,
    "originalPrice": 399,
    "category": "Language Learning",
    "featured": true,
    "softwareIncluded": false,
    "instructor": {
      "name": "Elena Petrova",
      "role": "Senior Russian Language Instructor & TORFL Examiner",
      "image": "https://example.com/instructor-elena.jpg"
    },
    "syllabus": [
      {
        "id": "module-1",
        "title": "Welcome to Russian: Alphabet & First Steps",
        "itemCount": 5,
        "duration": "2.2 hrs",
        "items": [
          { "title": "Introduction to Cyrillic Alphabet", "type": "video", "duration": "25 min" },
          { "title": "Pronunciation: Vowels and Consonants", "type": "lesson", "duration": "30 min" },
          { "title": "First Greetings and Farewells", "type": "video", "duration": "20 min" },
          { "title": "Introducing Yourself", "type": "practice", "duration": "25 min" },
          { "title": "Basic Sentence Structure", "type": "lesson", "duration": "30 min" }
        ]
      },
      {
        "id": "module-2",
        "title": "About Myself: Personal and Professional Life",
        "itemCount": 6,
        "duration": "3 hrs",
        "items": [
          { "title": "Personal Pronouns and Gender", "type": "lesson", "duration": "35 min" },
          { "title": "Talking About Family", "type": "video", "duration": "30 min" },
          { "title": "Professions and Nationalities", "type": "lesson", "duration": "40 min" },
          { "title": "Possessive Pronouns", "type": "grammar", "duration": "30 min" },
          { "title": "Listening: Who is This?", "type": "audio", "duration": "25 min" },
          { "title": "Module 2 Quiz", "type": "quiz", "duration": "20 min" }
        ]
      },
      {
        "id": "module-3",
        "title": "My Day: Daily Routines, Time & Hobbies",
        "itemCount": 7,
        "duration": "3.8 hrs",
        "items": [
          { "title": "Verbs: Present Tense Conjugation", "type": "grammar", "duration": "45 min" },
          { "title": "Telling Time and Days of the Week", "type": "lesson", "duration": "35 min" },
          { "title": "Describing Daily Routines", "type": "video", "duration": "30 min" },
          { "title": "Hobbies and Free Time", "type": "vocabulary", "duration": "40 min" },
          { "title": "Ordering in a Café", "type": "dialogue", "duration": "30 min" },
          { "title": "Reading: A Typical Day", "type": "text", "duration": "25 min" },
          { "title": "Module 3 Quiz", "type": "quiz", "duration": "20 min" }
        ]
      },
      {
        "id": "module-4",
        "title": "Getting Around: Navigating the City & Travel",
        "itemCount": 6,
        "duration": "3.4 hrs",
        "items": [
          { "title": "Prepositional Case: Location (Where?)", "type": "grammar", "duration": "50 min" },
          { "title": "Asking for Directions", "type": "dialogue", "duration": "30 min" },
          { "title": "Transport and Movement Verbs", "type": "vocabulary", "duration": "40 min" },
          { "title": "Describing Your City", "type": "writing", "duration": "35 min" },
          { "title": "Making Travel Plans", "type": "practice", "duration": "30 min" },
          { "title": "Module 4 Quiz", "type": "quiz", "duration": "20 min" }
        ]
      },
      {
        "id": "module-5",
        "title": "Expanding Your World: Home, Food & Shopping",
        "itemCount": 6,
        "duration": "3.8 hrs",
        "items": [
          { "title": "Accusative Case: Direct Object", "type": "grammar", "duration": "55 min" },
          { "title": "Describing Your Home and Furniture", "type": "vocabulary", "duration": "40 min" },
          { "title": "Food, Cooking, and Russian Cuisine", "type": "video", "duration": "45 min" },
          { "title": "Shopping for Clothes and Groceries", "type": "dialogue", "duration": "35 min" },
          { "title": "Numbers, Prices, and Payment", "type": "lesson", "duration": "30 min" },
          { "title": "Module 5 Quiz", "type": "quiz", "duration": "20 min" }
        ]
      },
      {
        "id": "module-6",
        "title": "Past and Future: Events & Plans",
        "itemCount": 7,
        "duration": "4 hrs",
        "items": [
          { "title": "Verbs: Past Tense Formation", "type": "grammar", "duration": "45 min" },
          { "title": "Discussing Past Events and Holidays", "type": "practice", "duration": "40 min" },
          { "title": "Verbs: Future Tense (Imperfective)", "type": "grammar", "duration": "50 min" },
          { "title": "Making Plans and Invitations", "type": "dialogue", "duration": "30 min" },
          { "title": "Seasons and Weather", "type": "vocabulary", "duration": "25 min" },
          { "title": "Reading: A Travel Story", "type": "text", "duration": "30 min" },
          { "title": "Module 6 Quiz", "type": "quiz", "duration": "20 min" }
        ]
      },
      {
        "id": "module-7",
        "title": "Deeper Communication: Describing People & Health",
        "itemCount": 6,
        "duration": "4.2 hrs",
        "items": [
          { "title": "Genitive Case: Possession and Absence", "type": "grammar", "duration": "60 min" },
          { "title": "Describing Appearance and Character", "type": "vocabulary", "duration": "45 min" },
          { "title": "Talking About Health and Body Parts", "type": "lesson", "duration": "40 min" },
          { "title": "Expressing Feelings and Opinions", "type": "practice", "duration": "35 min" },
          { "title": "Dative Case: Indirect Object and Need", "type": "grammar", "duration": "50 min" },
          { "title": "Module 7 Quiz", "type": "quiz", "duration": "20 min" }
        ]
      },
      {
        "id": "module-8",
        "title": "Russian Culture & Final Review",
        "itemCount": 6,
        "duration": "5.8 hrs",
        "items": [
          { "title": "Instrumental Case: Means and Accompaniment", "type": "grammar", "duration": "55 min" },
          { "title": "Introduction to Russian Holidays and Customs", "type": "culture", "duration": "45 min" },
          { "title": "Famous Russians: History and Culture", "type": "presentation", "duration": "40 min" },
          { "title": "Comprehensive Grammar Review", "type": "review", "duration": "60 min" },
          { "title": "Final Project Preparation", "type": "project", "duration": "90 min" },
          { "title": "Final Assessment", "type": "exam", "duration": "60 min" }
        ]
      }
    ],
    "features": [
      "Interactive video lessons with native speakers",
      "Downloadable PDF worksheets for each module",
      "Quizzes and progress checks aligned with TORFL exam structure",
      "Access to a private community forum for practice and support",
      "Mobile app for learning on the go",
      "Certificate of completion (aligned with CEFR A2 level)",
      "Regular live Q&A sessions with the instructor",
      "Final course project to present a topic in Russian"
    ],
    "software": [
      "Modern web browser (Chrome, Firefox, Safari)",
      "PDF reader (Adobe Acrobat Reader)",
      "Russian keyboard layout installed (optional but recommended)"
    ],
    "learningOutcomes": [
      "Understand and use familiar everyday expressions and basic phrases",
      "Introduce yourself and others, and ask/answer basic personal questions",
      "Interact in a simple way on topics like family, shopping, and work",
      "Describe your background, immediate environment, and daily routines",
      "Read and understand short, simple texts and messages",
      "Write short, simple notes and messages, and fill in forms with personal details",
      "Navigate common travel situations in a Russian-speaking country",
      "Understand the main points of clear, standard speech on familiar matters"
    ],
    "prerequisites": [
      "No prior knowledge of Russian is required",
      "A willingness to learn and practice consistently"
    ],
    "certification": "Upon completing the course and passing the final assessment, you will receive a Certificate of Completion. This certificate demonstrates that you have achieved a level of proficiency equivalent to CEFR A2 (Waystage) and prepares you to take an official exam like the TORFL (Test of Russian as a Foreign Language) at the Elementary Level (A2).",
    "projects": [
      "Project 1: Record a 2-3 minute video introducing yourself, your family, and your hobbies in Russian.",
      "Project 2: Write a short blog post (150-200 words) in Russian describing a typical day in your life.",
      "Project 3: Create a travel itinerary for a 3-day trip to a Russian city, and present it in a short written or spoken format.",
      "Final Project: Choose a topic related to Russian culture (e.g., a holiday, a famous person, a traditional dish). Prepare a 5-minute presentation in Russian and deliver it to the instructor or in the course forum."
    ]
  },
  {
    "id": "russian-b1-b2-002",
    "title": "Russian B1-B2 Intermediate Mastery Course",
    "slug": "russian-b1-b2-intermediate-mastery-course",
    "description": "Advance from elementary to upper-intermediate proficiency, mastering complex grammar, idiomatic expressions, and confident conversation on abstract topics.",
    "fullDescription": "This course builds directly on the A1-A2 foundation, guiding learners to B2 (upper-intermediate) level. You will deepen your understanding of verbal aspect, master all verbs of motion with prefixes, and learn to use participles and gerunds. The curriculum emphasizes fluent discussion of news, culture, work, and personal opinions. With over 2000 new vocabulary items and authentic materials (film clips, articles), you will be prepared for the TORFL-I (B1) and TORFL-II (B2) exams.",
    "image": "https://example.com/russian-b1-b2-cover.jpg",
    "duration": "35.9 hrs",
    "level": "Intermediate to Upper-Intermediate (B1-B2)",
    "students": 3200,
    "rating": 4.9,
    "price": 349,
    "originalPrice": 449,
    "category": "Language Learning",
    "featured": true,
    "softwareIncluded": false,
    "instructor": {
      "name": "Elena Petrova",
      "role": "Senior Russian Language Instructor & TORFL Examiner",
      "image": "https://example.com/instructor-elena.jpg"
    },
    "syllabus": [
      {
        "id": "b1-module-1",
        "title": "Refining the Cases: Advanced Noun & Adjective Use",
        "itemCount": 6,
        "duration": "4.3 hrs",
        "items": [
          { "title": "Case Review and Irregular Plurals", "type": "grammar", "duration": "45 min" },
          { "title": "Advanced Genitive: Quantities and Dates", "type": "lesson", "duration": "50 min" },
          { "title": "Advanced Dative: Impersonal Constructions", "type": "grammar", "duration": "40 min" },
          { "title": "Advanced Instrumental: Professions and States", "type": "practice", "duration": "45 min" },
          { "title": "Short Form Adjectives", "type": "grammar", "duration": "35 min" },
          { "title": "Module 1 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "b1-module-2",
        "title": "Verbal Aspect Deep Dive",
        "itemCount": 7,
        "duration": "4.6 hrs",
        "items": [
          { "title": "Aspect Pairs: Imperfective vs. Perfective", "type": "grammar", "duration": "50 min" },
          { "title": "Aspect in the Future Tense", "type": "lesson", "duration": "40 min" },
          { "title": "Aspect in the Infinitive (Modals)", "type": "grammar", "duration": "45 min" },
          { "title": "Aspect in Negative Constructions", "type": "practice", "duration": "35 min" },
          { "title": "Conveying Result vs. Process", "type": "dialogue", "duration": "40 min" },
          { "title": "Listening: Aspect in Context", "type": "audio", "duration": "30 min" },
          { "title": "Module 2 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "b1-module-3",
        "title": "Verbs of Motion: Unprefixed and Prefixed",
        "itemCount": 8,
        "duration": "5.5 hrs",
        "items": [
          { "title": "Review: Unprefixed Pairs (идти/ходить, ехать/ездить)", "type": "grammar", "duration": "45 min" },
          { "title": "Prefixes: при-, у-, в-, вы-", "type": "grammar", "duration": "55 min" },
          { "title": "Prefixes: под-, от-, до-, об-", "type": "grammar", "duration": "50 min" },
          { "title": "Prefixes: пере-, про-, за-", "type": "grammar", "duration": "50 min" },
          { "title": "Abstract and Figurative Meanings", "type": "lesson", "duration": "40 min" },
          { "title": "Verbs of Carrying (нести/носить, везти/возить)", "type": "vocabulary", "duration": "35 min" },
          { "title": "Reading: A Journey Story", "type": "text", "duration": "40 min" },
          { "title": "Module 3 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "b1-module-4",
        "title": "Expressing Conditions, Wishes, and Hypotheticals",
        "itemCount": 6,
        "duration": "4.4 hrs",
        "items": [
          { "title": "Subjunctive/Conditional Mood (бы)", "type": "grammar", "duration": "55 min" },
          { "title": "Real and Unreal Conditions (если vs. если бы)", "type": "lesson", "duration": "50 min" },
          { "title": "Expressing Wishes (чтобы)", "type": "grammar", "duration": "45 min" },
          { "title": "Complex Sentences with который", "type": "syntax", "duration": "40 min" },
          { "title": "Conjunctions: потому что, поэтому, хотя", "type": "practice", "duration": "35 min" },
          { "title": "Module 4 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "b1-module-5",
        "title": "Participles and Gerunds",
        "itemCount": 6,
        "duration": "4.5 hrs",
        "items": [
          { "title": "Active Participles (Present and Past)", "type": "grammar", "duration": "55 min" },
          { "title": "Passive Participles (Present and Past)", "type": "grammar", "duration": "55 min" },
          { "title": "Short Form Participles", "type": "lesson", "duration": "45 min" },
          { "title": "Gerunds: Imperfective and Perfective", "type": "grammar", "duration": "50 min" },
          { "title": "Using Participles and Gerunds in Writing", "type": "writing", "duration": "40 min" },
          { "title": "Module 5 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "b1-module-6",
        "title": "Discussing Media, Work, and Society",
        "itemCount": 7,
        "duration": "4.8 hrs",
        "items": [
          { "title": "Vocabulary: News and Media", "type": "vocabulary", "duration": "45 min" },
          { "title": "Understanding Russian News Headlines", "type": "reading", "duration": "40 min" },
          { "title": "Talking About Your Job and Career", "type": "dialogue", "duration": "45 min" },
          { "title": "Writing a CV and Cover Letter in Russian", "type": "writing", "duration": "50 min" },
          { "title": "Social Issues and Discussion Phrases", "type": "lesson", "duration": "40 min" },
          { "title": "Listening: A Job Interview", "type": "audio", "duration": "35 min" },
          { "title": "Module 6 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "b1-module-7",
        "title": "Art, Literature, and Expressing Nuanced Opinions",
        "itemCount": 6,
        "duration": "4.2 hrs",
        "items": [
          { "title": "Vocabulary: Describing Art and Film", "type": "vocabulary", "duration": "45 min" },
          { "title": "Reading: Short Stories by Chekhov (Adapted)", "type": "reading", "duration": "55 min" },
          { "title": "Giving Compliments and Constructive Criticism", "type": "practice", "duration": "40 min" },
          { "title": "Prefixes and Word Formation (Roots)", "type": "grammar", "duration": "45 min" },
          { "title": "Viewing: Russian Film Clip Analysis", "type": "video", "duration": "40 min" },
          { "title": "Module 7 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "b1-module-8",
        "title": "Consolidation and TORFL B1/B2 Preparation",
        "itemCount": 6,
        "duration": "3.6 hrs",
        "items": [
          { "title": "Comprehensive Grammar Review: Tricky Points", "type": "review", "duration": "50 min" },
          { "title": "TORFL Writing Task Practice", "type": "writing", "duration": "40 min" },
          { "title": "TORFL Speaking Task Simulation", "type": "practice", "duration": "45 min" },
          { "title": "Authentic Listening Comprehension", "type": "audio", "duration": "35 min" },
          { "title": "Final Project Guidance", "type": "project", "duration": "30 min" },
          { "title": "Final B1/B2 Assessment Exam", "type": "exam", "duration": "60 min" }
        ]
      }
    ],
    "features": [
      "Authentic Russian video and audio materials (news, film excerpts)",
      "In-depth grammar drills focusing on challenging intermediate topics",
      "Personalized writing feedback from the instructor",
      "Downloadable advanced grammar reference sheets",
      "Interactive exercises for verbs of motion and aspect",
      "Full-length TORFL-I (B1) and TORFL-II (B2) practice tests",
      "Certificate of completion aligned with CEFR B2 level"
    ],
    "software": [
      "Modern web browser (Chrome, Firefox, Safari)",
      "PDF reader (Adobe Acrobat Reader)",
      "Russian keyboard layout installed (recommended)",
      "Headphones for listening exercises"
    ],
    "learningOutcomes": [
      "Understand the main ideas of complex text on both concrete and abstract topics",
      "Interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible",
      "Produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue",
      "Master all six cases with advanced usage, including time expressions and complex prepositions",
      "Confidently use perfective and imperfective verb aspects in past, present, and future",
      "Navigate all prefixed verbs of motion in literal and figurative contexts",
      "Read and understand short, unadapted Russian literary texts and news articles",
      "Write cohesive essays, formal letters, and reports in Russian"
    ],
    "prerequisites": [
      "Successful completion of the Russian A1-A2 Comprehensive Course or equivalent knowledge (CEFR A2 level)",
      "Familiarity with the Cyrillic alphabet and basic sentence structure",
      "Basic vocabulary of approximately 1000 words"
    ],
    "certification": "Upon completing the course and passing the final assessment (70% pass mark), you will receive a Certificate of Completion. This certificate confirms you have achieved a level of proficiency equivalent to CEFR B2 (Vantage) and are fully prepared to sit for the official TORFL-II examination.",
    "projects": [
      "Project 1: Write a 300-word review of a Russian film or book, using participles and nuanced opinion phrases.",
      "Project 2: Record a 4-minute oral presentation describing your career plans and what you would do if you won the lottery (using conditional mood).",
      "Project 3: Compose a formal email of complaint or inquiry in Russian.",
      "Final Project: Research a current event in the Russian-speaking world. Prepare a 7-minute presentation (with visual aids) analyzing the event and presenting your perspective in Russian."
    ]
  },
  {
    "id": "russian-c1-c2-003",
    "title": "Russian C1-C2 Advanced Proficiency Course",
    "slug": "russian-c1-c2-advanced-proficiency-course",
    "description": "Achieve near-native fluency and mastery of Russian, enabling you to handle complex academic, professional, and literary material with precision and stylistic nuance.",
    "fullDescription": "This advanced course is designed for learners who have completed the B1-B2 level and wish to attain C1 (Effective Operational Proficiency) or C2 (Mastery). The curriculum delves into the subtleties of Russian syntax, advanced stylistics, idiomatic and colloquial speech, and the nuances of professional and academic discourse. You will engage with authentic, unadapted materials including classic literature, academic lectures, political debates, and specialized texts. By the end, you will be able to express yourself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in more complex situations. This course fully prepares you for the TORFL-III (C1) and TORFL-IV (C2) examinations.",
    "image": "https://example.com/russian-c1-c2-cover.jpg",
    "duration": "38.4 hrs",
    "level": "Advanced to Proficiency (C1-C2)",
    "students": 1800,
    "rating": 5.0,
    "price": 399,
    "originalPrice": 499,
    "category": "Language Learning",
    "featured": true,
    "softwareIncluded": false,
    "instructor": {
      "name": "Elena Petrova",
      "role": "Senior Russian Language Instructor & TORFL Examiner",
      "image": "https://example.com/instructor-elena.jpg"
    },
    "syllabus": [
      {
        "id": "c1-module-1",
        "title": "Advanced Syntax and Complex Sentence Structures",
        "itemCount": 6,
        "duration": "4.7 hrs",
        "items": [
          { "title": "Multi-Clause Sentences and Punctuation", "type": "grammar", "duration": "55 min" },
          { "title": "Advanced Use of который and Other Relatives", "type": "syntax", "duration": "50 min" },
          { "title": "Conjunctions of Cause, Consequence, and Concession", "type": "lesson", "duration": "45 min" },
          { "title": "Word Order and Emphasis (Theme/Rheme)", "type": "stylistics", "duration": "50 min" },
          { "title": "Impersonal and Infinitive Constructions", "type": "grammar", "duration": "45 min" },
          { "title": "Module 1 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "c1-module-2",
        "title": "Mastering Verbal Aspect: Nuance and Exception",
        "itemCount": 7,
        "duration": "5.1 hrs",
        "items": [
          { "title": "Aspect in Imperatives and Infinitives", "type": "grammar", "duration": "50 min" },
          { "title": "Aspect in Negative Imperatives", "type": "lesson", "duration": "45 min" },
          { "title": "Aspect and Adverbial Modifiers", "type": "practice", "duration": "40 min" },
          { "title": "Biaspectual Verbs and Special Cases", "type": "grammar", "duration": "50 min" },
          { "title": "Aspect in Complex Narrative", "type": "reading", "duration": "45 min" },
          { "title": "Listening: Aspect in Rapid Speech", "type": "audio", "duration": "40 min" },
          { "title": "Module 2 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "c1-module-3",
        "title": "Advanced Participles and Gerunds in Academic Writing",
        "itemCount": 6,
        "duration": "4.5 hrs",
        "items": [
          { "title": "Review and Stylistic Use of Participles", "type": "grammar", "duration": "50 min" },
          { "title": "Participial Phrases vs. который Clauses", "type": "writing", "duration": "45 min" },
          { "title": "Advanced Gerunds: Simultaneity and Sequence", "type": "grammar", "duration": "50 min" },
          { "title": "Gerunds in Formal and Scientific Prose", "type": "reading", "duration": "40 min" },
          { "title": "Avoiding Common Errors with Participles/Gerunds", "type": "practice", "duration": "45 min" },
          { "title": "Module 3 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "c1-module-4",
        "title": "Stylistics: Registers, Idioms, and Colloquialisms",
        "itemCount": 7,
        "duration": "5.2 hrs",
        "items": [
          { "title": "Formal vs. Informal Registers", "type": "stylistics", "duration": "50 min" },
          { "title": "Advanced Idiomatic Expressions", "type": "vocabulary", "duration": "55 min" },
          { "title": "Slang and Contemporary Colloquial Russian", "type": "lesson", "duration": "45 min" },
          { "title": "Understanding Irony, Sarcasm, and Humor", "type": "culture", "duration": "40 min" },
          { "title": "Phraseology from Classic Literature", "type": "reading", "duration": "45 min" },
          { "title": "Listening: Analyzing a Comedy Sketch", "type": "audio", "duration": "40 min" },
          { "title": "Module 4 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "c1-module-5",
        "title": "Professional and Academic Communication",
        "itemCount": 7,
        "duration": "5.3 hrs",
        "items": [
          { "title": "Writing a Scientific Abstract in Russian", "type": "writing", "duration": "55 min" },
          { "title": "Delivering a Formal Presentation", "type": "practice", "duration": "50 min" },
          { "title": "Business Correspondence and Negotiation Phrases", "type": "dialogue", "duration": "45 min" },
          { "title": "Vocabulary for Law, Economics, and IT", "type": "vocabulary", "duration": "50 min" },
          { "title": "Participating in Academic Discussions", "type": "speaking", "duration": "40 min" },
          { "title": "Listening: A University Lecture", "type": "audio", "duration": "45 min" },
          { "title": "Module 5 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "c1-module-6",
        "title": "Russian Literature and Advanced Text Analysis",
        "itemCount": 6,
        "duration": "4.8 hrs",
        "items": [
          { "title": "Reading Unadapted Dostoevsky (Selected Passages)", "type": "reading", "duration": "60 min" },
          { "title": "Analyzing Poetic Language: Pushkin and Akhmatova", "type": "literature", "duration": "55 min" },
          { "title": "Understanding 20th Century Prose (Bulgakov, Platonov)", "type": "reading", "duration": "50 min" },
          { "title": "Stylistic Devices in Russian Prose", "type": "analysis", "duration": "45 min" },
          { "title": "Writing a Literary Analysis Essay", "type": "writing", "duration": "50 min" },
          { "title": "Module 6 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "c1-module-7",
        "title": "Media, Politics, and Debating Current Affairs",
        "itemCount": 7,
        "duration": "5 hrs",
        "items": [
          { "title": "Understanding Political Discourse and Rhetoric", "type": "vocabulary", "duration": "50 min" },
          { "title": "Analyzing News Reports and Editorials", "type": "reading", "duration": "45 min" },
          { "title": "Expressing and Defending Opinions", "type": "debate", "duration": "50 min" },
          { "title": "Formal Debate Structures in Russian", "type": "practice", "duration": "40 min" },
          { "title": "Listening: Political Talk Show Analysis", "type": "audio", "duration": "45 min" },
          { "title": "Writing a Persuasive Op-Ed", "type": "writing", "duration": "50 min" },
          { "title": "Module 7 Quiz", "type": "quiz", "duration": "25 min" }
        ]
      },
      {
        "id": "c1-module-8",
        "title": "Consolidation and TORFL C1/C2 Preparation",
        "itemCount": 6,
        "duration": "3.8 hrs",
        "items": [
          { "title": "Comprehensive Grammar and Syntax Review", "type": "review", "duration": "55 min" },
          { "title": "TORFL-III Writing: Essay and Document Drafting", "type": "writing", "duration": "50 min" },
          { "title": "TORFL-IV Speaking: Monologue and Dialogue", "type": "practice", "duration": "45 min" },
          { "title": "Authentic Listening Comprehension (C2 Level)", "type": "audio", "duration": "40 min" },
          { "title": "Final Project Consultation", "type": "project", "duration": "30 min" },
          { "title": "Final C1/C2 Assessment Exam", "type": "exam", "duration": "60 min" }
        ]
      }
    ],
    "features": [
      "Exclusive access to a library of unadapted Russian literary texts and academic articles",
      "Advanced pronunciation and intonation coaching for near-native fluency",
      "Weekly live webinar discussions on current Russian politics and culture",
      "Detailed, personalized feedback on writing assignments from a TORFL examiner",
      "Simulated TORFL-III and TORFL-IV exams with full diagnostic reports",
      "Certificate of completion aligned with CEFR C2 (Mastery) level",
      "Private 1-on-1 consultation session to plan further specialization"
    ],
    "software": [
      "Modern web browser (Chrome, Firefox, Safari)",
      "PDF reader (Adobe Acrobat Reader)",
      "Russian keyboard layout installed (essential for writing tasks)",
      "Headphones with microphone for speaking sessions"
    ],
    "learningOutcomes": [
      "Understand with ease virtually everything heard or read in Russian",
      "Summarize information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation",
      "Express yourself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in more complex situations",
      "Produce clear, well-structured, detailed text on complex subjects, showing controlled use of organizational patterns, connectors and cohesive devices",
      "Read and critically analyze classic and contemporary Russian literature in the original",
      "Participate effectively in academic and professional environments, including delivering presentations and negotiating",
      "Write formal essays, reports, and articles with a sophisticated command of Russian stylistics",
      "Successfully pass the TORFL-III (C1) and be fully prepared for TORFL-IV (C2) examination"
    ],
    "prerequisites": [
      "Successful completion of the Russian B1-B2 Intermediate Mastery Course or equivalent knowledge (CEFR B2 level)",
      "Strong command of all six cases, verbal aspect, verbs of motion, and participles/gerunds",
      "Active vocabulary of at least 3000-4000 words",
      "Ability to read and understand adapted literary texts and news articles"
    ],
    "certification": "Upon completing the course and passing the final assessment (75% pass mark), you will receive a Certificate of Completion. This certificate attests to a level of proficiency equivalent to CEFR C2 (Mastery) and confirms readiness to take the official TORFL-IV examination for near-native fluency certification.",
    "projects": [
      "Project 1: Write a 1000-word critical essay analyzing a theme in a Russian short story by Chekhov or Bunin, employing advanced literary terminology.",
      "Project 2: Prepare and record a 10-minute academic presentation on a topic of your expertise (e.g., your profession or field of study) using formal Russian register.",
      "Project 3: Participate in a live moderated debate with fellow students on a current social or political issue in Russia, using persuasive rhetorical techniques.",
      "Final Project: Conduct a 15-minute oral interview (via video conference) entirely in Russian, where you discuss a complex, abstract topic (e.g., the role of art in society, the future of technology) demonstrating C2-level fluency and precision."
    ]
  }
]

```



