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
  if (lk)  { kd.textContent = (tk -lk >=0?'+':'')+(tk -lk )+' kcal';    kd.className = 'wc-delta '+(tk >=lk ?'up':'down'); }
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
// CHART
// ═══════════════════════════════════════════════════════
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
  if (currentChartType === 'weight')   { data = logs.map(l => l.weight ? Number(l.weight) : null); label = 'Тегло (кг)'; color = '#f97316'; }
  else if (currentChartType === 'calories') { data = logs.map(l => Number(l.calories)||0); label = 'Калории'; color = '#22c55e'; }
  else                                 { data = logs.map(l => Number(l.km)||0); label = 'Км'; color = '#3b82f6'; }

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
// WEIGHT GOAL STATS (Stats screen)
// ═══════════════════════════════════════════════════════
function renderWeightGoalStats() {
  const card = document.getElementById('weightGoalStatsCard');
  const el   = document.getElementById('weightGoalStats');
  if (!weightGoal) { card.style.display = 'none'; return; }
  card.style.display = 'block';

  const weightLogs = allLogs.filter(l => l.weight).map(l => ({ date:l.date, w:Number(l.weight) }));
  if (weightLogs.length < 2) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon">📊</div><p>Нужни са поне 2 измервания</p></div>';
    return;
  }

  let bestWeekLoss = 0, bestWeekStr = '—';
  for (let i = 1; i < weightLogs.length; i++) {
    const diff = weightLogs[i-1].w - weightLogs[i].w;
    if (diff > bestWeekLoss) { bestWeekLoss = diff; bestWeekStr = `${diff.toFixed(1)} кг (${weightLogs[i].date})`; }
  }

  const n    = weightLogs.length;
  const xs   = weightLogs.map((_, i) => i);
  const ys   = weightLogs.map(l => l.w);
  const sumX = xs.reduce((a,b) => a+b, 0);
  const sumY = ys.reduce((a,b) => a+b, 0);
  const sumXY = xs.reduce((s,x,i) => s+x*ys[i], 0);
  const sumX2 = xs.reduce((s,x) => s+x*x, 0);
  const slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
  const trendText  = slope < -0.05 ? '📉 Намалява' : slope > 0.05 ? '📈 Нараства' : '➡️ Стабилно';
  const trendColor = slope < -0.05 ? 'var(--green)' : slope > 0.05 ? 'var(--red)' : 'var(--text-dim)';

  const wm = getWeightGoalMeta();
  el.innerHTML = `
    <div class="wg-insight-row" style="margin-bottom:8px;">
      <div class="wg-insight"><div class="wg-insight-val">${weightLogs[0].w} кг</div><div class="wg-insight-lbl">🏁 Начало</div></div>
      <div class="wg-insight"><div class="wg-insight-val">${wm ? wm.currentWeight : '-'} кг</div><div class="wg-insight-lbl">⚖️ Сега</div></div>
      <div class="wg-insight"><div class="wg-insight-val">${weightGoal.targetWeight} кг</div><div class="wg-insight-lbl">🎯 Цел</div></div>
    </div>
    <div class="wg-insight-row" style="margin-bottom:8px;">
      <div class="wg-insight"><div class="wg-insight-val" style="color:${trendColor};">${trendText}</div><div class="wg-insight-lbl">📊 Тренд</div></div>
      <div class="wg-insight"><div class="wg-insight-val">${wm ? wm.pct : 0}%</div><div class="wg-insight-lbl">🎯 % от целта</div></div>
    </div>
    <div class="wg-insight-row">
      <div class="wg-insight" style="flex:1;"><div class="wg-insight-val">${bestWeekStr}</div><div class="wg-insight-lbl">🏆 Най-добра седмица</div></div>
    </div>`;
}
