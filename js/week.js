// ═══════════════════════════════════════════════════════
// WEEKS SCREEN
// ═══════════════════════════════════════════════════════
function renderWeeks() {
  const weeks    = getPlanWeeks();
  const safeWeek = Math.min(currentWeek, weeks.length - 1);
  const week     = weeks[safeWeek];
  document.getElementById('weekNavTitle').textContent = week.title;

  document.getElementById('weekDots').innerHTML = weeks.map((_, i) =>
    `<div class="week-dot ${i === safeWeek ? 'active' : ''}"></div>`
  ).join('');

  const { weekIndex, dayIndex } = getWeekAndDay();
  const daysEl = document.getElementById('weekDays');
  daysEl.innerHTML = '';

  week.days.forEach((day, di) => {
    const key     = checkKey(safeWeek, di);
    const checked = localStorage.getItem(key) === '1';
    const isToday = safeWeek === weekIndex && di === dayIndex;
    const rest    = isRestDay(day);

    const row = document.createElement('div');
    row.className = `day-row ${checked ? 'done' : ''} ${isToday ? 'today-highlight' : ''} ${rest ? 'rest-day' : ''}`;
    row.innerHTML = `
      <div class="day-index">${di + 1}</div>
      <div class="day-text">
        ${day.text}${day.km ? ` <strong>${day.km} км</strong>` : ''}
        ${isToday ? ' ← <strong>Днес</strong>' : ''}
        ${rest ? '<span class="rest-auto-badge">автоматично</span>' : ''}
      </div>
      ${rest
        ? `<span style="font-size:18px">✅</span>`
        : `<button class="toggle-check ${checked ? 'on' : ''}" onclick="saveCheck('${key}',this)"></button>`
      }`;
    daysEl.appendChild(row);
  });
}

function changeWeek(dir) {
  const weeks = getPlanWeeks();
  const next  = currentWeek + dir;
  if (next < 0 || next >= weeks.length) return;
  currentWeek = next;
  localStorage.setItem('currentWeek', currentWeek);
  renderWeeks();
}

// ═══════════════════════════════════════════════════════
// CHECK / PROGRESS
// ═══════════════════════════════════════════════════════
function saveCheck(key, btn) {
  const cur    = localStorage.getItem(key) === '1';
  const newVal = !cur;
  localStorage.setItem(key, newVal ? '1' : '0');
  btn.classList.toggle('on', newVal);
  btn.closest('.day-row')?.classList.toggle('done', newVal);
  checkPlanCompletion();
  renderUnifiedToday();
  if (newVal) showToast('✅ Ден отбелязан!');
}
