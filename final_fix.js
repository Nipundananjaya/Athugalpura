const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');

// 1. Save lastReportData globally when report is fetched
c = c.replace(
  'renderReports(res.data, type, dates);',
  'window.lastReportData = res.data; window.lastReportDates = dates; renderReports(res.data, type, dates);'
);

// 2. Also fix the 'orders' forEach - the table rows were mixed up (orders table using getRankBadge(i) and table cols)
// The orders forEach at line 3555 is wrong - it should only show hour/count, not table columns
// Let's find and fix it
const wrongOrdersRow = `      rows.forEach(row => {
        const count = parseInt(row.count);
        tbody.innerHTML += \`<tr>
          <td class="col-rank">\${getRankBadge(i)}</td>
          <td class="col-primary">Table \${row.table_number}</td>
          <td style="text-align:center; font-weight:600;">\${row.unique_customers}</td>
          <td style="text-align:center; font-weight:700; font-size:15px; color:var(--heading);">\${orders}</td>
          <td>\${getBarHtml(orders, maxOrders, 'linear-gradient(90deg,#FF9209,#FFB347)')}</td>
        </tr>\`;
      });
    }
  }
  if (window.feather) feather.replace();
}`;

const correctOrdersRow = `      rows.forEach(row => {
        const count = parseInt(row.count);
        tbody.innerHTML += \`<tr>
          <td class="col-primary">\${row.hour_of_day}:00 &rarr; \${parseInt(row.hour_of_day)+1}:00</td>
          <td style="text-align:center; font-weight:700; font-size:15px; color:var(--heading);">\${count}</td>
          <td>\${getBarHtml(count, maxCount, 'linear-gradient(90deg,#3d4168,#6a6f9e)')}</td>
        </tr>\`;
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
      tbody.innerHTML = \`<tr><td colspan="6"><div class="report-empty-state"><p>No item data found for this period.</p></div></td></tr>\`;
    } else {
      rows.forEach((row, i) => {
        const rev = parseFloat(row.item_revenue);
        tbody.innerHTML += \`<tr>
          <td class="col-rank">\${getRankBadge(i)}</td>
          <td class="col-primary">\${row.item_name}</td>
          <td><span style="background:#F3F4F8; padding:3px 10px; border-radius:20px; font-size:11.5px; font-weight:600; color:var(--muted);">\${row.category_name}</span></td>
          <td style="text-align:center; font-weight:700;">\${row.sold_qty} <span style="color:var(--muted); font-weight:400; font-size:12px;">pcs</span></td>
          <td class="col-money" style="text-align:right;">Rs. \${rev.toFixed(2)}</td>
          <td>\${getBarHtml(rev, maxRev)}</td>
        </tr>\`;
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
      tbody.innerHTML = \`<tr><td colspan="5"><div class="report-empty-state"><p>No table data found for this period.</p></div></td></tr>\`;
    } else {
      rows.forEach((row, i) => {
        const orders = parseInt(row.total_orders);
        tbody.innerHTML += \`<tr>
          <td class="col-rank">\${getRankBadge(i)}</td>
          <td class="col-primary">Table \${row.table_number}</td>
          <td style="text-align:center; font-weight:600;">\${row.unique_customers}</td>
          <td style="text-align:center; font-weight:700; font-size:15px; color:var(--heading);">\${orders}</td>
          <td>\${getBarHtml(orders, maxOrders, 'linear-gradient(90deg,#FF9209,#FFB347)')}</td>
        </tr>\`;
      });
    }
  }
  if (window.feather) feather.replace();
}`;

c = c.replace(wrongOrdersRow, correctOrdersRow);

