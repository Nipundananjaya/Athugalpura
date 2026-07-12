const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');

const missingCode = `
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
`;

c = c.replace(/    tbody\.innerHTML = '';\n    if \(rows\.length === 0\) \{\n      tbody\.innerHTML = `<tr><td colspan="5"><div class="report-empty-state"><p>No table data found for this period\.<\/p><\/div><\/td><\/tr>`;/, missingCode + "\n    tbody.innerHTML = '';\n    if (rows.length === 0) {\n      tbody.innerHTML = `<tr><td colspan=\"5\"><div class=\"report-empty-state\"><p>No table data found for this period.</p></div></td></tr>`;");

c = c.replace(/html2canvas\(printArea, \{ scale: 2 \}\)\.then\(canvas => \{([\s\S]*?)\}\)\.catch\(err => \{([\s\S]*?)\}\);/g, `printArea.classList.add('pdf-exporting');\n    html2canvas(printArea, { scale: 2 }).then(canvas => {\n      printArea.classList.remove('pdf-exporting');$1}).catch(err => {\n      printArea.classList.remove('pdf-exporting');$2});`);

fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', c, 'utf8');
