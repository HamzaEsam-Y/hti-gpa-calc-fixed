/**
 * calculator.js - GPA Engine & Academic Regulations Compliance
 * Handles SGPA, CGPA, Academic Warnings (Article 21), Retake/Replacement,
 * Credit Limits & Summer Training Eligibility.
 */

// حساب الحد الأقصى المسموح به للتسجيل بناءً على المعدل التراكمي والفصل وحالة التخرج
function getMaxAllowedSemesterCredits(cgpa, semId, totalCompletedHours = 0) {
  if (semId === "summer_term") {
    // الفصل الصيفي: حده الأقصى 6 ساعات، وللخريج 9 ساعات بموافقة
    const isGraduating = (134 - totalCompletedHours) <= 9;
    return {
      max: isGraduating ? 9 : 6,
      reason: isGraduating ? "فصل صيفي (حد أقصى استثنائي 9 ساعات لخريج)" : "فصل صيفي (الحد الأقصى المعتمد 6 ساعات)"
    };
  }

  // فصول الخريف والربيع العادية
  // ملاحظة: دليل اللائحة داخل الموقع يذكر حدًا مخفضًا 12 ساعة لمعدل أقل من 1.50،
  // لكن هذا غير مؤكد من اللائحة الرسمية ولم يكن مطبقًا في الكود الأصلي، فتُرك موثقًا وغير مطبق.
  if (cgpa < 2.00 && totalCompletedHours > 0) {
    return {
      max: 14,
      reason: "⚠️ تحت الملاحظة الأكاديمية (إنذار): الحد الأقصى 14 ساعة وفق المادة (14 & 21)"
    };
  }

  // خريج متبقي له حتى 21 ساعة
  if ((134 - totalCompletedHours) <= 21 && (134 - totalCompletedHours) > 0) {
    return {
      max: 21,
      reason: "🎓 طالب خريج: مسموح بحد أقصى استثنائي 21 ساعة معتمدة للتخرج"
    };
  }

  // طالب متفوق CGPA >= 3.00
  if (cgpa >= 3.00) {
    return {
      max: 21,
      reason: "⭐ طالب متفوق (معدل 3.00 فأكثر): يحق لك تسجيل حد أقصى 21 ساعة معتمدة"
    };
  }

  return {
    max: 18,
    reason: "العبء الدراسي النظامي (الحد الأقصى 18 ساعة معتمدة)"
  };
}

// فحص أهلية التدريب الصيفي وفق الساعات المجتازة
function checkSummerTrainingEligibility(totalEarnedHours, isTrain1Completed) {
  return {
    train1: {
      eligible: totalEarnedHours >= 60,
      requiredHours: 60,
      diff: Math.max(0, 60 - totalEarnedHours),
      message: totalEarnedHours >= 60 
        ? "مؤهل للتسجيل في التدريب الصيفي (1) ✓ (اجتزت 60 ساعة فأكثر)" 
        : `غير مؤهل للتدريب الصيفي (1): يلزم اجتياز 60 ساعة معتمدة (متبقي ${60 - totalEarnedHours} س)`
    },
    train2: {
      eligible: totalEarnedHours >= 90 && isTrain1Completed,
      requiredHours: 90,
      diff: Math.max(0, 90 - totalEarnedHours),
      message: (totalEarnedHours >= 90 && isTrain1Completed)
        ? "مؤهل للتسجيل في التدريب الصيفي (2) ✓ (اجتزت 90 ساعة وأنهيت تدريب 1)"
        : !isTrain1Completed
          ? "غير مؤهل للتدريب الصيفي (2): يجب إنهاء التدريب الصيفي (1) أولاً"
          : `غير مؤهل للتدريب الصيفي (2): يلزم اجتياز 90 ساعة معتمدة (متبقي ${90 - totalEarnedHours} س)`
    }
  };
}

// محرك حساب التكرار والتحسين اللائحي (Retake & Replacement Engine)
// اللائحة: إذا كرر الطالب مقرراً دراسياً، يُحسب له التقدير الجديد وتلغى نقاط وساعات المحاولة القديمة من المعدل التراكمي
function resolveRetakeCourses(allCoursesChronological) {
  // allCoursesChronological: قائمة مرتبة زمنياً بكل المواد المسجلة عبر الفصول
  const seenCodes = new Map();
  const resolvedList = [];

  // نمر من الأحدث إلى الأقدم لتحديد آخر محاولة
  for (let i = allCoursesChronological.length - 1; i >= 0; i--) {
    const item = allCoursesChronological[i];
    const code = extractCourseCode(item.searchVal);

    if (code && !seenCodes.has(code)) {
      // هذه أحدث محاولة للمقرر
      seenCodes.set(code, {
        latestGrade: item.grade,
        latestIndex: i
      });
      resolvedList.unshift({
        ...item,
        isSuperseded: false, // المحاولة الفعالة
        code: code
      });
    } else if (code && seenCodes.has(code)) {
      // هذه محاولة قديمة سابقة لمقرر تمت إعادته
      resolvedList.unshift({
        ...item,
        isSuperseded: true, // محاولة ملغاة من التراكمي
        code: code,
        supersededByGrade: seenCodes.get(code).latestGrade
      });
    } else {
      resolvedList.unshift({
        ...item,
        isSuperseded: false,
        code: ""
      });
    }
  }

  return resolvedList;
}

// دالة فحص المتطلب السابق للمقرر
function checkCoursePrerequisite(courseCode, currentBatch, currentSemId) {
  if (!courseCode) return { status: "valid", text: "" };
  const catalogItem = COURSE_CATALOG.find(c => c.code.toUpperCase() === courseCode.toUpperCase());
  if (!catalogItem || !catalogItem.prereq || catalogItem.prereq === "-" || catalogItem.prereq === "To be determined") {
    return { status: "valid", text: "" };
  }

  const reqCode = catalogItem.prereq.trim();
  const currentBatchIdx = ALL_BATCHES.indexOf(currentBatch);
  const currentSemIdx = SEMESTER_CONFIGS.findIndex(s => s.id === currentSemId);

  // جمع كافة المقررات المجتازة بنجاح في فصول سابقة
  let passedPrereq = false;

  for (let b = 0; b < ALL_BATCHES.length; b++) {
    const bName = ALL_BATCHES[b];
    const yearData = (bName === currentViewYear) ? getCurrentTableCourses() : (allYearsCourses[bName] || {});

    for (let s = 0; s < SEMESTER_CONFIGS.length; s++) {
      const sId = SEMESTER_CONFIGS[s].id;
      // لا نحتسب فصولاً مستقبلية أو نفس الفصل الحالي
      if (b > currentBatchIdx) continue;
      if (b === currentBatchIdx && s >= currentSemIdx) continue;

      const list = yearData[sId] || [];
      list.forEach(c => {
        const cCode = extractCourseCode(c.searchVal);
        if (cCode.toUpperCase() === reqCode.toUpperCase() && c.grade !== "F" && c.grade !== "W") {
          passedPrereq = true;
        }
      });
    }
  }

  if (passedPrereq) {
    return { status: "valid", text: `المتطلب السابق (${reqCode}) مجتاز بنجاح ✓` };
  } else {
    return {
      status: "warning",
      text: `⚠️ تنبيه لائحي: يتطلب اجتياز المقرر السابق (${reqCode}) قبل التسجيل.`
    };
  }
}
