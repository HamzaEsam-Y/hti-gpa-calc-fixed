/**
 * config.js - Global Constants & Firebase Setup
 * GPA Portal - Computer Science Credit Hours System
 */

const firebaseConfig = {
  apiKey: "AIzaSyDpd3JM18bcwWYfyduVR5zTDT4xTxR_A-Q",
  authDomain: "gpaa-c66e0.firebaseapp.com",
  projectId: "gpaa-c66e0",
  storageBucket: "gpaa-c66e0.firebasestorage.app",
  messagingSenderId: "337071312380",
  appId: "1:337071312380:web:afce41e0475fa4cac03679",
  measurementId: "G-Q67B8L9HW6"
};

let currentUser = null;
let isFirebaseReady = false;
let db = null;
let auth = null;

// سلم التقديرات ونقاط الجودة المعتمد (اللائحة الرسمية)
const GRADE_POINTS = {
  "A+": 4.00,
  "A": 3.70,
  "A-": 3.40,
  "B+": 3.10,
  "B": 2.80,
  "B-": 2.50,
  "C+": 2.20,
  "C": 2.00,
  "C-": 1.70,
  "D+": 1.40,
  "D": 1.00,
  "F": 0.00
};

// سقوف التقدير عند إعادة المقرر (مادة 20) — مشتقة تلقائياً من نفس سلم GRADE_POINTS أعلاه
// حتى لا تختلف قيم السقف عن نقاط التقديرات المستخدمة في كل الحاسبات
const RETAKE_CAPS = {
  fail_1: { grade: "B+", points: GRADE_POINTS["B+"] },  // إعادة لأول مرة: حد أقصى B+
  fail_2: { grade: "C+", points: GRADE_POINTS["C+"] },  // إعادة لثاني مرة: حد أقصى C+
  fail_3: { grade: "D",  points: GRADE_POINTS["D"]  }   // إعادة لثالث مرة فأكثر: حد أقصى D
};

// أسماء التقديرات الكاملة بالعربي
const GRADE_FULL_NAMES = {
  "A+": "امتياز مرتفع (A+)",
  "A": "امتياز (A)",
  "A-": "امتياز منخفض (A-)",
  "B+": "جيد جداً مرتفع (B+)",
  "B": "جيد جداً (B)",
  "B-": "جيد جداً منخفض (B-)",
  "C+": "جيد مرتفع (C+)",
  "C": "جيد (C)",
  "C-": "جيد منخفض (C-)",
  "D+": "مقبول مرتفع (D+)",
  "D": "مقبول (D)",
  "F": "راسب (F)"
};

const ALL_BATCHES = ["الفرقة الأولى", "الفرقة الثانية", "الفرقة الثالثة", "الفرقة الرابعة"];

const SEMESTER_CONFIGS = [
  { id: "term_1", name: "الفصل الدراسي الأول", icon: "book-open" },
  { id: "term_2", name: "الفصل الدراسي الثاني", icon: "award" },
  { id: "summer_term", name: "الفصل الصيفي (Summer)", icon: "sun" }
];

// الحالة العامة للتطبيق
let currentViewYear = "الفرقة الأولى";
let activeSelectedSemester = "term_1";
let hasConfiguredPastCourses = false;
let priorWarnAnswered = false; // هل أجاب الطالب فعلياً على سؤال الإنذارات الأكاديمية السابقة؟
let summerTrainingState = { train1: false, train2: false };
let lastDeletedCourse = null;
let deletedCourseHistory = [];

// هيكل المقررات المخزنة لكافة السنوات
let allYearsCourses = {
  "الفرقة الأولى": { term_1: [], term_2: [], summer_term: [] },
  "الفرقة الثانية": { term_1: [], term_2: [], summer_term: [] },
  "الفرقة الثالثة": { term_1: [], term_2: [], summer_term: [] },
  "الفرقة الرابعة": { term_1: [], term_2: [], summer_term: [] }
};
