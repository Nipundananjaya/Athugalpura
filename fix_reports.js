const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');

// Fix getRankBadge
c = c.replace(/function getRankBadge\(i\) \{([\s\S]*?)return `<span class="rank-badge normal">\$\{i\+1\}<\/span>`;\n\}/g, `function getRankBadge(i) {
  if (i === 0) return \`<span class="rank-badge gold">🥇</span>\`;
  if (i === 1) return \`<span class="rank-badge silver">🥈</span>\`;
  if (i === 2) return \`<span class="rank-badge bronze">🥉</span>\`;
  return \`<span class="rank-badge normal">\${i+1}</span>\`;
}`);

// Fix updateDateBadge
c = c.replace(/function updateDateBadge\(id, dates\) \{([\s\S]*?)\}/g, `function updateDateBadge(id, dates) {
  const el = document.getElementById(id);
  if(el) el.textContent = \`\${dates.start_date} → \${dates.end_date}\`;
}`);

// Fix renderReports row HTML
c = c.replace(/<td class="col-primary">\$\{row\.hour_of_day\}:00[^<]*\$\{parseInt\(row\.hour_of_day\)\+1\}:00<\/td>/g, `<td class="col-primary">\${row.hour_of_day}:00 → \${parseInt(row.hour_of_day)+1}:00</td>`);

fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', c, 'utf8');
console.log('Fixed reports icons');
