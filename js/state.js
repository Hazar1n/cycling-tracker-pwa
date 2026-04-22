// ═══════════════════════════════════════════════════════
// SUPABASE CLIENT
// ═══════════════════════════════════════════════════════
const supabaseClient = window.supabase.createClient(
  'https://baqktcuvnhhjqceamvli.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcWt0Y3V2bmhoanFjZWFtdmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NjY2ODksImV4cCI6MjA5MjM0MjY4OX0.hyeKAwnGIBGaWjD148SekirgenVA-8h3vSZGmm3k-xo',
  { auth: { storageKey:'cycling-tracker-auth', autoRefreshToken:true, persistSession:true, detectSessionInUrl:false } }
);

// ═══════════════════════════════════════════════════════
// APP STATE
// ═══════════════════════════════════════════════════════
let currentWeek    = Number(localStorage.getItem('currentWeek') || 0);
let activeTab      = 'today';
let allLogs        = [];
let currentChartType = 'weight';
let mainChartInstance = null;
let timerInterval  = null;
let timerSeconds   = 0;
let timerRunning   = false;
let activePlan     = null;
let activePlanId   = localStorage.getItem('activePlanId') || 'default-4week';
let allPlans       = [];
let builderWeeks   = [];
let weightGoal     = JSON.parse(localStorage.getItem('weightGoal') || 'null');

// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function isRestDay(day) {
  return day.type === 'rest' || DAY_TEMPLATES[day.type]?.isRest;
}

function parseDate(s) {
  const p = s.split('.');
  return p.length === 3 ? new Date(p[2], p[1]-1, p[0]) : new Date(s);
}

function computeStreak(logs) {
  if (!logs.length) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const dates = [...new Set(logs.map(l => l.date))]
    .map(parseDate)
    .filter(d => !isNaN(d))
    .sort((a,b) => b - a);
  let streak = 0, check = new Date(today);
  for (const d of dates) {
    d.setHours(0,0,0,0);
    if (d.getTime() === check.getTime()) { streak++; check.setDate(check.getDate()-1); }
    else if (d < check) break;
  }
  return streak;
}

// ═══════════════════════════════════════════════════════
// TAB NAV
// ═══════════════════════════════════════════════════════
function switchTab(tab, el) {
  activeTab = tab;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('screen-' + tab).classList.add('active');
  if (el) el.classList.add('active');
  if (tab === 'week')  renderWeeks();
  if (tab === 'stats') { renderChart(allLogs); renderWeightGoalStats(); }
  if (tab === 'log')   renderLogs();
  if (tab === 'plans') renderPlansScreen();
}
