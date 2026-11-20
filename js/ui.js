/**
 * ui.js - User Interface Controller
 * Modals, Dynamic Tables, Autocomplete, Mobile Responsive Cards, Transcript & PDF Export
 */

function validateProfileField(input, regex, errorMsg) {
      const val = input.value.trim();
      const isValid = !val || regex.test(val);
      if (!isValid) {
        input.classList.add("border-rose-400", "bg-rose-50");
      } else {
        input.classList.remove("border-rose-400", "bg-rose-50");
      }
    }

    function openProfileModal() {
      const modal = document.getElementById("profile-modal");
      const closeBtn = document.getElementById("closeProfileModalBtn");
      
      document.getElementById("modalStudentName").value = document.getElementById("displayStudentName").innerText || "";
      document.getElementById("modalStudentCode").value = document.getElementById("displayStudentCode").innerText || "";
      document.getElementById("modalAcademicYear").value = document.getElementById("displayAcademicYear").innerText || "";
      const currentBatch = document.getElementById("displayStudentBatch").innerText || "الفرقة الأولى";
      document.getElementById("modalStudentBatch").value = currentBatch;

      updateModalPriorWarningsVisibility(currentBatch);

      const hasPriorWarn = document.getElementById("priorWarnRadioYes")?.checked || false;
      const priorCount = document.getElementById("priorWarningsCountSelect")?.value || "1";
      const modalWarnYes = document.getElementById("modalPriorWarnYes");
      const modalWarnNo = document.getElementById("modalPriorWarnNo");
      const modalCountSelect = document.getElementById("modalPriorWarnCount");
      const modalCountWrap = document.getElementById("modalPriorWarnCountWrapper");

      if (modalWarnYes && modalWarnNo) {
        modalWarnYes.checked = hasPriorWarn;
        modalWarnNo.checked = !hasPriorWarn;
      }
      if (modalCountSelect) modalCountSelect.value = priorCount;
      if (modalCountWrap) modalCountWrap.classList.toggle("hidden", !hasPriorWarn);

      closeBtn.classList.remove("hidden");
      modal.classList.remove("hidden");
    }

    function closeProfileModal() {
      document.getElementById("profile-modal").classList.add("hidden");
    }

    function updateModalPriorWarningsVisibility(batch) {
      const sec = document.getElementById("modalPriorWarnSection");
      if (sec) {
        sec.classList.toggle("hidden", batch === "الفرقة الأولى");
      }
    }

    function toggleModalPriorWarn(hasWarn) {
      const countWrap = document.getElementById("modalPriorWarnCountWrapper");
      if (countWrap) countWrap.classList.toggle("hidden", !hasWarn);
    }

    function handlePriorWarningToggle(hasWarn) {
      const wrapper = document.getElementById("priorWarnSelectWrapper");
      if (wrapper) wrapper.classList.toggle("hidden", !hasWarn);

      const modalYes = document.getElementById("modalPriorWarnYes");
      const modalNo = document.getElementById("modalPriorWarnNo");
      const modalCountWrapper = document.getElementById("modalPriorWarnCountWrapper");
      if (modalYes && modalNo) {
        modalYes.checked = hasWarn;
        modalNo.checked = !hasWarn;
      }
      if (modalCountWrapper) modalCountWrapper.classList.toggle("hidden", !hasWarn);

      recalculateAll();
      autoSaveAll();
    }

    function handlePriorWarningCountChange() {
      const val = document.getElementById("priorWarningsCountSelect")?.value || "1";
      const modalVal = document.getElementById("modalPriorWarnCount");
      if (modalVal) modalVal.value = val;
      recalculateAll();
      autoSaveAll();
    }

    function saveProfileData(e) {
      if (e) e.preventDefault();

      const name = document.getElementById("modalStudentName").value.trim();
      const code = document.getElementById("modalStudentCode").value.trim();
      const year = document.getElementById("modalAcademicYear").value.trim();

      // ===== Validation =====
      let hasError = false;

      // الاسم: حروف فقط (عربي أو إنجليزي)، لا يقبل أرقام
      const nameInput = document.getElementById("modalStudentName");
      const nameError = document.getElementById("nameFieldError");
      if (!name || /\d/.test(name)) {
        nameInput.classList.add("border-rose-400", "bg-rose-50");
        if (nameError) nameError.classList.remove("hidden");
        hasError = true;
      } else {
        nameInput.classList.remove("border-rose-400", "bg-rose-50");
        if (nameError) nameError.classList.add("hidden");
      }

      // الكود: أرقام فقط
      const codeInput = document.getElementById("modalStudentCode");
      const codeError = document.getElementById("codeFieldError");
      if (!code || !/^\d+$/.test(code)) {
        codeInput.classList.add("border-rose-400", "bg-rose-50");
        if (codeError) codeError.classList.remove("hidden");
        hasError = true;
      } else {
        codeInput.classList.remove("border-rose-400", "bg-rose-50");
        if (codeError) codeError.classList.add("hidden");
      }

      // العام الجامعي: أرقام وشرطة ومسافة فقط
      const yearInput = document.getElementById("modalAcademicYear");
      const yearError = document.getElementById("yearFieldError");
      if (!year || /[^\d\/\-\s]/.test(year)) {
        yearInput.classList.add("border-rose-400", "bg-rose-50");
        if (yearError) yearError.classList.remove("hidden");
        hasError = true;
      } else {
        yearInput.classList.remove("border-rose-400", "bg-rose-50");
        if (yearError) yearError.classList.add("hidden");
      }

      if (hasError) {
        showToast("يرجى تصحيح الأخطاء في البيانات المُدخلة أولاً ⚠️", true);
        return;
      }

      const oldBatch = document.getElementById("displayStudentBatch").innerText;
      const batch = document.getElementById("modalStudentBatch").value;

      document.getElementById("displayStudentName").innerText = name;
      document.getElementById("displayStudentCode").innerText = code;
      document.getElementById("displayAcademicYear").innerText = year;
      document.getElementById("displayStudentBatch").innerText = batch;

      if (batch !== "الفرقة الأولى") {
        const modalHasWarn = document.getElementById("modalPriorWarnYes")?.checked || false;
        const modalWarnCount = document.getElementById("modalPriorWarnCount")?.value || "1";
        
        const mainRadioYes = document.getElementById("priorWarnRadioYes");
        const mainRadioNo = document.getElementById("priorWarnRadioNo");
        const mainCountSelect = document.getElementById("priorWarningsCountSelect");
        const wrapper = document.getElementById("priorWarnSelectWrapper");

        if (mainRadioYes && mainRadioNo) {
          mainRadioYes.checked = modalHasWarn;
          mainRadioNo.checked = !modalHasWarn;
        }
        if (mainCountSelect) mainCountSelect.value = modalWarnCount;
        if (wrapper) wrapper.classList.toggle("hidden", !modalHasWarn);
      }

      if (oldBatch !== batch && batch !== "الفرقة الأولى") {
        document.getElementById("prevHoursInput").value = "";
        document.getElementById("prevGpaInput").value = "";
      }

      closeProfileModal();
      handleBatchChange(false);
      autoSaveAll();

      // لو الفرقة ≥ ثانية ومحتاج تحديد مقررات سابقة → افتح الـ modal إجبارياً فوراً
      if (batch !== "الفرقة الأولى" && !hasConfiguredPastCourses) {
        setTimeout(() => {
          showToast("📋 يرجى تحديد المقررات السابقة التي اجتزتها قبل المتابعة", true);
          openPastCoursesModal(false);
        }, 300);
      } else {
        checkPastCoursesRequirement();
        showToast("تم حفظ وتحديث بيانات الملف الشخصي بنجاح! 🎉");
      }
    }

    // تخطي بيانات الملف الشخصي: دخول سريع بدون اسم أو كود (يمكن إدخالها لاحقاً من زر الملف بالأعلى)
    function skipProfileSetup() {
      closeProfileModal();
      showToast("تم الدخول في الوضع السريع ⚡ يمكنك إضافة بياناتك لاحقاً من زر تعديل الملف الشخصي بالأعلى.");
    }

    // شرح طريقة حساب المعدل التراكمي بالأرقام الحالية
    function toggleCalcExplanation() {
      const box = document.getElementById("calcExplanationBox");
      if (!box) return;
      box.classList.toggle("hidden");
      updateCalcExplanation();
    }

    function updateCalcExplanation() {
      const box = document.getElementById("calcExplanationBox");
      const text = document.getElementById("calcExplanationText");
      if (!box || !text || box.classList.contains("hidden")) return;
      const calc = window.lastCgpaCalc;
      if (!calc || calc.hours === 0) {
        text.innerHTML = "لم يتم تسجيل مقررات بعد. أضف مقرراتك وسيظهر هنا تفصيل الحساب خطوة بخطوة.";
        return;
      }
      text.innerHTML =
        `المعدل التراكمي = مجموع (ساعات كل مقرر × نقاط تقديره) ÷ مجموع الساعات المحتسبة` +
        `<br>= ${calc.points.toFixed(2)} ÷ ${calc.hours} = <strong class="text-emerald-300">${calc.cgpa.toFixed(2)}</strong>` +
        `<br><span class="text-slate-400">ملاحظة: مقررات الانسحاب (W) والصفوف الفارغة لا تدخل في الحساب، وعند إعادة مقرر تُستبدل نقاط المحاولة القديمة بالجديدة وفق اللائحة.</span>` +
        `<br><span class="text-amber-300/90">⚠️ النقاط محسوبة وفق سلم داخلي موحد غير مؤكد رسمياً. راجع اللائحة الرسمية للمعهد (تبويب الدليل).</span>` +
        (window.retakeAnchorNotes && window.retakeAnchorNotes.length ? `<br><span class="text-amber-300/90">⚠️ مقررات معادة من سنوات سابقة دون تقدير سابق مسجل (${window.retakeAnchorNotes.join("، ")}): أُضيفت المحاولة الجديدة وبقي أثر المحاولة القديمة ضمن المعدل السابق المُدخل، فالنتيجة تقريبية لهذه المقررات. سجّل تقدير المحاولة السابقة في جدول سنتها لحساب أدق.</span>` : "");
    }

    function checkProfileCompletion(data) {
      if (!data || !data.name || !data.code) {
        document.getElementById("closeProfileModalBtn").classList.add("hidden");
        document.getElementById("profile-modal").classList.remove("hidden");
      }
    }

    // ==============================================================
    // FULL OFFICIAL COURSE CATALOG (لائحة علوم الحاسب 134 ساعة)
    // ==============================================================

