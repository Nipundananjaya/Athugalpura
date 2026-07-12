const fs = require('fs');

let html = fs.readFileSync('kitchen.html', 'utf8');

// 1. Add Supabase JS CDN and remove old chime logic
html = html.replace('<script src="https://unpkg.com/feather-icons"></script>', 
`<script src="https://unpkg.com/feather-icons"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`);

// Add new side panel HTML for Aggregation
const aggregationPanelHtml = `
  <!-- AGGREGATION PANEL -->
  <div class="sidebar" id="panel-aggregation">
    <div class="panel-header">
      <span>Aggregated Prep Load</span>
      <button class="close-btn" onclick="document.getElementById('panel-aggregation').classList.remove('open')"><i data-feather="x"></i></button>
    </div>
    <div class="panel-body" id="list-aggregation">Loading...</div>
  </div>
`;
html = html.replace('<!-- UNDO MODAL -->', aggregationPanelHtml + '\n  <!-- UNDO MODAL -->');

// Add topbar button for Aggregation
html = html.replace('<button class="action-btn" onclick="openUndoModal()"><i data-feather="rotate-ccw" style="width:16px;"></i> Undo</button>', 
`<button class="action-btn" onclick="openAggregationPanel()"><i data-feather="list" style="width:16px;"></i> Prep Load</button>
      <button class="action-btn" onclick="openUndoModal()"><i data-feather="rotate-ccw" style="width:16px;"></i> Recall</button>`);

// Update CSS for high-contrast notes and animations
const newCss = `
.item-notes {
  margin-top: 8px; font-size: 14px; font-weight: 800; color: #000;
  background: #ffea00; padding: 6px 10px; border-radius: 4px; border-left: 5px solid #ff3300;
  animation: pulse-alert 2s infinite; text-transform: uppercase; letter-spacing: 0.5px;
}
@keyframes pulse-alert { 0% { box-shadow: 0 0 0 0 rgba(255,234,0, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255,234,0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255,234,0, 0); } }
`;
html = html.replace('.item-notes {\n  margin-top: 8px; font-size: 13px; font-weight: 700; color: #fbbf24;\n  background: rgba(251, 191, 36, 0.1); padding: 6px 10px; border-radius: 4px; border-left: 3px solid #fbbf24;\n}', newCss);

// Replace init logic with Real-Time logic
const oldInit = `    function init() {
      pollOrders();
      setInterval(pollOrders, 3000);
      setInterval(updateClock, 1000);
      setInterval(updateElapsedTimers, 5000);
      document.body.addEventListener('click', () => {
        try { const a = new (window.AudioContext || window.webkitAudioContext)(); if(a.state === 'suspended') a.resume(); } catch(e){}
      }, { once: true });
    }`;

const newInit = `    const SUPABASE_URL = 'https://phheuvsnkllqxjkgoodh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaGV1dnNua2xscXhqa2dvb2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjgwOTcsImV4cCI6MjA5ODgwNDA5N30.xTG6XBv32ln3Ks-HGE7NDE1wimO9ul4aKcSySH4wb-A';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    function init() {
      pollOrders();
      setInterval(updateClock, 1000);
      setInterval(updateElapsedTimers, 5000);
      document.body.addEventListener('click', () => {
        try { const a = new (window.AudioContext || window.webkitAudioContext)(); if(a.state === 'suspended') a.resume(); } catch(e){}
      }, { once: true });

      // Real-Time Sync
      supabaseClient.channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => { pollOrders(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, payload => { pollOrders(); })
        .subscribe();
    }
    
    function openAggregationPanel() {
      document.getElementById('panel-aggregation').classList.add('open');
      const aggregation = {};
      activeOrders.forEach(o => {
        if (o.status !== 'ready' && o.status !== 'served') {
          o.items.forEach(i => {
            if (i.item_status !== 'ready') {
              aggregation[i.item_name] = (aggregation[i.item_name] || 0) + i.quantity;
            }
          });
        }
      });
      
      const listHtml = Object.entries(aggregation)
        .sort((a,b) => b[1] - a[1])
        .map(([name, qty]) => \`
          <div class="menu-item-row" style="background: rgba(255,255,255,0.1); border-left: 4px solid var(--primary);">
            <div class="menu-item-name" style="font-size: 18px;">\${name}</div>
            <div class="toggle-btn" style="background: var(--bg-app); font-size: 18px;">\${qty}x</div>
          </div>
        \`).join('');
      document.getElementById('list-aggregation').innerHTML = listHtml || 'No items in prep.';
    }`;
html = html.replace(oldInit, newInit);

// Replace chime
const oldChime = `    function playChime() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
      } catch(e) {}
    }`;
const newChime = `    function playChime() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playNote = (freq, startTime, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine'; osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.3, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.start(startTime); osc.stop(startTime + duration);
        };
        playNote(1046.50, ctx.currentTime, 0.3); // High C
        playNote(1318.51, ctx.currentTime + 0.15, 0.4); // High E
      } catch(e) {}
    }`;
html = html.replace(oldChime, newChime);

// Update Ticket Header to show Session Token
html = html.replace('<div class="ticket-table"><i data-feather="hash"></i>${order.table_number}</div>', 
`<div style="display:flex; align-items:center; gap:8px;">
  <div class="ticket-table"><i data-feather="hash"></i>\${order.table_number}</div>
  <div style="font-size: 14px; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">Sess: \${String(order.session_id || 'Legacy').substring(0,4)}</div>
</div>`);

// Update serveOrder to just update to ready
html = html.replace(/<button class="serve-btn ready" onclick="serveOrder\(\${order.order_id}\)"><i data-feather="bell"><\/i> Serve Order<\/button>/, 
`<button class="serve-btn ready" onclick="markReady(\${order.order_id})"><i data-feather="bell"></i> Mark Ready</button>`);

const markReadyLogic = `    function markReady(orderId) {
      fetch('/api/kitchen?action=update_status', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ order_id: orderId, status: 'ready' })
      }).then(() => pollOrders());
    }
    
    function serveOrder(orderId) {`;
html = html.replace('function serveOrder(orderId) {', markReadyLogic);

fs.writeFileSync('kitchen.html', html);
console.log('kitchen.html updated');
