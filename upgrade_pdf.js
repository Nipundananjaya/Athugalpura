const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');

// 1. Save data globally
c = c.replace(/renderReports\(res\.data, type, dates\);/g, `window.lastReportData = res.data; window.lastReportDates = dates; renderReports(res.data, type, dates);`);

// 2. Replace PDF logic
const oldPdfLogic = `if (btnExportPdf) {
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

const newPdfLogic = `
function generatePrintableHTML(type, data, dates) {
  let html = \`
    <div style="font-family: Arial, sans-serif; color: #1e293b; background: #fff; width: 800px; padding: 40px; box-sizing: border-box;">
      <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; color: #0f172a;">Athugalpura Restaurant</h1>
        <h2 style="margin: 10px 0 5px 0; font-size: 20px; color: #334155; text-transform: uppercase;">\${type} Report</h2>
        <p style="margin: 0; font-size: 14px; color: #64748b;">Period: \${dates.start_date} to \${dates.end_date}</p>
      </div>
  \`;

  const tableStyle = "width: 100%; border-collapse: collapse; margin-top: 20px;";
  const thStyle = "background: #f1f5f9; padding: 12px; text-align: left; font-size: 14px; font-weight: bold; border-bottom: 2px solid #cbd5e1; color: #334155;";
  const tdStyle = "padding: 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0;";

  if (type === 'sales') {
    html += \`
      <div style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div style="flex:1; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Gross Revenue</div>
          <div style="font-size:24px; font-weight:bold; color:#0f172a;">Rs. \${parseFloat(data.revenue_sales.gross_revenue).toFixed(2)}</div>
        </div>
        <div style="flex:1; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Net Profit</div>
          <div style="font-size:24px; font-weight:bold; color:#059669;">Rs. \${parseFloat(data.revenue_sales.net_profit).toFixed(2)}</div>
        </div>
        <div style="flex:1; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Avg Order Value</div>
          <div style="font-size:24px; font-weight:bold; color:#0f172a;">Rs. \${parseFloat(data.revenue_sales.aov).toFixed(2)}</div>
        </div>
      </div>
      <table style="\${tableStyle}">
        <thead><tr><th style="\${thStyle}">Date</th><th style="\${thStyle};text-align:right;">Revenue</th></tr></thead>
        <tbody>
    \`;
    data.revenue_sales.timeline.forEach(row => {
      html += \`<tr><td style="\${tdStyle}">\${row.report_date}</td><td style="\${tdStyle};text-align:right;font-weight:bold;">Rs. \${parseFloat(row.revenue).toFixed(2)}</td></tr>\`;
    });
    html += \`</tbody></table>\`;
  }
  else if (type === 'orders') {
    html += \`
      <div style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div style="flex:1; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Total Orders</div>
          <div style="font-size:24px; font-weight:bold; color:#0f172a;">\${data.order_volume.total_orders}</div>
        </div>
        <div style="flex:1; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Cancelled</div>
          <div style="font-size:24px; font-weight:bold; color:#ef4444;">\${data.order_volume.cancelled_orders}</div>
        </div>
      </div>
      <table style="\${tableStyle}">
        <thead><tr><th style="\${thStyle}">Hour of Day</th><th style="\${thStyle};text-align:right;">Order Count</th></tr></thead>
        <tbody>
    \`;
    data.order_volume.timeline.forEach(row => {
      html += \`<tr><td style="\${tdStyle}">\${row.hour_of_day}:00 - \${parseInt(row.hour_of_day)+1}:00</td><td style="\${tdStyle};text-align:right;font-weight:bold;">\${row.count}</td></tr>\`;
    });
    html += \`</tbody></table>\`;
  }
  else if (type === 'items') {
    html += \`
      <h3 style="color:#0f172a; margin-top:0;">Top Performing Menu Items</h3>
      <table style="\${tableStyle}">
        <thead><tr><th style="\${thStyle}">Item Name</th><th style="\${thStyle}">Category</th><th style="\${thStyle};text-align:center;">Qty Sold</th><th style="\${thStyle};text-align:right;">Revenue</th></tr></thead>
        <tbody>
    \`;
    data.menu_performance.top_items.forEach(row => {
      html += \`<tr>
        <td style="\${tdStyle};font-weight:bold;">\${row.item_name}</td>
        <td style="\${tdStyle}">\${row.category_name}</td>
        <td style="\${tdStyle};text-align:center;">\${row.sold_qty}</td>
        <td style="\${tdStyle};text-align:right;color:#059669;font-weight:bold;">Rs. \${parseFloat(row.item_revenue).toFixed(2)}</td>
      </tr>\`;
    });
    html += \`</tbody></table>\`;
  }
  else if (type === 'tables') {
    html += \`
      <div style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div style="flex:1; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Single Customers</div>
          <div style="font-size:24px; font-weight:bold; color:#0f172a;">\${data.table_traffic.single_count}</div>
        </div>
        <div style="flex:1; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size:14px; color:#64748b; margin-bottom:8px;">Group Customers</div>
          <div style="font-size:24px; font-weight:bold; color:#0f172a;">\${data.table_traffic.group_count}</div>
        </div>
      </div>
      <table style="\${tableStyle}">
        <thead><tr><th style="\${thStyle}">Table</th><th style="\${thStyle};text-align:center;">Unique Customers</th><th style="\${thStyle};text-align:center;">Total Orders</th></tr></thead>
        <tbody>
    \`;
    data.table_traffic.table_stats.forEach(row => {
      html += \`<tr>
        <td style="\${tdStyle};font-weight:bold;">Table \${row.table_number}</td>
        <td style="\${tdStyle};text-align:center;">\${row.unique_customers}</td>
        <td style="\${tdStyle};text-align:center;font-weight:bold;">\${row.total_orders}</td>
      </tr>\`;
    });
    html += \`</tbody></table>\`;
  }

  html += \`
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e2e8f0; text-align:center; font-size:12px; color:#94a3b8;">
        Generated by Athugalpura Restaurant System on \${new Date().toLocaleString()}
      </div>
    </div>
  \`;
  return html;
}

if (btnExportPdf) {
  btnExportPdf.addEventListener('click', () => {
    const type = reportsTypePreset.value;
    if (!window.lastReportData) {
      alert('Please generate the report first.');
      return;
    }

    btnExportPdf.disabled = true;
    btnExportPdf.innerHTML = 'Generating PDF...';

    // Create hidden container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.innerHTML = generatePrintableHTML(type, window.lastReportData, window.lastReportDates);
    document.body.appendChild(container);

    setTimeout(() => {
      html2canvas(container.firstElementChild, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(\`Athugalpura_\${type}_Report_\${new Date().getTime()}.pdf\`);
        
        document.body.removeChild(container);
        btnExportPdf.disabled = false;
        btnExportPdf.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> PDF';
      }).catch(err => {
        console.error(err);
        if(container.parentNode) document.body.removeChild(container);
        btnExportPdf.disabled = false;
        btnExportPdf.innerHTML = 'PDF Error';
      });
    }, 100);
  });
}
`;

c = c.replace(oldPdfLogic, newPdfLogic);
fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', c, 'utf8');
console.log('PDF logic upgraded');
