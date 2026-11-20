/**
 * catalog.js - Clean Course Catalog & Schedule
 */

const COURSE_CATALOG = [
      // أولاً: المقررات الإجبارية (إجمالي 110 ساعة معتمدة)
      { code: "H 101", codeAr: "إ ن 101", nameAr: "مهارات تواصل", nameEn: "Communication Skills", credits: 2, prereq: "-", type: "إجباري" },
      { code: "BS 101", codeAr: "ع أ 101", nameAr: "التفاضل والتكامل", nameEn: "Calculus", credits: 3, prereq: "-", type: "إجباري" },
      { code: "CS 101", codeAr: "ع ح 101", nameAr: "مقدمة في علوم الحاسب", nameEn: "Intro. to Computer Science", credits: 3, prereq: "-", type: "إجباري" },
      { code: "H 102", codeAr: "إ ن 102", nameAr: "اللغة الإنجليزية", nameEn: "English Language", credits: 2, prereq: "-", type: "إجباري" },
      { code: "BS 102", codeAr: "ع أ 102", nameAr: "الجبر الخطي", nameEn: "Linear Algebra", credits: 3, prereq: "BS 101", type: "إجباري" },
      { code: "CS 102", codeAr: "ع ح 102", nameAr: "برمجة الحاسبات", nameEn: "Computers Programming", credits: 3, prereq: "CS 101", type: "إجباري" },
      { code: "H 103", codeAr: "إ ن 103", nameAr: "إدارة أعمال", nameEn: "Business administration", credits: 2, prereq: "-", type: "إجباري" },
      { code: "BS 103", codeAr: "ع أ 103", nameAr: "الرياضيات غير المتصلة", nameEn: "Discrete Mathematics", credits: 3, prereq: "BS 101", type: "إجباري" },
      { code: "CS 103", codeAr: "ع ح 103", nameAr: "البرمجة الشيئية", nameEn: "Object-Oriented Programming", credits: 3, prereq: "CS 102", type: "إجباري" },
      { code: "BS 104", codeAr: "ع أ 104", nameAr: "الكترونيات", nameEn: "Electronics", credits: 3, prereq: "-", type: "إجباري" },
      { code: "CS 104", codeAr: "ع ح 104", nameAr: "مقدمة نظم المعلومات", nameEn: "Introduction to information systems", credits: 3, prereq: "CS 101", type: "إجباري" },
      { code: "BS 105", codeAr: "ع أ 105", nameAr: "إحصاء واحتمالات", nameEn: "Statistics and Probabilities", credits: 3, prereq: "BS 101", type: "إجباري" },
      { code: "H 201", codeAr: "إ ن 201", nameAr: "أخلاقيات العمل", nameEn: "Work Ethics", credits: 2, prereq: "-", type: "إجباري" },
      { code: "BS 201", codeAr: "ع أ 201", nameAr: "بحوث العمليات", nameEn: "Operations Research", credits: 3, prereq: "BS 101", type: "إجباري" },
      { code: "CS 201", codeAr: "ع ح 201", nameAr: "هياكل البيانات", nameEn: "Data Structures", credits: 3, prereq: "CS 103", type: "إجباري" },
      { code: "H 202", codeAr: "إ ن 202", nameAr: "حقوق الإنسان", nameEn: "Human Rights", credits: 2, prereq: "-", type: "إجباري" },
      { code: "BS 202", codeAr: "ع أ 202", nameAr: "فيزياء", nameEn: "Physics", credits: 3, prereq: "-", type: "إجباري" },
      { code: "CS 202", codeAr: "ع ح 202", nameAr: "تحليل وتصميم النظم", nameEn: "Systems Analysis and Design", credits: 3, prereq: "CS 104", type: "إجباري" },
      { code: "H 203", codeAr: "إ ن 203", nameAr: "كتابة تقارير فنية", nameEn: "Technical Report Writing", credits: 2, prereq: "H 102", type: "إجباري" },
      { code: "CS 203", codeAr: "ع ح 203", nameAr: "معالجة الملفات", nameEn: "File Processing", credits: 3, prereq: "CS 102", type: "إجباري" },
      { code: "H 204", codeAr: "إ ن 204", nameAr: "ضبط وتوكيد الجودة", nameEn: "Quality Assurance & Control", credits: 2, prereq: "-", type: "إجباري" },
      { code: "CS 204", codeAr: "ع ح 204", nameAr: "مقدمة في قواعد البيانات", nameEn: "Introduction to databases", credits: 3, prereq: "CS 104", type: "إجباري" },
      { code: "CS 205", codeAr: "ع ح 205", nameAr: "أساسيات الوسائط المتعددة", nameEn: "Fundamentals of Multimedia", credits: 3, prereq: "CS 103", type: "إجباري" },
      { code: "CS 301", codeAr: "ع ح 301", nameAr: "لغة التجميع", nameEn: "Assembly Language", credits: 3, prereq: "CS 102", type: "إجباري" },
      { code: "CS 302", codeAr: "ع ح 302", nameAr: "برمجة الويب", nameEn: "Web Programming", credits: 3, prereq: "CS 102", type: "إجباري" },
      { code: "CS 303", codeAr: "ع ح 303", nameAr: "البرمجة المنطقية", nameEn: "Logic Programming", credits: 3, prereq: "CS 102", type: "إجباري" },
      { code: "CS 304", codeAr: "ع ح 304", nameAr: "تحليل الخوارزميات", nameEn: "Analysis of Algorithms", credits: 3, prereq: "CS 201", type: "إجباري" },
      { code: "CS 305", codeAr: "ع ح 305", nameAr: "هندسة البرمجيات", nameEn: "Software Engineering", credits: 3, prereq: "CS 202", type: "إجباري" },
      { code: "CS 306", codeAr: "ع ح 306", nameAr: "بناء الحاسب", nameEn: "Computer Architecture", credits: 3, prereq: "CS 104", type: "إجباري" },
      { code: "CS 307", codeAr: "ع ح 307", nameAr: "نظرية وتصميم المترجمات", nameEn: "Theory and Design of Compilers", credits: 3, prereq: "CS 306", type: "إجباري" },
      { code: "CS 308", codeAr: "ع ح 308", nameAr: "الرسم بالحاسب", nameEn: "Computer Graphics", credits: 3, prereq: "CS 103", type: "إجباري" },
      { code: "CS 309", codeAr: "ع ح 309", nameAr: "تطوير تطبيقات الجوال", nameEn: "Mobile App Development", credits: 3, prereq: "CS 302", type: "إجباري" },
      { code: "CS 310", codeAr: "ع ح 310", nameAr: "شبكات الحاسب", nameEn: "Computer Networks", credits: 3, prereq: "CS 101", type: "إجباري" },
      { code: "CS 401", codeAr: "ع ح 401", nameAr: "اللغات الديناميكية", nameEn: "Dynamic Languages", credits: 3, prereq: "CS 103", type: "إجباري" },
      { code: "CS 402", codeAr: "ع ح 402", nameAr: "معالجة الصور الرقمية", nameEn: "Digital Image Processing", credits: 3, prereq: "CS 308", type: "إجباري" },
      { code: "CS 403", codeAr: "ع ح 403", nameAr: "الذكاء الاصطناعي", nameEn: "Artificial Intelligence", credits: 3, prereq: "CS 304", type: "إجباري" },
      { code: "CS 404", codeAr: "ع ح 404", nameAr: "نظريات نظم التشغيل", nameEn: "Theory of Operating Systems", credits: 3, prereq: "CS 306", type: "إجباري" },
      { code: "CS 498", codeAr: "ع ح 498", nameAr: "مشروع التخرج 1", nameEn: "Senior Project 1", credits: 3, prereq: "CS 202", type: "إجباري" },
      { code: "CS 499", codeAr: "ع ح 499", nameAr: "مشروع التخرج 2", nameEn: "Senior Project 2", credits: 3, prereq: "CS 498", type: "إجباري" },

      // ثانياً: المقررات الاختيارية
      { code: "CS 300", codeAr: "ع ح 300", nameAr: "موضوعات مختارة في علوم الحاسب - مستوى 3", nameEn: "Selected Topics in computer science - level 3", credits: 3, prereq: "To be determined", type: "اختياري" },
      { code: "CS 320", codeAr: "ع ح 320", nameAr: "تعلم الآلة", nameEn: "Machine Learning", credits: 3, prereq: "CS 202", type: "اختياري" },
      { code: "CS 321", codeAr: "ع ح 321", nameAr: "النمذجة والمحاكاة", nameEn: "Simulation and Modeling", credits: 3, prereq: "CS 103", type: "اختياري" },
      { code: "CS 322", codeAr: "ع ح 322", nameAr: "تعريب الحاسبات", nameEn: "Computer Arabization", credits: 3, prereq: "CS 304", type: "اختياري" },
      { code: "CS 323", codeAr: "ع ح 323", nameAr: "معالجة اللغات الطبيعية", nameEn: "Natural language processing", credits: 3, prereq: "CS 304", type: "اختياري" },
      { code: "CS 324", codeAr: "ع ح 324", nameAr: "تطوير نظام مفتوح المصدر", nameEn: "Open-Source System Development", credits: 3, prereq: "CS 103", type: "اختياري" },
      { code: "CS 325", codeAr: "ع ح 325", nameAr: "طرق اتصال الإنسان بالحاسب", nameEn: "Human Computer Interaction", credits: 3, prereq: "-", type: "اختياري" },
      { code: "CS 330", codeAr: "ع ح 330", nameAr: "رؤية المعلومات", nameEn: "Information Visualization", credits: 3, prereq: "CS 104", type: "اختياري" },
      { code: "CS 331", codeAr: "ع ح 331", nameAr: "تمثيل المعرفة والاستدلال", nameEn: "Knowledge Representation and Reasoning", credits: 3, prereq: "CS 201", type: "اختياري" },
      { code: "CS 332", codeAr: "ع ح 332", nameAr: "مستودعات البيانات", nameEn: "Data warehouses", credits: 3, prereq: "CS 204", type: "اختياري" },
      { code: "CS 333", codeAr: "ع ح 333", nameAr: "نظم دعم القرار وتطبيقاتها", nameEn: "Decision support systems and applications", credits: 3, prereq: "BS 201", type: "اختياري" },
      { code: "CS 334", codeAr: "ع ح 334", nameAr: "قواعد البيانات الشيئية", nameEn: "Object Oriented Databases", credits: 3, prereq: "CS 204", type: "اختياري" },
      { code: "CS 335", codeAr: "ع ح 335", nameAr: "نظم معلومات الوسائط المتعددة", nameEn: "Multimedia Information Systems", credits: 3, prereq: "CS 205", type: "اختياري" },
      { code: "CS 340", codeAr: "ع ح 340", nameAr: "أمن الشبكات", nameEn: "Network Security", credits: 3, prereq: "CS 310", type: "اختياري" },
      { code: "CS 341", codeAr: "ع ح 341", nameAr: "انترنت الأشياء", nameEn: "Internet of Things (IoT)", credits: 3, prereq: "CS 310", type: "اختياري" },
      { code: "CS 342", codeAr: "ع ح 342", nameAr: "التعليم الإلكتروني", nameEn: "E-learning", credits: 3, prereq: "CS 310", type: "اختياري" },
      { code: "CS 343", codeAr: "ع ح 343", nameAr: "معالجة الإشارات الرقمية", nameEn: "Digital signal processing", credits: 3, prereq: "CS 103", type: "اختياري" },
      { code: "CS 344", codeAr: "ع ح 344", nameAr: "نظم تشغيل الشبكات", nameEn: "Network operating systems", credits: 3, prereq: "CS 310", type: "اختياري" },
      { code: "CS 345", codeAr: "ع ح 345", nameAr: "الشبكات اللاسلكية والمتحركة", nameEn: "Wireless and mobile communication", credits: 3, prereq: "CS 310", type: "اختياري" },
      { code: "CS 400", codeAr: "ع ح 400", nameAr: "موضوعات مختارة في علوم الحاسب - مستوى 4", nameEn: "Selected Topics in computer science - level 4", credits: 3, prereq: "To be determined", type: "اختياري" },
      { code: "CS 420", codeAr: "ع ح 420", nameAr: "المعالجة المتوازية", nameEn: "Parallel processing", credits: 3, prereq: "CS 301", type: "اختياري" },
      { code: "CS 421", codeAr: "ع ح 421", nameAr: "نظم الرؤية بالحاسب", nameEn: "Computer Vision Systems", credits: 3, prereq: "CS 103", type: "اختياري" },
      { code: "CS 422", codeAr: "ع ح 422", nameAr: "الخورزيميات الجينية", nameEn: "Genetic Algorithms", credits: 3, prereq: "CS 304", type: "اختياري" },
      { code: "CS 423", codeAr: "ع ح 423", nameAr: "الحاسبات الذكية والكمية", nameEn: "Intelligent Quantum Computers", credits: 3, prereq: "BS 102", type: "اختياري" },
      { code: "CS 424", codeAr: "ع ح 424", nameAr: "النظم المعلوماتية الحيوية", nameEn: "Bioinformatics Systems", credits: 3, prereq: "CS 304", type: "اختياري" },
      { code: "CS 425", codeAr: "ع ح 425", nameAr: "الشبكات العصبية", nameEn: "Neural Networks", credits: 3, prereq: "CS 304", type: "اختياري" },
      { code: "CS 426", codeAr: "ع ح 426", nameAr: "الرسوم المتحركة بالحاسب", nameEn: "Computer Animation", credits: 3, prereq: "CS 308", type: "اختياري" },
      { code: "CS 430", codeAr: "ع ح 430", nameAr: "التنقيب عن البيانات", nameEn: "Data Mining", credits: 3, prereq: "CS 304", type: "اختياري" },
      { code: "CS 431", codeAr: "ع ح 431", nameAr: "نظم معلومات الويب", nameEn: "Web Info Systems", credits: 3, prereq: "CS 302", type: "اختياري" },
      { code: "CS 432", codeAr: "ع ح 432", nameAr: "قواعد بيانات النصوص الفوقية", nameEn: "XML Database", credits: 3, prereq: "CS 204", type: "اختياري" },
      { code: "CS 433", codeAr: "ع ح 433", nameAr: "التجارة الإلكترونية", nameEn: "E-Commerce", credits: 3, prereq: "CS 302", type: "اختياري" },
      { code: "CS 434", codeAr: "ع ح 434", nameAr: "نظم المعلومات الجغرافية", nameEn: "Geographical Information Systems", credits: 3, prereq: "CS 204", type: "اختياري" },
      { code: "CS 435", codeAr: "ع ح 435", nameAr: "البنوك الإلكترونية", nameEn: "E-banking", credits: 3, prereq: "CS 302", type: "اختياري" },
      { code: "CS 440", codeAr: "ع ح 440", nameAr: "الأنظمة الموزعة", nameEn: "Distributed Systems", credits: 3, prereq: "CS 310", type: "اختياري" },
      { code: "CS 441", codeAr: "ع ح 441", nameAr: "نظم الوقت الحقيقي", nameEn: "Real Time Systems", credits: 3, prereq: "CS 306", type: "اختياري" },
      { code: "CS 442", codeAr: "ع ح 442", nameAr: "إتصالات البيانات", nameEn: "Data Communication", credits: 3, prereq: "CS 310", type: "اختياري" },
      { code: "CS 443", codeAr: "ع ح 443", nameAr: "التعرف على الأنماط", nameEn: "Pattern recognition", credits: 3, prereq: "CS 304", type: "اختياري" },
      { code: "CS 444", codeAr: "ع ح 444", nameAr: "الواقع الافتراضي", nameEn: "Virtual Reality", credits: 3, prereq: "CS 308", type: "اختياري" },
      { code: "CS 445", codeAr: "ع ح 445", nameAr: "الحوسبة السحابية", nameEn: "Cloud Computing", credits: 3, prereq: "CS 310", type: "اختياري" }
    ];

