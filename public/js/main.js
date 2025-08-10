// public/js/main.js
// Handles modal, user flow, save to /save-invoice and print generation (client-side)
document.addEventListener('DOMContentLoaded', () => {
  // Basic redirect: if not from login, user can still access - we assume login handled separately
  // Optionally display username in header (if you store that)
  const userDisplay = document.getElementById('userDisplay');
  userDisplay.textContent = ''; // you can set saved name here

  // Elements
  const monthSelect = document.getElementById('month');
  const yearSelect = document.getElementById('year');
  const openBtn = document.getElementById('openBtn');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const tablesContainer = document.getElementById('tablesContainer');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const total1El = document.getElementById('total1');
  const total2El = document.getElementById('total2');
  const totalAllEl = document.getElementById('totalAll');
  const amountWords = document.getElementById('amountWords');
  const customerInput = document.getElementById('customer');
  const logoutBtn = document.getElementById('logoutBtn');

  // populate month/year
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  months.forEach((m,i) => {
    const opt = document.createElement('option'); opt.value = i+1; opt.textContent = m;
    monthSelect.appendChild(opt);
  });
  const now = new Date();
  for(let y = now.getFullYear(); y >= now.getFullYear()-5; y--){
    const opt = document.createElement('option'); opt.value = y; opt.textContent = y;
    yearSelect.appendChild(opt);
  }
  monthSelect.value = now.getMonth()+1;
  yearSelect.value = now.getFullYear();

  openBtn.addEventListener('click', () => {
    const cust = customerInput.value.trim();
    if (!cust) return alert('Enter customer name first.');
    openMonthEditor();
  });
  closeModal.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);

  logoutBtn.addEventListener('click', () => {
    // if you had auth tokens stored, clear them here
    window.location.href = '/login.html';
  });

  function close(){ modal.classList.remove('show'); tablesContainer.innerHTML = ''; amountWords.value = ''; }

  function openMonthEditor(){
    tablesContainer.innerHTML = '';
    const m = parseInt(monthSelect.value)-1;
    const y = parseInt(yearSelect.value);
    const daysInMonth = new Date(y, m+1, 0).getDate();
    // build two tables
    const table1 = buildTable(1, Math.min(15, daysInMonth));
    const table2 = buildTable(16, daysInMonth);
    tablesContainer.appendChild(table1);
    tablesContainer.appendChild(table2);
    modal.classList.add('show');
    recalcTotals();
  }

  function buildTable(start, end){
    const container = document.createElement('div'); container.className = 'daily-table';
    const title = document.createElement('h4'); title.textContent = `${start} - ${end}`; container.appendChild(title);
    const table = document.createElement('table');
    const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>S.no</th><th>Date</th><th>Amount</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    for(let d = start; d <= end; d++){
      const tr = document.createElement('tr');
      const td1 = document.createElement('td'); td1.textContent = d;
      const td2 = document.createElement('td');
      // Show actual date in DD/MM/YYYY format
      const y = parseInt(yearSelect.value);
      const m = parseInt(monthSelect.value)-1;
      const dateObj = new Date(y, m, d);
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const yyyy = dateObj.getFullYear();
      td2.textContent = `${dd}/${mm}/${yyyy}`;
      const td3 = document.createElement('td');
      const inp = document.createElement('input'); inp.type = 'text'; inp.placeholder = 'amount or -';
      inp.dataset.day = d;
      inp.addEventListener('input', recalcTotals);
      td3.appendChild(inp);
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
    return container;
  }

  function recalcTotals(){
    const inputs = modal.querySelectorAll('input[type="text"]');
    let t1 = 0, t2 = 0;
    inputs.forEach(inp => {
      const val = inp.value.trim();
      const day = Number(inp.dataset.day);
      if (val === '-' || val === '') return;
      const num = Number(val);
      if (isNaN(num)) return;
      if (day <= 15) t1 += num; else t2 += num;
    });
    total1El.textContent = t1.toFixed(2);
    total2El.textContent = t2.toFixed(2);
    totalAllEl.textContent = (t1 + t2).toFixed(2);
    // Convert total amount to words automatically
    amountWords.value = numberToWords(Math.round(t1 + t2));
  }

// Helper function to convert number to words (simple version)
function numberToWords(num) {
  if (num === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '');
    if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' and ' + convert(n%100) : '');
    if (n < 100000) return convert(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + convert(n%1000) : '');
    if (n < 10000000) return convert(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + convert(n%100000) : '');
    return n;
  }
  return convert(num) + ' Only';
}

  // Save + Print flow
  saveBtn.addEventListener('click', async () => {
    const cust = customerInput.value.trim();
    if (!cust) return alert('Enter customer name first.');
    const m = parseInt(monthSelect.value)-1;
    const y = parseInt(yearSelect.value);
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const monthFirstDay = new Date(y, m, 1).toISOString().slice(0,10);

    // collect daily data
    const inputs = modal.querySelectorAll('input[type="text"]');
    const dailyRows = [];
    inputs.forEach(inp => {
      const day = Number(inp.dataset.day);
      const raw = inp.value.trim();
      if (raw === '-' || raw === '') {
        dailyRows.push({ day_num: day, date: formatISODate(y, m, day), amount: null, is_empty: true, notes: null });
      } else {
        const num = Number(raw);
        if (isNaN(num)) {
          dailyRows.push({ day_num: day, date: formatISODate(y, m, day), amount: null, is_empty: true, notes: 'invalid' });
        } else {
          dailyRows.push({ day_num: day, date: formatISODate(y, m, day), amount: num, is_empty: false, notes: null });
        }
      }
    });

    // compute totals
    let t1 = 0, t2 = 0;
    dailyRows.forEach(r => {
      if (!r.is_empty && r.amount !== null) {
        if (r.day_num <= 15) t1 += Number(r.amount); else t2 += Number(r.amount);
      }
    });
    const totalAmount = (t1 + t2).toFixed(2);

    const payload = {
      customerName: cust,
      monthYear: monthFirstDay,
      dailyAmounts: dailyRows.map(r => ({ date: r.date, amount: r.amount === null ? null : r.amount })),
      totalAmount: totalAmount,
      totalWords: amountWords.value || ''
    };

    try {
      const resp = await fetch('/save-invoice', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (data.success) {
        modal.classList.remove('show');
        openPrintWindow({ invoiceId: data.insertId || data.invoiceId || null, customer: cust, monthYear: monthFirstDay, daily: dailyRows, totals: { t1, t2, grand: (t1 + t2) }, words: payload.totalWords });
      } else {
        alert(data.message || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving invoice.');
    }
  });

  // helper to open print-ready window and trigger print (uses local data)
  function openPrintWindow({ invoiceId=null, customer, monthYear, daily, totals, words }) {
    // prepare HTML string
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const mdate = new Date(monthYear);
    const monthText = `${months[mdate.getMonth()]} ${mdate.getFullYear()}`;

    const win = window.open('', '_blank');
    const html = buildPrintHTML({ customer, monthText, daily, totals, words });
    win.document.open();
    win.document.write(html);
    win.document.close();

    // give browser a moment to render then call print
    setTimeout(() => {
      try { win.focus(); win.print(); } catch (e) { console.warn('Print failed', e); }
    }, 600);
  }

  function buildPrintHTML({ customer, monthText, daily, totals, words }) {
    // split into two tables: 1-15 and 16-end
    const t1Rows = daily.filter(r => r.day_num <= 15);
    const t2Rows = daily.filter(r => r.day_num > 15);
    const t1Sum = totals.t1.toFixed(2);
    const t2Sum = totals.t2.toFixed(2);
    const grand = totals.grand.toFixed(2);

    const tableRowsHTML = (rows) => rows.map(r => {
      const amount = (r.is_empty || r.amount === null) ? '-' : Number(r.amount).toFixed(2);
      return `<tr><td style="border:1px solid #ccc;padding:6px">${r.day_num}</td><td style="border:1px solid #ccc;padding:6px">${r.date}</td><td style="border:1px solid #ccc;padding:6px;text-align:right">${amount}</td></tr>`;
    }).join('');

    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${customer} - ${monthText}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Montserrat, Arial, sans-serif; color:#111; padding:24px; background:#fff; }
    .invoice-header { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #eee; padding-bottom:12px; margin-bottom:18px; }
    .logo-wrap { width:90px; height:90px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#FFBF00,#ffd84d); border-radius:16px; box-shadow:0 4px 24px rgba(255,191,0,0.12); }
    .logo-wrap img { width:70px; height:70px; object-fit:contain; border-radius:12px; }
    .company-info { margin-left:18px; }
    .company-info h1 { margin:0; font-size:26px; letter-spacing:1px; }
    .muted { color:#555; font-size:13px; }
    .invoice-title { text-align:right; font-weight:700; font-size:20px; letter-spacing:1px; }
    .invoice-date { text-align:right; color:#888; font-size:14px; }
    .to-section { margin:18px 0 10px 0; font-weight:600; font-size:15px; }
    .tables { display:flex; gap:18px; justify-content:space-between; margin-top:12px; }
    .table { width:48%; background:#fafafa; border-radius:8px; box-shadow:0 2px 8px #eee; }
    table { width:100%; border-collapse:collapse; }
    th,td { padding:8px; border:1px solid #ccc; font-size:13px; text-align:left; }
    th { background:#f5f5f5; font-size:13px; }
    .right { text-align:right; }
    .totals { margin-top:18px; font-size:15px; }
    .totals strong { font-size:16px; color:#222; }
    .words { margin-top:6px; font-size:13px; color:#444; }
    .signature-section { margin-top:40px; text-align:right; }
    .auth-label { font-size:13px; color:#555; margin-bottom:8px; }
    .signatory { font-size:15px; font-weight:700; border-top:2px solid #222; display:inline-block; padding-top:8px; margin-top:6px; }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div style="display:flex;align-items:center;">
      <div class="logo-wrap"><img src="/logo.png" alt="Logo"></div>
      <div class="company-info">
        <h1>SHANKAR SAH</h1>
        <div class="muted">Gamharia market complex - 832108</div>
        <div class="muted">Contact: 8210945932 | Email: shankarvegetableshop7@gmail.com</div>
      </div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-date">${monthText}</div>
    </div>
  </div>

  <div class="to-section">To: ${escapeHtml(customer)}</div>

  <div class="tables">
    <div class="table">
      <table>
        <thead><tr><th>S.no</th><th>Date</th><th>Amount</th></tr></thead>
        <tbody>
          ${tableRowsHTML(t1Rows)}
        </tbody>
        <tfoot><tr><th colspan="2">Total 1</th><th class="right">${t1Sum}</th></tr></tfoot>
      </table>
    </div>

    <div class="table">
      <table>
        <thead><tr><th>S.no</th><th>Date</th><th>Amount</th></tr></thead>
        <tbody>
          ${tableRowsHTML(t2Rows)}
        </tbody>
        <tfoot><tr><th colspan="2">Total 2</th><th class="right">${t2Sum}</th></tr></tfoot>
      </table>
    </div>
  </div>

  <div class="totals">
    <div>Total Amount to be Paid: <strong>${grand}</strong></div>
    <div class="words">Total Amount in Words: <span>${escapeHtml(words || '')}</span></div>
  </div>

  <div class="signature-section">
    <div class="signatory">SHANKAR SAH</div>
    <div class="auth-label">Authorized Signatory</div>
  </div>
</body>
</html>
    `;
  }

  // small helpers
  function formatISODate(year, monthZeroBased, day) {
    const d = new Date(year, monthZeroBased, day);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
});


// Modal elements
const previousBillsModal = document.getElementById("previousBillsModal");
const viewPreviousBtn = document.getElementById("viewPreviousBtn");
const closePreviousModal = document.getElementById("closePreviousModal");
const previousBillsTableBody = document.querySelector("#previousBillsTable tbody");

viewPreviousBtn.addEventListener("click", async () => {
    const res = await fetch("/get-invoices");
    const invoices = await res.json();

    previousBillsTableBody.innerHTML = "";
    invoices.forEach(inv => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${inv.month_id}</td>
            <td>${inv.customer_name}</td>
            <td>${inv.month_year}</td>
            <td>${inv.total_amount}</td>
            <td><button class="print-btn" data-id="${inv.month_id}">Print</button></td>
        `;
        previousBillsTableBody.appendChild(row);
    });

    // Add print event listeners
    document.querySelectorAll(".print-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            const res = await fetch(`/get-invoice/${id}`);
            const data = await res.json();
            buildPrintHTML(data.invoice, data.dailyAmounts);
        });
    });

    previousBillsModal.style.display = "block";
});

closePreviousModal.addEventListener("click", () => {
    previousBillsModal.style.display = "none";
});

// Print builder (reuse existing logic)
function buildPrintHTML(invoice, dailyAmounts) {
    // Use the same print format as the main invoice print
    const t1Rows = dailyAmounts.filter(r => r.day_num <= 15);
    const t2Rows = dailyAmounts.filter(r => r.day_num > 15);
    let t1 = 0, t2 = 0;
    dailyAmounts.forEach(r => {
      if (r.amount !== null && r.amount !== '' && !isNaN(r.amount)) {
        if (r.day_num <= 15) t1 += Number(r.amount); else t2 += Number(r.amount);
      }
    });
    const totals = { t1, t2, grand: t1 + t2 };
    const monthText = invoice.month_year;
    const customer = invoice.customer_name;
    const words = invoice.total_amount_words;
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(buildPrintHTMLTemplate({ customer, monthText, daily: dailyAmounts, totals, words }));
    printWindow.document.close();
    setTimeout(() => { try { printWindow.focus(); printWindow.print(); } catch (e) {} }, 600);
}

function buildPrintHTMLTemplate({ customer, monthText, daily, totals, words }) {
    // Same as the improved invoice print preview
    const t1Rows = daily.filter(r => r.day_num <= 15);
    const t2Rows = daily.filter(r => r.day_num > 15);
    const t1Sum = totals.t1.toFixed(2);
    const t2Sum = totals.t2.toFixed(2);
    const grand = totals.grand.toFixed(2);
    const tableRowsHTML = (rows) => rows.map(r => {
      const amount = (r.is_empty || r.amount === null || r.amount === '') ? '-' : Number(r.amount).toFixed(2);
      return `<tr><td style="border:1px solid #ccc;padding:6px">${r.day_num}</td><td style="border:1px solid #ccc;padding:6px">${r.date || r.bill_date}</td><td style="border:1px solid #ccc;padding:6px;text-align:right">${amount}</td></tr>`;
    }).join('');
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${customer} - ${monthText}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Montserrat, Arial, sans-serif; color:#111; padding:24px; background:#fff; }
    .invoice-header { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #eee; padding-bottom:12px; margin-bottom:18px; }
    .logo-wrap { width:90px; height:90px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#FFBF00,#ffd84d); border-radius:16px; box-shadow:0 4px 24px rgba(255,191,0,0.12); }
    .logo-wrap img { width:70px; height:70px; object-fit:contain; border-radius:12px; }
    .company-info { margin-left:18px; }
    .company-info h1 { margin:0; font-size:26px; letter-spacing:1px; }
    .muted { color:#555; font-size:13px; }
    .invoice-title { text-align:right; font-weight:700; font-size:20px; letter-spacing:1px; }
    .invoice-date { text-align:right; color:#888; font-size:14px; }
    .to-section { margin:18px 0 10px 0; font-weight:600; font-size:15px; }
    .tables { display:flex; gap:18px; justify-content:space-between; margin-top:12px; }
    .table { width:48%; background:#fafafa; border-radius:8px; box-shadow:0 2px 8px #eee; }
    table { width:100%; border-collapse:collapse; }
    th,td { padding:8px; border:1px solid #ccc; font-size:13px; text-align:left; }
    th { background:#f5f5f5; font-size:13px; }
    .right { text-align:right; }
    .totals { margin-top:18px; font-size:15px; }
    .totals strong { font-size:16px; color:#222; }
    .words { margin-top:6px; font-size:13px; color:#444; }
    .signature-section { margin-top:40px; text-align:right; }
    .signatory { font-size:15px; font-weight:700; border-top:2px solid #222; display:inline-block; padding-top:8px; margin-top:6px; }
    .auth-label { font-size:13px; color:#555; margin-bottom:2px; }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div style="display:flex;align-items:center;">
      <div class="logo-wrap"><img src="/logo.png" alt="Logo"></div>
      <div class="company-info">
        <h1>SHANKAR SAH</h1>
        <div class="muted">Gamharia market complex - 832108</div>
        <div class="muted">Contact: 8210945932 | Email: shankarvegetableshop7@gmail.com</div>
      </div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-date">${monthText}</div>
    </div>
  </div>

  <div class="to-section">To: ${escapeHtml(customer)}</div>

  <div class="tables">
    <div class="table">
      <table>
        <thead><tr><th>S.no</th><th>Date</th><th>Amount</th></tr></thead>
        <tbody>
          ${tableRowsHTML(t1Rows)}
        </tbody>
        <tfoot><tr><th colspan="2">Total 1</th><th class="right">${t1Sum}</th></tr></tfoot>
      </table>
    </div>

    <div class="table">
      <table>
        <thead><tr><th>S.no</th><th>Date</th><th>Amount</th></tr></thead>
        <tbody>
          ${tableRowsHTML(t2Rows)}
        </tbody>
        <tfoot><tr><th colspan="2">Total 2</th><th class="right">${t2Sum}</th></tr></tfoot>
      </table>
    </div>
  </div>

  <div class="totals">
    <div>Total Amount to be Paid: <strong>${grand}</strong></div>
    <div class="words">Total Amount in Words: <span>${escapeHtml(words || '')}</span></div>
  </div>

  <div class="signature-section">
    <div class="signatory">SHANKAR SAH</div>
    <div class="auth-label">Authorized Signatory</div>
  </div>
</body>
</html>
    `;
}
