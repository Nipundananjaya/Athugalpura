const fs = require('fs');

const files = ['admin.html', 'waiter.html'];
const realtimeScript = `
<!-- REAL-TIME SYNC INJECTION -->
<script>
  (function() {
    const SUPABASE_URL = 'https://phheuvsnkllqxjkgoodh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaGV1dnNua2xscXhqa2dvb2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjgwOTcsImV4cCI6MjA5ODgwNDA5N30.xTG6XBv32ln3Ks-HGE7NDE1wimO9ul4aKcSySH4wb-A';
    
    if (typeof supabase !== 'undefined') {
      const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      
      const triggerUpdate = () => {
        if(typeof pollDashboardData === 'function') pollDashboardData();
        if(typeof fetchOrdersData === 'function') fetchOrdersData();
        if(typeof loadDashboardData === 'function') loadDashboardData();
      };

      client.channel('public:orders_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => { triggerUpdate(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, payload => { triggerUpdate(); })
        .subscribe();
    }
  })();
</script>
</body>`;

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes('supabase-js')) {
      content = content.replace('<script src="https://unpkg.com/feather-icons"></script>', 
        '<script src="https://unpkg.com/feather-icons"></script>\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    }
    
    if (!content.includes('REAL-TIME SYNC INJECTION')) {
      content = content.replace('</body>', realtimeScript);
    }
    
    fs.writeFileSync(file, content);
    console.log(`Real-time sync injected into ${file}`);
  }
});
