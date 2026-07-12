const fs = require('fs');
let code = fs.readFileSync('supabase_helper.js', 'utf8');

// Update path parsing logic
code = code.replace(
  'const path = parsedUrl.pathname.split(\'/\').pop();',
  'const path = parsedUrl.pathname.split(\'/\').pop().replace(/\\.php$/, \'\').replace(/_api$/, \'\');'
);

// Update all if statements
code = code.replace(/if \(path === '([a-z_]+)_api\.php'\)/g, (match, p1) => {
  return `if (path === '${p1}')`;
});
code = code.replace(/if \(path === '([a-z_]+)\.php'\)/g, (match, p1) => {
  return `if (path === '${p1}')`;
});

// Update Staff Delete logic
const oldStaffDelete = `await supabaseQuery(\`users?staff_id=eq.\${staffId}\`, 'DELETE');
                    await supabaseQuery(\`staff?staff_id=eq.\${staffId}\`, 'DELETE');`;
const newStaffDelete = `try { await supabaseQuery(\`users?staff_id=eq.\${staffId}\`, 'DELETE'); } catch(e) { console.warn('User delete error', e); }
                    try { await supabaseQuery(\`staff?staff_id=eq.\${staffId}\`, 'DELETE'); } catch(e) { console.warn('Staff delete error', e); }`;
code = code.replace(oldStaffDelete, newStaffDelete);

// Update Table Count logic (prevent silent failure)
const oldTableCount = `const [allTables, activeSessions] = await Promise.all([
                        supabaseQuery('tables_qr?select=id'),
                        supabaseQuery('table_sessions?status=eq.active&select=table_number')
                    ]);`;
const newTableCount = `let allTables = [];
                    let activeSessions = [];
                    try {
                        const results = await Promise.all([
                            supabaseQuery('tables_qr?select=id'),
                            supabaseQuery('table_sessions?status=eq.active&select=table_number')
                        ]);
                        allTables = results[0] || [];
                        activeSessions = results[1] || [];
                    } catch (e) {
                        console.error('Error fetching table stats:', e);
                    }`;
code = code.replace(oldTableCount, newTableCount);

fs.writeFileSync('supabase_helper.js', code);
console.log('supabase_helper.js updated successfully!');
