/* ==========================================================================
   GREENWAVE AI — CORE INTERACTIVE JAVASCRIPT
   Navbar scroll state, contact form handlers, digital twin mirror engine
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initContactForms();
  initDigitalTwinMirror();
});

// ─── NAVBAR SCROLL ─────────────────────────────────────────────────────────
function initNavbar() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const update = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ─── SECURE INTAKE FORM HANDLER ────────────────────────────────────────────
function initContactForms() {
  document.querySelectorAll('.terminal-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'TRANSMITTING ENCRYPTED FRAME...';
      btn.disabled = true;

      const payload = {};
      new FormData(form).forEach((v, k) => { payload[k] = v; });
      console.log(`SECURE_INGEST:: [${form.id}]`, payload);

      setTimeout(() => {
        const id = `GW-${Math.floor(Math.random() * 90000) + 10000}`;
        const wrap = form.parentElement;
        wrap.innerHTML = `
          <div class="form-success">
            <span class="form-success__code">INGEST_STATUS: SUCCESS (CODE 200) — SECURE_ID: ${id}</span>
            <span class="form-success__body">Transmission packet successfully registered. GreenWave systems engineers have received your intake profile. Secure acknowledgement will be dispatched via the provided endpoint within 48 hours.</span>
          </div>`;
      }, 1500);
    });
  });
}

// ─── DIGITAL TWIN MIRROR ENGINE ─────────────────────────────────────────────
function initDigitalTwinMirror() {
  const canvas = document.getElementById('twin-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let vehiclesCount  = 2847;
  let reductionIndex = 47.3;
  let latencyProfile = 12.4;
  let speedVector    = 34.2;

  // Resize canvas to fill parent
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Mini twin vehicle particles
  const lanes = [
    { sx: 0.5, sy: 0,   ex: 0.5, ey: 1,   col: '#00FF66' }, // N-S
    { sx: 0,   sy: 0.5, ex: 1,   ey: 0.5, col: '#1A5F48' }  // E-W
  ];
  const pts = [];
  for (let i = 0; i < 14; i++) {
    const lane = lanes[i % 2];
    pts.push({ lane, progress: Math.random(), speed: Math.random() * 0.006 + 0.003, size: Math.random() * 2 + 1.5, pulse: Math.random() * Math.PI });
  }

  // Live stat tickers
  setInterval(() => {
    vehiclesCount  += Math.floor(Math.random() * 7) - 3;
    reductionIndex += (Math.random() * 0.4 - 0.2);
    latencyProfile += (Math.random() * 0.6 - 0.3);
    speedVector    += (Math.random() * 0.8 - 0.4);

    vehiclesCount  = Math.min(Math.max(vehiclesCount,  2810), 2890);
    reductionIndex = Math.min(Math.max(reductionIndex, 45.5), 49.0);
    latencyProfile = Math.min(Math.max(latencyProfile, 11.2), 13.8);
    speedVector    = Math.min(Math.max(speedVector,    32.0), 36.5);

    const el = id => document.getElementById(id);
    if (el('val-vehicles'))  el('val-vehicles').textContent  = vehiclesCount;
    if (el('val-reduction')) el('val-reduction').textContent = reductionIndex.toFixed(1) + '%';
    if (el('val-latency'))   el('val-latency').textContent   = latencyProfile.toFixed(1) + 'ms';
    if (el('val-speed'))     el('val-speed').textContent     = speedVector.toFixed(1) + ' km/h';

    if (Math.random() < 0.4) appendLog();
  }, 400);

  // Console log messages
  const LOGS = [
    { text: 'Connecting to city GPS telemetry cloud API endpoint', cls: '' },
    { text: 'Processing queue estimates at North-South node', cls: '' },
    { text: 'Optimizing signal split parameters for intersection grid', cls: 'success' },
    { text: 'Broadcasting override to virtual controller', cls: 'success' },
    { text: 'Latency audit: sub-millisecond execution confirmed', cls: 'success' },
    { text: 'Synchronizing model state with digital-twin testbed', cls: '' },
    { text: 'MFD boundary pressure check: STABLE', cls: 'success' },
    { text: 'Shockwave dissolution confirmed upstream node 7', cls: 'success' },
    { text: 'Kinetic optimizer: freight corridor holding momentum', cls: 'success' },
  ];

  const logContainer = document.getElementById('lab-console-log');
  function appendLog() {
    if (!logContainer) return;
    const entry = LOGS[Math.floor(Math.random() * LOGS.length)];
    const div = document.createElement('div');
    div.className = `console-line ${entry.cls}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${entry.text}`;
    logContainer.insertBefore(div, logContainer.firstChild);
    while (logContainer.children.length > 5) logContainer.removeChild(logContainer.lastChild);
  }
  appendLog();

  // Twin canvas animation
  function draw() {
    requestAnimationFrame(draw);
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#060709';
    ctx.fillRect(0, 0, W, H);

    // Road surface
    ctx.fillStyle = 'rgba(26, 95, 72, 0.08)';
    ctx.fillRect(W * 0.43, 0, W * 0.14, H);
    ctx.fillRect(0, H * 0.43, W, H * 0.14);

    // Centre dividers
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H);
    ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vehicles
    pts.forEach(p => {
      p.progress += p.speed;
      if (p.progress >= 1) p.progress = 0;

      const x = (p.lane.sx + (p.lane.ex - p.lane.sx) * p.progress) * W;
      const y = (p.lane.sy + (p.lane.ey - p.lane.sy) * p.progress) * H;

      ctx.fillStyle = p.lane.col;
      ctx.shadowColor = p.lane.col;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }
  draw();
}
