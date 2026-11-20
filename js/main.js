function continueAsGuest() {
  const overlay = document.getElementById("login-overlay");
  if (overlay) overlay.style.display = "none";
  if (typeof showToast === "function") {
    showToast("أهلاً بك! تم الدخول بنجاح مع تفعيل الحفظ التلقائي المحلي 🚀");
  }
  if (typeof checkProfileCompletion === "function") {
    const saved = localStorage.getItem("hti_gpa_state_v2");
    checkProfileCompletion(saved ? JSON.parse(saved) : null);
  }
}

/**
 * main.js - Application Lifecycle, Storage & Core Flow Controller
 */



    try {
      if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        isFirebaseReady = true;

        auth.onAuthStateChanged(user => {
          const overlay = document.getElementById("login-overlay");
          if (user) {
            currentUser = user;
            if (overlay) overlay.style.display = "none";
            updateAuthUI(true, user);
            loadUserDataFromFirestore(user.uid);
          } else {
            currentUser = null;
            if (overlay) overlay.style.display = "flex";
            updateAuthUI(false);
          }
        });
      }
    } catch (e) {
      console.warn("Firebase Init note: Local storage fallback active.", e);
    }

    async function signInWithGoogle() {
      if (!isFirebaseReady) {
        showToast("يرجى إعداد Firebase للتسجيل السحابي!", true);
        return;
      }
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        showToast("مرحباً بك! تم تسجيل الدخول بنجاح ✓");
      } catch (err) {
        showToast("تعذر تسجيل الدخول: " + err.message, true);
      }
    }

    async function signOutUser() {
      if (auth) {
        await auth.signOut();
        showToast("تم تسجيل الخروج.");
      }
    }

    function updateAuthUI(isLoggedIn, user = null) {
      const signInBtn = document.getElementById("googleSignInBtn");
      const profileBox = document.getElementById("userProfileBox");
      const userAvatar = document.getElementById("userAvatar");
      const userName = document.getElementById("userName");

      if (isLoggedIn && user) {
        signInBtn.classList.add("hidden");
        profileBox.classList.remove("hidden");
        userAvatar.src = user.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=student";
        userName.innerText = user.displayName ? user.displayName.split(" ")[0] : "طالب";
      } else {
        signInBtn.classList.remove("hidden");
        profileBox.classList.add("hidden");
      }
    }

    // PROFILE MODAL LOGIC & PRIOR WARNINGS
    // دالة مساعدة للـ validation الفوري على الـ input

