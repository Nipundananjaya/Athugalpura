const fs = require('fs');
const helper = fs.readFileSync('supabase_helper.js', 'utf8');
const kitchen = fs.readFileSync('kitchen.html', 'utf8');
const waiter = fs.readFileSync('waiter.html', 'utf8');

const checks = [
  ['Kitchen: no hard 403 block', !helper.includes("return mockResponse({ success: false, message: 'Unauthorized access.' }, 403);\n                }\n\n                if (action === 'fetch_active')")],
  ['Waiter: no hard 403 block', !helper.includes("return mockResponse({ success: false, message: 'Unauthorized access.' }, 403);\n                }\n\n                if (action === 'fetch_orders')")],
  ['kitchen: update_item_status exists', helper.includes('update_item_status')],
  ['kitchen: fetch_menu_items exists', helper.includes('fetch_menu_items')],
  ['kitchen: toggle_item_availability exists', helper.includes('toggle_item_availability')],
  ['kitchen: fetch_recently_served exists', helper.includes('fetch_recently_served')],
  ['SUPABASE_URL exposed globally', helper.includes('window.SUPABASE_URL')],
  ['Kitchen: session guard exists', kitchen.includes('startKitchen')],
  ['Kitchen: error recovery with retry', kitchen.includes('showKDSError')],
  ['Kitchen: realtime init safe', kitchen.includes('initRealtimeClient')],
  ['Kitchen: fallback poll exists', kitchen.includes('_kdsFallbackPoll')],
  ['Kitchen: no hard SUPABASE_URL redeclare', !kitchen.includes('const SUPABASE_URL')],
  ['Waiter: realtime channel in checkSession', waiter.includes('waiter:orders')],
  ['Waiter: fallback poll 5s not 3s', waiter.includes('setInterval(loadDashboardData, 5000)')],
];

let allOk = true;
checks.forEach(([name, ok]) => {
  console.log((ok ? 'OK' : 'FAIL') + ' ' + name);
  if (!ok) allOk = false;
});
console.log(allOk ? 'ALL CLEAR' : 'SOME ISSUES REMAIN');
