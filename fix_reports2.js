const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');
const lines = c.split('\n');

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('function getRankBadge(i) {')) {
    lines[i+1] = '  if (i === 0) return `<span class="rank-badge gold">🥇</span>`;';
    lines[i+2] = '  if (i === 1) return `<span class="rank-badge silver">🥈</span>`;';
    lines[i+3] = '  if (i === 2) return `<span class="rank-badge bronze">🥉</span>`;';
  }
  if (lines[i].includes('function updateDateBadge(id, dates) {')) {
    lines[i+1] = '  const el = document.getElementById(id);';
    lines[i+2] = '  if(el) el.textContent = `${dates.start_date} → ${dates.end_date}`;';
    lines[i+3] = '}';
    lines[i+4] = ''; // blank out the corrupted lines
    lines[i+5] = ''; 
  }
}

fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', lines.join('\n'), 'utf8');
console.log('Fixed reports again');
