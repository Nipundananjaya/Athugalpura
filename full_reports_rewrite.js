const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');

// Find the REPORTS & ANALYTICS LOGIC script block and replace its content
const scriptStart = c.indexOf('// ==========================================\n// REPORTS & ANALYTICS LOGIC');
const scriptEnd = c.indexOf('</script>', scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.log('Could not find reports script block');
  process.exit(1);
}

const newReportsScript = `// ==========================================
// REPORTS & ANALYTICS LOGIC
// ==========================================
let chartRevenue, chartOrderVolume, chartMenuPerformance, chartTablePerformance;

const reportsTypePreset = document.getElementById('reports-type-preset');
const reportsDatePreset = document.getElementById('reports-date-preset');
const reportsCustomDates = document.getElementById('reports-custom-dates');
const reportsStartDate = document.getElementById('reports-start-date');
const reportsEndDate = document.getElementById('reports-end-date');
const btnGenerateReport = document.getElementById('btn-generate-report');
const btnExportCsv = document.getElementById('btn-export-csv');
const btnExportPdf = document.getElementById('btn-export-pdf');

// Show/Hide custom date inputs
if (reportsDatePreset) {
  reportsDatePreset.addEventListener('change', () => {
    if (reportsCustomDates) {
      reportsCustomDates.style.display = reportsDatePreset.value === 'custom' ? 'flex' : 'none';
    }
  });
}

function getReportDateRange() {
  const preset = reportsDatePreset ? reportsDatePreset.value : 'today';
  let start = new Date(), end = new Date();
  if (preset === 'yesterday') {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (preset === 'last7') {
    start.setDate(start.getDate() - 7);
  } else if (preset === 'thismonth') {
    start = new Date(start.getFullYear(), start.getMonth(), 1);
  } else if (preset === 'custom') {
    start = new Date(reportsStartDate.value || Date.now());
    end = new Date(reportsEndDate.value || Date.now());
  }
  const formatDate = (d) => {
    const pad = n => n < 10 ? '0'+n : n;
    return \`\${d.getFullYear()}-\${pad(d.getMonth()+1)}-\${pad(d.getDate())}\`;
  };
  return { start_date: formatDate(start), end_date: formatDate(end) };
}

function fetchReportsData() {
  const dates = getReportDateRange();
  const type = reportsTypePreset.value;
  ['sales','orders','items','tables'].forEach(t => {
    const el = document.getElementById('report-view-' + t);
    if (el) el.style.display = 'none';
  });
  const view = document.getElementById('report-view-' + type);
  if (view) { view.style.display = 'flex'; view.style.flexDirection = 'column'; }

  fetch('/api/admin?action=fetch_reports&start_date=' + dates.start_date + '&end_date=' + dates.end_date)
    .then(res => res.json())
    .then(res => {
      if (res.success && res.data) {
        window.lastReportData = res.data;
        window.lastReportDates = dates;
        renderReports(res.data, type, dates);
      } else {
        console.error('Failed to fetch reports:', res.message);
      }
    })
    .catch(err => console.error('Reports Error:', err));
}

if (btnGenerateReport) {
  btnGenerateReport.addEventListener('click', fetchReportsData);
}

function getRankBadge(i) {
  const medals = ['🥇','🥈','🥉'];
  if (i < 3) return \`<span class="rank-badge" style="font-size:18px;">\${medals[i]}</span>\`;
  return \`<span class="rank-badge normal">\${i+1}</span>\`;
}

function getBarHtml(val, max, color) {
  const pct = max > 0 ? Math.round((val / max) * 100) : 0;
  return \`<div class="revenue-bar-cell"><div class="revenue-bar-track"><div class="revenue-bar-fill" style="width:\${pct}%; background:\${color || 'linear-gradient(90deg,#FF4B2B,#FF9209)'}"></div></div><span style="font-size:11px;color:var(--muted);min-width:28px;">\${pct}%</span></div>\`;
}

function updateDateBadge(id, dates) {
  const el = document.getElementById(id);
  if (el) el.textContent = dates.start_date + ' → ' + dates.end_date;
}

function renderReports(data, type, dates) {
  if (type === 'sales') {
    document.getElementById('r-gross-rev').textContent = 'Rs. ' + parseFloat(data.revenue_sales.gross_revenue).toFixed(2);
    document.getElementById('r-net-rev').textContent   = 'Rs. ' + parseFloat(data.revenue_sales.net_profit).toFixed(2);
    document.getElementById('r-aov').textContent       = 'Rs. ' + parseFloat(data.revenue_sales.aov).toFixed(2);
    updateDateBadge('r-sales-date-badge', dates);
    const tbody = document.getElementById('tbody-report-sales');
    const rows = data.revenue_sales.timeline;
    const maxRev = rows.length ? Math.max(...rows.map(r => parseFloat(r.revenue))) : 0;
    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4"><div class="report-empty-state"><p>No sales data found for this period.</p></div></td></tr>';
    } else {
      rows.forEach((row, i) => {
        const rev = parseFloat(row.revenue);
        tbody.innerHTML += '<tr><td class="col-rank">' + (i+1) + '</td><td class="col-primary">' + row.report_date + '</td><td class="col-money" style="text-align:right;">Rs. ' + rev.toFixed(2) + '</td><td>' + getBarHtml(rev, maxRev) + '</td></tr>';
      });
    }
  }
  else if (type === 'orders') {
    document.getElementById('r-total-orders').textContent  = data.order_volume.total_orders;
    document.getElementById('r-cancel-orders').textContent = data.order_volume.cancelled_orders;
    updateDateBadge('r-orders-date-badge', dates);
    const tbody = document.getElementById('tbody-report-orders');
    const rows = data.order_volume.timeline;
    const maxCount = rows.length ? Math.max(...rows.map(r => parseInt(r.count))) : 0;
    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3"><div class="report-empty-state"><p>No orders data found for this period.</p></div></td></tr>';
    } else {
      rows.forEach(row => {
        const count = parseInt(row.count);
        tbody.innerHTML += '<tr><td class="col-primary">' + row.hour_of_day + ':00 &rarr; ' + (parseInt(row.hour_of_day)+1) + ':00</td><td style="text-align:center;font-weight:700;font-size:15px;color:var(--heading);">' + count + '</td><td>' + getBarHtml(count, maxCount, 'linear-gradient(90deg,#3d4168,#6a6f9e)') + '</td></tr>';
      });
    }
  }
  else if (type === 'items') {
    updateDateBadge('r-items-date-badge', dates);
    const tbody = document.getElementById('tbody-report-items');
    const rows = data.menu_performance.top_items;
    const maxRev = rows.length ? Math.max(...rows.map(r => parseFloat(r.item_revenue))) : 0;
    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="report-empty-state"><p>No item data found for this period.</p></div></td></tr>';
    } else {
      rows.forEach((row, i) => {
        const rev = parseFloat(row.item_revenue);
        tbody.innerHTML += '<tr><td class="col-rank">' + getRankBadge(i) + '</td><td class="col-primary">' + row.item_name + '</td><td><span style="background:#F3F4F8;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600;color:var(--muted);">' + row.category_name + '</span></td><td style="text-align:center;font-weight:700;">' + row.sold_qty + ' <span style="color:var(--muted);font-weight:400;font-size:12px;">pcs</span></td><td class="col-money" style="text-align:right;">Rs. ' + rev.toFixed(2) + '</td><td>' + getBarHtml(rev, maxRev) + '</td></tr>';
      });
    }
  }
  else if (type === 'tables') {
    document.getElementById('r-single-count').textContent = data.table_traffic.single_count;
    document.getElementById('r-group-count').textContent  = data.table_traffic.group_count;
    updateDateBadge('r-tables-date-badge', dates);
    const tbody = document.getElementById('tbody-report-tables');
    const rows = data.table_traffic.table_stats;
    const maxOrders = rows.length ? Math.max(...rows.map(r => parseInt(r.total_orders))) : 0;
    tbody.innerHTML = '';
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="report-empty-state"><p>No table data found for this period.</p></div></td></tr>';
    } else {
      rows.forEach((row, i) => {
        const orders = parseInt(row.total_orders);
        tbody.innerHTML += '<tr><td class="col-rank">' + getRankBadge(i) + '</td><td class="col-primary">Table ' + row.table_number + '</td><td style="text-align:center;font-weight:600;">' + row.unique_customers + '</td><td style="text-align:center;font-weight:700;font-size:15px;color:var(--heading);">' + orders + '</td><td>' + getBarHtml(orders, maxOrders, 'linear-gradient(90deg,#FF9209,#FFB347)') + '</td></tr>';
      });
    }
  }
}

// ── CSV Export ──────────────────────────────────────────────────────────────
if (btnExportCsv) {
  btnExportCsv.addEventListener('click', () => {
    const type = reportsTypePreset.value;
    const table = document.getElementById('table-report-' + type);
    if (!table) return;
    let csv = 'data:text/csv;charset=utf-8,';
    table.querySelectorAll('tr').forEach(row => {
      const cols = Array.from(row.querySelectorAll('th,td')).map(c => '"' + c.innerText.replace(/\\n/g,' ').trim() + '"').join(',');
      csv += cols + '\\n';
    });
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'Athugalpura_' + type + '_Report.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  });
}

// ── Professional PDF Export ──────────────────────────────────────────────────
function buildPdfHtml(type, data, dates) {
  const typeLabel = { sales:'Revenue & Sales', orders:'Order Volume', items:'Menu Performance', tables:'Table Traffic' };
  const label = typeLabel[type] || type.toUpperCase();
  const th = 'padding:10px 14px;text-align:left;font-size:13px;font-weight:700;background:#f1f5f9;color:#334155;border-bottom:2px solid #cbd5e1;';
  const td = 'padding:10px 14px;font-size:13px;border-bottom:1px solid #e2e8f0;color:#1e293b;';
  const tdR = td + 'text-align:right;font-weight:700;';
  const tdC = td + 'text-align:center;';
  const kpi = (lbl, val, color) => '<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;text-align:center;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' + lbl + '</div><div style="font-size:22px;font-weight:800;color:' + (color||'#0f172a') + ';">' + val + '</div></div>';
  let body = '';
  if (type === 'sales' && data.revenue_sales) {
    const d = data.revenue_sales;
    body = '<div style="display:flex;gap:14px;margin-bottom:28px;">' +
      kpi('Gross Revenue', 'Rs. '+parseFloat(d.gross_revenue).toFixed(2)) +
      kpi('Net Profit', 'Rs. '+parseFloat(d.net_profit).toFixed(2), '#059669') +
      kpi('Avg Order Value', 'Rs. '+parseFloat(d.aov).toFixed(2)) +
    '</div><table style="width:100%;border-collapse:collapse;"><thead><tr><th style="' + th + '">Date</th><th style="' + th + 'text-align:right;">Revenue (Rs.)</th></tr></thead><tbody>' +
    d.timeline.map(r => '<tr><td style="' + td + '">' + r.report_date + '</td><td style="' + tdR + '">Rs. ' + parseFloat(r.revenue).toFixed(2) + '</td></tr>').join('') +
    '</tbody></table>';
  } else if (type === 'orders' && data.order_volume) {
    const d = data.order_volume;
    body = '<div style="display:flex;gap:14px;margin-bottom:28px;">' +
      kpi('Total Orders', d.total_orders) + kpi('Cancelled', d.cancelled_orders, '#ef4444') +
    '</div><table style="width:100%;border-collapse:collapse;"><thead><tr><th style="' + th + '">Time Slot</th><th style="' + th + 'text-align:center;">Orders</th></tr></thead><tbody>' +
    d.timeline.map(r => '<tr><td style="' + td + '">' + r.hour_of_day + ':00 – ' + (parseInt(r.hour_of_day)+1) + ':00</td><td style="' + tdC + '">' + r.count + '</td></tr>').join('') +
    '</tbody></table>';
  } else if (type === 'items' && data.menu_performance) {
    body = '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="' + th + '">#</th><th style="' + th + '">Item Name</th><th style="' + th + '">Category</th><th style="' + th + 'text-align:center;">Qty</th><th style="' + th + 'text-align:right;">Revenue</th></tr></thead><tbody>' +
    data.menu_performance.top_items.map((r,i) => '<tr><td style="' + tdC + '">' + (i+1) + '</td><td style="' + td + 'font-weight:700;">' + r.item_name + '</td><td style="' + td + '">' + r.category_name + '</td><td style="' + tdC + '">' + r.sold_qty + ' pcs</td><td style="' + tdR + 'color:#059669;">Rs. ' + parseFloat(r.item_revenue).toFixed(2) + '</td></tr>').join('') +
    '</tbody></table>';
  } else if (type === 'tables' && data.table_traffic) {
    const d = data.table_traffic;
    body = '<div style="display:flex;gap:14px;margin-bottom:28px;">' +
      kpi('Single Customers', d.single_count) + kpi('Group Customers', d.group_count) +
    '</div><table style="width:100%;border-collapse:collapse;"><thead><tr><th style="' + th + '">#</th><th style="' + th + '">Table</th><th style="' + th + 'text-align:center;">Unique Customers</th><th style="' + th + 'text-align:center;">Total Orders</th></tr></thead><tbody>' +
    d.table_stats.map((r,i) => '<tr><td style="' + tdC + '">' + (i+1) + '</td><td style="' + td + 'font-weight:700;">Table ' + r.table_number + '</td><td style="' + tdC + '">' + r.unique_customers + '</td><td style="' + tdC + 'font-weight:700;">' + r.total_orders + '</td></tr>').join('') +
    '</tbody></table>';
  }
  return '<div style="width:780px;background:#fff;font-family:Arial,sans-serif;color:#1e293b;padding:50px;box-sizing:border-box;">' +
    '<div style="text-align:center;border-bottom:3px solid #FF4B2B;padding-bottom:24px;margin-bottom:32px;">' +
      '<div style="font-size:26px;font-weight:900;color:#0f172a;margin-bottom:6px;">Athugalpura Restaurant</div>' +
      '<div style="font-size:17px;font-weight:700;color:#FF4B2B;margin-bottom:8px;">' + label + ' Report</div>' +
      '<div style="font-size:12px;color:#64748b;">Period: <strong>' + dates.start_date + '</strong> to <strong>' + dates.end_date + '</strong> &nbsp;|&nbsp; Generated: ' + new Date().toLocaleString() + '</div>' +
    '</div>' + body +
    '<div style="margin-top:40px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;">Confidential &mdash; Athugalpura Restaurant Management System</div>' +
  '</div>';
}

if (btnExportPdf) {
  btnExportPdf.addEventListener('click', () => {
    if (!window.lastReportData) {
      alert('Please generate a report first by clicking the Generate button.');
      return;
    }
    const type = reportsTypePreset.value;
    btnExportPdf.disabled = true;
    btnExportPdf.innerHTML = 'Generating PDF...';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;z-index:-9999;background:#fff;';
    wrapper.innerHTML = buildPdfHtml(type, window.lastReportData, window.lastReportDates);
    document.body.appendChild(wrapper);
    setTimeout(() => {
      html2canvas(wrapper.firstElementChild, { scale:2, useCORS:true, logging:false, backgroundColor:'#ffffff' }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p','mm','a4');
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        const pageH = pdf.internal.pageSize.getHeight();
        if (pdfH <= pageH) {
          pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
        } else {
          const totalPages = Math.ceil(pdfH / pageH);
          for (let p = 0; p < totalPages; p++) {
            if (p > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -(p * pageH), pdfW, pdfH);
          }
        }
        pdf.save('Athugalpura_' + type + '_Report.pdf');
        document.body.removeChild(wrapper);
        btnExportPdf.disabled = false;
        btnExportPdf.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg> PDF';
      }).catch(err => {
        console.error(err);
        if (wrapper.parentNode) document.body.removeChild(wrapper);
        btnExportPdf.disabled = false;
        btnExportPdf.innerHTML = 'PDF Error';
      });
    }, 200);
  });
}
`;

c = c.slice(0, scriptStart) + newReportsScript + c.slice(scriptEnd);
fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', c, 'utf8');
console.log('✅ Reports script fully replaced — line count: ' + c.split('\n').length);
