// ═══════════════════════════════════════════════════════
// UNIFIED TODAY CARD
// ═══════════════════════════════════════════════════════
function renderUnifiedToday() {
  const plan  = getActivePlan();
  const weeks = getPlanWeeks();
  const { weekIndex, dayIndex } = getWeekAndDay();
  const safeWeek = Math.min(Math.max(weekIndex, 0), weeks.length - 1);
  const week = weeks[safeWeek];
  const day  = week.days[dayIndex];
  const dayNum = getProgramDay() + 1;
  const key  = checkKey(safeWeek, dayIndex);
  const rest = isRestDay(day);

  // Auto-mark rest days
  if (rest && localStorage.getItem(key) !== '1') {
    localStorage.setItem(key, '1');
  }
  const checked = localStorage.getItem(key) === '1';

  // Plan progress
  let total = 0, done = 0;
  weeks.forEach((w, wi) => w.days.forEach((d, di) => {
    total++;
    if (isRestDay(d) || localStorage.getItem(checkKey(wi, di)) === '1') done++;
  }));
  const planPct = total ? Math.round(done / total * 100) : 0;

  // Weight goal meta
  const wm = getWeightGoalMeta();
  const weightPct   = wm ? wm.pct : 0;
  const weightColor = wm ? wm.status.color : 'var(--text-dim)';

  // Stats
  const streak        = computeStreak(allLogs);
  const totalKm       = Math.round(allLogs.reduce((s,l) => s+(Number(l.km)||0), 0));
  const totalSessions = allLogs.length;

  // Dual ring SVG  (outer r=52 plan, inner r=41 weight)
  const planC = 326.7, wC = 257.6;
  const planOff = planC - (planC * planPct   / 100);
  const wOff    = wC   - (wC   * weightPct / 100);

  const ringSVG = `
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle class="dr-track"  cx="60" cy="60" r="52" stroke-width="8"/>
      <circle class="dr-plan"   cx="60" cy="60" r="52" stroke-width="8"
        stroke-dasharray="${planC}" stroke-dashoffset="${planOff}"/>
      <circle class="dr-track"  cx="60" cy="60" r="41" stroke-width="7"/>
      <circle class="dr-weight" cx="60" cy="60" r="41" stroke-width="7"
        stroke="${weightColor}"
        stroke-dasharray="${wC}" stroke-dashoffset="${wOff}"
        style="filter:drop-shadow(0 0 5px ${weightColor}88);"/>
    </svg>`;

  const el = document.getElementById('unifiedTodayContent');

  el.innerHTML = `
    <!-- TOP ROW -->
    <div class="today-top-row">
      <div class="dual-ring">
        ${ringSVG}
        <div class="dual-ring-center">
          <div class="dr-plan-pct">${planPct}%</div>
          <div class="dr-weight-pct" style="color:${weightColor};">${weightPct}%</div>
          <div class="dr-labels">
            <span class="dr-lbl dr-lbl-plan">план</span>
            <span class="dr-lbl dr-lbl-weight" style="background:${weightColor}22;color:${weightColor};">цел</span>
          </div>
        </div>
      </div>
      <div class="today-stats-col">
        <div class="today-plan-name">${plan.name}</div>
        <div class="today-stats-grid">
          <div class="today-stat">
            <div class="today-stat-val">${totalSessions}</div>
            <div class="today-stat-lbl">🗓️ сесии</div>
          </div>
          <div class="today-stat">
            <div class="today-stat-val">${totalKm}</div>
            <div class="today-stat-lbl">🛣️ км</div>
          </div>
          <div class="today-stat">
            <div class="today-stat-val" style="color:var(--orange);">${wm ? wm.currentWeight.toFixed(1) : '—'}</div>
            <div class="today-stat-lbl">⚖️ кг сега</div>
          </div>
          <div class="today-stat">
            <div class="today-stat-val" style="color:${wm && wm.daysLeft < 8 ? 'var(--red)' : 'var(--text)'};">${wm ? wm.daysLeft : '—'}</div>
            <div class="today-stat-lbl">📅 дни</div>
          </div>
        </div>
      </div>
    </div>

    ${streak > 0 ? `<div class="streak-badge">🔥 ${streak} поредни дни</div>` : ''}

    <div class="sep"></div>

    <!-- WEIGHT GOAL SECTION -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
      <div class="section-lbl" style="margin-bottom:0;flex:1;">⚖️ Целево тегло</div>
      <button class="edit-goal-btn" onclick="openGoalModal()" style="margin-left:10px;">✏️ ${wm ? 'Промени' : 'Задай цел'}</button>
    </div>

    ${wm ? `
      <div class="wg-status-bar ${wm.status.cls}">
        <div class="wg-status-icon">${wm.status.icon}</div>
        <div class="wg-status-body">
          <div class="wg-status-title" style="color:${wm.status.color};">${wm.status.title}</div>
          <div class="wg-status-sub">${wm.status.sub}</div>
        </div>
      </div>
      <div class="wg-metrics">
        <div class="wg-metric">
          <div class="wg-metric-val" style="color:${wm.lost>=0?'var(--green)':'var(--red)'};">${wm.lost>=0?'−':'+'}${Math.abs(wm.lost).toFixed(1)}</div>
          <div class="wg-metric-lbl">📉 свалено кг</div>
        </div>
        <div class="wg-metric">
          <div class="wg-metric-val">${Math.abs(wm.remaining).toFixed(1)}</div>
          <div class="wg-metric-lbl">🎯 остават кг</div>
        </div>
        <div class="wg-metric">
          <div class="wg-metric-val">${wm.avgRate > 0 ? wm.avgRate.toFixed(2) : '—'}</div>
          <div class="wg-metric-lbl">📈 кг/седм.</div>
        </div>
        <div class="wg-metric">
          <div class="wg-metric-val" style="font-size:12px;">${wm.forecastText}</div>
          <div class="wg-metric-lbl">🔮 прогноза</div>
        </div>
      </div>
      <div class="wg-bar-wrap">
        <div class="wg-bar-fill" style="width:${wm.pct}%;background:${wm.status.color};box-shadow:0 0 8px ${wm.status.color}66;"></div>
      </div>
      <div class="wg-bar-labels">
        <span>${wm.startWeight} кг</span>
        <span style="color:${wm.status.color};font-weight:700;">${wm.pct}% от целта</span>
        <span>${wm.targetWeight} кг</span>
      </div>
    ` : `<div style="text-align:center;padding:10px 0;color:var(--text-dim);font-size:13px;">Задай целево тегло за да следиш прогреса си</div>`}

    <div class="sep"></div>

    <!-- TODAY WORKOUT -->
    <div class="section-lbl">📅 Днес</div>
    ${rest ? `
      <div class="today-workout-box">
        <div style="text-align:center;padding:8px 0;">
          <div style="font-size:32px;margin-bottom:6px;">🛌</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;color:var(--text-dim);text-transform:uppercase;">Почивен ден</div>
          <div style="font-size:12px;color:var(--text-dim);margin-top:4px;">${day.text}</div>
          <div style="margin-top:8px;font-size:11px;color:var(--green);font-weight:600;">✅ Автоматично отбелязан</div>
        </div>
      </div>
    ` : `
      <div class="today-workout-box">
        <div class="today-day-label">
          Ден ${dayNum} — ${week.title}
          ${day.km ? `<span class="today-km-badge">${day.km} км</span>` : ''}
        </div>
        <div class="today-workout-text">${day.text}</div>
        <div class="today-check-row">
          <span class="today-check-label">Маркирай като завършен</span>
          <button class="toggle-check ${checked ? 'on' : ''}" onclick="toggleTodayCheck('${key}')"></button>
        </div>
      </div>
    `}
  `;
}

// ═══════════════════════════════════════════════════════
// TODAY TOGGLE
// ═══════════════════════════════════════════════════════
function toggleTodayCheck(key) {
  const cur    = localStorage.getItem(key) === '1';
  const newVal = !cur;
  localStorage.setItem(key, newVal ? '1' : '0');
  renderUnifiedToday();
  checkPlanCompletion();
  if (newVal) showToast('✅ Тренировката е отбелязана!');
}
