/**
 * undo.js - Full History State Manager (Undo / Redo System)
 * Stores snapshots of tables and year states to allow restoring
 * after accidental deletions, clear semester, or grade modifications.
 */

class HistoryManager {
  constructor(maxHistory = 25) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = maxHistory;
    this.isApplyingSnapshot = false;
  }

  // التقاط حالة سريعة وتخزينها
  pushState(description = "تعديل في البيانات") {
    if (this.isApplyingSnapshot) return;

    try {
      // حفظ الجدول الحالي أولاً
      if (typeof saveCurrentTableToState === "function") {
        saveCurrentTableToState();
      }

      const snapshot = {
        description: description,
        timestamp: Date.now(),
        currentViewYear: typeof currentViewYear !== "undefined" ? currentViewYear : "الفرقة الأولى",
        allYearsCourses: JSON.parse(JSON.stringify(allYearsCourses)),
        prevHours: document.getElementById("prevHoursInput")?.value || "0",
        prevGpa: document.getElementById("prevGpaInput")?.value || "0"
      };

      this.undoStack.push(snapshot);
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }

      // تفريغ الـ Redo عند حدوث تعديل جديد
      this.redoStack = [];
      this.updateUndoUI();
    } catch (e) {
      console.warn("History push state failed:", e);
    }
  }

  // التراجع خطوة للخلف
  undo() {
    if (this.undoStack.length <= 1) {
      if (typeof showToast === "function") {
        showToast("لا توجد عمليات سابقة للتراجع عنها!", true);
      }
      return;
    }

    this.isApplyingSnapshot = true;
    try {
      // نقل الحالة الحالية إلى Redo
      const currentState = this.undoStack.pop();
      this.redoStack.push(currentState);

      // تطبيق الحالة السابقة
      const previousState = this.undoStack[this.undoStack.length - 1];
      this.applySnapshot(previousState);

      if (typeof showToast === "function") {
        showToast(`↩️ تم التراجع عن: ${currentState.description}`);
      }
    } finally {
      this.isApplyingSnapshot = false;
      this.updateUndoUI();
    }
  }

  // الإعادة خطوة للأمام
  redo() {
    if (this.redoStack.length === 0) return;

    this.isApplyingSnapshot = true;
    try {
      const nextState = this.redoStack.pop();
      this.undoStack.push(nextState);
      this.applySnapshot(nextState);

      if (typeof showToast === "function") {
        showToast(`↪️ تم استعادة: ${nextState.description}`);
      }
    } finally {
      this.isApplyingSnapshot = false;
      this.updateUndoUI();
    }
  }

  // استرجاع لقطة محفوظة
  applySnapshot(snapshot) {
    if (!snapshot) return;

    allYearsCourses = JSON.parse(JSON.stringify(snapshot.allYearsCourses));
    currentViewYear = snapshot.currentViewYear;

    const hInput = document.getElementById("prevHoursInput");
    const gInput = document.getElementById("prevGpaInput");
    if (hInput) hInput.value = snapshot.prevHours;
    if (gInput) gInput.value = snapshot.prevGpa;

    if (typeof loadYearCoursesToTable === "function") {
      loadYearCoursesToTable(currentViewYear);
    }
    if (typeof updateYearTabsUI === "function") {
      updateYearTabsUI();
    }
    if (typeof recalculateAll === "function") {
      recalculateAll();
    }
    if (typeof autoSaveAll === "function") {
      autoSaveAll();
    }
  }

  // تحديث حالة زر التراجع في الواجهة
  updateUndoUI() {
    const undoBtn = document.getElementById("globalUndoBtn");
    const redoBtn = document.getElementById("globalRedoBtn");
    const canUndo = this.undoStack.length > 1;
    const canRedo = this.redoStack.length > 0;

    if (undoBtn) {
      undoBtn.disabled = !canUndo;
      undoBtn.classList.toggle("opacity-50", !canUndo);
      undoBtn.classList.toggle("cursor-not-allowed", !canUndo);
    }
    if (redoBtn) {
      redoBtn.disabled = !canRedo;
      redoBtn.classList.toggle("opacity-50", !canRedo);
      redoBtn.classList.toggle("cursor-not-allowed", !canRedo);
    }
  }
}

// إنشاء نسخة عامة للنظام
const historyManager = new HistoryManager(30);

// دعم اختصار الكيبورد Ctrl+Z و Ctrl+Y
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
    // تجنب التعارض لو المستخدم بيكتب داخل input عادي
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    if (tag === "input" && document.activeElement.type === "text") return;

    e.preventDefault();
    historyManager.undo();
  } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    if (tag === "input" && document.activeElement.type === "text") return;

    e.preventDefault();
    historyManager.redo();
  }
});
