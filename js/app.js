// ═══════════════════════════════════════════════════════
// GOAL MODAL
// ═══════════════════════════════════════════════════════
function openGoalModal() {
  const wg = weightGoal || {};
  document.getElementById('wgStart').value  = wg.startWeight  || '';
  document.getElementById('wgTarget').value = wg.targetWeight || '';
  document.getElementById('wgDate').value   = wg.targetDate   || '';
  document.getElementById('goalModal').classList.add('open');
}

function closeGoalModal() {
  document.getElementById('goalModal').classList.remove('open');
}

function saveWeightGoal() {
  const startWeight  = parseFloat(document.getElementById('wgStart').value);
  const targetWeight = parseFloat(document.getElementById('wgTarget').value);
  const targetDate   = document.getElementById('wgDate').value;
  if (!startWeight || !targetWeight || !targetDate) {
    showToast('⚠️ Попълни всички полета!'); return;
  }
  weightGoal = {
    startWeight, targetWeight, targetDate,
    startDate: new Date().toISOString().split('T')[0]
  };
  localStorage.setItem('weightGoal', JSON.stringify(weightGoal));
  closeGoalModal();
  renderUnifiedToday();
  if (activeTab === 'stats') renderWeightGoalStats();
  showToast('✅ Целта е запазена!');
}

// ═══════════════════════════════════════════════════════
// TIMER
// ═══════════════════════════════════════════════════════
function timerToggle() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('timerStartBtn').textContent = '▶ Продължи';
    document.getElementById('timerDisplay').classList.remove('running');
  } else {
    timerRunning = true;
    document.getElementById('timerStartBtn').textContent = '⏸ Пауза';
    document.getElementById('timerDisplay').classList.add('running');
    timerInterval = setInterval(() => {
      timerSeconds++;
      const h = String(Math.floor(timerSeconds / 3600)).padStart(2,'0');
      const m = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2,'0');
      const s = String(timerSeconds % 60).padStart(2,'0');
      document.getElementById('timerDisplay').textContent = `${h}:${m}:${s}`;
    }, 1000);
  }
}

function timerReset() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = 0;
  document.getElementById('timerDisplay').textContent = '00:00:00';
  document.getElementById('timerDisplay').classList.remove('running');
  document.getElementById('timerStartBtn').textContent = '▶ Старт';
}

// ═══════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════
async function signUp() {
  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) showToast('❌ ' + error.message);
  else showToast('✅ Регистриран! Провери имейла си.');
}

async function login() {
  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) showToast('❌ ' + error.message);
}

async function logout() {
  await supabaseClient.auth.signOut();
  showToast('👋 Излезе успешно');
}

// ═══════════════════════════════════════════════════════
// APP INIT
// ═══════════════════════════════════════════════════════
async function showApp() {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('app').style.display  = 'block';
  await loadPlans();
  allLogs = await loadFromSupabase();
  renderUnifiedToday();
  updateStatsHeader();
  renderLogs();
  initBuilder();
}

function showAuth() {
  document.getElementById('auth').style.display = 'flex';
  document.getElementById('app').style.display  = 'none';
}

// ═══════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION') { session?.user ? showApp() : showAuth(); return; }
  if (event === 'SIGNED_IN')  showApp();
  if (event === 'SIGNED_OUT') showAuth();
});

document.getElementById('repeatModal').addEventListener('click', function(e) {
  if (e.target === this) closeRepeatModal();
});
document.getElementById('goalModal').addEventListener('click', function(e) {
  if (e.target === this) closeGoalModal();
});
