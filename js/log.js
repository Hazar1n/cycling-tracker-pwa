// ═══════════════════════════════════════════════════════
// RENDER LOGS
// ═══════════════════════════════════════════════════════
function renderLogs() {
  const el  = document.getElementById('history');
  const rev = [...allLogs].reverse();
  el.innerHTML = rev.length
    ? rev.map(l => `
      <div class="log-item">
        <div>
          <div class="log-date">${l.date}</div>
          <div class="log-stats">
            ${l.calories ? `<span class="log-chip">🔥 ${l.calories} kcal</span>` : ''}
            ${l.weight   ? `<span class="log-chip">⚖️ ${l.weight} кг</span>` : ''}
            ${l.km       ? `<span class="log-chip">🛣️ ${l.km} км</span>` : ''}
          </div>
          ${l.notes ? `<div class="log-note">${l.notes}</div>` : ''}
        </div>
        <button class="log-del" onclick="deleteLog(${l.id})">✕</button>
      </div>`).join('')
    : '<div class="empty-state"><div class="es-icon">📋</div><p>Все още няма записи</p></div>';
  renderWeeklyCompare();
}

function renderWeeklyCompare() {
  const now = new Date();
  const sow = new Date(now); sow.setDate(now.getDate() - now.getDay()); sow.setHours(0,0,0,0);
  const sol = new Date(sow); sol.setDate(sow.getDate() - 7);

  const thisW = allLogs.filter(l => { const d = parseDate(l.date); d.setHours(0,0,0,0); return d >= sow; });
  const lastW = allLogs.filter(l => { const d = parseDate(l.date); d.setHours(0,0,0,0); return d >= sol && d < sow; });

  const sumKcal = a => a.reduce((s,l) => s+(Number(l.calories)||0), 0);
  const sumKm   = a => a.reduce((s,l) => s+(Number(l.km)||0), 0);
  const tk = sumKcal(thisW), lk = sumKcal(lastW), tkm = sumKm(thisW), lkm = sumKm(lastW);

  document.getElementById('wcThisKcal').textContent = tk  || '—';
  document.getElementById('wcLastKcal').textContent = lk  || '—';
  document.getElementById('wcThisKm').textContent   = tkm ? tkm.toFixed(1) : '—';
  document.getElementById('wcLastKm').textContent   = lkm ? lkm.toFixed(1) : '—';

  const kd = document.getElementById('wcKcalDelta');
  const md = document.getElementById('wcKmDelta');
  if (lk)  { kd.textContent = (tk -lk >=0?'+':'')+(tk -lk )+' kcal';         kd.className = 'wc-delta '+(tk >=lk ?'up':'down'); }
  if (lkm) { md.textContent = (tkm-lkm>=0?'+':'')+(tkm-lkm).toFixed(1)+' км'; md.className = 'wc-delta '+(tkm>=lkm?'up':'down'); }
}