// 3. Replace old PDF logic with professional version
const oldPdf = `if (btnExportPdf) {
  btnExportPdf.addEventListener('click', () => {
    const type = reportsTypePreset.value;
    const printArea = document.getElementById(\`report-view-\${type}\`);
    if (!printArea || printArea.style.display === 'none') return;

    btnExportPdf.disabled = true;
    btnExportPdf.innerHTML = 'Generating...';
    
    printArea.classList.add('pdf-exporting');
    html2canvas(printArea, { scale: 2 }).then(canvas => {
      printArea.classList.remove('pdf-exporting');
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text(\`Athugalpura Restaurant - \${type.toUpperCase()} Report\`, 10, 10);
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(\`report_\${type}_\${new Date().getTime()}.pdf\`);
      
      btnExportPdf.disabled = false;
      btnExportPdf.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> PDF';
    }).catch(err => {
      printArea.classList.remove('pdf-exporting');
      console.error(err);
      btnExportPdf.disabled = false;
      btnExportPdf.innerHTML = 'PDF Error';
    });
  });
}`;

const newPdf = `
function buildPdfHtml(type, data, dates) {
  const typeLabel = { sales:'Revenue & Sales', orders:'Order Volume', items:'Menu Performance', tables:'Table Traffic' };
  const label = typeLabel[type] || type.toUpperCase();
  const th = 'padding:10px 14px;text-align:left;font-size:13px;font-weight:700;background:#f1f5f9;color:#334155;border-bottom:2px solid #cbd5e1;';
  const td = 'padding:10px 14px;font-size:13px;border-bottom:1px solid #e2e8f0;';
  const tdR = td + 'text-align:right;font-weight:700;';
  const tdC = td + 'text-align:center;';
  const kpi = (label,val,color='#0f172a') =>
    \`<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;text-align:center;">
      <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">\${label}</div>
      <div style="font-size:22px;font-weight:800;color:\${color};">\${val}</div>
    </div>\`;

  let body = '';
  if (type === 'sales' && data.revenue_sales) {
    const d = data.revenue_sales;
    body = \`
      <div style="display:flex;gap:14px;margin-bottom:28px;">
        \${kpi('Gross Revenue', 'Rs. ' + parseFloat(d.gross_revenue).toFixed(2))}
        \${kpi('Net Profit', 'Rs. ' + parseFloat(d.net_profit).toFixed(2), '#059669')}
        \${kpi('Avg Order Value', 'Rs. ' + parseFloat(d.aov).toFixed(2))}
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="\${th}">Date</th><th style="\${th}text-align:right;">Revenue (Rs.)</th></tr></thead>
        <tbody>\${d.timeline.map(r=>\`<tr><td style="\${td}">\${r.report_date}</td><td style="\${tdR}">Rs. \${parseFloat(r.revenue).toFixed(2)}</td></tr>\`).join('')}</tbody>
      </table>\`;
  } else if (type === 'orders' && data.order_volume) {
    const d = data.order_volume;
    body = \`
      <div style="display:flex;gap:14px;margin-bottom:28px;">
        \${kpi('Total Orders', d.total_orders)}
        \${kpi('Cancelled', d.cancelled_orders, '#ef4444')}
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="\${th}">Time Slot</th><th style="\${th}text-align:center;">Orders</th></tr></thead>
        <tbody>\${d.timeline.map(r=>\`<tr><td style="\${td}">\${r.hour_of_day}:00 – \${parseInt(r.hour_of_day)+1}:00</td><td style="\${tdC}">\${r.count}</td></tr>\`).join('')}</tbody>
      </table>\`;
  } else if (type === 'items' && data.menu_performance) {
    body = \`
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="\${th}">#</th><th style="\${th}">Item Name</th><th style="\${th}">Category</th><th style="\${th}text-align:center;">Qty Sold</th><th style="\${th}text-align:right;">Revenue</th></tr></thead>
        <tbody>\${data.menu_performance.top_items.map((r,i)=>\`<tr><td style="\${tdC}">\${i+1}</td><td style="\${td}font-weight:700;">\${r.item_name}</td><td style="\${td}">\${r.category_name}</td><td style="\${tdC}">\${r.sold_qty} pcs</td><td style="\${tdR}color:#059669;">Rs. \${parseFloat(r.item_revenue).toFixed(2)}</td></tr>\`).join('')}</tbody>
      </table>\`;
  } else if (type === 'tables' && data.table_traffic) {
    const d = data.table_traffic;
    body = \`
      <div style="display:flex;gap:14px;margin-bottom:28px;">
        \${kpi('Single Customers', d.single_count)}
        \${kpi('Group Customers', d.group_count)}
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="\${th}">#</th><th style="\${th}">Table</th><th style="\${th}text-align:center;">Unique Customers</th><th style="\${th}text-align:center;">Total Orders</th></tr></thead>
        <tbody>\${d.table_stats.map((r,i)=>\`<tr><td style="\${tdC}">\${i+1}</td><td style="\${td}font-weight:700;">Table \${r.table_number}</td><td style="\${tdC}">\${r.unique_customers}</td><td style="\${tdC}font-weight:700;">\${r.total_orders}</td></tr>\`).join('')}</tbody>
      </table>\`;
  }

  return \`<div style="width:780px;background:#fff;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;padding:50px;">
    <div style="text-align:center;border-bottom:3px solid #FF4B2B;padding-bottom:24px;margin-bottom:32px;">
      <div style="font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">🍽 Athugalpura Restaurant</div>
      <div style="font-size:18px;font-weight:700;color:#FF4B2B;margin:8px 0;">\${label} Report</div>
      <div style="font-size:13px;color:#64748b;">Period: <strong>\${dates.start_date}</strong> to <strong>\${dates.end_date}</strong> &nbsp;|&nbsp; Generated: \${new Date().toLocaleString()}</div>
    </div>
    \${body}
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;">
      Confidential — Athugalpura Restaurant Management System
    </div>
  </div>\`;
}

if (btnExportPdf) {
  btnExportPdf.addEventListener('click', () => {
    if (!window.lastReportData) {
      alert('Please generate a report first by clicking Generate.');
      return;
    }
    const type = reportsTypePreset.value;
    btnExportPdf.disabled = true;
    btnExportPdf.innerHTML = '<i data-feather="loader" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Generating...';
    if(window.feather) feather.replace();

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;z-index:-1;';
    wrapper.innerHTML = buildPdfHtml(type, window.lastReportData, window.lastReportDates);
    document.body.appendChild(wrapper);

    setTimeout(() => {
      html2canvas(wrapper.firstElementChild, { scale: 2, useCORS: true, logging: false }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        if (pdfH <= pdf.internal.pageSize.getHeight()) {
          pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
        } else {
          let y = 0;
          const pageH = pdf.internal.pageSize.getHeight();
          const totalPages = Math.ceil(pdfH / pageH);
          for (let p = 0; p < totalPages; p++) {
            if (p > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -p * pageH, pdfW, pdfH);
          }
        }
        pdf.save('Athugalpura_' + type + '_Report.pdf');
        document.body.removeChild(wrapper);
        btnExportPdf.disabled = false;
        btnExportPdf.innerHTML = '<i data-feather="download" style="width:14px;height:14px;margin-right:4px;vertical-align:middle;"></i> PDF';
        if(window.feather) feather.replace();
      }).catch(err => {
        console.error(err);
        if(wrapper.parentNode) document.body.removeChild(wrapper);
        btnExportPdf.disabled = false;
        btnExportPdf.innerHTML = 'PDF Error';
      });
    }, 200);
  });
}`;

if (c.includes(oldPdf)) {
  c = c.replace(oldPdf, newPdf);
  console.log('✅ PDF logic replaced successfully');
} else {
  console.log('❌ Old PDF string not found — checking...');
  // Find existing btnExportPdf block and replace
  c = c.replace(/if \(btnExportPdf\) \{[\s\S]*?\}\r?\n\}[\s\S]*?<\/script>/m, newPdf + '\n</script>');
  console.log('Attempted fallback replacement');
}

fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', c, 'utf8');
