// ═══════════════════════════════════════════════════════
// PLANS SCREEN
// ═══════════════════════════════════════════════════════
function renderPlansScreen() {
  renderActivePlanInfo();
  renderAllPlans();
  if (builderWeeks.length === 0) initBuilder();
}

function renderActivePlanInfo() {
  const plan  = getActivePlan();
  const weeks = getPlanWeeks();
  const hist  = JSON.parse(localStorage.getItem('planHistory') || '[]');
  const cycles = hist.filter(h => h.id === plan.id).length;
  let total = 0, done = 0;
  weeks.forEach((w, wi) => w.days.forEach((d, di) => {
    total++;
    if (isRestDay(d) || localStorage.getItem(checkKey(wi, di)) === '1') done++;
  }));
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('activePlanInfo').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;">${plan.name}</div>
        <div style="font-size:12px;color:var(--text-dim);margin-top:2px;">${weeks.length} седмици • ${weeks.reduce((s,w)=>s+w.days.length,0)} дни${cycles?` • ${cycles} завършен${cycles===1?'':'и'} цикъл${cycles===1?'':'а'}`:''}
        </div>
      </div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:900;color:var(--orange);">${pct}%</div>
    </div>
    <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:var(--orange);border-radius:999px;transition:width .5s;"></div>
    </div>`;
}

function renderAllPlans() {
  const el   = document.getElementById('allPlansList');
  const hist = JSON.parse(localStorage.getItem('planHistory') || '[]');
  const plans = [DEFAULT_PLAN, ...allPlans];
  el.innerHTML = plans.map(plan => {
    const isActive = plan.id === activePlanId;
    const cycles   = hist.filter(h => h.id === plan.id).length;
    const lastDone = hist.filter(h => h.id === plan.id).slice(-1)[0];
    return `
      <div class="plan-item ${isActive ? 'active-plan' : ''}">
        <div class="plan-item-header">
          <div class="plan-item-name">${plan.name}</div>
          <span class="plan-badge ${isActive ? 'badge-active' : 'badge-draft'}">${isActive ? 'Активен' : 'Наличен'}</span>
        </div>
        <div class="plan-item-meta">
          <span>📅 ${plan.weeks.length} седмици</span>
          <span>🏃 ${plan.weeks.reduce((s,w) => s+w.days.filter(d => !isRestDay(d)).length, 0)} тренировки</span>
          ${cycles ? `<span>🔄 ${cycles} цикъл${cycles===1?'':'а'}</span>` : ''}
          ${lastDone ? `<span>✅ Последно: ${lastDone.completedAt}</span>` : ''}
        </div>
        <div class="plan-item-actions">
          ${!isActive
            ? `<button class="btn btn-orange btn-sm" onclick="activatePlan('${plan.id}')">▶ Активирай</button>`
            : '<span style="font-size:12px;color:var(--orange);font-weight:600;">▶ В момента активен</span>'
          }
          ${!plan.isBuiltIn ? `<button class="btn btn-red btn-sm" onclick="deletePlan('${plan.id}')">🗑️</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

async function activatePlan(planId) {
  activePlanId = planId;
  localStorage.setItem('activePlanId', planId);
  currentWeek = 0;
  localStorage.setItem('currentWeek', '0');
  const startKey = `planStart_${planId}`;
  if (!localStorage.getItem(startKey)) localStorage.setItem(startKey, new Date().toISOString());
  renderUnifiedToday();
  renderPlansScreen();
  showToast('✅ Планът е активиран!');
}

async function deletePlan(planId) {
  if (!confirm('Изтриване на плана?')) return;
  const { data:{ user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  await supabaseClient.from('plans').delete().eq('id', planId).eq('user_id', user.id);
  if (activePlanId === planId) {
    activePlanId = 'default-4week';
    localStorage.setItem('activePlanId', 'default-4week');
  }
  await loadPlans();
  renderPlansScreen();
  showToast('🗑️ Планът е изтрит');
}

// ═══════════════════════════════════════════════════════
// PLAN BUILDER
// ═══════════════════════════════════════════════════════
function initBuilder() {
  builderWeeks = [createWeekData(1)];
  renderBuilder();
}

function createWeekData(num) {
  return {
    title: `Седмица ${num}`,
    days: DEFAULT_WEEK_DAYS.map(t => ({ type:t, km: DAY_TEMPLATES[t].isRest ? 0 : 20 }))
  };
}

function addWeekToBuilder() {
  builderWeeks.push(createWeekData(builderWeeks.length + 1));
  renderBuilder();
}

function removeWeek(wi) {
  builderWeeks.splice(wi, 1);
  builderWeeks.forEach((w, i) => w.title = `Седмица ${i+1}`);
  renderBuilder();
}

function setDayType(wi, di, type) {
  builderWeeks[wi].days[di].type = type;
  if (DAY_TEMPLATES[type].isRest) builderWeeks[wi].days[di].km = 0;
  renderBuilder();
}

function renderBuilder() {
  const el = document.getElementById('weeksBuilder');
  el.innerHTML = builderWeeks.map((week, wi) => `
    <div class="week-builder-card">
      <div class="week-builder-header">
        <div class="week-builder-title">${week.title}</div>
        ${builderWeeks.length > 1
          ? `<button class="remove-week-btn" onclick="removeWeek(${wi})">✕ Премахни</button>`
          : ''}
      </div>
      <div class="days-builder">
        ${week.days.map((day, di) => `
          <div class="day-builder-row">
            <div class="day-num-label">Д${di+1}</div>
            <div class="template-selector">
              ${Object.entries(DAY_TEMPLATES).map(([key, tmpl]) => `
                <button class="tmpl-btn tmpl-${key} ${day.type===key?'selected':''}"
                  onclick="setDayType(${wi},${di},'${key}')">${tmpl.label}</button>
              `).join('')}
            </div>
            ${!DAY_TEMPLATES[day.type]?.isRest ? `
              <input class="day-km-input" type="number" placeholder="км"
                value="${day.km||''}"
                onchange="builderWeeks[${wi}].days[${di}].km=Number(this.value)">
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

async function savePlan() {
  const name = document.getElementById('planNameInput').value.trim();
  if (!name) { showToast('⚠️ Въведи име на плана!'); return; }
  const { data:{ user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  const planData = {
    name,
    weeks: builderWeeks.map(w => ({
      title: w.title,
      days:  w.days.map(d => ({
        type: d.type,
        text: DAY_TEMPLATES[d.type].text + (d.km ? ` • ${d.km} км` : ''),
        km:   d.km || 0
      }))
    })),
    user_id: user.id
  };
  const { data, error } = await supabaseClient.from('plans').insert([planData]).select().single();
  if (error) { showToast('❌ Грешка: ' + error.message); return; }
  document.getElementById('planNameInput').value = '';
  builderWeeks = [createWeekData(1)];
  renderBuilder();
  await loadPlans();
  renderPlansScreen();
  showToast('✅ Планът е запазен!');
}
