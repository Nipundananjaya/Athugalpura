const fs = require('fs');

const files = [
  'admin.html',
  'customer menu.html',
  'index.html',
  'kitchen.html',
  'menu.html',
  'waiter.html'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace API endpoints
    content = content.replace(/([a-z_]+)_api\.php/g, '/api/$1');
    
    // Replace login and check_session
    content = content.replace(/login\.php/g, '/api/login');
    content = content.replace(/check_session\.php/g, '/api/check_session');
    
    // Replace logout.php with /api/logout
    content = content.replace(/logout\.php/g, '/api/logout');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