function getCurrentTableCourses() {
      const semData = {};
      SEMESTER_CONFIGS.forEach(sem => {
        semData[sem.id] = [];
        const tbody = document.getElementById(`coursesTableBody-${sem.id}`);
        if (tbody) {
          tbody.querySelectorAll("tr").forEach(row => {
            const rowId = row.id;
            semData[sem.id].push({
              searchVal: document.getElementById(`search_${rowId}`)?.value || "",
              credits: parseInt(document.getElementById(`credits_${rowId}`)?.value) || 3,
              grade: document.getElementById(`grade_${rowId}`)?.value ?? "A",
              isRetake: document.getElementById(`retake_${rowId}`)?.checked || false
            });
          });
        }
      });
      return semData;
    }

    // حفظ مقررات الجدول المعروض في ذاكرة السنة المناسبة
    function saveCurrentTableToState() {
      if (!allYearsCourses[currentViewYear]) {
        allYearsCourses[currentViewYear] = { term_1: [], term_2: [], summer_term: [] };
      }
      allYearsCourses[currentViewYear] = getCurrentTableCourses();
    }

    // تحديث أزرار تبديل عرض الفرق
    function updateYearTabsUI() {
      ALL_BATCHES.forEach(b => {
        const btnId = `year-tab-${b.replace(/\s+/g, '-')}`;
        const btn = document.getElementById(btnId);
        if (btn) {
          if (b === currentViewYear) {
            btn.className = "year-tab-btn flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition border bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20";
          } else {
            btn.className = "year-tab-btn flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition border bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200";
          }
        }
      });
    }

    // تحميل مقررات سنة معينة في الجداول
    function loadYearCoursesToTable(year) {
      currentViewYear = year;
      updateYearTabsUI();

      const titleEl = document.getElementById("activeYearSemestersTitle");
      if (titleEl) titleEl.innerText = `مقررات ${year} (الفصول الثلاثة)`;

      if (!allYearsCourses[year]) {
        allYearsCourses[year] = { term_1: [], term_2: [], summer_term: [] };
      }

      const yearData = allYearsCourses[year];
      SEMESTER_CONFIGS.forEach(sem => {
        const tbody = document.getElementById(`coursesTableBody-${sem.id}`);
        if (tbody) {
          if (typeof historyManager !== "undefined") {
        historyManager.pushState("تفريغ " + sem.name);
      }
      tbody.innerHTML = "";
          const list = yearData[sem.id];
          if (list && list.length > 0) {
            list.forEach(c => addCourseRow(sem.id, c, false));
          }
        }
      });

      recalculateAll();
    }

    // تبديل عرض الفرقة عند الضغط على التاب
    function switchYearView(year) {
      saveCurrentTableToState();
      loadYearCoursesToTable(year);
      autoSaveAll();
    }

    // رندر شجرة المواد والمتطلبات
    function renderCoursesTree(filterQuery = "") {
      const grid = document.getElementById("coursesTreeGrid");
      if (!grid) return;
      grid.innerHTML = "";

      const normFilter = normalizeSearchText(filterQuery);

      const filtered = COURSE_CATALOG.filter(c => {
        if (!normFilter) return true;
        const prereqCourse = (c.prereq && c.prereq !== '-' && c.prereq !== 'To be determined')
          ? COURSE_CATALOG.find(other => other.code.toUpperCase() === c.prereq.toUpperCase())
          : null;
        const prereqNameAr = prereqCourse ? prereqCourse.nameAr : '';

        return (
          normalizeSearchText(c.code).includes(normFilter) ||
          normalizeSearchText(c.codeAr).includes(normFilter) ||
          normalizeSearchText(c.nameAr).includes(normFilter) ||
          normalizeSearchText(c.nameEn).includes(normFilter) ||
          normalizeSearchText(c.prereq).includes(normFilter) ||
          normalizeSearchText(prereqNameAr).includes(normFilter)
        );
      });

      document.getElementById("totalTreeCount").innerText = COURSE_CATALOG.length;

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm font-bold">لا توجد مادة تطابق بحثك في الشجرة الأكاديمية</div>`;
        return;
      }

      filtered.forEach(course => {
        // حساب المواد التي تفتحها هذه المادة (التي تجعل هذه المادة متطلباً لها)
        const unlockedCourses = COURSE_CATALOG.filter(other => {
          if (!other.prereq || other.prereq === "-") return false;
          // التحقق مما إذا كان كود هذه المادة مذكوراً في متطلبات المادة الأخرى
          return other.prereq.toUpperCase().includes(course.code.toUpperCase());
        });

        const card = document.createElement("div");
        card.className = "bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:border-teal-400 transition-all flex flex-col justify-between";

        const typeBadge = course.type === "إجباري"
          ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">إجباري</span>`
          : `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">اختياري</span>`;

        // تجهيز عرض المتطلب السابق بالاسم والكود
        let prereqHtml = "";
        if (!course.prereq || course.prereq === "-") {
          prereqHtml = `<span class="text-slate-400 font-medium text-xs">لا يوجد (مقرر استهلالي)</span>`;
        } else if (course.prereq === "To be determined") {
          prereqHtml = `<span class="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">يُحدد لاحقاً</span>`;
        } else {
          const prereqCourse = COURSE_CATALOG.find(c => c.code.toUpperCase() === course.prereq.toUpperCase());
          if (prereqCourse) {
            prereqHtml = `
              <span class="inline-flex items-center gap-1.5 bg-rose-50 text-rose-900 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm" title="${prereqCourse.nameEn}">
                <span class="font-mono text-rose-700 font-black" dir="ltr">${highlightMatch(prereqCourse.code, filterQuery)}</span>
                <span class="text-rose-950 font-extrabold">${highlightMatch(prereqCourse.nameAr, filterQuery)}</span>
              </span>
            `;
          } else {
            prereqHtml = `<span class="font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs" dir="ltr">${course.prereq}</span>`;
          }
        }

        let unlockedHtml = "";
        if (unlockedCourses.length > 0) {
          unlockedHtml = `
            <div class="mt-3 pt-3 border-t border-slate-100">
              <span class="block text-[11px] font-extrabold text-teal-800 mb-1.5 flex items-center gap-1">
                <i data-lucide="unlock" class="w-3.5 h-3.5"></i>
                <span>تفتح لك بعد اجتيازها (${unlockedCourses.length} مقررات):</span>
              </span>
              <div class="flex flex-wrap gap-1.5">
                ${unlockedCourses.map(u => `
                  <span class="inline-flex items-center gap-1 bg-teal-50 text-teal-900 border border-teal-200 text-[10px] font-bold px-2 py-1 rounded-lg" title="${u.nameAr}">
                    <span class="font-mono text-teal-700 font-black" dir="ltr">${u.code}</span>
                    <span class="truncate max-w-[130px]">${u.nameAr}</span>
                  </span>
                `).join('')}
              </div>
            </div>
          `;
        } else {
          unlockedHtml = `
            <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
              لا توجد مقررات تالية مباشرة (أو مقرر تخرج / اختياري نهائي).
            </div>
          `;
        }

        card.innerHTML = `
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 text-xs" dir="ltr">${highlightMatch(course.code, filterQuery)}</span>
                <span class="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">${highlightMatch(course.codeAr, filterQuery)}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${course.credits} ساعات</span>
                ${typeBadge}
              </div>
            </div>

            <h4 class="text-sm font-extrabold text-slate-900 mb-0.5">${highlightMatch(course.nameAr, filterQuery)}</h4>
            <p class="text-xs text-slate-500 font-medium mb-3" dir="ltr">${highlightMatch(course.nameEn, filterQuery)}</p>

            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="text-slate-500 font-semibold shrink-0">المتطلب السابق اللازم:</span>
                ${prereqHtml}
              </div>
            </div>
          </div>

          ${unlockedHtml}
        `;
        grid.appendChild(card);
      });
      lucide.createIcons();
    }

    function buildSemestersUI() {
      const container = document.getElementById("semestersContainer");
      container.innerHTML = "";

      SEMESTER_CONFIGS.forEach((sem, index) => {
        const semDiv = document.createElement("div");
        semDiv.className = `bg-white rounded-2xl shadow-sm border border-slate-200/80 ${sem.id === activeSelectedSemester ? '' : 'hidden'}`;
        semDiv.id = `semester-wrapper-${sem.id}`;

        semDiv.innerHTML = `
          <div class="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">${index + 1}</span>
              <h4 class="text-sm font-extrabold text-slate-800">${sem.name}</h4>
              <span id="semBadge-${sem.id}" class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">0 مواد</span>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-xs font-semibold text-slate-600 flex flex-wrap items-center gap-2.5 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                <span>الساعات: <strong id="semHours-${sem.id}" class="text-slate-900">0</strong></span>
                <span class="text-slate-300">|</span>
                <span>المعدل الفصلي: <strong id="semSgpa-${sem.id}" class="text-emerald-700 font-extrabold">0.00</strong></span>
                <span class="text-slate-300">|</span>
                <span id="semCreditBadge-${sem.id}" class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  الحد الأقصى: <strong id="semMaxLimit-${sem.id}">18</strong> س
                </span>
              </div>

              <div class="flex items-center gap-2">
                <button onclick="clearSemesterCourses('${sem.id}')" class="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-lg text-xs font-bold transition border border-rose-200 shadow-2xs" title="حذف وتفريغ جميع مقررات هذا الفصل">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5 text-rose-600"></i>
                  <span>تفريغ الفصل</span>
                </button>

                <button onclick="addCourseRow('${sem.id}')" class="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                  <span>إضافة مقرر</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Credit Limit Alert Banner (تنبيه تجاوز سقف الساعات) -->
          <div id="semLimitWarning-${sem.id}" class="hidden mx-5 mt-2.5 p-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold flex items-center gap-2"></div>

          <div class="overflow-x-visible">
            <table class="semester-table w-full text-xs text-right border-collapse">
              <thead>
                <tr class="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200">
                  <th class="p-3 w-5/12">المقرر الدراسي (بحث سريع: كود / عربي / إنجليزي)</th>
                  <th class="p-3 w-2/12 text-center">الساعات المعتمدة</th>
                  <th class="p-3 w-2/12 text-center">التقدير المحقق</th>
                  <th class="p-3 w-2/12 text-center">إعادة المقرر</th>
                  <th class="p-3 w-1/12 text-center">حذف</th>
                </tr>
              </thead>
              <tbody id="coursesTableBody-${sem.id}" class="divide-y divide-slate-100"></tbody>
            </table>
          </div>
        `;
        container.appendChild(semDiv);
      });
      lucide.createIcons();
    }

    function switchActiveSemester(semId) {
      activeSelectedSemester = semId;
      SEMESTER_CONFIGS.forEach(sem => {
        const el = document.getElementById(`semester-wrapper-${sem.id}`);
        if (el) el.classList.toggle("hidden", sem.id !== semId);
      });
    }

    function addCourseRow(semId, courseData = null, triggerSave = true) {
      const tbody = document.getElementById(`coursesTableBody-${semId}`);
      if (!tbody) return;

      const rowId = 'row_' + Math.random().toString(36).substring(2, 9);
      const tr = document.createElement("tr");
      tr.id = rowId;
      tr.className = "hover:bg-slate-50/70 transition-colors";

      const selectedCredits = courseData ? courseData.credits : 3;
      const selectedGrade = courseData ? courseData.grade : "A";
      const isRetake = courseData ? courseData.isRetake : false;
      const courseSearchVal = courseData ? courseData.searchVal : "";

      tr.innerHTML = `
        <td class="p-2 relative course-search-wrapper course-search-cell" data-label="المقرر الدراسي">
          <div class="relative flex items-center">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none"></i>
            <input type="text" id="search_${rowId}" value="${courseSearchVal}" autocomplete="off"
              placeholder="ابحث بكود المادة (CS 101 / ع ح 101) أو الاسم بالعربي أو الإنجليزي..." 
              onfocus="handleCourseSearchInput(event, '${rowId}')"
              oninput="handleCourseSearchInput(event, '${rowId}')" 
              onkeydown="handleCourseSearchKeydown(event, '${rowId}')"
              onblur="recalculateAll(); autoSaveAll();"
              class="w-full text-xs font-semibold pr-8 pl-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none">
          </div>
          <div id="alerts_${rowId}" class="mt-1 space-y-1"></div>
          <div id="autocomplete_${rowId}" class="autocomplete-items hidden"></div>
        </td>
        <td class="p-2 text-center" data-label="الساعات المعتمدة">
          <select id="credits_${rowId}" onchange="recalculateAll(); autoSaveAll();" class="text-xs font-bold px-3 py-2 border border-slate-300 bg-white rounded-lg">
            <option value="3" ${selectedCredits == 3 ? 'selected' : ''}>3 ساعات</option>
            <option value="2" ${selectedCredits == 2 ? 'selected' : ''}>2 ساعة</option>
          </select>
        </td>
        <td class="p-2 text-center" data-label="التقدير المحقق">
          <select id="grade_${rowId}" onchange="recalculateAll(); autoSaveAll();" class="text-xs font-extrabold px-3 py-2 border border-slate-300 bg-white rounded-lg text-emerald-800">
            ${selectedGrade === '' ? '<option value="" selected>—</option>' : ''}${Object.keys(GRADE_POINTS).map(g => `<option value="${g}" ${selectedGrade === g ? 'selected' : ''}>${g} ${g === 'W' ? '(انسحاب بعذر)' : '(' + GRADE_POINTS[g].toFixed(2) + ')'}</option>`).join('')}
          </select>
        </td>
        <td class="p-2 text-center" data-label="إعادة المقرر">
          <input type="checkbox" id="retake_${rowId}" ${isRetake ? 'checked' : ''} onchange="recalculateAll(); autoSaveAll();" class="w-4 h-4 text-emerald-600 rounded cursor-pointer" title="حدد إذا كانت هذه المادة إعادة لتحسين التقدير أو بعد رسوب">
        </td>
        <td class="p-2 text-center action-cell" data-label="حذف المقرر">
          <button onclick="deleteCourseRow('${rowId}')" class="text-slate-400 hover:text-rose-600 transition p-1" title="حذف المقرر"><i data-lucide="trash-2" class="w-4 h-4 inline"></i></button>
        </td>
      `;

      tbody.appendChild(tr);
      lucide.createIcons();
      recalculateAll();
      if (triggerSave) autoSaveAll();
    }

    /* deletedCourseHistory in config.js */
    function deleteCourseRow(rowId) {
      const row = document.getElementById(rowId);
      if (!row) return;

      const tbody = row.closest("tbody");
      const semId = tbody ? tbody.id.replace("coursesTableBody-", "") : "term_1";
      const courseData = {
        searchVal: document.getElementById(`search_${rowId}`)?.value || "",
        credits: parseInt(document.getElementById(`credits_${rowId}`)?.value) || 3,
        grade: document.getElementById(`grade_${rowId}`)?.value ?? "A",
        isRetake: document.getElementById(`retake_${rowId}`)?.checked || false
      };

      deletedCourseHistory.push({ semId, courseData });
      row.remove();
      recalculateAll();
      autoSaveAll();

      const undoBtn = document.getElementById("toastUndoBtn");
      if (undoBtn) undoBtn.classList.remove("hidden");
      const courseTitle = courseData.searchVal.split('-')[0].trim() || 'مقرر';
      showToast(`تم حذف المقرر: ${courseTitle}`);
    }

    function undoLastDelete() {
      const item = deletedCourseHistory.pop();
      if (!item) return;
      addCourseRow(item.semId, item.courseData, true);
      showToast("تم استعادة المقرر بنجاح! ↩️");
      const undoBtn = document.getElementById("toastUndoBtn");
      if (undoBtn && deletedCourseHistory.length === 0) undoBtn.classList.add("hidden");
    }

    // حذف وتفريغ جميع مقررات فصل دراسي بالكامل مع دعم التراجع (Undo)
    function clearSemesterCourses(semId) {
      const tbody = document.getElementById(`coursesTableBody-${semId}`);
      if (!tbody) return;

      const rows = tbody.querySelectorAll("tr");
      if (rows.length === 0) {
        showToast("هذا الفصل الدراسي فارغ بالفعل ولا توجد مقررات لحذفها.", true);
        return;
      }

      const semConfig = SEMESTER_CONFIGS.find(s => s.id === semId);
      const semName = semConfig ? semConfig.name : semId;

      if (!confirm(`هل أنت متأكد من تفريغ وحذف جميع مقررات ${semName}؟\n\n(يمكنك التراجع واستعادتها عبر زر التراجع)`)) {
        return;
      }

      // أرشفة المقررات المحذوفة في تاريخ التراجع
      rows.forEach(row => {
        const rowId = row.id;
        const courseData = {
          searchVal: document.getElementById(`search_${rowId}`)?.value || "",
          credits: parseInt(document.getElementById(`credits_${rowId}`)?.value) || 3,
          grade: document.getElementById(`grade_${rowId}`)?.value ?? "A",
          isRetake: document.getElementById(`retake_${rowId}`)?.checked || false
        };
        deletedCourseHistory.push({ semId, courseData });
      });

      tbody.innerHTML = "";
      saveCurrentTableToState();
      recalculateAll();
      autoSaveAll();

      const undoBtn = document.getElementById("toastUndoBtn");
      if (undoBtn) undoBtn.classList.remove("hidden");

      showToast(`تم تفريغ مقررات ${semName} بنجاح. 🗑️`);
    }

    // إعادة ضبط السجل والمصنع بالكامل (Reset All Data)
    function resetAllDataFactoryPrompt() {
      const confirm1 = confirm("⚠️ تحذير: إعادة ضبط المصنع للسجل الأكاديمي\n\nهل أنت متأكد من رغبتك في حذف وإعادة ضبط جميع البيانات والمقررات المسجلة عبر كافة الفرق والفصول الدراسية؟");
      if (!confirm1) return;

      const confirm2 = confirm("تأكيد نهائي: سيتم تفريغ كافة البيانات والبدء من الصفر تماماً. هل تريد المتابعة بالتأكيد؟");
      if (!confirm2) return;

      // 1. مسح البيانات المحفوظة محلياً
      localStorage.removeItem("hti_gpa_state_v2");

      hasConfiguredPastCourses = false;

      // 2. تصفير الذاكرة الداخلية
      allYearsCourses = {
        "الفرقة الأولى": { term_1: [], term_2: [], summer_term: [] },
        "الفرقة الثانية": { term_1: [], term_2: [], summer_term: [] },
        "الفرقة الثالثة": { term_1: [], term_2: [], summer_term: [] },
        "الفرقة الرابعة": { term_1: [], term_2: [], summer_term: [] }
      };
      summerTrainingState = { train1: false, train2: false };
      deletedCourseHistory = [];
      currentViewYear = "الفرقة الأولى";

      // 3. إعادة تعيين الحقول وعناصر التحكم
      document.getElementById("displayStudentBatch").innerText = "الفرقة الأولى";
      document.getElementById("modalStudentBatch").value = "الفرقة الأولى";
      const pHours = document.getElementById("prevHoursInput");
      const pGpa = document.getElementById("prevGpaInput");
      if (pHours) pHours.value = "";
      if (pGpa) pGpa.value = "";

      const radioNo = document.getElementById("priorWarnRadioNo");
      const radioYes = document.getElementById("priorWarnRadioYes");
      if (radioNo) radioNo.checked = true;
      if (radioYes) radioYes.checked = false;
      const warnWrap = document.getElementById("priorWarnSelectWrapper");
      if (warnWrap) warnWrap.classList.add("hidden");

      const cb1 = document.getElementById("checkSummerTrain1");
      const cb2 = document.getElementById("checkSummerTrain2");
      if (cb1) cb1.checked = false;
      if (cb2) cb2.checked = false;

      // 4. تحديث الواجهة وبناء الفصل الأول للمستجدين
      handleBatchChange(false);
      loadYearCoursesToTable("الفرقة الأولى");

      if (document.getElementById("profile-modal") && !document.getElementById("profile-modal").classList.contains("hidden")) {
        closeProfileModal();
      }

      showToast("تمت إعادة ضبط السجل والمصنع بنجاح! 🔄");
    }

    // تصدير واستيراد النسخ الاحتياطية (JSON Backup / Restore)
    function exportBackupData() {
      saveCurrentTableToState();
      const stateStr = localStorage.getItem("hti_gpa_state_v2");
      if (!stateStr) {
        showToast("لا توجد بيانات لتصديرها!", true);
        return;
      }
      const blob = new Blob([stateStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `HTI_GPA_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("تم تصدير وحفظ ملف النسخة الاحتياطية بنجاح 💾");
    }

    function handleRestoreBackup(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          localStorage.setItem("hti_gpa_state_v2", JSON.stringify(data));
          applyLoadedData(data);
          showToast("تم استعادة بياناتك بنجاح من النسخة الاحتياطية! 🎉");
        } catch (err) {
          showToast("ملف النسخة الاحتياطية غير صالح أو تالف!", true);
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    }

    // تتبع التدريب الصيفي
    /* summerTrainingState in config.js */
    function toggleSummerTraining(trainNum, isChecked) {
      const totalEarned = parseInt(document.getElementById("gradEarnedHours")?.innerText) || 0;
      if (trainNum === 1 && totalEarned < 30 && isChecked) {
        showToast("⚠️ تنبيه اللائحة (المادة 22): يشترط للتسجيل في التدريب الصيفي 1 إنهاء 30 ساعة معتمدة أولاً.", true);
      }
      if (trainNum === 2 && totalEarned < 60 && isChecked) {
        showToast("⚠️ تنبيه اللائحة (المادة 22): يشترط للتسجيل في التدريب الصيفي 2 إنهاء 60 ساعة معتمدة أولاً.", true);
      }
      summerTrainingState[`train${trainNum}`] = isChecked;
      autoSaveAll();
    }

    // استبعاد سابقة "ال" التعريفية في الكلمات العربية للبحث المرن
    function stripArabicPrefix(word) {
      if (word && word.startsWith("ال") && word.length > 3) {
        return word.slice(2);
      }
      return word;
    }

    // إدارة المقررات المخصصة المحفوظة
    function saveCustomCoursesToStorage() {
      try {
        const customOnly = COURSE_CATALOG.filter(c => c.isCustom);
        localStorage.setItem("hti_custom_courses", JSON.stringify(customOnly));
      } catch (e) {
        console.error("Failed to save custom courses to localStorage", e);
      }
    }

    function loadCustomCoursesFromStorage() {
      try {
        const saved = localStorage.getItem("hti_custom_courses");
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            list.forEach(c => {
              if (!COURSE_CATALOG.some(existing => existing.code.toUpperCase() === c.code.toUpperCase() || existing.nameAr === c.nameAr)) {
                c.isCustom = true;
                COURSE_CATALOG.push(c);
              }
            });
          }
        }
      } catch (e) {
        console.error("Failed to load custom courses from localStorage", e);
      }
    }

    // محرك البحث الفوري الشامل والمطور (يدعم كود المادة، الاسم عربي/إنجليزي، والبحث المرن)
    function searchCourseCatalog(rawQuery) {
      const normQuery = normalizeSearchText(rawQuery);
      const compactQuery = normQuery.replace(/\s+/g, "");

      if (!normQuery) {
        return COURSE_CATALOG.slice(0, 10);
      }

      const queryWords = normQuery.split(/\s+/).filter(Boolean);

      return COURSE_CATALOG.filter(c => {
        const normCode = normalizeSearchText(c.code);
        const compactCode = normCode.replace(/\s+/g, "");
        const normCodeAr = normalizeSearchText(c.codeAr || "");
        const compactCodeAr = normCodeAr.replace(/\s+/g, "");
        const normAr = normalizeSearchText(c.nameAr);
        const normEn = normalizeSearchText(c.nameEn);

        // 1. مطابقة مباشرة للكود أو الاسم
        if (
          normCode.includes(normQuery) ||
          compactCode.includes(compactQuery) ||
          normCodeAr.includes(normQuery) ||
          compactCodeAr.includes(compactQuery) ||
          normAr.includes(normQuery) ||
          normEn.includes(normQuery)
        ) {
          return true;
        }

        // 2. مطابقة ذكية للكلمات العربية مع أو بدون "ال" التعريف
        const fullTargetText = `${normAr} ${normEn} ${normCode} ${normCodeAr}`;
        const targetWords = fullTargetText.split(/\s+/).filter(Boolean);
        const targetWordsStripped = targetWords.map(w => stripArabicPrefix(w));

        return queryWords.every(qWord => {
          const qStripped = stripArabicPrefix(qWord);
          return (
            fullTargetText.includes(qWord) ||
            fullTargetText.includes(qStripped) ||
            targetWordsStripped.some(tw => tw.includes(qStripped))
          );
        });
      });
    }

    // إضافة مقرر جديد غير مدرج بالكتالوج
    function addCustomCourseFromSearch(rowId, courseName, isBestWorst = false) {
      const trimmed = (courseName || "").trim();
      if (!trimmed) return;

      let code = extractCourseCode(trimmed);
      if (!code || code === trimmed.toUpperCase()) {
        const mCode = trimmed.match(/^([A-Za-z]{1,4}\s*\d{2,3})/);
        if (mCode) {
          code = mCode[1].toUpperCase();
        } else {
          code = trimmed;
        }
      }

      let existing = COURSE_CATALOG.find(c => 
        c.code.toUpperCase() === code.toUpperCase() || 
        c.nameAr === trimmed
      );

      if (!existing) {
        existing = {
          code: code,
          codeAr: code,
          nameAr: trimmed,
          nameEn: trimmed,
          credits: 3,
          prereq: "-",
          type: "اختياري",
          isCustom: true
        };
        COURSE_CATALOG.push(existing);
        saveCustomCoursesToStorage();
      }

      const searchInput = document.getElementById(`search_${rowId}`);
      if (searchInput) {
        searchInput.value = existing.code !== existing.nameAr ? `${existing.code} - ${existing.nameAr}` : existing.nameAr;
      }

      const creditsSelect = document.getElementById(`credits_${rowId}`);
      if (creditsSelect) {
        creditsSelect.value = existing.credits || 3;
      }

      const listDiv = document.getElementById(`autocomplete_${rowId}`);
      if (listDiv) listDiv.classList.add("hidden");

      if (!isBestWorst) {
        recalculateAll();
        autoSaveAll();
      }

      showToast(`تمت إضافة المقرر "${trimmed}" بنجاح وتحديده في جدولك! 🎉`);
      if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
    }

    function handleCourseSearchInput(e, rowId, isBestWorst = false) {
      const rawQuery = e.target.value;
      const listDiv = document.getElementById(`autocomplete_${rowId}`);
      if (!listDiv) return;

      document.querySelectorAll(".autocomplete-items").forEach(el => {
        if (el.id !== `autocomplete_${rowId}`) el.classList.add("hidden");
      });

      const trimmedQuery = rawQuery.trim();
      const escapedQuery = trimmedQuery.replace(/"/g, '&quot;');

      const matches = searchCourseCatalog(rawQuery);

      if (matches.length === 0) {
        if (trimmedQuery) {
          listDiv.innerHTML = `
            <div class="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl m-1 hover:border-emerald-500 transition cursor-pointer" onclick="addCustomCourseFromSearch('${rowId}', '${escapedQuery}', ${isBestWorst})">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 overflow-hidden">
                  <span class="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">+</span>
                  <div class="text-right truncate">
                    <p class="text-xs font-black text-slate-800 truncate">المادة غير موجودة بالكتالوج</p>
                    <p class="text-[11px] text-emerald-800 font-bold truncate">اضغط لإضافة: "${escapedQuery}"</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-xs">
                  <span>+ إضافة المادة</span>
                </span>
              </div>
            </div>
          `;
        } else {
          listDiv.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center">اكتب كود أو اسم المادة للبحث...</div>`;
        }
        listDiv.classList.remove("hidden");
        if (!isBestWorst) autoSaveAll();
        return;
      }

      listDiv.innerHTML = "";
      listDiv.dataset.activeIndex = "-1";

      matches.slice(0, 12).forEach((match, idx) => {
        const item = document.createElement("div");
        item.className = "autocomplete-item flex items-center justify-between gap-2";
        item.dataset.index = idx;

        const highlightedCode = highlightMatch(match.code, rawQuery.trim());
        const highlightedCodeAr = highlightMatch(match.codeAr || "", rawQuery.trim());
        const highlightedAr = highlightMatch(match.nameAr, rawQuery.trim());
        const highlightedEn = highlightMatch(match.nameEn, rawQuery.trim());

        const typeBadgeClass = match.type === "إجباري" 
          ? "bg-blue-50 text-blue-700 border-blue-200" 
          : "bg-amber-50 text-amber-800 border-amber-200";

        item.innerHTML = `
          <div class="flex flex-col text-right">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="font-mono font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]" dir="ltr">${highlightedCode}</span>
              ${match.codeAr ? `<span class="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">${highlightedCodeAr}</span>` : ''}
              <span class="font-extrabold text-slate-900 text-xs">${highlightedAr}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-1">
              <span class="text-[11px] text-slate-500 font-medium" dir="ltr">${highlightedEn}</span>
              ${(() => {
                if (!match.prereq || match.prereq === "-") return '';
                const pCourse = COURSE_CATALOG.find(c => c.code.toUpperCase() === match.prereq.toUpperCase());
                const pTitle = pCourse ? ` (${pCourse.nameAr})` : '';
                const pStatus = checkCoursePrerequisite(match.code, currentViewYear, activeSelectedSemester);
                if (pStatus.status === "ok") {
                  return `<span class="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">متطلب: <span dir="ltr">${match.prereq}</span>${pTitle} (مجتاز ✓)</span>`;
                } else if (pStatus.status === "failed") {
                  return `<span class="text-[10px] text-rose-800 font-black bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">متطلب: <span dir="ltr">${match.prereq}</span>${pTitle} (راسب F 🚨)</span>`;
                } else {
                  return `<span class="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">متطلب: <span dir="ltr">${match.prereq}</span>${pTitle} (غير مستوفى ⚠️)</span>`;
                }
              })()}
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              ${match.credits} ساعات
            </span>
            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded border ${typeBadgeClass}">
              ${match.type}
            </span>
          </div>
        `;

        item.onclick = () => {
          const selectedCode = match.code;
          const tbody = document.getElementById(`coursesTableBody-${activeSelectedSemester}`);
          
          let isDuplicate = false;
          if (tbody) {
            tbody.querySelectorAll("tr").forEach(r => {
              if (r.id !== rowId) {
                const val = document.getElementById(`search_${r.id}`)?.value || "";
                if (extractCourseCode(val) === selectedCode.toUpperCase()) {
                  isDuplicate = true;
                }
              }
            });
          }

          if (isDuplicate) {
            showToast(`⚠️ تنبيه: المقرر (${match.code} - ${match.nameAr}) مسجل بالفعل في هذا الفصل!`, true);
          }

          const prereqCheck = checkCoursePrerequisite(selectedCode, currentViewYear, activeSelectedSemester);
          if (prereqCheck.status === "failed") {
            showToast(`🚨 تنبيه رسوب: رسبت بتقدير F في المتطلب السابق (${prereqCheck.prereqTitle}) لهذا المقرر!`, true);
          } else if (prereqCheck.status === "same_term") {
            showToast(`⚠️ تنبيه: لا يجوز تسجيل المقرر بالتزامن مع متطلبه السابق في نفس الترم!`, true);
          } else if (prereqCheck.status === "not_taken") {
            showToast(`⚠️ تنبيه: لم تجتز المتطلب السابق (${prereqCheck.prereqTitle}) لهذا المقرر بعد!`, true);
          }

          e.target.value = `${match.code} - ${match.nameAr} (${match.nameEn})`;
          const creditsSelect = document.getElementById(`credits_${rowId}`);
          if (creditsSelect) creditsSelect.value = match.credits;
          listDiv.classList.add("hidden");
          if (!isBestWorst) {
            recalculateAll();
            autoSaveAll();
          }
        };
        listDiv.appendChild(item);
      });

      // خيار إضافي في أسفل القائمة لإضافة المادة إذا لم تكن مطابقة بالكامل لما كتبه الطالب
      if (trimmedQuery && !matches.some(m => m.code.toUpperCase() === trimmedQuery.toUpperCase() || m.nameAr === trimmedQuery)) {
        const addFooter = document.createElement("div");
        addFooter.className = "p-2.5 border-t border-slate-200 bg-slate-50/80 hover:bg-emerald-50 flex items-center justify-between gap-2 text-xs transition cursor-pointer";
        addFooter.onclick = () => addCustomCourseFromSearch(rowId, trimmedQuery, isBestWorst);
        addFooter.innerHTML = `
          <span class="text-slate-600 text-[11px] font-medium">مادتك غير موجودة بالضبط في النتائج؟</span>
          <span class="text-emerald-700 hover:text-emerald-800 font-black text-[11px] underline flex items-center gap-1">
            + إضافة "${escapedQuery}" كمقرر جديد
          </span>
        `;
        listDiv.appendChild(addFooter);
      }

      listDiv.classList.remove("hidden");
      if (!isBestWorst) autoSaveAll();
    }

    function handleCourseSearchKeydown(e, rowId) {
      const listDiv = document.getElementById(`autocomplete_${rowId}`);
      if (!listDiv || listDiv.classList.contains("hidden")) return;

      const items = listDiv.querySelectorAll(".autocomplete-item");
      let activeIndex = parseInt(listDiv.dataset.activeIndex || "-1", 10);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length > 0) {
          activeIndex = (activeIndex + 1) % items.length;
          updateActiveAutocompleteItem(items, activeIndex, listDiv);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length > 0) {
          activeIndex = (activeIndex - 1 + items.length) % items.length;
          updateActiveAutocompleteItem(items, activeIndex, listDiv);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          items[activeIndex].click();
        } else {
          const val = e.target.value.trim();
          if (val) {
            const matches = searchCourseCatalog(val);
            if (matches.length > 0) {
              const firstItem = listDiv.querySelector(".autocomplete-item");
              if (firstItem) firstItem.click();
            } else {
              addCustomCourseFromSearch(rowId, val, false);
            }
          }
        }
      } else if (e.key === "Escape") {
        listDiv.classList.add("hidden");
      }
    }

    function updateActiveAutocompleteItem(items, activeIndex, listDiv) {
      items.forEach(item => item.classList.remove("autocomplete-active"));
      if (items[activeIndex]) {
        items[activeIndex].classList.add("autocomplete-active");
        items[activeIndex].scrollIntoView({ block: "nearest" });
      }
      listDiv.dataset.activeIndex = activeIndex.toString();
    }

    // حساب إجمالي الساعات والمعدل المتراكم حتى فرقة معينة

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
    function checkPastCoursesRequirement() {
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
            if (code) existingCoursesMap[code] = c.grade;
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
        // لا يُطلب التقدير: نعتمد التقدير المسجل مسبقاً إن وجد ولم يكن F، وإلا تقدير B (3.00) كمقرر مجتاز بنجاح
        const grade = (existingCoursesMap[code] && existingCoursesMap[code] !== 'F') ? existingCoursesMap[code] : "B";
        const pts = GRADE_POINTS[grade] !== undefined ? GRADE_POINTS[grade] : 3.00;

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
        const calculatedOldGpa = totalEarnedHours > 0 ? (totalQualityPts / totalEarnedHours) : 3.00;
        prevGpaInput.value = calculatedOldGpa.toFixed(2);
      }

      hasConfiguredPastCourses = true;

      if (currentViewYear !== batch) {
        loadYearCoursesToTable(currentViewYear);
      }

      closePastCoursesModal();
      handleBatchChange(false);
      recalculateAll();
      autoSaveAll();

      showToast(`تم حفظ ${checkedBoxes.length} مقررات سابقة مجتازة بنجاح! شجرة المتطلبات وسجلك مفعلان بالكامل 🎉`);
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



// ==========================================
// تصدير كشف الدرجات إلى PDF احترافي مباشر
// ==========================================
function exportTranscriptToPDF() {
  const element = document.getElementById("transcriptContentBody");
  const studentName = document.getElementById("transcriptStudentName")?.innerText || "طالب";
  const studentCode = document.getElementById("transcriptStudentCode")?.innerText || "سجل";
  
  if (!element || element.children.length === 0) {
    showToast("لا توجد بيانات مقررات في السجل لتصديرها!", true);
    return;
  }

  showToast("جاري إعداد وتحميل ملف الـ PDF... 📄");

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `HTI_Transcript_${studentCode}_${studentName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // استدعاء html2pdf
  if (typeof html2pdf !== "undefined") {
    html2pdf().set(opt).from(element).save().then(() => {
      showToast("تم تنزيل كشف الدرجات بصيغة PDF بنجاح! 🎉");
    }).catch(err => {
      console.error(err);
      window.print();
    });
  } else {
    // البديل المباشر
    window.print();
  }
                      }
