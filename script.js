const GRADE_SCALE = [
  { rating: 1.0, remark: "Excellent", class: "excellent" },
  { rating: 1.25, remark: "Excellent", class: "excellent" },
  { rating: 1.5, remark: "Very Good", class: "very-good" },
  { rating: 1.75, remark: "Very Good", class: "very-good" },
  { rating: 2.0, remark: "Good", class: "good" },
  { rating: 2.25, remark: "Good", class: "good" },
  { rating: 2.5, remark: "Satisfactory", class: "satisfactory" },
  { rating: 2.75, remark: "Satisfactory", class: "satisfactory" },
  { rating: 3.0, remark: "Passed", class: "passed" },
];

const SPECIAL_STATUSES = {
  INC: { rating: null, remark: "Incomplete", excluded: true },
  DO: { rating: null, remark: "Dropped Officially", excluded: true },
  DU: { rating: 5.0, remark: "Dropped Unofficially (5.00)", excluded: false },
};

const NUMERICAL_OPTIONS = [
  { value: "", label: "— Select —" },
  ...GRADE_SCALE.map((g) => ({
    value: String(g.rating),
    label: g.rating.toFixed(2),
  })),
  { value: "5.00", label: "5.00" },
  { value: "INC", label: "INC" },
  { value: "DO", label: "DO" },
  { value: "DU", label: "DU (5.00)" },
];

const subjectsBody = document.getElementById("subjectsBody");
const addRowBtn = document.getElementById("addRowBtn");
const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const resultsSection = document.getElementById("resultsSection");
const gwaValue = document.getElementById("gwaValue");
const interpretationValue = document.getElementById("interpretationValue");
const unitsValue = document.getElementById("unitsValue");
const excludedNotice = document.getElementById("excludedNotice");
const errorNotice = document.getElementById("errorNotice");

let rowIdCounter = 0;

function ratingToGradeInfo(rating) {
  if (!rating || rating === "") return null;

  if (SPECIAL_STATUSES[rating]) {
    const special = SPECIAL_STATUSES[rating];
    return {
      rating: special.rating,
      remark: special.remark,
      class: "special",
      excluded: special.excluded,
      status: rating,
    };
  }

  const num = parseFloat(rating);
  if (isNaN(num)) return null;

  if (num === 5.0) {
    return { rating: 5.0, remark: "Failed", class: "failed" };
  }

  const match = GRADE_SCALE.find((g) => g.rating === num);
  if (match) {
    return { rating: match.rating, remark: match.remark, class: match.class };
  }

  return null;
}

function interpretGWA(gwa) {
  if (gwa <= 1.25) return "Excellent";
  if (gwa <= 1.75) return "Very Good";
  if (gwa <= 2.25) return "Good";
  if (gwa <= 2.75) return "Satisfactory";
  if (gwa <= 3.0) return "Passed";
  return "Failed";
}

function createRow() {
  const id = ++rowIdCounter;
  const tr = document.createElement("tr");
  tr.dataset.rowId = id;

  tr.innerHTML = `
    <td><input type="text" class="subject-input" placeholder="e.g. Math 101" aria-label="Subject name"></td>
    <td><input type="number" class="units-input" placeholder="3" min="0.5" step="0.5" aria-label="Units"></td>
    <td>
      <select class="rating-select" aria-label="Grade">
        ${NUMERICAL_OPTIONS.map((o) => `<option value="${o.value}">${o.label}</option>`).join("")}
      </select>
    </td>
    <td class="remark-cell">—</td>
    <td><button type="button" class="btn-remove" aria-label="Remove subject" title="Remove">&times;</button></td>
  `;

  const ratingSelect = tr.querySelector(".rating-select");
  const remarkCell = tr.querySelector(".remark-cell");
  const removeBtn = tr.querySelector(".btn-remove");

  ratingSelect.addEventListener("change", () => {
    const grade = ratingToGradeInfo(ratingSelect.value);
    updateRemarkCell(remarkCell, grade);
  });

  removeBtn.addEventListener("click", () => {
    tr.remove();
    if (subjectsBody.children.length === 0) addRow();
  });

  return tr;
}

function updateRemarkCell(cell, grade) {
  cell.textContent = grade ? grade.remark : "—";
  cell.className = "remark-cell" + (grade && grade.class ? ` ${grade.class}` : "");
}

function addRow() {
  subjectsBody.appendChild(createRow());
}

function getRowData(tr) {
  const subject = tr.querySelector(".subject-input").value.trim();
  const unitsRaw = tr.querySelector(".units-input").value.trim();
  const ratingValue = tr.querySelector(".rating-select").value;

  const units = unitsRaw === "" ? null : Number(unitsRaw);
  const gradeInfo = ratingValue ? ratingToGradeInfo(ratingValue) : null;

  let error = null;
  if (units !== null && (isNaN(units) || units <= 0)) {
    error = "Units must be greater than 0.";
  }

  const hasGrade = gradeInfo !== null;
  const hasUnits = units !== null && !isNaN(units) && units > 0;
  const isComplete = hasGrade && hasUnits;

  return { subject, units, ratingValue, gradeInfo, error, isComplete };
}

function calculateGWA() {
  const rows = [...subjectsBody.querySelectorAll("tr")];
  const errors = [];
  const completeRows = [];
  const excludedSubjects = [];

  rows.forEach((tr, index) => {
    const data = getRowData(tr);
    const rowLabel = data.subject || `Row ${index + 1}`;

    if (data.error) {
      errors.push(`${rowLabel}: ${data.error}`);
      return;
    }

    const isEmpty = !data.subject && data.units === null && !data.ratingValue;

    if (isEmpty) return;

    if (!data.isComplete) {
      errors.push(`${rowLabel}: Provide units and a grade.`);
      return;
    }

    if (data.gradeInfo.excluded) {
      excludedSubjects.push(`${rowLabel} (${data.gradeInfo.status})`);
      return;
    }

    completeRows.push(data);
  });

  errorNotice.hidden = true;
  excludedNotice.hidden = true;

  if (errors.length > 0) {
    resultsSection.hidden = false;
    gwaValue.textContent = "—";
    interpretationValue.textContent = "—";
    unitsValue.textContent = "—";
    errorNotice.textContent = errors.join(" ");
    errorNotice.hidden = false;
    return;
  }

  if (completeRows.length === 0) {
    resultsSection.hidden = false;
    gwaValue.textContent = "—";
    interpretationValue.textContent = "—";
    unitsValue.textContent = "0";
    errorNotice.textContent = "Add at least one complete subject with units and a grade.";
    errorNotice.hidden = false;
    return;
  }

  let weightedSum = 0;
  let totalUnits = 0;

  completeRows.forEach((row) => {
    weightedSum += row.gradeInfo.rating * row.units;
    totalUnits += row.units;
  });

  const gwa = weightedSum / totalUnits;

  gwaValue.textContent = gwa.toFixed(2);
  interpretationValue.textContent = interpretGWA(gwa);
  unitsValue.textContent = String(totalUnits);
  resultsSection.hidden = false;

  if (excludedSubjects.length > 0) {
    excludedNotice.textContent = `Excluded from GWA: ${excludedSubjects.join(", ")}.`;
    excludedNotice.hidden = false;
  }
}

function resetAll() {
  subjectsBody.innerHTML = "";
  addRow();
  resultsSection.hidden = true;
  errorNotice.hidden = true;
  excludedNotice.hidden = true;
}

addRowBtn.addEventListener("click", addRow);
calculateBtn.addEventListener("click", calculateGWA);
resetBtn.addEventListener("click", resetAll);

addRow();
