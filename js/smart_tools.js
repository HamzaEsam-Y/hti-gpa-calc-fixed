/**
 * smart_tools.js - Smart Simulation & Prediction Suite
 * Target GPA Optimizer, Probation Shield, Retake Simulator, Best/Worst Scenarios
 */

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

    function calculateRetakeTool() {
      const hOld = parseFloat(document.getElementById("t3_Hold").value);
      const oldGpa = parseFloat(document.getElementById("t3_OldGpa").value);
      const reason = document.getElementById("t3_Reason").value;
      const courseHours = parseFloat(document.getElementById("t3_CourseHours").value);
      const oldGradePts = parseFloat(document.getElementById("t3_OldGrade").value);
      let rawExpectedPts = parseFloat(document.getElementById("t3_NewGrade").value);
      const resDiv = document.getElementById("t3_result");

      if (isNaN(hOld) || isNaN(oldGpa) || hOld <= 0) {
        resDiv.innerHTML = `<span class="text-rose-600 font-bold">يرجى إدخال الساعات السابقة والمعدل الحالي بصورة صحيحة.</span>`;
        resDiv.className = "mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm";
        resDiv.classList.remove("hidden");
        return;
      }

      let cappedPts = rawExpectedPts;
      let capMessage = "";

      const cap = RETAKE_CAPS[reason];
      if (cap && rawExpectedPts > cap.points) {
        cappedPts = cap.points;
        const reasonLabel = reason === "fail_1" ? "إعادة 1" : reason === "fail_2" ? "إعادة 2" : "إعادة 3 فأكثر";
        capMessage = `تم تطبيق سقف اللائحة (${reasonLabel}: حد أقصى ${cap.grade} أي ${cap.points.toFixed(2)}).`;
      }

      let newCgpa = ((oldGpa * hOld) + ((cappedPts - oldGradePts) * courseHours)) / hOld;
      newCgpa = Math.min(4.00, Math.max(0.00, newCgpa));

      const diff = newCgpa - oldGpa;
      resDiv.classList.remove("hidden");

      if (diff > 0) {
        resDiv.className = "mt-4 p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-950 text-sm leading-relaxed";
        resDiv.innerHTML = `
          ✨ <strong>تأثير إيجابي ممتاز:</strong> سينتقل معدلك التراكمي من <strong>${oldGpa.toFixed(2)}</strong> إلى <strong class="text-xl font-black text-indigo-700 mx-1">${newCgpa.toFixed(2)}</strong> بزيادة قدرها (+${diff.toFixed(2)}).
          ${capMessage ? `<span class="block text-xs font-semibold text-amber-800 mt-1">📌 ${capMessage}</span>` : ''}
        `;
      } else if (diff < 0) {
        resDiv.className = "mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-950 text-sm leading-relaxed";
        resDiv.innerHTML = `
          ⚠️ <strong>تأثير عكسي:</strong> التقدير الجديد المحسوب أقل من القديم، وسينخفض معدلك من ${oldGpa.toFixed(2)} إلى <strong>${newCgpa.toFixed(2)}</strong>.
        `;
      } else {
        resDiv.className = "mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm leading-relaxed";
        resDiv.innerHTML = `
          ℹ️ <strong>لا يوجد تغيير جوهري:</strong> المعدل التراكمي سيظل ثابتاً عند <strong>${oldGpa.toFixed(2)}</strong>.
        `;
      }
    }

    function addBestWorstCourseRow() {
      const tbody = document.getElementById("bestWorstCoursesTable");
      const rId = 'bw_' + Math.random().toString(36).substring(2, 7);
      const tr = document.createElement("tr");
      tr.id = rId;
      tr.className = "hover:bg-slate-50";
      // توليد خيارات التقديرات من نفس سلم النقاط المعتمد في الموقع (توحيد القيم)
      const gradeOptionsHtml = Object.keys(GRADE_POINTS).map(g =>
        `<option value="${GRADE_POINTS[g]}">${g} (${GRADE_POINTS[g].toFixed(2)})</option>`
      ).join('');
      const gradeOptionsWorstHtml = Object.keys(GRADE_POINTS).map(g =>
        `<option value="${GRADE_POINTS[g]}" ${g === 'F' ? 'selected' : ''}>${g} (${GRADE_POINTS[g].toFixed(2)})</option>`
      ).join('');
      tr.innerHTML = `
        <td class="p-2 relative course-search-wrapper course-search-cell" data-label="المقرر">
          <input type="text" id="search_${rId}" autocomplete="off"
            placeholder="ابحث بالكود أو الاسم (عربي / إنجليزي)..." 
            onfocus="handleCourseSearchInput(event, '${rId}', true)"
            oninput="handleCourseSearchInput(event, '${rId}', true)"
            onkeydown="handleCourseSearchKeydown(event, '${rId}')"
            class="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
          <div id="autocomplete_${rId}" class="autocomplete-items hidden"></div>
        </td>
        <td class="p-2 text-center" data-label="الساعات">
          <select id="credits_${rId}" class="text-xs font-bold px-2 py-1.5 bg-slate-50 border rounded-lg">
            <option value="3">3 ساعات</option>
            <option value="2">2 ساعة</option>
          </select>
        </td>
        <td class="p-2 text-center" data-label="التقدير المتفائل">
          <select class="text-xs font-extrabold px-2 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
            ${gradeOptionsHtml}
          </select>
        </td>
        <td class="p-2 text-center" data-label="التقدير المتعثر">
          <select class="text-xs font-extrabold px-2 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
            ${gradeOptionsWorstHtml}
          </select>
        </td>
        <td class="p-2 text-center action-cell" data-label="حذف">
          <button onclick="document.getElementById('${rId}').remove()" class="text-slate-400 hover:text-rose-600"><i data-lucide="trash-2" class="w-4 h-4 inline"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
      lucide.createIcons();
    }

    function calculateBestWorstTool() {
      const hOld = parseFloat(document.getElementById("t4_Hold").value);
      const oldGpa = parseFloat(document.getElementById("t4_OldGpa").value);
      const tbody = document.getElementById("bestWorstCoursesTable");
      const resDiv = document.getElementById("t4_result");

      if (isNaN(hOld) || isNaN(oldGpa)) {
        resDiv.classList.remove("hidden");
        resDiv.className = "mt-4 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-sm";
        resDiv.innerHTML = `⚠️ يرجى إدخال الساعات السابقة والمعدل التراكمي السابق بصورة صحيحة.`;
        return;
      }

      let bestPoints = hOld * oldGpa;
      let worstPoints = hOld * oldGpa;
      let realisticPoints = hOld * oldGpa;
      let totalNewHours = 0;

      const rows = tbody.querySelectorAll("tr");
      if (rows.length === 0) {
        resDiv.classList.remove("hidden");
        resDiv.className = "mt-4 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm";
        resDiv.innerHTML = `⚠️ يرجى إضافة مادة واحدة على الأقل لحساب السيناريوهات.`;
        return;
      }

      rows.forEach(row => {
        const selects = row.querySelectorAll("select");
        const credits = parseFloat(selects[0].value);
        const bestGradePt = parseFloat(selects[1].value);
        const worstGradePt = parseFloat(selects[2].value);
        const realisticGradePt = (bestGradePt + worstGradePt) / 2;

        totalNewHours += credits;
        bestPoints += credits * bestGradePt;
        worstPoints += credits * worstGradePt;
        realisticPoints += credits * realisticGradePt;
      });

      const totalHours = hOld + totalNewHours;
      const bestCgpa = Math.min(4.00, bestPoints / totalHours);
      const realisticCgpa = Math.min(4.00, realisticPoints / totalHours);
      const worstCgpa = Math.max(0.00, worstPoints / totalHours);

      resDiv.classList.remove("hidden");
      resDiv.className = "mt-4 p-4 rounded-xl border border-purple-200 bg-purple-50 text-purple-950 text-sm leading-relaxed";
      resDiv.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div class="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm">
            <span class="block text-xs font-bold text-emerald-800 mb-1">السيناريو المتفائل (الأفضل) ✨</span>
            <strong class="text-2xl font-black text-emerald-700">${bestCgpa.toFixed(2)}</strong>
          </div>
          <div class="p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
            <span class="block text-xs font-bold text-blue-800 mb-1">السيناريو الواقعي 📊</span>
            <strong class="text-2xl font-black text-blue-700">${realisticCgpa.toFixed(2)}</strong>
          </div>
          <div class="p-3 bg-white rounded-xl border border-rose-200 shadow-sm">
            <span class="block text-xs font-bold text-rose-800 mb-1">السيناريو المتشائم (الأسوأ) ⚠️</span>
            <strong class="text-2xl font-black text-rose-700">${worstCgpa.toFixed(2)}</strong>
          </div>
        </div>
      `;
    }

    /* saveTimeout in main.js */