function updateStatsHeader() {
  const totalCal = allLogs.reduce((s,l) => s+(Number(l.calories)||0), 0);
  const totalKm  = allLogs.reduce((s,l) => s+(Number(l.km)||0), 0);
  const lastW    = allLogs.filter(l => l.weight).slice(-1)[0]?.weight;
  const firstW   = allLogs.find(l => l.weight)?.weight;
  document.getElementById('summary').innerHTML = `
    <div class="log-item" style="display:block;">
      <div class="log-stats" style="gap:14px;">
        <span class="log-chip" style="font-size:14px;">🔥 <strong>${totalCal}</strong> kcal общо</span>
        <span class="log-chip" style="font-size:14px;">🛣️ <strong>${totalKm.toFixed(1)}</strong> км общо</span>
        ${firstW && lastW ? `<span class="log-chip" style="font-size:14px;">⚖️ <strong>${(lastW-firstW).toFixed(1)}</strong> кг разлика</span>` : ''}
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════
// CHART (main)
// ═══════════════════════════════════════════════════════
let weeklyKmChartInstance     = null;
let weightForecastChartInstance = null;

function switchChart(type, el) {
  currentChartType = type;
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderChart(allLogs);
}

function renderChart(logs) {
  const ctx = document.getElementById('mainChart');
  if (!ctx) return;
  if (mainChartInstance) { mainChartInstance.destroy(); mainChartInstance = null; }
  if (!logs.length) return;

  const labels = logs.map(l => l.date);
  let data, label, color;
  if (currentChartType === 'weight')        { data = logs.map(l => l.weight ? Number(l.weight) : null); label = 'Тегло (кг)'; color = '#f97316'; }
  else if (currentChartType === 'calories') { data = logs.map(l => Number(l.calories)||0); label = 'Калории'; color = '#22c55e'; }
  else                                      { data = logs.map(l => Number(l.km)||0); label = 'Км'; color = '#3b82f6'; }

  mainChartInstance = new Chart(ctx, {
    type: currentChartType === 'weight' ? 'line' : 'bar',
    data: { labels, datasets:[{
      label, data,
      borderColor: color,
      backgroundColor: currentChartType === 'weight' ? color+'22' : color+'99',
      borderWidth: 2, tension: .35,
      fill: currentChartType === 'weight',
      pointBackgroundColor: color, pointRadius: 4, borderRadius: 6
    }]},
    options: {
      responsive: true,
      plugins: { legend: { labels: { color:'#ccc', font:{ family:'Barlow' }, boxWidth:12 } } },
      scales: {
        x: { ticks:{ color:'#6b7a96', font:{ size:10, family:'Barlow' } }, grid:{ color:'rgba(255,255,255,0.04)' } },
        y: { ticks:{ color:'#6b7a96', font:{ family:'Barlow' } },          grid:{ color:'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════
// WEIGHT FORECAST CHART + VERDICT
// ═══════════════════════════════════════════════════════
function renderWeightGoalStats() {
  const card = document.getElementById('weightGoalStatsCard');
  const el   = document.getElementById('weightGoalStats');
  if (!weightGoal) { card.style.display = 'none'; return; }
  card.style.display = 'block';

  const weightLogs = allLogs.filter(l => l.weight).map(l => ({ date: l.date, w: Number(l.weight) }));
  if (weightLogs.length < 2) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon">📊</div><p>Нужни са поне 2 измервания за прогноза</p></div>';
    if (weightForecastChartInstance) { weightForecastChartInstance.destroy(); weightForecastChartInstance = null; }
    return;
  }

  // Linear regression
  const n     = weightLogs.length;
  const xs    = weightLogs.map((_, i) => i);
  const ys    = weightLogs.map(l => l.w);
  const sumX  = xs.reduce((a,b) => a+b, 0);
  const sumY  = ys.reduce((a,b) => a+b, 0);
  const sumXY = xs.reduce((s,x,i) => s+x*ys[i], 0);
  const sumX2 = xs.reduce((s,x) => s+x*x, 0);
  const denom = n*sumX2 - sumX*sumX;
  const slope     = denom !== 0 ? (n*sumXY - sumX*sumY) / denom : 0;
  const intercept = (sumY - slope*sumX) / n;

  const target          = weightGoal.targetWeight;
  const stepsToTarget   = slope !== 0 ? Math.round((target - intercept) / slope) : null;
  const lastIdx         = n - 1;
  const stepsLeft       = stepsToTarget !== null ? stepsToTarget - lastIdx : null;

  const today    = new Date(); today.setHours(0,0,0,0);
  const deadline = new Date(weightGoal.targetDate); deadline.setHours(0,0,0,0);
  const daysLeft = Math.max(0, Math.round((deadline - today) / 86400000));

  const firstLogDate       = parseDate(weightLogs[0].date);
  const lastLogDate        = parseDate(weightLogs[n-1].date);
  const totalDays          = Math.max(1, Math.round((lastLogDate - firstLogDate) / 86400000));
  const avgDaysBetweenLogs = totalDays / Math.max(1, n-1);
  const stepsInRemaining   = daysLeft / avgDaysBetweenLogs;

  const wm          = getWeightGoalMeta();
  const canAchieve  = stepsLeft !== null && stepsLeft <= stepsInRemaining && slope < 0;
  const isGaining   = slope > 0.03;

  let forecastDateStr = '—';
  if (slope < 0 && stepsLeft !== null && stepsLeft > 0) {
    const fd = new Date(lastLogDate);
    fd.setDate(lastLogDate.getDate() + Math.round(stepsLeft * avgDaysBetweenLogs));
    forecastDateStr = fd.toLocaleDateString('bg-BG', { day:'numeric', month:'long', year:'numeric' });
  } else if (slope < 0 && stepsLeft !== null && stepsLeft <= 0) {
    forecastDateStr = 'Вече постигнато! 🏆';
  }

  let bestWeekLoss = 0, bestWeekStr = '—';
  for (let i = 1; i < weightLogs.length; i++) {
    const diff = weightLogs[i-1].w - weightLogs[i].w;
    if (diff > bestWeekLoss) { bestWeekLoss = diff; bestWeekStr = `${diff.toFixed(1)} кг (${weightLogs[i].date})`; }
  }

  const trendText  = slope < -0.05 ? '📉 Намалява' : slope > 0.05 ? '📈 Нараства' : '➡️ Стабилно';
  const trendColor = slope < -0.05 ? 'var(--green)'  : slope > 0.05 ? 'var(--red)'  : 'var(--text-dim)';

  let verdictHTML = '';
  if (isGaining) {
    verdictHTML = `<div class="forecast-verdict danger"><div class="fv-icon">🚨</div><div class="fv-body"><div class="fv-title">КАЧВАШ ТЕГЛО — ЦЕЛТА В РИСК</div><div class="fv-sub">При сегашния темп теглото ти расте. Нужна е промяна в режима.</div></div></div>`;
  } else if (canAchieve) {
    verdictHTML = `<div class="forecast-verdict success"><div class="fv-icon">✅</div><div class="fv-body"><div class="fv-title">ЩЕ ПОСТИГНЕШ ЦЕЛТА СИ!</div><div class="fv-sub">При сегашния темп ще достигнеш ${target} кг около <strong>${forecastDateStr}</strong> — преди крайната дата.</div></div></div>`;
  } else if (slope < 0) {
    verdictHTML = `<div class="forecast-verdict warning"><div class="fv-icon">⚠️</div><div class="fv-body"><div class="fv-title">ТЕМПОТО Е НЕДОСТАТЪЧНО</div><div class="fv-sub">При сегашния темп ще достигнеш целта около <strong>${forecastDateStr}</strong> — след крайната дата. Нужен темп: ${wm ? wm.neededRate.toFixed(2) : '—'} кг/седм.</div></div></div>`;
  } else {
    verdictHTML = `<div class="forecast-verdict neutral"><div class="fv-icon">📊</div><div class="fv-body"><div class="fv-title">НЕДОСТАТЪЧНО ДАННИ</div><div class="fv-sub">Добави повече измервания за по-точна прогноза.</div></div></div>`;
  }

  el.innerHTML = `
    ${verdictHTML}
    <div class="wg-insight-row" style="margin-bottom:8px;margin-top:12px;">
      <div class="wg-insight"><div class="wg-insight-val">${weightLogs[0].w} кг</div><div class="wg-insight-lbl">🏁 Начало</div></div>
      <div class="wg-insight"><div class="wg-insight-val">${wm ? wm.currentWeight : '—'} кг</div><div class="wg-insight-lbl">⚖️ Сега</div></div>
      <div class="wg-insight"><div class="wg-insight-val">${target} кг</div><div class="wg-insight-lbl">🎯 Цел</div></div>
    </div>
    <div class="wg-insight-row" style="margin-bottom:8px;">
      <div class="wg-insight"><div class="wg-insight-val" style="color:${trendColor};">${trendText}</div><div class="wg-insight-lbl">📊 Тренд</div></div>
      <div class="wg-insight"><div class="wg-insight-val">${wm ? wm.avgRate.toFixed(2) : '—'} кг/с</div><div class="wg-insight-lbl">📉 Темп</div></div>
      <div class="wg-insight"><div class="wg-insight-val">${wm ? wm.neededRate.toFixed(2) : '—'} кг/с</div><div class="wg-insight-lbl">🎯 Нужно</div></div>
    </div>
    <div class="wg-insight-row">
      <div class="wg-insight" style="flex:1;"><div class="wg-insight-val">${bestWeekStr}</div><div class="wg-insight-lbl">🏆 Най-добра седмица</div></div>
    </div>`;

  renderWeightForecastChart(weightLogs, slope, intercept, n, stepsLeft, avgDaysBetweenLogs, lastLogDate);
}

function renderWeightForecastChart(weightLogs, slope, intercept, n, stepsLeft, avgDaysBetweenLogs, lastLogDate) {
  const ctx = document.getElementById('weightForecastChart');
  if (!ctx) return;
  if (weightForecastChartInstance) { weightForecastChartInstance.destroy(); weightForecastChartInstance = null; }

  const today    = new Date(); today.setHours(0,0,0,0);
  const deadline = new Date(weightGoal.targetDate); deadline.setHours(0,0,0,0);
  const daysToDeadline = Math.max(7, Math.round((deadline - today) / 86400000));
  const projectSteps   = Math.max(3, Math.ceil(daysToDeadline / Math.max(1, avgDaysBetweenLogs)));

  const actualLabels = weightLogs.map(l => l.date);
  const actualData   = weightLogs.map(l => l.w);
  const projLabels   = [];
  const projData     = [];

  for (let i = 1; i <= projectSteps; i++) {
    const d = new Date(lastLogDate);
    d.setDate(lastLogDate.getDate() + Math.round(i * avgDaysBetweenLogs));
    projLabels.push(d.toLocaleDateString('bg-BG', { day:'numeric', month:'short' }));
    projData.push(Number((intercept + slope * (n - 1 + i)).toFixed(2)));
  }

  const allLabels = [...actualLabels, ...projLabels];
  const actFull   = [...actualData, ...new Array(projLabels.length).fill(null)];
  const projFull  = [...new Array(actualLabels.length - 1).fill(null), actualData[n-1], ...projData];
  const targetLine = new Array(allLabels.length).fill(weightGoal.targetWeight);

  weightForecastChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allLabels,
      datasets: [
        { label:'Реално тегло', data:actFull,    borderColor:'#f97316', backgroundColor:'rgba(249,115,22,0.1)',  borderWidth:2.5, pointBackgroundColor:'#f97316', pointRadius:4, tension:0.3, fill:false, spanGaps:false },
        { label:'Прогноза',     data:projFull,   borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.06)', borderWidth:2,   borderDash:[6,4], pointBackgroundColor:'#3b82f6', pointRadius:3, tension:0.3, fill:false, spanGaps:false },
        { label:`Цел: ${weightGoal.targetWeight} кг`, data:targetLine, borderColor:'#a855f7', backgroundColor:'transparent', borderWidth:1.5, borderDash:[4,4], pointRadius:0, tension:0, fill:false }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { labels:{ color:'#ccc', font:{ family:'Barlow', size:11 }, boxWidth:14, padding:12 } },
        tooltip: { callbacks:{ label: c => c.raw !== null ? `${c.dataset.label}: ${c.raw} кг` : null } }
      },
      scales: {
        x: { ticks:{ color:'#6b7a96', font:{ size:9, family:'Barlow' }, maxRotation:45 }, grid:{ color:'rgba(255,255,255,0.04)' } },
        y: { ticks:{ color:'#6b7a96', font:{ family:'Barlow' }, callback: v => v+' кг' }, grid:{ color:'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════
// WEEKLY KM COMPARISON CHART
// ═══════════════════════════════════════════════════════
function getWeeklyKmData(numWeeks) {
  const now = new Date(); now.setHours(0,0,0,0);
  const result = [];
  for (let w = numWeeks - 1; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - w * 7);
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const km = allLogs
      .filter(l => { const d = parseDate(l.date); d.setHours(0,0,0,0); return d >= weekStart && d < weekEnd; })
      .reduce((s,l) => s+(Number(l.km)||0), 0);
    const label = w === 0 ? 'Тази' : w === 1 ? 'Мин.' : weekStart.toLocaleDateString('bg-BG', { day:'numeric', month:'short' });
    result.push({ label, km: Math.round(km * 10) / 10, isCurrentWeek: w === 0 });
  }
  return result;
}

function renderWeeklyKmChart() {
  const ctx = document.getElementById('weeklyKmChart');
  if (!ctx) return;
  if (weeklyKmChartInstance) { weeklyKmChartInstance.destroy(); weeklyKmChartInstance = null; }

  const weeks   = getWeeklyKmData(8);
  const labels  = weeks.map(w => w.label);
  const data    = weeks.map(w => w.km);
  const thisKm  = weeks[weeks.length - 1].km;
  const lastKm  = weeks[weeks.length - 2]?.km || 0;
  const prevKms = weeks.slice(0, -1).filter(w => w.km > 0).map(w => w.km);
  const avgKm   = prevKms.length ? prevKms.reduce((a,b) => a+b, 0) / prevKms.length : 0;

  // Trend slope over last 4 non-empty weeks
  const last4 = weeks.slice(-4).filter(w => w.km > 0);
  let trendSlope = 0;
  if (last4.length >= 2) {
    const n4 = last4.length;
    const xs4 = last4.map((_,i) => i), ys4 = last4.map(w => w.km);
    const sX = xs4.reduce((a,b)=>a+b,0), sY = ys4.reduce((a,b)=>a+b,0);
    const sXY = xs4.reduce((s,x,i)=>s+x*ys4[i],0), sX2 = xs4.reduce((s,x)=>s+x*x,0);
    const d = n4*sX2 - sX*sX;
    trendSlope = d !== 0 ? (n4*sXY - sX*sY) / d : 0;
  }

  const diff    = thisKm - lastKm;
  const diffPct = lastKm > 0 ? Math.round((diff / lastKm) * 100) : 0;
  const trendUp = trendSlope > 0.5;
  const trendDn = trendSlope < -0.5;

  let verdictIcon, verdictTitle, verdictSub, verdictCls;
  if (thisKm === 0) {
    verdictIcon = '⏳'; verdictCls = 'neutral';
    verdictTitle = 'ТАЗИ СЕДМИЦА ОЩЕ НЕ СИ КАРАЛ';
    verdictSub = `Миналата седмица: ${lastKm} км. Средно: ${avgKm.toFixed(0)} км/седм.`;
  } else if (diff > 0) {
    verdictIcon = '🔥'; verdictCls = 'success';
    verdictTitle = `+${diff.toFixed(1)} КМ СПРЯМО МИНАЛАТА (+${diffPct}%)`;
    verdictSub = trendUp
      ? `Тренд нагоре 📈 — подобряваш се! Средно: ${avgKm.toFixed(0)} км/седм.`
      : `Средно последните седмици: ${avgKm.toFixed(0)} км/седм.`;
  } else if (diff < 0) {
    verdictIcon = '📉'; verdictCls = 'warning';
    verdictTitle = `${diff.toFixed(1)} КМ СПРЯМО МИНАЛАТА (${diffPct}%)`;
    verdictSub = trendDn
      ? `Тренд надолу ⚠️ — внимавай да не губиш форма. Средно: ${avgKm.toFixed(0)} км.`
      : `Средно последните седмици: ${avgKm.toFixed(0)} км/седм.`;
  } else {
    verdictIcon = '➡️'; verdictCls = 'neutral';
    verdictTitle = 'СЪЩОТО ТЕМПО КАТО МИНАЛАТА СЕДМИЦА';
    verdictSub = `Средно последните седмици: ${avgKm.toFixed(0)} км/седм.`;
  }

  document.getElementById('weeklyKmVerdict').innerHTML = `
    <div class="forecast-verdict ${verdictCls}">
      <div class="fv-icon">${verdictIcon}</div>
      <div class="fv-body">
        <div class="fv-title">${verdictTitle}</div>
        <div class="fv-sub">${verdictSub}</div>
      </div>
    </div>`;

  const colors  = data.map((_,i) => i === data.length-1 ? '#f97316' : 'rgba(59,130,246,0.7)');
  const borders = data.map((_,i) => i === data.length-1 ? '#f97316' : '#3b82f6');

  weeklyKmChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets:[{ label:'Км', data, backgroundColor:colors, borderColor:borders, borderWidth:1.5, borderRadius:6 }] },
    options: {
      responsive: true,
      plugins: {
        legend: { display:false },
        tooltip: { callbacks:{ label: c => `${c.raw} км` } }
      },
      scales: {
        x: { ticks:{ color:'#6b7a96', font:{ size:10, family:'Barlow' } }, grid:{ color:'rgba(255,255,255,0.04)' } },
        y: { ticks:{ color:'#6b7a96', font:{ family:'Barlow' }, callback: v => v+' км' }, grid:{ color:'rgba(255,255,255,0.04)' }, beginAtZero:true }
      }
    }
  });
}