function calculateHistoricalSummaryUpTo(targetBatch) {
      const targetIdx = ALL_BATCHES.indexOf(targetBatch);
      let totalPts = 0;
      let totalAttempted = 0;
      let totalEarned = 0;

      for (let i = 0; i <= targetIdx && i < ALL_BATCHES.length; i++) {
        const b = ALL_BATCHES[i];
        const semObj = (b === currentViewYear) ? getCurrentTableCourses() : (allYearsCourses[b] || {});

        SEMESTER_CONFIGS.forEach(sem => {
          const courses = semObj[sem.id] || [];
          courses.forEach(c => {
            if (c.grade === "W") return;
            const pts = GRADE_POINTS[c.grade] !== undefined ? GRADE_POINTS[c.grade] : 0;
            totalAttempted += c.credits;
            totalPts += (c.credits * pts);
            if (c.grade !== "F") {
              totalEarned += c.credits;
            }
          });
        });
      }

      const cgpa = totalAttempted > 0 ? (totalPts / totalAttempted) : 0.00;
      return { attemptedHours: totalAttempted, earnedHours: totalEarned, qualityPoints: totalPts, cgpa: cgpa };
    }

    function handleBatchChange(triggerAutoSave = true) {
      const batch = document.getElementById("displayStudentBatch").innerText;
      const prevContainer = document.getElementById("prevRecordContainer");
      const subtext = document.getElementById("progressionSubtext");
      const progBtn = document.getElementById("progressionBtn");
      const progBtnText = document.getElementById("progressionBtnText");
      const badge = document.getElementById("batchPromptBadge");

      subtext.innerHTML = `أنت الآن في مرحلة: <strong class="text-emerald-800">${batch}</strong>`;

      if (batch === "الفرقة الأولى") {
        prevContainer.classList.add("hidden");
        progBtn.classList.remove("hidden");
        progBtnText.innerText = "هل أنهيت العام الدراسي؟ الانتقال إلى الفرقة الثانية";
      } else if (batch === "الفرقة الثانية") {
        prevContainer.classList.remove("hidden");
        badge.innerText = "الفرقة الثانية";
        progBtn.classList.remove("hidden");
        progBtnText.innerText = "هل أنهيت العام الدراسي؟ الانتقال إلى الفرقة الثالثة";
      } else if (batch === "الفرقة الثالثة") {
        prevContainer.classList.remove("hidden");
        badge.innerText = "الفرقة الثالثة";
        progBtn.classList.remove("hidden");
        progBtnText.innerText = "هل أنهيت العام الدراسي؟ الانتقال إلى الفرقة الرابعة";
      } else if (batch === "الفرقة الرابعة") {
        prevContainer.classList.remove("hidden");
        badge.innerText = "الفرقة الرابعة (التخرج)";
        progBtn.classList.add("hidden");
        subtext.innerHTML = `أنت الآن في مرحلة: <strong class="text-teal-800 font-black">الفرقة الرابعة (مرحلة التخرج) 🎓</strong>`;
      }

      handlePrevDataInput(false);
      recalculateAll();
      if (triggerAutoSave) autoSaveAll();
    }

    // الانتقال للعام الأكاديمي التالي مع أرشفة مواد السنة الحالية وتفريغ الفصول للسنة الجديدة
    function progressToNextYear() {
      saveCurrentTableToState();

      const batchEl = document.getElementById("displayStudentBatch");
      const current = batchEl.innerText;
      let nextBatch = "";

      if (current === "الفرقة الأولى") nextBatch = "الفرقة الثانية";
      else if (current === "الفرقة الثانية") nextBatch = "الفرقة الثالثة";
      else if (current === "الفرقة الثالثة") nextBatch = "الفرقة الرابعة";

      if (!nextBatch) return;

      if (confirm(`هل أنت متأكد من إنهاء مقررات ${current} والانتقال إلى ${nextBatch}؟\n\n✓ سيتم حفظ مقررات ودرجات ${current} في سجلك الأكاديمي الشامل.\n✓ ستفتح فصول ${nextBatch} خالية تماماً لتتمكن من إضافة موادك الجديدة.\n✓ يمكنك استعراض مقررات أي سنة سابقة أو تعديلها في أي وقت.`)) {
        batchEl.innerText = nextBatch;
        document.getElementById("modalStudentBatch").value = nextBatch;

        // حساب الرصيد التراكمي السابق تلقائياً ووضعه في خانات الساعات السابقة
        const summary = calculateHistoricalSummaryUpTo(current);
        const prevHoursInput = document.getElementById("prevHoursInput");
        const prevGpaInput = document.getElementById("prevGpaInput");
        if (prevHoursInput && prevGpaInput) {
          prevHoursInput.value = summary.earnedHours > 0 ? summary.earnedHours : "";
          prevGpaInput.value = summary.earnedHours > 0 ? summary.cgpa.toFixed(2) : "";
        }

        // إذا كان معدل الطالب أقل من 2.00 عند إنهاء السنة، تفعيل مؤشر الإنذار السابق تلقائياً
        if (summary.cgpa < 2.00 && summary.earnedHours > 0) {
          handlePriorWarningToggle(true);
        }

        handleBatchChange(false);
        loadYearCoursesToTable(nextBatch);
        autoSaveAll();

        showToast(`مبروك الانتقال إلى ${nextBatch}! 🎉 فصولك جاهزة الآن وموادك السابقة محفوظة بالسجل.`);
      }
    }

    function handlePrevDataInput(triggerSave = true) {
      const prevHoursInput = document.getElementById("prevHoursInput");
      const prevGpaInput = document.getElementById("prevGpaInput");
      const prevPointsDisplay = document.getElementById("prevPointsDisplay");

      const hOld = parseFloat(prevHoursInput.value) || 0;
      const oldGpa = parseFloat(prevGpaInput.value) || 0;

      if (prevPointsDisplay) prevPointsDisplay.innerText = (hOld * oldGpa).toFixed(2);
      recalculateAll();
      if (triggerSave) autoSaveAll();
    }

    // استخراج الكود الأكاديمي الموحد من نص المقرر بمرونة ودقة (عربي وإنجليزي)
    function extractCourseCode(text) {
      if (!text) return "";
      const trimmed = text.trim();
      // مطابقة الأكواد الإنجليزية مثل CS 101 أو BS 101
      const m = trimmed.match(/([A-Z]{1,3}\s*\d{2,3})/i);
      if (m) return m[1].replace(/\s+/g, " ").toUpperCase();

      // البحث في الكتالوج بالمطابقة مع الكود العربي أو اسم المادة
      const cat = COURSE_CATALOG.find(c => 
        c.codeAr === trimmed || 
        c.nameAr === trimmed || 
        trimmed.includes(c.nameAr) ||
        (c.codeAr && trimmed.includes(c.codeAr))
      );
      if (cat) return cat.code.toUpperCase();

      const firstPart = trimmed.split("-")[0].trim();
      return firstPart.toUpperCase();
    }

    // فحص المتطلب السابق للمقرر والتحقق من اجتيازه في السجل الأكاديمي للطالب
    function checkCoursePrerequisite(courseCode, currentBatch, currentSemId) {
      if (!courseCode) return { status: "ok" };

      const course = COURSE_CATALOG.find(c => c.code.toUpperCase() === courseCode.toUpperCase());
      if (!course) return { status: "ok" };

      if (!course.prereq || course.prereq === "-" || course.prereq === "To be determined") {
        return { status: "ok" };
      }

      const prereqCode = course.prereq.toUpperCase();
      const prereqCourse = COURSE_CATALOG.find(c => c.code.toUpperCase() === prereqCode);
      const prereqTitle = prereqCourse ? `${prereqCourse.code} (${prereqCourse.nameAr})` : prereqCode;

      // 1. هل المتطلب مسجل في نفس الفصل الدراسي الحالي؟
      let currentSemCourses = (allYearsCourses[currentBatch] && allYearsCourses[currentBatch][currentSemId]) || [];
      if (currentBatch === currentViewYear && typeof getCurrentTableCourses === "function") {
        const live = getCurrentTableCourses()[currentSemId] || [];
        if (live.length > 0) currentSemCourses = live;
      }

      const inSameTerm = currentSemCourses.some(c => extractCourseCode(c.searchVal) === prereqCode);
      if (inSameTerm) {
        return {
          status: "same_term",
          prereqCode,
          prereqTitle,
          message: `⚠️ لا يمكن تسجيل مقرر (${course.code}) بالتزامن مع متطلبه السابق (${prereqTitle}) في نفس الفصل الدراسي! يجب اجتياز المتطلب أولاً.`
        };
      }

      // 2. البحث عن المتطلب في كامل السجل الأكاديمي للطالب عبر كافة الفرق والفصول
      let foundRecord = false;
      let hasPassed = false;
      let allAttemptsFailed = true;

      ALL_BATCHES.forEach(b => {
        let semData = allYearsCourses[b] || {};
        if (b === currentViewYear && typeof getCurrentTableCourses === "function") {
          const liveData = getCurrentTableCourses();
          if (SEMESTER_CONFIGS.some(s => (liveData[s.id] || []).length > 0)) {
            semData = liveData;
          }
        }
        SEMESTER_CONFIGS.forEach(sem => {
          const list = semData[sem.id] || [];
          list.forEach(c => {
            const code = extractCourseCode(c.searchVal);
            if (code === prereqCode) {
              foundRecord = true;
              if (c.grade && c.grade !== "F" && c.grade !== "W") {
                hasPassed = true;
                allAttemptsFailed = false;
              }
            }
          });
        });
      });

      if (hasPassed) {
        return { status: "ok", prereqCode, prereqTitle };
      }

      if (foundRecord && allAttemptsFailed) {
        return {
          status: "failed",
          prereqCode,
          prereqTitle,
          message: `🚨 تنبيه رسوب: لقد حصلت على تقدير رسوب (F) في المتطلب السابق (${prereqTitle})! تنص اللائحة على عدم جواز تسجيل المقرر قبل اجتياز متطلبه بنجاح.`
        };
      }

      // في حالة عدم وجود المتطلب بسجل المقررات المسجلة
      const studentBatch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
      const pHours = parseFloat(document.getElementById("prevHoursInput")?.value) || 0;

      if (studentBatch !== "الفرقة الأولى" && pHours > 0) {
        return {
          status: "unverified",
          prereqCode,
          prereqTitle,
          message: `ℹ️ تنبيه المتطلب: هذا المقرر يشترط اجتياز (${prereqTitle}). تأكد من اجتيازه ضمن رصيد ساعاتك السابقة المعتمدة.`
        };
      }

      return {
        status: "not_taken",
        prereqCode,
        prereqTitle,
        message: `⚠️ تنبيه المتطلب السابق: لم تجتز المتطلب السابق (${prereqTitle}) لهذا المقرر بعد! تنص اللائحة على ضرورة اجتياز المتطلب أولاً.`
      };
    }

    // فحص جميع صفوف الجداول وتنبيه الطالب بالتكرار ومخالفة المتطلبات السابقة فورياً
    function validateCurrentTableRows() {
      SEMESTER_CONFIGS.forEach(sem => {
        const tbody = document.getElementById(`coursesTableBody-${sem.id}`);
        if (!tbody) return;

        const rows = tbody.querySelectorAll("tr");
        const codeOccurrences = {};

        // حصر تكرار المواد في نفس الفصل الدراسي
        rows.forEach(row => {
          const rowId = row.id;
          const searchVal = document.getElementById(`search_${rowId}`)?.value || "";
          const code = extractCourseCode(searchVal);
          if (code) {
            codeOccurrences[code] = (codeOccurrences[code] || 0) + 1;
          }
        });

        // فحص كل صف وإظهار رسائل التحذير المناسبة
        rows.forEach(row => {
          const rowId = row.id;
          const searchVal = document.getElementById(`search_${rowId}`)?.value || "";
          const code = extractCourseCode(searchVal);
          const alertContainer = document.getElementById(`alerts_${rowId}`);
          const inputEl = document.getElementById(`search_${rowId}`);
          if (!alertContainer || !inputEl) return;

          alertContainer.innerHTML = "";
          let hasDup = false;
          let hasPrereqWarn = false;

          // 1. فحص تكرار تسجيل المادة في نفس الترم
          if (code && codeOccurrences[code] > 1) {
            hasDup = true;
            const dupDiv = document.createElement("div");
            dupDiv.className = "flex items-center gap-1.5 p-1.5 bg-rose-50 border border-rose-300 rounded-lg text-[10px] font-bold text-rose-800 shadow-2xs";
            dupDiv.innerHTML = `<i data-lucide="alert-octagon" class="w-3.5 h-3.5 text-rose-600 shrink-0"></i><span>⚠️ تنبيه تكرار: هذا المقرر مسجل أكثر من مرة في نفس هذا الفصل الدراسي!</span>`;
            alertContainer.appendChild(dupDiv);
          }

          // 2. فحص المتطلب السابق
          if (code) {
            const prereqCheck = checkCoursePrerequisite(code, currentViewYear, sem.id);
            if (prereqCheck.status !== "ok") {
              hasPrereqWarn = true;
              const isDanger = (prereqCheck.status === "failed" || prereqCheck.status === "same_term");
              const bgClass = isDanger ? "bg-rose-50 border-rose-300 text-rose-900" : "bg-amber-50 border-amber-300 text-amber-900";
              const iconClass = isDanger ? "text-rose-600" : "text-amber-600";
              const iconName = isDanger ? "shield-alert" : "alert-triangle";

              const prereqDiv = document.createElement("div");
              prereqDiv.className = `flex items-center gap-1.5 p-1.5 ${bgClass} border rounded-lg text-[10px] font-bold shadow-2xs`;
              prereqDiv.innerHTML = `<i data-lucide="${iconName}" class="w-3.5 h-3.5 ${iconClass} shrink-0"></i><span>${prereqCheck.message}</span>`;
              alertContainer.appendChild(prereqDiv);
            }
          }

          // تمييز حقل الإدخال
          if (hasDup) {
            inputEl.classList.add("border-rose-400", "ring-1", "ring-rose-400");
          } else if (hasPrereqWarn) {
            inputEl.classList.add("border-amber-400", "ring-1", "ring-amber-300");
            inputEl.classList.remove("border-rose-400", "ring-rose-400");
          } else {
            inputEl.classList.remove("border-rose-400", "ring-1", "ring-rose-400", "border-amber-400", "ring-amber-300");
          }
        });
      });
      lucide.createIcons();
    }

    function recalculateAll() {
      // 1. حساب المعدلات الفصلية للفرقة المعروضة حالياً
      SEMESTER_CONFIGS.forEach(sem => {
        const tbody = document.getElementById(`coursesTableBody-${sem.id}`);
        if (!tbody) return;

        let semAttemptedHours = 0;
        let semPoints = 0;

        let semCourseCount = 0;
        tbody.querySelectorAll("tr").forEach(row => {
          const rowId = row.id;
          const searchVal = (document.getElementById(`search_${rowId}`)?.value || "").trim();
          // تجاهل الصفوف الفارغة التي لم يتم اختيار مقرر لها بعد (لا تدخل في الحساب)
          if (!searchVal) return;

          const credits = parseFloat(document.getElementById(`credits_${rowId}`)?.value) || 0;
          const grade = document.getElementById(`grade_${rowId}`)?.value;

          if (grade === "W") return;

          semCourseCount++;
          const pts = GRADE_POINTS[grade] !== undefined ? GRADE_POINTS[grade] : 0;
          semAttemptedHours += credits;
          semPoints += (credits * pts);
        });

        const semSgpa = semAttemptedHours > 0 ? (semPoints / semAttemptedHours) : 0.00;
        const semHoursEl = document.getElementById(`semHours-${sem.id}`);
        const semSgpaEl = document.getElementById(`semSgpa-${sem.id}`);
        const semBadgeEl = document.getElementById(`semBadge-${sem.id}`);

        if (semHoursEl) semHoursEl.innerText = semAttemptedHours;
        if (semSgpaEl) semSgpaEl.innerText = semSgpa.toFixed(2);
        if (semBadgeEl) semBadgeEl.innerText = `${semCourseCount} مواد`;
      });

      // 2. محرك الحساب التراكمي المتقدم والمعالجة الدقيقة لإعادة المواد والتحسين (Retake Replacement Engine)
      // تجميع كافة المقررات بتسلسل زمني عبر جميع السنوات والفصول
      const coursesChronological = [];
      ALL_BATCHES.forEach(b => {
        let semData = allYearsCourses[b] || {};
        if (b === currentViewYear && typeof getCurrentTableCourses === "function") {
          const liveData = getCurrentTableCourses();
          if (SEMESTER_CONFIGS.some(s => (liveData[s.id] || []).length > 0)) {
            semData = liveData;
          }
        }
        SEMESTER_CONFIGS.forEach(sem => {
          const list = semData[sem.id] || [];
          list.forEach(c => {
            // استبعاد الصفوف الفارغة (لم يتم اختيار مقرر لها) من المعدل التراكمي والتقدم للتخرج
            if (!c.searchVal || !c.searchVal.trim()) return;
            coursesChronological.push({
              code: extractCourseCode(c.searchVal),
              searchVal: c.searchVal,
              credits: c.credits,
              grade: c.grade,
              isRetake: c.isRetake,
              batch: b,
              semId: sem.id
            });
          });
        });
      });

      // قاموس لتتبع المقررات النشطة واستبدال المحاولات السابقة بالتحسين والإعادة
      const activeCoursesMap = {};
      let grandTotalPoints = 0;
      let grandAttemptedHours = 0;
      let grandEarnedHours = 0;
      let compulsoryEarned = 0;
      let electiveEarned = 0;
      let projectEarned = 0;

      coursesChronological.forEach(c => {
        if (c.grade === "W") return;
        const courseKey = c.code || c.searchVal;
        const pts = GRADE_POINTS[c.grade] !== undefined ? GRADE_POINTS[c.grade] : 0;

        // التحقق مما إذا كانت هذه المادة إعادة/تحسين لمادة سابقة مسجلة
        if (c.isRetake && activeCoursesMap[courseKey]) {
          const prev = activeCoursesMap[courseKey];
          // خصم نقاط وساعات المحاولة السابقة
          grandAttemptedHours -= prev.credits;
          grandTotalPoints -= (prev.credits * prev.pts);
          if (prev.grade !== "F") {
            grandEarnedHours -= prev.credits;
            if (prev.isElective) electiveEarned -= prev.credits;
            else if (prev.isProject) projectEarned -= prev.credits;
            else compulsoryEarned -= prev.credits;
          }
        }

        // تحديد سقف الدرجات عند الإعادة بعد الرسوب وفق المادة (20)
        let countedPts = pts;
        if (c.isRetake && activeCoursesMap[courseKey] && activeCoursesMap[courseKey].grade === "F") {
          // إعادة بعد رسوب: سقف التقدير B+ وفق نفس سلم النقاط المعتمد في الموقع
          countedPts = Math.min(RETAKE_CAPS.fail_1.points, pts);
        }

        // إضافة المحاولة الجديدة
        grandAttemptedHours += c.credits;
        grandTotalPoints += (c.credits * countedPts);

        // فحص نوع المادة في الكتالوج
        const catCourse = COURSE_CATALOG.find(cat => cat.code.toUpperCase() === c.code.toUpperCase());
        const isElective = catCourse ? catCourse.type === "اختياري" : false;
        const isProject = (c.code === "CS 498" || c.code === "CS 499");

        if (c.grade !== "F") {
          grandEarnedHours += c.credits;
          if (isElective) electiveEarned += c.credits;
          else if (isProject) projectEarned += c.credits;
          else compulsoryEarned += c.credits;
        }

        activeCoursesMap[courseKey] = {
          credits: c.credits,
          pts: countedPts,
          grade: c.grade,
          isElective,
          isProject
        };
      });

      // دعم الساعات السابقة المدخلة يدوياً
      const studentBatch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
      if (studentBatch !== "الفرقة الأولى" && grandAttemptedHours === 0) {
        const pHours = parseFloat(document.getElementById("prevHoursInput")?.value) || 0;
        const pGpa = parseFloat(document.getElementById("prevGpaInput")?.value) || 0;
        grandAttemptedHours += pHours;
        grandTotalPoints += (pHours * pGpa);
        grandEarnedHours += pHours;
        compulsoryEarned += pHours;
      }

      const overallCgpa = grandAttemptedHours > 0 ? (grandTotalPoints / grandAttemptedHours) : 0.00;
      
      const cgpaDisplay = document.getElementById("cumulativeGpaDisplay");
      const creditsDisplay = document.getElementById("totalCreditsDisplay");
      if (cgpaDisplay) cgpaDisplay.innerText = overallCgpa.toFixed(2);
      if (creditsDisplay) creditsDisplay.innerText = grandEarnedHours;

      // حفظ مجاميع الحساب الحالية لعرضها في شرح "كيف حُسب المعدل؟"
      window.lastCgpaCalc = {
        points: grandTotalPoints,
        hours: grandAttemptedHours,
        cgpa: overallCgpa
      };
      if (typeof updateCalcExplanation === "function") updateCalcExplanation();

      // 3. فحص سقف التسجيل الفصلي وعرض التنبيهات الذكية (Credit Limits Validation)
      SEMESTER_CONFIGS.forEach(sem => {
        const limitInfo = getMaxAllowedSemesterCredits(overallCgpa, sem.id, grandEarnedHours);
        const maxAllowed = limitInfo.max;
        const semHoursEl = document.getElementById(`semHours-${sem.id}`);
        const maxLimitEl = document.getElementById(`semMaxLimit-${sem.id}`);
        const badgeEl = document.getElementById(`semCreditBadge-${sem.id}`);
        const warnBanner = document.getElementById(`semLimitWarning-${sem.id}`);

        if (maxLimitEl) maxLimitEl.innerText = maxAllowed;

        const currentHours = parseFloat(semHoursEl?.innerText) || 0;
        if (currentHours > maxAllowed) {
          if (badgeEl) {
            badgeEl.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 animate-pulse";
          }
          if (warnBanner) {
            warnBanner.classList.remove("hidden");
            warnBanner.innerHTML = `
              <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600 shrink-0"></i>
              <span>تنبيه اللائحة (المادة 14): تجاوزت سقف التسجيل المسموح لمعدلك (${maxAllowed} ساعة)؛ ساعتك المسجلة حالياً ${currentHours} ساعة.</span>
            `;
          }
        } else {
          if (badgeEl) {
            badgeEl.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200";
          }
          if (warnBanner) {
            warnBanner.classList.add("hidden");
          }
        }
      });

      // 4. تحديث مؤشرات التخرج الإجبارية والاختيارية ومشروع التخرج (سقف 24 س للمواد الاختيارية)
      const countedCompulsory = Math.min(104, compulsoryEarned);
      const countedElective = Math.min(24, electiveEarned); // الالتزام بسقف 24 ساعة للمقررات الاختيارية المحددة باللائحة
      const countedProject = Math.min(6, projectEarned);
      const gradCountedEarned = countedCompulsory + countedElective + countedProject;

      const totalReq = 134;
      const remainingHours = Math.max(0, totalReq - gradCountedEarned);
      const progressPercent = Math.min(100, Math.max(0, (gradCountedEarned / totalReq) * 100));

      const gradEarnedEl = document.getElementById("gradEarnedHours");
      const gradRemEl = document.getElementById("gradRemainingHours");
      const gradPctEl = document.getElementById("gradPercentText");
      const gradBarEl = document.getElementById("gradProgressBar");

      if (gradEarnedEl) {
        if (electiveEarned > 24) {
          gradEarnedEl.innerHTML = `${gradCountedEarned} ساعة <span class="text-[10px] text-amber-700 block font-normal">(محتسبة للتخرج من إجمالي ${grandEarnedHours} س مجتازة)</span>`;
        } else {
          gradEarnedEl.innerText = `${gradCountedEarned} ساعة`;
        }
      }

      if (gradRemEl) {
        if (remainingHours === 0) {
          gradRemEl.innerHTML = `<span class="text-emerald-700 font-black">أتممت متطلبات التخرج 🎓</span>`;
        } else {
          const parts = [];
          if (104 - countedCompulsory > 0) parts.push(`${104 - countedCompulsory} إجباري`);
          if (24 - countedElective > 0) parts.push(`${24 - countedElective} اختياري`);
          if (6 - countedProject > 0) parts.push(`${6 - countedProject} مشروع`);
          gradRemEl.innerHTML = `${remainingHours} ساعة <span class="text-[10px] text-slate-500 block font-normal">(${parts.join(' + ')})</span>`;
        }
      }

      if (gradPctEl) gradPctEl.innerText = `${progressPercent.toFixed(1)}%`;
      if (gradBarEl) gradBarEl.style.width = `${progressPercent}%`;

      // المقررات الإجبارية (104 ساعة) والاختيارية (24 ساعة) ومشروع التخرج (6 ساعات)
      const compEl = document.getElementById("gradCompulsoryHours");
      const compBar = document.getElementById("gradCompulsoryBar");
      const electEl = document.getElementById("gradElectiveHours");
      const electBar = document.getElementById("gradElectiveBar");
      const electRemEl = document.getElementById("gradElectiveRemText");
      const projEl = document.getElementById("gradProjectHours");
      const projStatusEl = document.getElementById("gradProjectStatus");

      if (compEl) compEl.innerText = countedCompulsory;
      if (compBar) compBar.style.width = `${Math.min(100, (compulsoryEarned / 104) * 100)}%`;

      if (electEl) electEl.innerText = countedElective;
      if (electBar) electBar.style.width = `${Math.min(100, (electiveEarned / 24) * 100)}%`;
      if (electRemEl) {
        if (electiveEarned > 24) {
          const surplus = electiveEarned - 24;
          electRemEl.innerHTML = `<span class="text-emerald-800 font-bold">اكتملت 24 س اختيارية ✓</span> <span class="text-amber-800 text-[10px] block font-semibold">(لديك ${surplus} س إضافية لا تعوض المواد الإجبارية الناقصة)</span>`;
        } else {
          const electCoursesRem = Math.max(0, Math.ceil((24 - electiveEarned) / 3));
          electRemEl.innerText = electCoursesRem === 0 ? "اكتملت الساعات الاختيارية بنجاح ✓" : `المتبقي: ${electCoursesRem} مواد اختيارية (${Math.max(0, 24 - electiveEarned)} ساعة)`;
        }
      }

      if (projEl) projEl.innerText = countedProject;
      if (projStatusEl) {
        if (projectEarned >= 6) {
          projStatusEl.innerText = "اكتمل مشروع التخرج بنجاح (CS 498 & 499) 🎓";
          projStatusEl.className = "text-[10px] text-emerald-800 font-bold block mt-1";
        } else if (grandEarnedHours >= 94) {
          projStatusEl.innerText = "مستوفٍ لشرط الساعات (94+ ساعة) ومؤهل للتسجيل ✓";
          projStatusEl.className = "text-[10px] text-emerald-700 font-bold block mt-1";
        } else {
          projStatusEl.innerText = `متبقي ${94 - grandEarnedHours} ساعة لاستيفاء شرط تسجيل المشروع (المادة 23)`;
          projStatusEl.className = "text-[10px] text-purple-800 font-semibold block mt-1";
        }
      }

      // تحديث شروط التدريب الصيفي 1 و 2
      let t1Notice = document.getElementById("summerTrain1Notice");
      let t2Notice = document.getElementById("summerTrain2Notice");
      if (t1Notice) {
        t1Notice.innerText = grandEarnedHours >= 30 ? "مستوفٍ لشرط الساعات (30+ ساعة) وجاهز للتسجيل ✓" : `متبقي ${30 - grandEarnedHours} ساعة لفتح شرط التسجيل (المادة 22)`;
      }
      if (t2Notice) {
        t2Notice.innerText = grandEarnedHours >= 60 ? "مستوفٍ لشرط الساعات (60+ ساعة) وجاهز للتسجيل ✓" : `متبقي ${60 - grandEarnedHours} ساعة لفتح شرط التسجيل (المادة 22)`;
      }

      // تقدير الحرف والتنبيهات
      const cgpaLetterEl = document.getElementById("cgpaGradeLetter");
      const cgpaTextEl = document.getElementById("cgpaEstimateText");
      if (cgpaLetterEl && cgpaTextEl) {
        if (grandAttemptedHours === 0) {
          cgpaLetterEl.innerText = "-";
          cgpaTextEl.innerText = "لم يتم تسجيل مقررات بعد";
        } else if (overallCgpa >= 3.60) {
          cgpaLetterEl.innerText = "A+ / ممتاز مرتفع";
          cgpaTextEl.innerText = "أداء أكاديمي استثنائي وممتاز جداً 🌟";
        } else if (overallCgpa >= 3.00) {
          cgpaLetterEl.innerText = "B+ / جيد جداً";
          cgpaTextEl.innerText = "معدل جيد جداً ومؤهل لمرتبة الشرف 👏";
        } else if (overallCgpa >= 2.40) {
          cgpaLetterEl.innerText = "C / جيد";
          cgpaTextEl.innerText = "معدل مستقر في النطاق الجيد 👍";
        } else if (overallCgpa >= 2.00) {
          cgpaLetterEl.innerText = "D+ / مقبول";
          cgpaTextEl.innerText = "فوق الحد الأدنى للتخرج مباشرة ⚠️";
        } else {
          cgpaLetterEl.innerText = "F / إنذار أكاديمي";
          cgpaTextEl.innerText = "المعدل تحت 2.00 — في منطقة خطر الإنذار 🚨";
        }
      }

      
      // 4.5. فحص قيود الساعات المعتمدة وأهلية التدريب الصيفي بذكاء
      if (typeof getMaxAllowedSemesterCredits === "function") {
        SEMESTER_CONFIGS.forEach(sem => {
          const semHoursEl = document.getElementById(`semHours-${sem.id}`);
          const currentHours = semHoursEl ? (parseFloat(semHoursEl.innerText) || 0) : 0;
          const limitInfo = getMaxAllowedSemesterCredits(overallCgpa, sem.id, grandEarnedHours);
          
          let warnBanner = document.getElementById(`semLimitWarn-${sem.id}`);
          if (currentHours > limitInfo.max) {
            if (!warnBanner) {
              const tbody = document.getElementById(`coursesTableBody-${sem.id}`);
              if (tbody && tbody.parentElement) {
                warnBanner = document.createElement("div");
                warnBanner.id = `semLimitWarn-${sem.id}`;
                warnBanner.className = "credits-warning-banner mb-3";
                tbody.parentElement.parentElement.insertBefore(warnBanner, tbody.parentElement);
              }
            }
            if (warnBanner) {
              warnBanner.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i><span>تنبيه لائحي: الساعات المسجلة (${currentHours} س) تجاوزت الحد المسموح به (${limitInfo.max} س). ${limitInfo.reason}</span>`;
              warnBanner.classList.remove("hidden");
            }
          } else if (warnBanner) {
            warnBanner.classList.add("hidden");
          }
        });
      }

      // تحديث حالة أهلية التدريب الصيفي
      t1Notice = document.getElementById("summerTrain1Notice");
      t2Notice = document.getElementById("summerTrain2Notice");
      const t1Box = document.getElementById("summerTrain1Box");
      const t2Box = document.getElementById("summerTrain2Box");
      const cb1 = document.getElementById("checkSummerTrain1");
      const cb2 = document.getElementById("checkSummerTrain2");

      if (t1Notice && t1Box) {
        if (cb1 && cb1.checked) {
          t1Notice.innerHTML = "<span class='text-emerald-700 font-bold'>تم إنجاز التدريب الصيفي الأول بنجاح ✓</span>";
          t1Box.className = "flex items-start gap-2.5 p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 transition cursor-pointer select-none";
        } else if (grandEarnedHours >= 30) {
          t1Notice.innerHTML = `<span class='text-emerald-600 font-bold'>أنت مؤهل للتسجيل الآن ✓ (أنجزت ${grandEarnedHours} من 30 س)</span>`;
          t1Box.className = "flex items-start gap-2.5 p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50/40 transition cursor-pointer select-none";
        } else {
          t1Notice.innerHTML = `<span class='text-slate-500'>غير مؤهل بعد: أنجزت ${grandEarnedHours} س من 30 س المطلوبة (متبقي ${30 - grandEarnedHours} س)</span>`;
          t1Box.className = "flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer select-none";
        }
      }

      if (t2Notice && t2Box) {
        if (cb2 && cb2.checked) {
          t2Notice.innerHTML = "<span class='text-emerald-700 font-bold'>تم إنجاز التدريب الصيفي الثاني بنجاح ✓</span>";
          t2Box.className = "flex items-start gap-2.5 p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 transition cursor-pointer select-none";
        } else if (grandEarnedHours >= 60 && cb1 && cb1.checked) {
          t2Notice.innerHTML = `<span class='text-emerald-600 font-bold'>أنت مؤهل للتسجيل الآن ✓ (أنجزت ${grandEarnedHours} من 60 س وأنهيت تدريب 1)</span>`;
          t2Box.className = "flex items-start gap-2.5 p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50/40 transition cursor-pointer select-none";
        } else {
          const reason = !cb1?.checked ? "يلزم إتمام التدريب الأول أولاً" : `متبقي ${Math.max(0, 60 - grandEarnedHours)} س`;
          t2Notice.innerHTML = `<span class='text-slate-500'>غير مؤهل بعد: (${reason})</span>`;
          t2Box.className = "flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer select-none";
        }
      }

      // 5. حساب الإنذارات الأكاديمية المتتالية بدقة وفق المادة (21) وسؤال الفرق 2 إلى 4
      const warningBadge = document.getElementById("warningBadge");
      const warningDetail = document.getElementById("warningDetailText");
      const warnCount = document.getElementById("consecutiveWarningsCount");

      if (warningBadge && warningDetail && warnCount) {
        const studentBatch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
        const hasPriorWarn = document.getElementById("priorWarnRadioYes")?.checked || false;
        const priorWarnCount = hasPriorWarn ? (parseInt(document.getElementById("priorWarningsCountSelect")?.value) || 1) : 0;
        const pHours = parseFloat(document.getElementById("prevHoursInput")?.value) || 0;
        const pGpa = parseFloat(document.getElementById("prevGpaInput")?.value) || 0;

        let initialWarnings = 0;
        if (studentBatch !== "الفرقة الأولى") {
          if (hasPriorWarn) {
            initialWarnings = priorWarnCount;
          } else if (pHours > 0 && pGpa < 2.00 && pGpa > 0) {
            initialWarnings = 1;
          }
        }

        // تتبع المعدل التراكمي في نهاية كل فصل دراسي مسجل لحساب الإنذارات المتتالية بدقة
        let runningAttempted = (studentBatch !== "الفرقة الأولى") ? pHours : 0;
        let runningPoints = (studentBatch !== "الفرقة الأولى") ? (pHours * pGpa) : 0;
        let consecutiveWarnings = initialWarnings;
        let anySemesterCalculated = false;

        ALL_BATCHES.forEach(b => {
          const semData = (b === currentViewYear) ? getCurrentTableCourses() : (allYearsCourses[b] || {});
          SEMESTER_CONFIGS.forEach(sem => {
            const list = semData[sem.id] || [];
            let semAttempted = 0;
            let semPts = 0;

            list.forEach(c => {
              if (c.grade === "W") return;
              const pts = GRADE_POINTS[c.grade] !== undefined ? GRADE_POINTS[c.grade] : 0;
              semAttempted += c.credits;
              semPts += (c.credits * pts);
            });

            if (semAttempted > 0) {
              anySemesterCalculated = true;
              runningAttempted += semAttempted;
              runningPoints += semPts;
              const semEndingCgpa = runningAttempted > 0 ? (runningPoints / runningAttempted) : 0;

              if (semEndingCgpa < 2.00) {
                consecutiveWarnings++;
              } else {
                consecutiveWarnings = 0; // زال الإنذار لارتفاع المعدل التراكمي فوق 2.00
              }
            }
          });
        });

        if (!anySemesterCalculated) {
          if (studentBatch !== "الفرقة الأولى" && (hasPriorWarn || (pHours > 0 && pGpa < 2.00))) {
            consecutiveWarnings = initialWarnings;
          } else if (overallCgpa < 2.00 && grandAttemptedHours > 0) {
            consecutiveWarnings = Math.max(1, initialWarnings);
          } else {
            consecutiveWarnings = 0;
          }
        }

        // إذا كان المعدل التراكمي الكلي حالياً 2.00 فما فوق، الإنذارات المتتالية الحالية تُصفَّر
        // لكن إذا أدخل الطالب إنذارات سابقة يدوياً، تُعرض كسجل تاريخي
        const currentlyOnWarning = !(overallCgpa >= 2.00 || grandAttemptedHours === 0);
        if (!currentlyOnWarning) {
          consecutiveWarnings = 0;
        }

        // الإنذارات التي تُعرض في اللوحة: الحالية إن وُجدت، وإلا الإنذارات القديمة كسجل
        const displayWarnings = consecutiveWarnings > 0 ? consecutiveWarnings : (hasPriorWarn ? priorWarnCount : 0);
        const isHistoricalOnly = consecutiveWarnings === 0 && displayWarnings > 0;

        const cappedConsecutive = Math.min(4, displayWarnings);
        warnCount.innerText = `${cappedConsecutive} / 4`;

        for (let i = 1; i <= 4; i++) {
          const el = document.getElementById(`warn-step-${i}`);
          if (el) {
            if (i <= displayWarnings) {
              if (isHistoricalOnly) {
                // إنذارات قديمة مُدخلة يدوياً - لون رمادي-بنفسجي للدلالة على أنها سجل تاريخي
                el.className = "h-2.5 rounded-full bg-slate-400 transition-colors";
              } else if (displayWarnings >= 4) {
                el.className = "h-2.5 rounded-full bg-rose-600 animate-pulse transition-colors";
              } else if (displayWarnings === 3) {
                el.className = "h-2.5 rounded-full bg-rose-500 transition-colors";
              } else if (displayWarnings === 2) {
                el.className = "h-2.5 rounded-full bg-amber-500 transition-colors";
              } else {
                el.className = "h-2.5 rounded-full bg-rose-400 transition-colors";
              }
            } else {
              el.className = "h-2.5 rounded-full bg-slate-200 transition-colors";
            }
          }
        }

        if (displayWarnings === 0) {
          warningBadge.innerText = "حالة ممتازة";
          warningBadge.className = "text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800";
          warningDetail.innerText = "المعدل أعلى من 2.00 (الحد الآمن). لا توجد إنذارات أكاديمية قائمة.";
        } else if (isHistoricalOnly) {
          // عرض الإنذارات القديمة كسجل تاريخي
          const warnLabel = displayWarnings === 1 ? "إنذار واحد" : displayWarnings === 2 ? "إنذاران" : `${displayWarnings} إنذارات`;
          warningBadge.innerText = `سجل سابق: ${warnLabel}`;
          warningBadge.className = "text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700";
          warningDetail.innerText = `📋 سجل تاريخي: تم تسجيل ${warnLabel} أكاديمية سابقة. المعدل الحالي جيد (أعلى من 2.00)، لكن الإنذارات السابقة مُدرجة في السجل الأكاديمي.`;
        } else if (displayWarnings === 1) {
          warningBadge.innerText = "إنذار أول (1 / 4)";
          warningBadge.className = "text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800";
          warningDetail.innerText = "إنذار أكاديمي أول: انخفض المعدل عن 2.00. أنت تحت الملاحظة الأكاديمية (الحد الأقصى للتسجيل 12-14 ساعة معتمدة - المادة 14 & 21).";
        } else if (displayWarnings === 2) {
          warningBadge.innerText = "إنذار ثانٍ (2 / 4)";
          warningBadge.className = "text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900";
          warningDetail.innerText = "إنذار أكاديمي ثانٍ متتالي: استمرار انخفاض المعدل عن 2.00 لفصلين متتاليين. يجب التركيز على رفع المعدل لتفادي الإنذار الثالث.";
        } else if (displayWarnings === 3) {
          warningBadge.innerText = "إنذار ثالث حرج (3 / 4)";
          warningBadge.className = "text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300 animate-pulse";
          warningDetail.innerText = "⚠️ إنذار أكاديمي ثالث متتالي! وضع أكاديمي حرج للغاية. إنذار رابع متتالي يؤدي إلى الفصل النهائي من المعهد (المادة 21-ب).";
        } else {
          warningBadge.innerText = "فصل أكاديمي (4 / 4)";
          warningBadge.className = "text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse shadow-sm";
          warningDetail.innerText = "🚨 تجاوزت 4 إنذارات أكاديمية متتالية: تنص اللائحة (المادة 21-ب) على الفصل الأكاديمي النهائي، ما لم يمنحك مجلس الإدارة فصلاً استثنائياً وفق المادة (21-ج).";
        }
      }

      // فحص صفوف الجدول الحالي وتنبيهات المتطلبات السابقة والتكرار
      validateCurrentTableRows();

      // تحديث الخريطة البصرية إن كانت مفتوحة
      if (typeof renderVisualPrerequisitesGraph === "function") {
        renderVisualPrerequisitesGraph(document.getElementById("treeSearchInput")?.value || "");
      }
    }

    // ==========================================
    // SMART SUITE TOOLS LOGIC
    // ==========================================

    // مصفوفة التقديرات وأسماؤها بالعربي
    /* GRADE_FULL_NAMES in config.js */

    function formatGradeCountsText(grade, count) {
      const gName = GRADE_FULL_NAMES[grade] || grade;
      if (count === 1) return `مادة واحدة بتقدير <strong>${gName}</strong>`;
      if (count === 2) return `مادتين بتقدير <strong>${gName}</strong>`;
      if (count >= 3 && count <= 10) return `${count} مواد بتقدير <strong>${gName}</strong>`;
      return `${count} مادة بتقدير <strong>${gName}</strong>`;
    }

    function getBenchmarkGradeInfo(sgpa) {
      if (sgpa > 3.70) return { title: "امتياز مرتفع (A+)", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      if (sgpa > 3.40) return { title: "امتياز (A)", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      if (sgpa > 3.20) return { title: "امتياز منخفض (A-)", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      if (sgpa > 3.00) return { title: "جيد جداً مرتفع (B+)", badge: "bg-teal-100 text-teal-800 border-teal-300" };
      if (sgpa > 2.80) return { title: "جيد جداً (B)", badge: "bg-teal-100 text-teal-800 border-teal-300" };
      if (sgpa > 2.60) return { title: "جيد جداً منخفض (B-)", badge: "bg-blue-100 text-blue-800 border-blue-300" };
      if (sgpa > 2.40) return { title: "جيد مرتفع (C+)", badge: "bg-indigo-100 text-indigo-800 border-indigo-300" };
      if (sgpa > 2.20) return { title: "جيد (C)", badge: "bg-amber-100 text-amber-800 border-amber-300" };
      if (sgpa > 2.00) return { title: "جيد منخفض (C-)", badge: "bg-amber-100 text-amber-800 border-amber-300" };
      return { title: "مقبول مرتفع (D+)", badge: "bg-rose-100 text-rose-800 border-rose-300" };
    }

    // محرك التوجيه الذكي للتقديرات المطلوب تحقيقها في المواد
    function generateSmartGradeGuidance(requiredSgpa, totalHours, mode, hOld, oldGpa, targetGpa) {
      const numCourses = Math.max(1, Math.round(totalHours / 3));

      // 1. حالة المستحيل في فصل واحد (المطلوب أكثر من 4.00)
      if (requiredSgpa > 4.00) {
        const maxPossibleCgpa = ((4.00 * totalHours) + (oldGpa * hOld)) / (hOld + totalHours);
        
        let timelineAdvice = "";
        if (mode === "target" && targetGpa < 4.00 && targetGpa > oldGpa) {
          const hoursAt37 = Math.ceil(((targetGpa - oldGpa) * hOld) / (3.70 - targetGpa));
          const semsAt37 = Math.ceil(hoursAt37 / 18);
          const hoursAt40 = Math.ceil(((targetGpa - oldGpa) * hOld) / (4.00 - targetGpa));
          const semsAt40 = Math.ceil(hoursAt40 / 18);

          timelineAdvice = `
            <div class="mt-3.5 pt-3.5 border-t border-amber-300/70 text-xs">
              <strong class="block text-slate-800 mb-2 font-black flex items-center gap-1.5">
                <i data-lucide="compass" class="w-4 h-4 text-amber-700"></i>
                <span>خطة الفصول القادمة للوصول لهدفك (${targetGpa.toFixed(2)}):</span>
              </strong>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div class="p-2.5 bg-white/80 rounded-xl border border-amber-200">
                  <span class="block font-bold text-emerald-800 mb-0.5">مسار الامتياز الكامل (A+ / 4.00):</span>
                  <span>تحتاج حوالي <strong>${semsAt40} فصول دراسية</strong> متتالية (نحو ${hoursAt40} ساعة معتمدة بتقدير A+).</span>
                </div>
                <div class="p-2.5 bg-white/80 rounded-xl border border-amber-200">
                  <span class="block font-bold text-teal-800 mb-0.5">مسار الامتياز (A / 3.70):</span>
                  <span>تحتاج حوالي <strong>${semsAt37} فصول دراسية</strong> متتالية (نحو ${hoursAt37} ساعة معتمدة بتقدير A).</span>
                </div>
              </div>
            </div>
          `;
        } else if (mode === "probation") {
          timelineAdvice = `
            <div class="mt-3 pt-3 border-t border-rose-200 text-xs text-rose-900 leading-relaxed">
              💡 <strong>نصيحة لائحة المعهد للخروج من الإنذار:</strong> ننصحك بتسجيل عبء ساعات إضافي أو إعادة المقررات الراسبة (F) حيث تتيح المادة (20) استبدال نقاط الرسوب بالتقدير الجديد مباشرة لرفع المعدل بشكل أسرع.
            </div>
          `;
        }

        const alertTitle = mode === "probation"
          ? "⚠️ وضع أكاديمي حرج للغاية! رفع المعدل فوق 2.00 مستحيل في هذا الفصل وحده بهذا العبء"
          : "عفواً، الوصول لهذا المعدل المستهدف مستحيل رياضياً في فصل واحد!";

        return `
          <div class="space-y-3">
            <div class="flex items-start gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow">✕</div>
              <div>
                <strong class="text-rose-700 font-black text-sm block mb-1">${alertTitle}</strong>
                <p class="text-xs text-slate-700 leading-relaxed">
                  المعدل الفصلي المطلوب تحقيقه هو: <strong class="text-rose-700 font-mono text-sm">${requiredSgpa.toFixed(2)}</strong> (وهو أعلى من الحد الأقصى للمعدل 4.00).
                </p>
              </div>
            </div>

            <div class="bg-white/95 p-4 rounded-xl border border-amber-200 shadow-xs text-xs leading-relaxed space-y-2">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="text-slate-700 font-bold">🎯 أقصى معدل تراكمي يمكنك بلوغه نهاية هذا الفصل:</span>
                <span class="text-emerald-800 font-mono font-black text-sm bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg">${maxPossibleCgpa.toFixed(2)} / 4.00</span>
              </div>
              <p class="text-slate-700">
                <strong>التقديرات التي يجب أن تجيبها في المواد:</strong> للوصول لأقصى معدل ممكن (${maxPossibleCgpa.toFixed(2)})، يجب أن تحصل على تقدير <strong>امتياز مرتفع A+ (4.00) في جميع المواد الـ ${numCourses} المسجلة لهذا الفصل</strong> دون أي نقصان.
              </p>
            </div>

            ${timelineAdvice}
          </div>
        `;
      }

      // 2. حالة الهدف المحقق مسبقاً
      if (requiredSgpa <= 0) {
        return `
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2 text-emerald-800 font-black text-sm">
              <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">✓</span>
              <span>هدف محقق بالفعل وأنت في منطقة الأمان التام!</span>
            </div>
            <p class="text-slate-700 leading-relaxed">
              معدلك التراكمي الحالي أعلى بالفعل من المعدل المطلوب.
            </p>
            <div class="bg-white p-3 rounded-xl border border-emerald-200 text-slate-700 leading-relaxed">
              <strong>التقديرات المطلوبة:</strong> يكفيك اجتياز مقررات هذا الفصل بتقديرات عادية (<strong>C أو D+</strong>) للحفاظ التام على موقعك الأكاديمي.
            </div>
          </div>
        `;
      }

      // 3. حالة الهدف الممكن (0 < requiredSgpa <= 4.00)
      const bench = getBenchmarkGradeInfo(requiredSgpa);

      const gradeKeysDesc = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+"];
      let uniformGrade = "A+";
      for (let i = gradeKeysDesc.length - 1; i >= 0; i--) {
        if (GRADE_POINTS[gradeKeysDesc[i]] >= requiredSgpa) {
          uniformGrade = gradeKeysDesc[i];
          break;
        }
      }

      const allCombos = [];
      const testGrades = ["A+", "A", "B+", "B", "C+", "C", "D+"];
      
      function searchCombos(curr, start) {
        if (curr.length === numCourses) {
          const sum = curr.reduce((acc, g) => acc + GRADE_POINTS[g], 0);
          const avg = sum / numCourses;
          if (avg >= requiredSgpa && avg <= requiredSgpa + 0.32) {
            allCombos.push({ combo: [...curr], avg });
          }
          return;
        }
        if (allCombos.length > 100) return;
        for (let i = start; i < testGrades.length; i++) {
          curr.push(testGrades[i]);
          searchCombos(curr, i);
          curr.pop();
        }
      }
      searchCombos([], 0);
      allCombos.sort((a, b) => a.avg - b.avg);

      const selectedPlans = [];

      // الخطة 1: المتوازنة المباشرة
      selectedPlans.push({
        title: "الخطة (1) - المتوازنة والأسهل:",
        desc: `الحصول على تقدير <strong>${GRADE_FULL_NAMES[uniformGrade]}</strong> في جميع المواد الـ ${numCourses}`,
        sgpa: GRADE_POINTS[uniformGrade].toFixed(2)
      });

      // الخطة 2: المرنة التعويضية
      const flexibleCombo = allCombos.find(c => {
        const hasHigh = c.combo.includes("A") || c.combo.includes("A+");
        const hasLow = c.combo.some(g => GRADE_POINTS[g] < GRADE_POINTS[uniformGrade]);
        return hasHigh && hasLow;
      });

      if (flexibleCombo) {
        const counts = {};
        flexibleCombo.combo.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
        const parts = Object.entries(counts).map(([g, count]) => formatGradeCountsText(g, count));
        selectedPlans.push({
          title: "الخطة (2) - المرنة (تعويض مادة بأخرى):",
          desc: parts.join(' + '),
          sgpa: flexibleCombo.avg.toFixed(2)
        });
      }

      // الخطة 3: الأمان المرتفع
      const safeCombo = allCombos.find(c => c.avg >= requiredSgpa + 0.15 && c !== flexibleCombo);
      if (safeCombo) {
        const counts = {};
        safeCombo.combo.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
        const parts = Object.entries(counts).map(([g, count]) => formatGradeCountsText(g, count));
        selectedPlans.push({
          title: "الخطة (3) - الأمان المرتفع (لتفوق أكاديمي):",
          desc: parts.join(' + '),
          sgpa: safeCombo.avg.toFixed(2)
        });
      }

      const plansHtml = selectedPlans.map(p => `
        <div class="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div class="text-xs">
            <span class="font-extrabold text-slate-900 block sm:inline ml-1">${p.title}</span>
            <span class="text-slate-700 leading-relaxed">${p.desc}</span>
          </div>
          <span class="shrink-0 text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg">معدل: ${p.sgpa}</span>
        </div>
      `).join('');

      const mainHeadline = mode === "probation"
        ? `تحتاج إلى معدل فصلي أدنى قدره: <strong class="text-xl font-black text-amber-900 mx-1 font-mono">${requiredSgpa.toFixed(2)}</strong> لرفع معدلك فوق 2.00 وتفادي الإنذار.`
        : `عليك تحقيق معدل فصلي (SGPA) لا يقل عن: <strong class="text-xl font-black text-emerald-700 mx-1 font-mono">${requiredSgpa.toFixed(2)}</strong> للوصول إلى المعدل المستهدف.`;

      return `
        <div class="space-y-3.5">
          <div>
