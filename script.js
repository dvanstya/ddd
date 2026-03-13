const WEIGHTS = {
  coreValues: 0.2,
  softCompetency: 0.25,
  technicalCompetency: 0.25,
  kpi: 0.3,
};

const STORAGE_KEY = 'performance-appraisal-history';

const inputIds = Object.keys(WEIGHTS);
const resultNode = document.getElementById('result');
const historyNode = document.getElementById('history');

function toNumber(value) {
  return Number.parseFloat(value || '0');
}

function scoreToPercent(score) {
  const clamped = Math.min(5, Math.max(1, score));
  return (clamped / 5) * 100;
}

function calculateAppraisal() {
  const detail = inputIds.map((id) => {
    const raw = toNumber(document.getElementById(id).value);
    const percent = scoreToPercent(raw);
    const contribution = percent * WEIGHTS[id];

    return { id, raw, percent, contribution };
  });

  const total = detail.reduce((acc, item) => acc + item.contribution, 0);
  return {
    employeeName: document.getElementById('employeeName').value.trim() || 'Tanpa Nama',
    period: document.getElementById('period').value || '-',
    detail,
    total,
    rating: getRating(total),
  };
}

function getRating(total) {
  if (total >= 90) return { label: 'Excellent', className: 'excellent' };
  if (total >= 80) return { label: 'Good', className: 'good' };
  if (total >= 70) return { label: 'Fair', className: 'fair' };
  return { label: 'Needs Improvement', className: 'poor' };
}

function labelFromId(id) {
  return {
    coreValues: 'Core Values',
    softCompetency: 'Soft Competency',
    technicalCompetency: 'Technical Competency',
    kpi: 'KPI',
  }[id];
}

function renderResult(data) {
  resultNode.classList.remove('empty');
  resultNode.innerHTML = `
    <strong>${data.employeeName}</strong> · Periode: ${data.period}
    <table class="table">
      <thead>
        <tr>
          <th>Aspek</th>
          <th>Skor (1-5)</th>
          <th>Konversi (%)</th>
          <th>Kontribusi</th>
        </tr>
      </thead>
      <tbody>
        ${data.detail
          .map(
            (item) => `
          <tr>
            <td>${labelFromId(item.id)}</td>
            <td>${item.raw.toFixed(1)}</td>
            <td>${item.percent.toFixed(2)}</td>
            <td>${item.contribution.toFixed(2)}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
    <p><strong>Total Nilai:</strong> ${data.total.toFixed(2)} / 100</p>
    <p><strong>Predikat:</strong> <span class="badge ${data.rating.className}">${data.rating.label}</span></p>
  `;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(item) {
  const history = loadHistory();
  history.unshift({
    timestamp: new Date().toISOString(),
    ...item,
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
}

function renderHistory() {
  const history = loadHistory();
  if (!history.length) {
    historyNode.className = 'history empty';
    historyNode.textContent = 'Belum ada data tersimpan.';
    return;
  }

  historyNode.className = 'history';
  historyNode.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Waktu</th>
          <th>Nama</th>
          <th>Periode</th>
          <th>Total</th>
          <th>Predikat</th>
        </tr>
      </thead>
      <tbody>
        ${history
          .map(
            (item) => `
          <tr>
            <td>${new Date(item.timestamp).toLocaleString('id-ID')}</td>
            <td>${item.employeeName}</td>
            <td>${item.period}</td>
            <td>${item.total.toFixed(2)}</td>
            <td><span class="badge ${item.rating.className}">${item.rating.label}</span></td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function resetForm() {
  document.getElementById('employeeName').value = '';
  document.getElementById('period').value = '';
  inputIds.forEach((id) => {
    document.getElementById(id).value = '4';
  });

  resultNode.className = 'result empty';
  resultNode.textContent = 'Belum ada perhitungan.';
}

document.getElementById('calculateBtn').addEventListener('click', () => {
  const appraisal = calculateAppraisal();
  renderResult(appraisal);
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const appraisal = calculateAppraisal();
  renderResult(appraisal);
  saveHistory(appraisal);
  renderHistory();
});

document.getElementById('resetBtn').addEventListener('click', resetForm);

renderHistory();
