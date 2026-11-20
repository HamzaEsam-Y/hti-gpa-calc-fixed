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
  // بوابة أول دخول بعد اختفاء شاشة الدخول: لو الملف مكتمل نفحص المقررات السابقة وسؤال الإنذارات
  setTimeout(() => {
    const profileModal = document.getElementById("profile-modal");
    const profileOpen = profileModal && !profileModal.classList.contains("hidden");
    if (!profileOpen && typeof runFirstEntryGate === "function") runFirstEntryGate();
  }, 500);
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

      const studentBatchNow = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
      const currentBatchIdxNow = ALL_BATCHES.indexOf(studentBatchNow);

      // خريطة مقررات السنوات السابقة لمعالجة إعادة مقرر مضمّن في رصيد المعدل السابق
      const priorCoursesMap = {};
      if (currentBatchIdxNow > 0) {
        ALL_BATCHES.slice(0, currentBatchIdxNow).forEach(b => {
          SEMESTER_CONFIGS.forEach(s => {
            (((allYearsCourses[b] || {})[s.id]) || []).forEach(pc => {
              const pcCode = extractCourseCode(pc.searchVal);
              if (pcCode) priorCoursesMap[pcCode] = { credits: parseInt(pc.credits) || 3, grade: pc.grade || "", gradeConfirmed: pc.gradeConfirmed === true };
            });
          });
        });
      }
      window.retakeAnchorNotes = [];
      let priorRetakeAdjHours = 0;
      let priorRetakeAdjPoints = 0;

      coursesChronological.forEach(c => {
        if (c.grade === "W") return;
        if (ALL_BATCHES.indexOf(c.batch) < currentBatchIdxNow) return;
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

        // إعادة مقرر محاولة سابقة مضمّنة في رصيد (ساعات/معدل) السنوات السابقة
        let skipEarnedForPriorRetake = false;
        if (c.isRetake && !activeCoursesMap[courseKey] && currentBatchIdxNow > 0) {
          const priorRec = priorCoursesMap[courseKey];
          const priorPassed = priorRec && priorRec.grade !== "F" && priorRec.grade !== "W";
          if (priorPassed) {
            // ساعاته محتسبة مسبقاً ضمن الساعات المكتسبة السابقة: لا تُضف ثانية
            skipEarnedForPriorRetake = true;
            if (priorRec.grade && priorRec.gradeConfirmed && GRADE_POINTS[priorRec.grade] !== undefined) {
              // تقدير المحاولة السابقة أكّده الطالب صراحة: تُستبدل نقاطها وساعاتها من الرصيد بدقة
              priorRetakeAdjHours += priorRec.credits;
              priorRetakeAdjPoints += priorRec.credits * GRADE_POINTS[priorRec.grade];
            } else {
              window.retakeAnchorNotes.push(courseKey);
            }
          } else {
            // محاولة سابقة غير مسجلة أو راسبة: تقديرها غير معروف من المجموع وحده
            window.retakeAnchorNotes.push(courseKey);
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

        if (c.grade !== "F" && !skipEarnedForPriorRetake) {
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
      if (studentBatch !== "الفرقة الأولى") {
        let pHours = parseFloat(document.getElementById("prevHoursInput")?.value) || 0;
        if (pHours === 0 && currentBatchIdxNow > 0) { ALL_BATCHES.slice(0, currentBatchIdxNow).forEach(b => { SEMESTER_CONFIGS.forEach(s => { (((allYearsCourses[b] || {})[s.id]) || []).forEach(c => { if (c.grade !== "F" && c.grade !== "W") pHours += (parseInt(c.credits) || 0); }); }); }); }
        const pGpa = parseFloat(document.getElementById("prevGpaInput")?.value) || 0;
        grandAttemptedHours += pHours;
        grandTotalPoints += (pHours * pGpa);
        grandEarnedHours += pHours;
        compulsoryEarned += pHours;
        grandAttemptedHours -= priorRetakeAdjHours;
        grandTotalPoints -= priorRetakeAdjPoints;
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
            <p class="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed mb-1.5">
              ${mainHeadline}
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border ${bench.badge} mt-1">
              <span>متوسط التقديرات المطلوب لمواد الفصل:</span>
              <span class="font-black text-sm">${bench.title}</span>
            </div>
          </div>

          <div class="space-y-2 pt-2 border-t border-slate-200/80">
            <div class="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <i data-lucide="check-square" class="w-4 h-4 text-emerald-600"></i>
              <span>أمثلة وخيارات التقديرات التي تجيبها في مواد هذا الفصل (${totalHours} ساعة = ${numCourses} مقررات تقريباً):</span>
            </div>
            <div class="space-y-2">
              ${plansHtml}
            </div>
          </div>
        </div>
      `;
    }

    function calculateTargetGpaTool() {
      const hOld = parseFloat(document.getElementById("t1_Hold").value);
      const oldGpa = parseFloat(document.getElementById("t1_OldGpa").value);
      const hNew = parseFloat(document.getElementById("t1_Hnew").value);
      const targetGpa = parseFloat(document.getElementById("t1_TargetGpa").value);
      const resDiv = document.getElementById("t1_result");

      if (isNaN(hOld) || isNaN(oldGpa) || isNaN(hNew) || isNaN(targetGpa) || hNew <= 0) {
        resDiv.innerHTML = `<span class="text-rose-600 font-bold">يرجى إدخال جميع الحقول بصورة صحيحة.</span>`;
        resDiv.className = "mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm";
        resDiv.classList.remove("hidden");
        return;
      }

      const requiredSgpa = ((targetGpa * (hOld + hNew)) - (oldGpa * hOld)) / hNew;
      resDiv.classList.remove("hidden");

      if (requiredSgpa > 4.00) {
        resDiv.className = "mt-4 p-5 rounded-2xl border border-amber-300 bg-amber-50/90 text-amber-950 text-sm leading-relaxed shadow-sm";
      } else if (requiredSgpa <= 0) {
        resDiv.className = "mt-4 p-5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-sm leading-relaxed shadow-sm";
      } else {
        resDiv.className = "mt-4 p-5 rounded-2xl border border-emerald-300 bg-emerald-50/70 text-slate-800 text-sm leading-relaxed shadow-sm";
      }

      resDiv.innerHTML = generateSmartGradeGuidance(requiredSgpa, hNew, "target", hOld, oldGpa, targetGpa);
      lucide.createIcons();
    }

    function calculateProbationShieldTool() {
      const hOld = parseFloat(document.getElementById("t2_Hold").value);
      const oldGpa = parseFloat(document.getElementById("t2_OldGpa").value);
      const hNew = parseFloat(document.getElementById("t2_Hnew").value);
      const resDiv = document.getElementById("t2_result");

      if (isNaN(hOld) || isNaN(oldGpa) || isNaN(hNew) || hNew <= 0) {
        resDiv.innerHTML = `<span class="text-rose-600 font-bold">يرجى إدخال البيانات بصورة صحيحة.</span>`;
        resDiv.className = "mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm";
        resDiv.classList.remove("hidden");
        return;
      }

      const requiredSgpa = ((2.00 * (hOld + hNew)) - (oldGpa * hOld)) / hNew;
      resDiv.classList.remove("hidden");

      if (requiredSgpa > 4.00) {
        resDiv.className = "mt-4 p-5 rounded-2xl border border-rose-300 bg-rose-50/90 text-rose-950 text-sm leading-relaxed shadow-sm";
      } else if (requiredSgpa <= 0) {
        resDiv.className = "mt-4 p-5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-sm leading-relaxed shadow-sm";
      } else {
        resDiv.className = "mt-4 p-5 rounded-2xl border border-amber-300 bg-amber-50/70 text-slate-800 text-sm leading-relaxed shadow-sm";
      }

      resDiv.innerHTML = generateSmartGradeGuidance(requiredSgpa, hNew, "probation", hOld, oldGpa, 2.00);
      lucide.createIcons();
    }

    let saveTimeout = null;
    function autoSaveAll() {
      saveCurrentTableToState();

      const hasPriorWarn = document.getElementById("priorWarnRadioYes")?.checked || false;
      const priorWarnCount = parseInt(document.getElementById("priorWarningsCountSelect")?.value) || 1;

      const studentData = {
        hasConfiguredPastCourses: hasConfiguredPastCourses,
        pastConfirmedBatches: (typeof getConfirmedPastBatchesRaw === "function" ? getConfirmedPastBatchesRaw() : []),
        priorWarnAnswered: priorWarnAnswered,
        name: document.getElementById("displayStudentName").innerText,
        code: document.getElementById("displayStudentCode").innerText,
        year: document.getElementById("displayAcademicYear").innerText,
        batch: document.getElementById("displayStudentBatch").innerText,
        currentViewYear: currentViewYear,
        prevHours: document.getElementById("prevHoursInput")?.value || "",
        prevGpa: document.getElementById("prevGpaInput")?.value || "",
        hasPriorWarnings: hasPriorWarn,
        priorWarningsCount: priorWarnCount,
        summerTraining: summerTrainingState,
        allYearsCourses: allYearsCourses,
        semesters: allYearsCourses[currentViewYear] || {},
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem("hti_gpa_state_v2", JSON.stringify(studentData));

      if (isFirebaseReady && currentUser) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          db.collection("students").doc(currentUser.uid).set(studentData, { merge: true });
        }, 1000);
      }
    }

    async function loadUserDataFromFirestore(uid) {
      if (!isFirebaseReady || !db) return;
      try {
        const doc = await db.collection("students").doc(uid).get();
        if (doc.exists) {
          const data = doc.data();
          applyLoadedData(data);
          checkProfileCompletion(data);
          // بوابة أول دخول لازم تتنفذ على البيانات السحابية الفعلية بعد تحميلها (ملف مكتمل)
          if (data && data.name && data.code && typeof runFirstEntryGate === "function") runFirstEntryGate();
        } else {
          checkProfileCompletion(null);
        }
      } catch (err) {}
    }

    function loadAllStateFromStorage() {
      const saved = localStorage.getItem("hti_gpa_state_v2");
      if (!saved) {
        return;
      }
      try {
        const data = JSON.parse(saved);
        applyLoadedData(data);
      } catch (e) {}
    }

    function applyLoadedData(data) {
      if (data.name) document.getElementById("displayStudentName").innerText = data.name;
      if (data.code) document.getElementById("displayStudentCode").innerText = data.code;
      if (data.year) document.getElementById("displayAcademicYear").innerText = data.year;
      if (data.batch) {
        document.getElementById("displayStudentBatch").innerText = data.batch;
        document.getElementById("modalStudentBatch").value = data.batch;
      }
      if (data.prevHours !== undefined) document.getElementById("prevHoursInput").value = data.prevHours;
      if (data.prevGpa !== undefined) document.getElementById("prevGpaInput").value = data.prevGpa;
      if (data.hasConfiguredPastCourses !== undefined) hasConfiguredPastCourses = !!data.hasConfiguredPastCourses;
      if (data.pastConfirmedBatches !== undefined && typeof setConfirmedPastBatches === "function") setConfirmedPastBatches(data.pastConfirmedBatches);
      if (data.priorWarnAnswered !== undefined) priorWarnAnswered = !!data.priorWarnAnswered;

      if (data.hasPriorWarnings !== undefined) {
        const yesRadio = document.getElementById("priorWarnRadioYes");
        const noRadio = document.getElementById("priorWarnRadioNo");
        const modalYes = document.getElementById("modalPriorWarnYes");
        const modalNo = document.getElementById("modalPriorWarnNo");
        const wrapper = document.getElementById("priorWarnSelectWrapper");
        const modalWrapper = document.getElementById("modalPriorWarnCountWrapper");

        if (yesRadio && noRadio) {
          yesRadio.checked = !!data.hasPriorWarnings;
          noRadio.checked = !data.hasPriorWarnings;
        }
        if (modalYes && modalNo) {
          modalYes.checked = !!data.hasPriorWarnings;
          modalNo.checked = !data.hasPriorWarnings;
        }
        if (wrapper) wrapper.classList.toggle("hidden", !data.hasPriorWarnings);
        if (modalWrapper) modalWrapper.classList.toggle("hidden", !data.hasPriorWarnings);
      }

      if (data.priorWarningsCount !== undefined) {
        const select = document.getElementById("priorWarningsCountSelect");
        const modalSelect = document.getElementById("modalPriorWarnCount");
        if (select) select.value = data.priorWarningsCount.toString();
        if (modalSelect) modalSelect.value = data.priorWarningsCount.toString();
      }

      if (data.summerTraining) {
        summerTrainingState = data.summerTraining;
        const cb1 = document.getElementById("checkSummerTrain1");
        const cb2 = document.getElementById("checkSummerTrain2");
        if (cb1) cb1.checked = !!summerTrainingState.train1;
        if (cb2) cb2.checked = !!summerTrainingState.train2;
      }

      // استرجاع مقررات كل السنوات
      if (data.allYearsCourses) {
        allYearsCourses = data.allYearsCourses;
      } else if (data.semesters) {
        // ترقية من الإصدار القديم للحفاظ التام على المقررات السابقة
        const b = data.batch || "الفرقة الأولى";
        allYearsCourses = {
          "الفرقة الأولى": { term_1: [], term_2: [], summer_term: [] },
          "الفرقة الثانية": { term_1: [], term_2: [], summer_term: [] },
          "الفرقة الثالثة": { term_1: [], term_2: [], summer_term: [] },
          "الفرقة الرابعة": { term_1: [], term_2: [], summer_term: [] }
        };
        allYearsCourses[b] = data.semesters;
      }

      currentViewYear = data.currentViewYear || data.batch || "الفرقة الأولى";
      handleBatchChange(false);
      loadYearCoursesToTable(currentViewYear);
      recalculateAll();
    }

    // ==============================================================
    // ACADEMIC TRANSCRIPT MODAL & RENDERER (السجل الأكاديمي الشامل)
    // ==============================================================

    function openTranscriptModal() {
      saveCurrentTableToState();
      renderTranscript();
      document.getElementById("transcript-modal").classList.remove("hidden");
      lucide.createIcons();
    }

    function closeTranscriptModal() {
      document.getElementById("transcript-modal").classList.add("hidden");
    }

    function printTranscript() {
      window.print();
    }

    // حذف مقرر فردي من السجل الأكاديمي (Transcript Item Delete)
    function deleteTranscriptCourse(batchName, semId, courseIndex) {

      if (!allYearsCourses[batchName] || !allYearsCourses[batchName][semId]) return;
      const list = allYearsCourses[batchName][semId];
      if (courseIndex < 0 || courseIndex >= list.length) return;

      const course = list[courseIndex];
      const courseTitle = course.searchVal ? course.searchVal.split('-')[0].trim() : 'المقرر';

      if (!confirm(`هل أنت متأكد من رغبتك في حذف ${courseTitle} من سجل ${batchName}؟`)) {
        return;
      }

      deletedCourseHistory.push({ semId, courseData: course });
      list.splice(courseIndex, 1);

      // إذا كانت الفرقة المحذوف منها هي المعروضة حالياً، إعادة تحميل الجدول
      if (batchName === currentViewYear) {
        loadYearCoursesToTable(currentViewYear);
      }

      recalculateAll();
      autoSaveAll();
      renderTranscript();
      lucide.createIcons();

      const undoBtn = document.getElementById("toastUndoBtn");
      if (undoBtn) undoBtn.classList.remove("hidden");

      showToast(`تم حذف المقرر (${courseTitle}) من السجل الأكاديمي بنجاح. 🗑️`);
    }

    // جدول توزيع المقررات القياسي للسنوات السابقة (Standard Curricular Schedule)
    /* STANDARD_COURSE_SCHEDULE in catalog.js */

    /* hasConfiguredPastCourses in config.js */

    // فحص هل الطالب بحاجة لتحديد مقرراته السابقة إجبارياً
    function getConfirmedPastBatchesRaw() { try { const v = JSON.parse(localStorage.getItem("hti_past_confirmed_batches") || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
    function getConfirmedPastBatches() { return getConfirmedPastBatchesRaw().map(function(x){ return (typeof x === "string") ? x : (x && x.b); }).filter(Boolean); }
    function setConfirmedPastBatches(arr) { try { localStorage.setItem("hti_past_confirmed_batches", JSON.stringify(arr)); } catch (e) {} }
    function batchHasRecordedCourses(b) { return !!(allYearsCourses[b] && SEMESTER_CONFIGS.some(function(s) { return ((allYearsCourses[b][s.id]) || []).length > 0; })); }
    // إصلاح ذاتي: نسخة ٢١ نوفمبر (٠٠:٢٦-٠٠:٣٧) كانت تخزّن تأكيد كل الفرق السابقة تلقائياً؛ أي تأكيد قديم غير مدعوم بمقررات مسجلة يُسقط حتى تظهر خطوة التحديد الإجبارية من جديد. التأكيدات الصريحة (explicit) تبقى كما هي حتى لو بلا مقررات (إلغاء تحديد الكل اختيار صحيح).
    function pruneUnbackedConfirmedBatches() {
      const raw = getConfirmedPastBatchesRaw();
      const kept = raw.filter(function(x) {
        if (x && typeof x === "object" && x.explicit) return true;
        const b = (typeof x === "string") ? x : (x && x.b);
        return !!b && batchHasRecordedCourses(b);
      });
      if (kept.length !== raw.length) setConfirmedPastBatches(kept);
      return kept;
    }
    function checkPastCoursesRequirementV2() { const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى"; if (batch === "الفرقة الأولى") { return; } const batchIdx = ALL_BATCHES.indexOf(batch); const raw = pruneUnbackedConfirmedBatches(); let confirmed = raw.map(function(x){ return (typeof x === "string") ? x : (x && x.b); }).filter(Boolean); for (let i = 0; i < batchIdx; i++) { if (confirmed.indexOf(ALL_BATCHES[i]) === -1 && batchHasRecordedCourses(ALL_BATCHES[i])) { confirmed.push(ALL_BATCHES[i]); } } let allConfirmed = true; for (let i = 0; i < batchIdx; i++) { if (confirmed.indexOf(ALL_BATCHES[i]) === -1) { allConfirmed = false; break; } } if (allConfirmed) { hasConfiguredPastCourses = true; return; } hasConfiguredPastCourses = false; setTimeout(function() { showToast("📋 يرجى تحديد المقررات السابقة التي اجتزتها قبل المتابعة", true); openPastCoursesModal(false); }, 300); }

    // بوابة أول دخول موحدة: تحديد المقررات السابقة (إجباري) ثم سؤال الإنذارات الأكاديمية لو لم يُجب عنه من قبل
    function runFirstEntryGate() {
      const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
      if (batch === "الفرقة الأولى") return;
      checkPastCoursesRequirementV2();
      setTimeout(function() {
        if (hasConfiguredPastCourses && !priorWarnAnswered) askPriorWarnings();
      }, 700);
    }

    function askPriorWarnings() {
      const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
      if (batch === "الفرقة الأولى" || priorWarnAnswered) return;
      showToast("⚠️ سؤال مطلوب قبل المتابعة: هل عليك إنذارات أكاديمية سابقة؟ أجب من نافذة الملف الشخصي", true);
      openProfileModal();
      const sec = document.getElementById("modalPriorWarnSection");
      if (sec) {
        sec.classList.remove("hidden");
        sec.classList.add("ring-4", "ring-rose-300");
        sec.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(function() { sec.classList.remove("ring-4", "ring-rose-300"); }, 9000);
      }
    }
function checkPastCoursesRequirement() {
  return checkPastCoursesRequirementV2();
      const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
      if (batch === "الفرقة الأولى") return;

      if (!hasConfiguredPastCourses) {
        // فحص ما إذا كانت السنوات السابقة تحتوي مقررات بالفعل
        const batchIdx = ALL_BATCHES.indexOf(batch);
        let hasCoursesRecorded = false;
        for (let i = 0; i < batchIdx; i++) {
          const b = ALL_BATCHES[i];
          if (allYearsCourses[b]) {
            SEMESTER_CONFIGS.forEach(s => {
              if ((allYearsCourses[b][s.id] || []).length > 0) hasCoursesRecorded = true;
            });
          }
        }

        if (hasCoursesRecorded) {
          hasConfiguredPastCourses = true;
          return;
        }

        // إلزام الطالب بتحديد المقررات السابقة
        openPastCoursesModal(false);
      }
    }

    // فتح نافذة تحديد المقررات السابقة المجتازة
    function openPastCoursesModal(isVoluntary = true) {
      const modal = document.getElementById("past-courses-modal");
      const closeBtn = document.getElementById("closePastCoursesModalBtn");
      const badge = document.getElementById("pastModalBatchBadge");
      const mandatoryBanner = document.getElementById("pastModalMandatoryBanner");
      const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";

      if (batch === "الفرقة الأولى") {
        showToast("أنت في الفرقة الأولى (مستجد)، لا توجد سنوات سابقة لتسجيلها!");
        return;
      }

      if (badge) badge.innerText = batch;

      // وضع الإجبار: لا زر إغلاق + بانر تحذيري
      const isMandatory = !isVoluntary && !hasConfiguredPastCourses;
      if (closeBtn) {
        closeBtn.classList.toggle("hidden", isMandatory);
      }
      if (mandatoryBanner) {
        mandatoryBanner.classList.toggle("hidden", !isMandatory);
      }

      // منع إغلاق الـ overlay بالضغط خارج الـ modal في وضع الإجبار
      modal.onclick = isMandatory ? (e) => {
        if (e.target === modal) {
          showToast("⚠️ يرجى تحديد مقرراتك السابقة أولاً ثم اضغط تأكيد وحفظ", true);
        }
      } : null;

      renderPastCoursesChecklist(batch);
      modal.classList.remove("hidden");
      lucide.createIcons();
    }

    function closePastCoursesModal() {
      // منع الإغلاق في وضع الإجبار
      if (!hasConfiguredPastCourses) {
        const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
        if (batch !== "الفرقة الأولى") {
          showToast("⚠️ يرجى تحديد مقرراتك السابقة أولاً ثم اضغط تأكيد وحفظ", true);
          return;
        }
      }
      document.getElementById("past-courses-modal").classList.add("hidden");
    }

    // فلترة وبحث المقررات في نافذة المقررات السابقة
    function filterPastCoursesModal(rawQuery) {
      const addBox = document.getElementById("pastCoursesSearchAddBox");
      const customNameSpan = document.getElementById("pastCoursesSearchCustomName");
      const trimmed = (rawQuery || "").trim();
      const norm = normalizeSearchText(trimmed);

      const rows = document.querySelectorAll(".past-course-row");
      let visibleCount = 0;

      rows.forEach(row => {
        const searchData = normalizeSearchText(row.dataset.search || "");
        if (!norm || searchData.includes(norm)) {
          row.classList.remove("hidden");
          visibleCount++;
        } else {
          row.classList.add("hidden");
        }
      });

      // إخفاء/إظهار الـ sections بناءً على هل فيها نتائج ظاهرة
      const sections = document.querySelectorAll("#pastCoursesListContainer > div");
      sections.forEach(section => {
        const visibleRows = section.querySelectorAll(".past-course-row:not(.hidden)");
        section.style.display = visibleRows.length === 0 && norm ? "none" : "";
      });

      // إذا لم توجد نتائج وبحث الطالب عن نص معين، إتاحة إضافته فوراً كمادة سابقة
      if (trimmed && visibleCount === 0) {
        if (addBox && customNameSpan) {
          customNameSpan.innerText = `"${trimmed}"`;
          addBox.classList.remove("hidden");
        }
      } else {
        if (addBox) addBox.classList.add("hidden");
      }
    }

    // إضافة مادة سابقة مخصصة غير مدرجة بالقائمة
    function addPastCustomCourse() {
      const input = document.getElementById("pastCoursesSearchInput");
      const rawName = input ? input.value.trim() : "";
      if (!rawName) return;

      const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الثانية";
      const currentIdx = ALL_BATCHES.indexOf(batch);
      const defaultBatch = currentIdx > 0 ? ALL_BATCHES[currentIdx - 1] : "الفرقة الأولى";

      const code = extractCourseCode(rawName) || `CUSTOM-${Date.now().toString().slice(-4)}`;
      const safeCode = code.replace(/\s+/g, '_');

      let existing = COURSE_CATALOG.find(c => c.code.toUpperCase() === code.toUpperCase() || c.nameAr === rawName);
      if (!existing) {
        existing = {
          code: code,
          codeAr: code,
          nameAr: rawName,
          nameEn: rawName,
          credits: 3,
          prereq: "-",
          type: "اختياري",
          isCustom: true
        };
        COURSE_CATALOG.push(existing);
        saveCustomCoursesToStorage();
      }

      const container = document.getElementById("pastCoursesListContainer");
      const targetGrid = container ? container.querySelector(".grid") : null;
      if (!targetGrid) return;

      const card = document.createElement("label");
      card.className = "past-course-row flex items-center justify-between gap-2 p-2.5 bg-emerald-50/70 hover:bg-emerald-50 rounded-xl border border-emerald-300 transition cursor-pointer select-none";
      card.dataset.search = `${code} ${rawName}`;
      card.innerHTML = `
        <div class="flex items-center gap-2.5 overflow-hidden">
          <input type="checkbox" id="past_chk_${safeCode}" data-code="${code}" data-credits="3" data-batch="${defaultBatch}" checked onchange="updatePastModalCounters()" class="past-course-checkbox w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0">
          <div class="truncate">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-black text-slate-800 text-[11px] bg-white px-1.5 py-0.2 rounded border border-slate-200" dir="ltr">${code}</span>
              <strong class="text-xs text-slate-800 truncate">${rawName}</strong>
            </div>
            <span class="text-[9px] text-emerald-700 font-bold block truncate">(مقرر إضافي مجتاز)</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">3 ساعات</span>
        </div>
      `;
      targetGrid.prepend(card);

      if (input) input.value = "";
      filterPastCoursesModal("");
      updatePastModalCounters();
      showToast(`تمت إضافة المقرر "${rawName}" كمقرر سابق مجتاز بنجاح! 🎉`);
    }

    // بناء قائمة المقررات السابقة حسب فرقة الطالب (بدون طلب التقدير إطلاقاً)
    function renderPastCoursesChecklist(currentBatch) {
      const container = document.getElementById("pastCoursesListContainer");
      if (!container) return;
      container.innerHTML = "";

      // إعادة تصفير حقل البحث
      const sInput = document.getElementById("pastCoursesSearchInput");
      if (sInput) sInput.value = "";
      const addBox = document.getElementById("pastCoursesSearchAddBox");
      if (addBox) addBox.classList.add("hidden");

      const currentIdx = ALL_BATCHES.indexOf(currentBatch);
      const priorBatches = ALL_BATCHES.slice(0, currentIdx);

      const existingCoursesMap = {};
      priorBatches.forEach(b => {
        SEMESTER_CONFIGS.forEach(s => {
          const list = (allYearsCourses[b] && allYearsCourses[b][s.id]) || [];
          list.forEach(c => {
            const code = extractCourseCode(c.searchVal);
            if (code) existingCoursesMap[code] = c.grade;
          });
        });
      });

      // ===== دالة مساعدة لبناء كارت مادة =====
      function buildCourseCard(c, bName, isChecked, badgeClass, badgeText) {
        const safeCode = c.code.replace(/\s+/g, '_');
        return `
          <label class="past-course-row flex items-center justify-between gap-2 p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 transition cursor-pointer select-none"
                 data-search="${c.code} ${c.codeAr || ''} ${c.nameAr} ${c.nameEn}">
            <div class="flex items-center gap-2.5 overflow-hidden">
              <input type="checkbox" id="past_chk_${safeCode}" data-code="${c.code}" data-credits="${c.credits}" data-batch="${bName}"
                     onchange="updatePastModalCounters()" ${isChecked ? 'checked' : ''}
                     class="past-course-checkbox w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0">
              <div class="truncate">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-mono font-black text-slate-800 text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200" dir="ltr">${c.code}</span>
                  <strong class="text-xs text-slate-800 truncate">${c.nameAr}</strong>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeClass}">${badgeText}</span>
                </div>
                <span class="text-[9px] text-slate-400 font-medium block truncate" dir="ltr">${c.nameEn}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">${c.credits} س</span>
            </div>
          </label>
        `;
      }

      // ===== 1) أقسام المواد الإجبارية لكل فرقة سابقة =====
      priorBatches.forEach((bName, bIdx) => {
        const bLevelChar = (bIdx + 1).toString();
        const bCourses = COURSE_CATALOG.filter(c => {
          if (c.type !== "إجباري") return false;
          const m = c.code.match(/\d{3}/);
          return m && m[0].charAt(0) === bLevelChar;
        });

        const section = document.createElement("div");
        section.className = "bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3";

        const totalHoursInBatch = bCourses.reduce((sum, c) => sum + c.credits, 0);

        section.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">${bIdx + 1}</span>
              <h4 class="text-sm font-extrabold text-slate-800">مقررات ${bName} <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">إجباري</span></h4>
            </div>
            <span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">${bCourses.length} مقررات · ${totalHoursInBatch} ساعة</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${bCourses.map(c => {
              const isChecked = existingCoursesMap[c.code] ? existingCoursesMap[c.code] !== 'F' : true;
              return buildCourseCard(c, bName, isChecked, "bg-blue-50 text-blue-700 border border-blue-200", "إجباري");
            }).join('')}
          </div>
        `;
        container.appendChild(section);
      });

      // ===== 2) قسم المواد الاختيارية (كل الاختياريات المتاحة) =====
      const electiveCourses = COURSE_CATALOG.filter(c => c.type === "اختياري");
      if (electiveCourses.length > 0) {
        const elecSection = document.createElement("div");
        elecSection.className = "bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3";

        const totalElecHours = electiveCourses.reduce((sum, c) => sum + c.credits, 0);

        elecSection.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-100">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">⭐</span>
              <h4 class="text-sm font-extrabold text-slate-800">المقررات الاختيارية التخصصية</h4>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">اختر ما اجتزته منها فقط</span>
            </div>
            <span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">${electiveCourses.length} مقرر · ${totalElecHours} ساعة</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${electiveCourses.map(c => {
              const isChecked = existingCoursesMap[c.code] ? existingCoursesMap[c.code] !== 'F' : false;
              return buildCourseCard(c, priorBatches[priorBatches.length - 1] || "الفرقة الثالثة", isChecked, "bg-amber-50 text-amber-700 border border-amber-200", "اختياري");
            }).join('')}
          </div>
        `;
        container.appendChild(elecSection);
      }

      updatePastModalCounters();
      lucide.createIcons();
    }

    // تحديث عدادات نافذة المقررات السابقة فورياً
    function updatePastModalCounters() {
      const checkboxes = document.querySelectorAll(".past-course-checkbox");
      let totalHours = 0;
      let totalCourses = 0;

      checkboxes.forEach(chk => {
        if (chk.checked) {
          totalCourses++;
          totalHours += parseInt(chk.dataset.credits) || 3;
        }
      });

      const hEl = document.getElementById("pastModalHoursCount");
      const cEl = document.getElementById("pastModalCoursesCount");
      if (hEl) hEl.innerText = totalHours;
      if (cEl) cEl.innerText = totalCourses;
    }

    // تحديد أو إلغاء تحديد كافة مقررات السنوات السابقة
    function selectAllPastCourses(selectAll) {
      document.querySelectorAll(".past-course-checkbox").forEach(chk => {
        chk.checked = selectAll;
      });
      updatePastModalCounters();
    }

    // حفظ المقررات السابقة وتوزيعها تلقائياً على فصول السجل (دون مطالبة بالتقدير)
    function savePastCoursesSelection() {
      const checkboxes = document.querySelectorAll(".past-course-checkbox");
      const checkedBoxes = Array.from(checkboxes).filter(chk => chk.checked);

      if (checkedBoxes.length === 0) {
        showToast("يرجى اختيار المقررات التي اجتزتها لتتمكن من المتابعة!", true);
        return;
      }

      const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
      const currentIdx = ALL_BATCHES.indexOf(batch);
      const priorBatches = ALL_BATCHES.slice(0, currentIdx);

      // استخراج التقديرات المسجلة مسبقاً إن وجدت
      const existingCoursesMap = {};
      priorBatches.forEach(b => {
        SEMESTER_CONFIGS.forEach(s => {
          const list = (allYearsCourses[b] && allYearsCourses[b][s.id]) || [];
          list.forEach(c => {
            const code = extractCourseCode(c.searchVal);
            if (code) existingCoursesMap[code] = { grade: c.grade, gradeConfirmed: !!c.gradeConfirmed };
          });
        });
      });

      // تصفير فصول السنوات السابقة لإعادة تعبئتها بالمقررات المحددة بدقة
      priorBatches.forEach(b => {
        allYearsCourses[b] = { term_1: [], term_2: [], summer_term: [] };
      });

      let totalEarnedHours = 0;
      let totalQualityPts = 0;

      checkedBoxes.forEach(chk => {
        const code = chk.dataset.code;
        const credits = parseInt(chk.dataset.credits) || 3;
        // لا يُطلب التقدير: نحتفظ بالتقدير الحقيقي المسجل إن وجد ولم يكن F، وإلا يُسجل كمجتاز بدون تقدير (الساعات فقط تُحتسب، والمعدل السابق من إدخال الطالب)
        const exPrev = existingCoursesMap[code];
        const grade = (exPrev && exPrev.grade && exPrev.grade !== 'F') ? exPrev.grade : "";
        const pts = (grade && GRADE_POINTS[grade] !== undefined) ? GRADE_POINTS[grade] : 0;

        const catCourse = COURSE_CATALOG.find(c => c.code.toUpperCase() === code.toUpperCase());
        const searchVal = catCourse ? `${catCourse.code} - ${catCourse.nameAr} (${catCourse.nameEn})` : code;

        const schedule = STANDARD_COURSE_SCHEDULE[code] || { batch: chk.dataset.batch || "الفرقة الأولى", semId: "term_1" };
        const targetBatch = schedule.batch;
        const targetSem = schedule.semId;

        if (!allYearsCourses[targetBatch]) {
          allYearsCourses[targetBatch] = { term_1: [], term_2: [], summer_term: [] };
        }

        allYearsCourses[targetBatch][targetSem].push({
          searchVal: searchVal,
          credits: credits,
          grade: grade,
          gradeConfirmed: (exPrev && grade && grade === exPrev.grade) ? !!exPrev.gradeConfirmed : false,
          isRetake: false
        });

        totalEarnedHours += credits;
        totalQualityPts += (credits * pts);
      });

      // تحديث الساعات والمعدل السابق دون مسح المعدل التراكمي السابق إذا كان الطالب قد أدخله بالفعل
      const prevHoursInput = document.getElementById("prevHoursInput");
      const prevGpaInput = document.getElementById("prevGpaInput");
      if (prevHoursInput) {
        prevHoursInput.value = totalEarnedHours;
      }
      if (prevGpaInput && (!prevGpaInput.value || parseFloat(prevGpaInput.value) === 0)) {
        setTimeout(() => { showToast("تم حساب ساعاتك السابقة تلقائياً ✅ خطوة أخيرة: ما هو معدلك التراكمي السابق؟ اكتبه في خانة «المعدل التراكمي السابق» 🎓"); const box = document.getElementById("prevRecordContainer"); if (box) box.scrollIntoView({ behavior: "smooth", block: "center" }); prevGpaInput.classList.add("ring-4", "ring-amber-300", "bg-amber-50"); prevGpaInput.focus(); setTimeout(() => prevGpaInput.classList.remove("ring-4", "ring-amber-300", "bg-amber-50"), 10000); }, 600);
        //const calculatedOldGpa = totalEarnedHours > 0 ? (totalQualityPts / totalEarnedHours) : 3.00;
        //prevGpaInput.value = calculatedOldGpa.toFixed(2);
      }

      hasConfiguredPastCourses = true;
      const confirmedBatches = getConfirmedPastBatchesRaw();
      const confirmedNames = confirmedBatches.map(function(x){ return (typeof x === "string") ? x : (x && x.b); });
      priorBatches.forEach(b => { if (confirmedNames.indexOf(b) === -1) { confirmedBatches.push({ b: b, explicit: true }); confirmedNames.push(b); } });
      setConfirmedPastBatches(confirmedBatches);

      loadYearCoursesToTable(batch);

      closePastCoursesModal();
      handleBatchChange(false);
      recalculateAll();
      autoSaveAll();

      showToast(`تم حفظ ${checkedBoxes.length} مقررات سابقة مجتازة بنجاح! شجرة المتطلبات وسجلك مفعلان بالكامل 🎉`);

      // بعد إتمام تحديد المقررات: لو سؤال الإنذارات لم يُجب عنه بعد، نسأله الآن
      if (!priorWarnAnswered) { setTimeout(function() { if (typeof askPriorWarnings === "function") askPriorWarnings(); }, 2500); }
    }

    function renderTranscript() {
      const name = document.getElementById("displayStudentName").innerText || "طالب غير مسجل";
      const code = document.getElementById("displayStudentCode").innerText || "-";
      const cgpa = document.getElementById("cumulativeGpaDisplay").innerText || "0.00";
      const hours = document.getElementById("totalCreditsDisplay").innerText || "0";

      document.getElementById("transcriptStudentName").innerText = name;
      document.getElementById("transcriptStudentCode").innerText = code;
      document.getElementById("transcriptCgpa").innerText = cgpa;
      document.getElementById("transcriptHours").innerText = `${hours} من 134 ساعة`;

      const container = document.getElementById("transcriptContentBody");
      container.innerHTML = "";

      let hasAnyCoursesAcrossYears = false;

      ALL_BATCHES.forEach((batchName, bIndex) => {
        const yearData = (batchName === currentViewYear) ? getCurrentTableCourses() : (allYearsCourses[batchName] || {});
        
        let yearAttempted = 0;
        let yearEarned = 0;
        let yearPoints = 0;
        let yearTotalCourses = 0;

        SEMESTER_CONFIGS.forEach(sem => {
          const list = yearData[sem.id] || [];
          yearTotalCourses += list.length;
          list.forEach(c => {
            if (c.grade === "W") return;
            const pts = GRADE_POINTS[c.grade] !== undefined ? GRADE_POINTS[c.grade] : 0;
            yearAttempted += c.credits;
            yearPoints += (c.credits * pts);
            if (c.grade !== "F") yearEarned += c.credits;
          });
        });

        const yearGpa = yearAttempted > 0 ? (yearPoints / yearAttempted) : 0.00;

        const yearCard = document.createElement("div");
        yearCard.className = "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden";

        if (yearTotalCourses === 0) {
          yearCard.innerHTML = `
            <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">${bIndex + 1}</span>
                <h4 class="font-black text-slate-700 text-sm">${batchName}</h4>
              </div>
              <span class="text-[11px] font-bold text-slate-400 italic">لم يتم تسجيل مقررات لهذه الفرقة بعد</span>
            </div>
          `;
          container.appendChild(yearCard);
          return;
        }

        hasAnyCoursesAcrossYears = true;

        let semestersHtml = "";
        SEMESTER_CONFIGS.forEach(sem => {
          const list = yearData[sem.id] || [];
          if (list.length === 0) return;

          let semHours = 0;
          let semEarned = 0;
          let semPts = 0;

          const rowsHtml = list.map((c, cIdx) => {
            const pts = GRADE_POINTS[c.grade] !== undefined ? GRADE_POINTS[c.grade] : 0;
            const coursePtsTotal = (c.credits * pts).toFixed(2);
            if (c.grade !== "W") {
              semHours += c.credits;
              semPts += (c.credits * pts);
              if (c.grade !== "F") semEarned += c.credits;
            }

            const isPass = c.grade !== "F" && c.grade !== "W";
            const gradeBadge = c.grade === "W" 
              ? '<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">W (انسحاب)</span>'
              : c.grade === "F"
                ? '<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-black">F (رسوب)</span>'
                : `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">${c.grade}</span>`;

            return `
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="p-2.5 text-center text-slate-400 font-mono">${cIdx + 1}</td>
                <td class="p-2.5 font-bold text-slate-800">
                  <div class="flex items-center gap-2">
                    <span>${c.searchVal || "مقرر بدون اسم"}</span>
                    ${c.isRetake ? '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">إعادة/تحسين</span>' : ''}
                  </div>
                </td>
                <td class="p-2.5 text-center font-bold">${c.credits}</td>
                <td class="p-2.5 text-center">${gradeBadge}</td>
                <td class="p-2.5 text-center font-mono">${c.grade === "W" ? "-" : pts.toFixed(2)}</td>
                <td class="p-2.5 text-center font-mono font-bold text-slate-700">${c.grade === "W" ? "-" : coursePtsTotal}</td>
                <td class="p-2.5 text-center">
                  ${c.grade === "W" ? '<span class="text-slate-400">منسحب</span>' : isPass ? '<span class="text-emerald-700 font-bold">مجتاز ✓</span>' : '<span class="text-rose-600 font-bold">راسب ✕</span>'}
                </td>
                <td class="p-2.5 text-center no-print">
                  <button onclick="deleteTranscriptCourse('${batchName}', '${sem.id}', ${cIdx})" class="text-slate-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-rose-50" title="حذف هذا المقرر من السجل">
                    <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('');

          const semSgpa = semHours > 0 ? (semPts / semHours) : 0.00;

          semestersHtml += `
            <div class="p-4 border-b border-slate-100 last:border-b-0 space-y-2">
              <div class="flex items-center justify-between">
                <h5 class="text-xs font-black text-slate-800 flex items-center gap-2">
                  <i data-lucide="book-check" class="w-4 h-4 text-emerald-600"></i>
                  <span>${sem.name}</span>
                  <span class="text-[10px] text-slate-500 font-normal">(${list.length} مقررات)</span>
                </h5>
                <div class="text-[11px] font-bold flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span>الساعات: <strong>${semHours}</strong></span>
                  <span class="text-slate-300">|</span>
                  <span>المعدل الفصلي (SGPA): <strong class="text-emerald-700 font-black">${semSgpa.toFixed(2)}</strong></span>
                </div>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200/70">
                <table class="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                      <th class="p-2 text-center w-10">#</th>
                      <th class="p-2">المقرر الدراسي</th>
                      <th class="p-2 text-center w-20">الساعات</th>
                      <th class="p-2 text-center w-24">التقدير</th>
                      <th class="p-2 text-center w-24">النقاط</th>
                      <th class="p-2 text-center w-24">المجموع</th>
                      <th class="p-2 text-center w-24">الحالة</th>
                      <th class="p-2 text-center w-14 no-print">حذف</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${rowsHtml}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        });

        yearCard.innerHTML = `
          <div class="px-5 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">${bIndex + 1}</span>
              <div>
                <h4 class="font-black text-slate-900 text-sm">${batchName}</h4>
                <p class="text-[10px] text-slate-500 font-medium">سجل المقررات والدرجات المنجزة خلال هذا العام الجامعي</p>
              </div>
            </div>

            <div class="flex items-center gap-3 text-xs bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm">
              <span>الساعات المجتازة: <strong class="text-slate-900 font-extrabold">${yearEarned} ساعة</strong></span>
              <span class="text-slate-300">|</span>
              <span>المعدل السنوي: <strong class="text-emerald-700 font-black text-sm">${yearGpa.toFixed(2)}</strong></span>
            </div>
          </div>
          <div>${semestersHtml}</div>
        `;

        container.appendChild(yearCard);
      });

      if (!hasAnyCoursesAcrossYears) {
        container.innerHTML = `
          <div class="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
            <i data-lucide="folder-open" class="w-10 h-10 mx-auto text-slate-400"></i>
            <h4 class="font-extrabold text-slate-800 text-sm">السجل الأكاديمي خالٍ حالياً</h4>
            <p class="text-xs text-slate-400">قم بإضافة مقرراتك وتقديراتها في الحاسبة الأكاديمية وستظهر تلقائياً هنا في سجلك الشامل مقسمة لكل سنة وفصل.</p>
          </div>
        `;
      }
    }

    function switchTab(tabId) {
      document.getElementById("calculator-section").classList.toggle("hidden", tabId !== "calculator");
      document.getElementById("suite-section").classList.toggle("hidden", tabId !== "suite");
      document.getElementById("bylaws-section").classList.toggle("hidden", tabId !== "bylaws");
      document.getElementById("tree-section").classList.toggle("hidden", tabId !== "tree");

      const tabs = ['calculator', 'suite', 'bylaws', 'tree'];
      tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        if (btn) {
          if (t === tabId) {
            btn.className = "tab-btn px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-emerald-400 text-emerald-400 flex items-center gap-2 whitespace-nowrap transition";
          } else {
            btn.className = "tab-btn px-5 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 whitespace-nowrap transition";
          }
        }
      });
    }

    function showToast(msg, isError = false) {
      const toast = document.getElementById("toastNotification");
      document.getElementById("toastMessage").innerText = msg;
      toast.classList.remove("translate-y-24", "opacity-0");
      setTimeout(() => toast.classList.add("translate-y-24", "opacity-0"), 3000);
    }

    // ==============================================================
    // INTERACTIVE VISUAL PREREQUISITES GRAPH & ROADMAP (الخريطة البصرية)
    // ==============================================================

    let treeViewMode = "graph"; // 'graph' or 'cards'

    function switchTreeViewMode(mode) {
      treeViewMode = mode;
      const graphDiv = document.getElementById("coursesVisualGraphContainer");
      const cardsDiv = document.getElementById("coursesTreeGrid");
      const btnGraph = document.getElementById("btn-tree-graph");
      const btnCards = document.getElementById("btn-tree-cards");

      if (mode === "graph") {
        if (graphDiv) graphDiv.classList.remove("hidden");
        if (cardsDiv) cardsDiv.classList.add("hidden");
        if (btnGraph) btnGraph.className = "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 bg-teal-600 text-white shadow-md shadow-teal-600/20";
        if (btnCards) btnCards.className = "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200";
        renderVisualPrerequisitesGraph(document.getElementById("treeSearchInput")?.value || "");
      } else {
        if (graphDiv) graphDiv.classList.add("hidden");
        if (cardsDiv) cardsDiv.classList.remove("hidden");
        if (btnCards) btnCards.className = "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 bg-teal-600 text-white shadow-md shadow-teal-600/20";
        if (btnGraph) btnGraph.className = "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200";
        renderCoursesTree(document.getElementById("treeSearchInput")?.value || "");
      }
      lucide.createIcons();
    }

    // استخراج مجموعة المواد التي اجتازها الطالب بنجاح عبر كافة الفصول
    function getStudentPassedCoursesSet() {
      const passed = new Set();
      ALL_BATCHES.forEach(b => {
        const semData = (b === currentViewYear) ? getCurrentTableCourses() : (allYearsCourses[b] || {});
        SEMESTER_CONFIGS.forEach(sem => {
          const list = semData[sem.id] || [];
          const isPriorBatchRec = ALL_BATCHES.indexOf(b) < ALL_BATCHES.indexOf(document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى");
          list.forEach(c => {
            if (c.grade !== "F" && c.grade !== "W" && (c.grade || isPriorBatchRec)) {
              const code = extractCourseCode(c.searchVal);
              if (code) passed.add(code);
            }
          });
        });
      });
      return passed;
    }

    function renderVisualPrerequisitesGraph(filterQuery = "") {
      const container = document.getElementById("coursesVisualGraphContainer");
      if (!container) return;
      container.innerHTML = "";

      const normFilter = normalizeSearchText(filterQuery);
      const passedSet = getStudentPassedCoursesSet();

      // تقسيم المقررات لمستويات أكاديمية (Level 100, 200, 300, 400)
      const levels = [
        { id: "100", title: "المستوى التأسيسي (100) — مقررات الفرقة الأولى", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { id: "200", title: "المستوى الوسيط (200) — مقررات الفرقة الثانية", badge: "bg-blue-100 text-blue-800 border-blue-300" },
        { id: "300", title: "المستوى المتقدم (300) — مقررات الفرقة الثالثة", badge: "bg-indigo-100 text-indigo-800 border-indigo-300" },
        { id: "400", title: "مستوى التخصص والتخرج (400) — مقررات الفرقة الرابعة", badge: "bg-purple-100 text-purple-800 border-purple-300" }
      ];

      levels.forEach(lvl => {
        // فلترة مقررات هذا المستوى
        const lvlCourses = COURSE_CATALOG.filter(c => {
          const m = c.code.match(/\d{3}/);
          const cLvl = m ? m[0].charAt(0) + "00" : "100";
          if (cLvl !== lvl.id) return false;

          if (!normFilter) return true;
          return (
            normalizeSearchText(c.code).includes(normFilter) ||
            normalizeSearchText(c.codeAr).includes(normFilter) ||
            normalizeSearchText(c.nameAr).includes(normFilter) ||
            normalizeSearchText(c.nameEn).includes(normFilter) ||
            normalizeSearchText(c.prereq).includes(normFilter)
          );
        });

        if (lvlCourses.length === 0) return;

        const levelSection = document.createElement("div");
        levelSection.className = "bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4";

        levelSection.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">${lvl.id}</span>
              <div>
                <h4 class="font-black text-slate-900 text-sm sm:text-base">${lvl.title}</h4>
                <p class="text-[11px] text-slate-500">خريطة تسلسل المقررات وتصنيف حالتها بناءً على سجلك الفعلي</p>
              </div>
            </div>
            <span class="text-xs font-bold px-3 py-1 rounded-xl border ${lvl.badge}">${lvlCourses.length} مقررات</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            ${lvlCourses.map(c => {
              const isPassed = passedSet.has(c.code.toUpperCase());
              const prereqCode = (c.prereq && c.prereq !== "-" && c.prereq !== "To be determined") ? c.prereq.toUpperCase() : null;
              const isPrereqPassed = !prereqCode || passedSet.has(prereqCode);
              const isUnlocked = !isPassed && isPrereqPassed;
              const isLocked = !isPassed && !isPrereqPassed;

              let cardBorderClass = "border-slate-200 bg-slate-50/70 opacity-80 hover:opacity-100";
              let statusBadge = '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">مغلقة 🔒</span>';

              if (isPassed) {
                cardBorderClass = "border-emerald-300 bg-emerald-50/50 shadow-xs hover:border-emerald-500";
                statusBadge = '<span class="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">مجتازة بنجاح ✓</span>';
              } else if (isUnlocked) {
                cardBorderClass = "border-amber-300 bg-amber-50/40 shadow-xs hover:border-amber-500 ring-2 ring-amber-400/20";
                statusBadge = '<span class="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">جاهزة للتسجيل 🚀</span>';
              }

              const prereqCourseObj = prereqCode ? COURSE_CATALOG.find(cat => cat.code.toUpperCase() === prereqCode) : null;
              const prereqDisplay = prereqCode 
                ? `<span class="text-rose-700 font-bold">${prereqCode} ${prereqCourseObj ? '(' + prereqCourseObj.nameAr + ')' : ''}</span>`
                : '<span class="text-slate-400 font-medium">لا يوجد (مقرر استهلالي)</span>';

              return `
                <div class="p-3.5 rounded-2xl border transition-all ${cardBorderClass} flex flex-col justify-between group">
                  <div>
                    <div class="flex items-center justify-between gap-1.5 mb-1.5">
                      <span class="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200" dir="ltr">${c.code}</span>
                      ${statusBadge}
                    </div>
                    <h5 class="text-xs font-black text-slate-900 group-hover:text-teal-700 transition-colors">${c.nameAr}</h5>
                    <p class="text-[10px] text-slate-500 font-medium mb-2.5 truncate" dir="ltr">${c.nameEn}</p>
                  </div>

                  <div class="pt-2 border-t border-slate-200/70 text-[10px] space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-500 font-semibold">المتطلب السابق:</span>
                      ${prereqDisplay}
                    </div>
                    <div class="flex items-center justify-between text-slate-400">
                      <span>الساعات: ${c.credits} س</span>
                      <span>${c.type}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;

        container.appendChild(levelSection);
      });

      lucide.createIcons();
    }

document.addEventListener("DOMContentLoaded", () => {
      loadCustomCoursesFromStorage();
      buildSemestersUI();
      addBestWorstCourseRow();
      addBestWorstCourseRow();
      loadAllStateFromStorage();
      handleBatchChange(false);
      updateYearTabsUI();
      recalculateAll();
      renderCoursesTree("");
      lucide.createIcons();
      // بوابة أول دخول تُستدعى بعد اختيار «المتابعة كزائر» أو بعد تحميل بيانات الحساب السحابية، لا هنا، حتى لا تظهر النوافذ خلف شاشة الدخول.

      // منع إغلاق نافذة المقررات السابقة بـ ESC في وضع الإجبار
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const pastModal = document.getElementById("past-courses-modal");
          if (pastModal && !pastModal.classList.contains("hidden") && !hasConfiguredPastCourses) {
            const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
            if (batch !== "الفرقة الأولى") {
              e.preventDefault();
              e.stopPropagation();
              showToast("⚠️ يرجى تحديد مقرراتك السابقة أولاً ثم اضغط تأكيد وحفظ", true);
            }
          }
        }
      });

      // إغلاق قائمة البحث عند الضغط خارجها
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".course-search-wrapper")) {
          document.querySelectorAll(".autocomplete-items").forEach(el => el.classList.add("hidden"));
        }
      });
    });
