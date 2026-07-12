const fs = require('fs');
let c = fs.readFileSync('c:/xampps/htdocs/qr/admin.html', 'utf8');

c = c.replace(/<span class="rank-badge gold">🥇<\/span>/g, '<span class="rank-badge gold" style="color:#fbbf24;"><i data-feather="award" style="width:16px;height:16px;vertical-align:middle;"></i></span>');
c = c.replace(/<span class="rank-badge silver">🥈<\/span>/g, '<span class="rank-badge silver" style="color:#94a3b8;"><i data-feather="award" style="width:16px;height:16px;vertical-align:middle;"></i></span>');
c = c.replace(/<span class="rank-badge bronze">🥉<\/span>/g, '<span class="rank-badge bronze" style="color:#b45309;"><i data-feather="award" style="width:16px;height:16px;vertical-align:middle;"></i></span>');
c = c.replace(/ \u2192 /g, ' <i data-feather="arrow-right" style="width:14px;height:14px;vertical-align:middle;"></i> ');
c = c.replace(/→/g, '<i data-feather="arrow-right" style="width:14px;height:14px;vertical-align:middle;"></i>');

// make sure feather.replace() is called after renderReports finishes so that these dynamic icons are rendered!
c = c.replace(/function renderReports\(data, type, dates\) \{([\s\S]*?)function getRankBadge/g, `function renderReports(data, type, dates) {$1  if(window.feather) feather.replace();\n}\n\nfunction getRankBadge`);

fs.writeFileSync('c:/xampps/htdocs/qr/admin.html', c, 'utf8');
console.log('Fixed emojis to feather icons');
