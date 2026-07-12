const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');
const lines = c.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('class="report-header-icon"') && !lines[i].includes('data-feather')) {
    const lineNum = i + 1;
    // Check which report this belongs to by searching nearby lines for the h2
    let context = lines.slice(i, i + 5).join(' ');
    if (context.includes('Menu Item')) {
      lines[i] = lines[i].replace(/<div class="report-header-icon">[^<]*<\/div>/, '<div class="report-header-icon"><i data-feather="coffee"></i></div>');
      console.log('Fixed Menu Item icon at line', lineNum);
    } else if (context.includes('Table Traffic')) {
      lines[i] = lines[i].replace(/<div class="report-header-icon">[^<]*<\/div>/, '<div class="report-header-icon"><i data-feather="grid"></i></div>');
      console.log('Fixed Table Traffic icon at line', lineNum);
    } else {
      lines[i] = lines[i].replace(/<div class="report-header-icon">[^<]*<\/div>/, '<div class="report-header-icon"><i data-feather="bar-chart-2"></i></div>');
      console.log('Fixed unknown icon at line', lineNum);
    }
  }
}

fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', lines.join('\n'), 'utf8');
console.log('All report header icons fixed');
