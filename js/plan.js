// ═══════════════════════════════════════════════════════
// ACTIVE PLAN HELPERS
// ═══════════════════════════════════════════════════════
function getActivePlan() {
  if (activePlanId === 'default-4week') return DEFAULT_PLAN;
  return allPlans.find(p => p.id === activePlanId) || DEFAULT_PLAN;
}

function getPlanWeeks() {
  return getActivePlan()?.weeks || DEFAULT_PLAN.weeks;
}

function getProgramDay() {
  const startKey = `planStart_${activePlanId}`;
  const stored = localStorage.getItem(startKey);
  if (!stored) {
    const today = new Date(); today.setHours(0,0,0,0);
    localStorage.setItem(startKey, today.toISOString());
    return 0;
  }
  const start = new Date(stored); start.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.floor((today - start) / 86400000);
}

function getWeekAndDay() {
  const d = getProgramDay();
  return { weekIndex: Math.floor(d / 7), dayIndex: d % 7 };
}

function checkKey(weekIndex, dayIndex) {
  return `plan_${activePlanId}_${weekIndex}_${dayIndex}`;
}

// ═══════════════════════════════════════════════════════
// WEIGHT GOAL META
// ═══════════════════════════════════════════════════════
function getWeightGoalMeta() {
  if (!weightGoal) return null;
  const { startWeight, targetWeight, targetDate, startDate } = weightGoal;
  const totalToLose = startWeight - targetWeight;
  const weightLogs = allLogs.filter(l => l.weight);
  const currentWeight = weightLogs.length
    ? Number(weightLogs[weightLogs.length-1].weight)
    : startWeight;
  const lost      = startWeight - currentWeight;
  const remaining = currentWeight - targetWeight;
  const pct = totalToLose !== 0
    ? Math.max(0, Math.min(100, Math.round(lost / totalToLose * 100)))
    : 100;

  const today  = new Date(); today.setHours(0,0,0,0);
  const endD   = new Date(targetDate); endD.setHours(0,0,0,0);
  const startD = new Date(startDate);  startD.setHours(0,0,0,0);
  const daysTotal   = Math.round((endD - startD) / 86400000);
  const daysLeft    = Math.max(0, Math.round((endD - today) / 86400000));
  const daysElapsed = daysTotal - daysLeft;
  const weeksElapsed = daysElapsed / 7;
  const avgRate  = weeksElapsed > 0 ? Math.abs(lost / weeksElapsed) : 0;
  const weeksLeft = daysLeft / 7;
  const neededRate = weeksLeft > 0 ? Math.abs(remaining) / weeksLeft : 0;

  let forecastText = '—';
  if (avgRate > 0 && remaining > 0) {
    const weeksNeeded = remaining / avgRate;
    const fd = new Date(today);
    fd.setDate(today.getDate() + Math.round(weeksNeeded * 7));
    forecastText = fd.toLocaleDateString('bg-BG', { day:'numeric', month:'short' });
  }

  const goalReached = (totalToLose > 0)
    ? currentWeight <= targetWeight
    : currentWeight >= targetWeight;
  const losing = totalToLose > 0;

  let statusKey;
  if (goalReached) {
    statusKey = 'achieved';
  } else if (losing && lost < 0) {
    statusKey = 'danger';
  } else {
    const expectedLost = (daysElapsed / daysTotal) * Math.abs(totalToLose);
    statusKey = Math.abs(lost) >= expectedLost * 0.85 ? 'on-track' : 'behind';
  }

  const statusConfigs = {
    'on-track': { cls:'on-track', icon:'✅', title:'НА ПРАВИЛНИЯ ПЪТ', sub:`Прогноза: ${forecastText}`,                 color:'var(--green)'   },
    'behind':   { cls:'behind',   icon:'⚠️', title:'ИЗОСТАВАШ',        sub:`Нужен темп: ${neededRate.toFixed(2)} кг/седм.`, color:'var(--orange)' },
    'danger':   { cls:'danger',   icon:'📈', title:'КАЧВАШ ТЕГЛО',     sub:`+${Math.abs(lost).toFixed(1)} кг от старта`,  color:'var(--red)'    },
    'achieved': { cls:'achieved', icon:'🏆', title:'ЦЕЛТА Е ПОСТИГНАТА!', sub:`Достигна ${currentWeight} кг!`,            color:'var(--purple)' },
  };

  return {
    currentWeight, lost, remaining, pct,
    daysLeft, avgRate, neededRate, forecastText,
    startWeight, targetWeight,
    status: statusConfigs[statusKey]
  };
}

// ═══════════════════════════════════════════════════════
// PLAN COMPLETION
// ═══════════════════════════════════════════════════════
function checkPlanCompletion() {
  const weeks = getPlanWeeks();
  const allDone = weeks.every((w, wi) =>
    w.days.every((d, di) => isRestDay(d) || localStorage.getItem(checkKey(wi, di)) === '1')
  );
  if (!allDone) return;
  markPlanCompleted();
  confetti({ particleCount:150, spread:90, origin:{y:0.5}, colors:['#f97316','#22c55e','#3b82f6','#a855f7'] });
  document.getElementById('repeatModal').classList.add('open');
}

function markPlanCompleted() {
  const plan = getActivePlan();
  const histKey = 'planHistory';
  const hist = JSON.parse(localStorage.getItem(histKey) || '[]');
  hist.push({
    id: plan.id,
    name: plan.name,
    completedAt: new Date().toLocaleDateString('bg-BG'),
    cycleCount: (hist.filter(h => h.id === plan.id).length + 1)
  });
  localStorage.setItem(histKey, JSON.stringify(hist));
}

function repeatPlan() {
  const weeks = getPlanWeeks();
  weeks.forEach((w, wi) => w.days.forEach((_, di) => localStorage.removeItem(checkKey(wi, di))));
  localStorage.setItem(`planStart_${activePlanId}`, new Date().toISOString());
  currentWeek = 0;
  localStorage.setItem('currentWeek', '0');
  closeRepeatModal();
  renderUnifiedToday();
  renderWeeks();
  renderPlansScreen();
  showToast('🔄 Планът е рестартиран!');
}

function closeRepeatModal() {
  document.getElementById('repeatModal').classList.remove('open');
}
