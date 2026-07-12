const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');

const missingCode = `
          <td class="col-primary">Table \${row.table_number}</td>
          <td style="text-align:center; font-weight:600;">\${row.unique_customers}</td>
          <td style="text-align:center; font-weight:700; font-size:15px; color:var(--heading);">\${orders}</td>
          <td>\${getBarHtml(orders, maxOrders, 'linear-gradient(90deg,#FF9209,#FFB347)')}</td>
        </tr>\`;
      });
    }
  }
  if (window.feather) feather.replace();
}

// Exports
if (btnExportCsv) {
  btnExportCsv.addEventListener('click', () => {
    const type = reportsTypePreset.value;`;

c = c.replace(/          <td class="col-rank">\$\{getRankBadge\(i\)\}<\/td>[\s\S]*?const table = document.getElementById\(`table-report-\$\{type\}`\);/g, `          <td class="col-rank">\${getRankBadge(i)}</td>` + missingCode + `\n    const table = document.getElementById(\`table-report-\${type}\`);`);

fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', c, 'utf8');
console.log('Restored the missing export code');