const STANDARD_COURSE_SCHEDULE = {
      // الفرقة الأولى - الفصل الأول
      "H 101": { batch: "الفرقة الأولى", semId: "term_1" },
      "BS 101": { batch: "الفرقة الأولى", semId: "term_1" },
      "CS 101": { batch: "الفرقة الأولى", semId: "term_1" },
      "H 102": { batch: "الفرقة الأولى", semId: "term_1" },
      "BS 102": { batch: "الفرقة الأولى", semId: "term_1" },
      "CS 102": { batch: "الفرقة الأولى", semId: "term_1" },
      // الفرقة الأولى - الفصل الثاني
      "H 103": { batch: "الفرقة الأولى", semId: "term_2" },
      "BS 103": { batch: "الفرقة الأولى", semId: "term_2" },
      "CS 103": { batch: "الفرقة الأولى", semId: "term_2" },
      "BS 104": { batch: "الفرقة الأولى", semId: "term_2" },
      "CS 104": { batch: "الفرقة الأولى", semId: "term_2" },
      "BS 105": { batch: "الفرقة الأولى", semId: "term_2" },

      // الفرقة الثانية - الفصل الأول
      "H 201": { batch: "الفرقة الثانية", semId: "term_1" },
      "BS 201": { batch: "الفرقة الثانية", semId: "term_1" },
      "CS 201": { batch: "الفرقة الثانية", semId: "term_1" },
      "H 202": { batch: "الفرقة الثانية", semId: "term_1" },
      "BS 202": { batch: "الفرقة الثانية", semId: "term_1" },
      "CS 202": { batch: "الفرقة الثانية", semId: "term_1" },
      // الفرقة الثانية - الفصل الثاني
      "H 203": { batch: "الفرقة الثانية", semId: "term_2" },
      "CS 203": { batch: "الفرقة الثانية", semId: "term_2" },
      "H 204": { batch: "الفرقة الثانية", semId: "term_2" },
      "CS 204": { batch: "الفرقة الثانية", semId: "term_2" },
      "CS 205": { batch: "الفرقة الثانية", semId: "term_2" },

      // الفرقة الثالثة - الفصل الأول
      "CS 301": { batch: "الفرقة الثالثة", semId: "term_1" },
      "CS 302": { batch: "الفرقة الثالثة", semId: "term_1" },
      "CS 303": { batch: "الفرقة الثالثة", semId: "term_1" },
      "CS 304": { batch: "الفرقة الثالثة", semId: "term_1" },
      "CS 305": { batch: "الفرقة الثالثة", semId: "term_1" },
      "CS 310": { batch: "الفرقة الثالثة", semId: "term_1" },
      // الفرقة الثالثة - الفصل الثاني
      "CS 306": { batch: "الفرقة الثالثة", semId: "term_2" },
      "CS 307": { batch: "الفرقة الثالثة", semId: "term_2" },
      "CS 308": { batch: "الفرقة الثالثة", semId: "term_2" },
      "CS 309": { batch: "الفرقة الثالثة", semId: "term_2" }
    };

function normalizeSearchText(str) {
  if (!str) return "";
  return str.toString().trim().toLowerCase()
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "").replace(/[\-_]/g, " ").replace(/\s+/g, " ");
}

function highlightMatch(text, query) {
  if (!query || !text) return text;
  const normQuery = normalizeSearchText(query);
  if (!normQuery) return text;
  return text;
}

function stripArabicPrefix(word) {
  if (!word) return "";
  if (word.startsWith("ال") && word.length > 3) return word.slice(2);
  return word;
}

function extractCourseCode(text) {
  if (!text) return "";
  const match = text.match(/\b([A-Z]{1,3}\s*\d{3})\b/i);
  return match ? match[1].replace(/\s+/g, " ").toUpperCase() : "";
  }
