// ═══════════════════════════════════════════════════════
// SUPABASE — PLANS
// ═══════════════════════════════════════════════════════
async function loadPlans() {
  const { data:{ user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  const { data, error } = await supabaseClient
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .order('id', { ascending:true });
  if (error) { console.error(error); return; }
  allPlans = (data||[]).map(p => ({
    ...p,
    weeks: typeof p.weeks === 'string' ? JSON.parse(p.weeks) : p.weeks
  }));
}

// ═══════════════════════════════════════════════════════
// SUPABASE — WORKOUTS
// ═══════════════════════════════════════════════════════
async function loadFromSupabase() {
  const { data:{ user } } = await supabaseClient.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabaseClient
    .from('Workout')
    .select('*')
    .eq('user_id', user.id)
    .order('id', { ascending:true });
  if (error) {
    const { data:d2 } = await supabaseClient.from('Workout').select('*').eq('user_id', user.id);
    return d2 || [];
  }
  return data || [];
}

async function saveWorkoutLog() {
  const calories = Number(document.getElementById('caloriesInput').value) || 0;
  const weight   = parseFloat(document.getElementById('weightInput').value) || null;
  const km       = parseFloat(document.getElementById('kmInput').value) || 0;
  const notes    = document.getElementById('notesInput').value.trim();
  const { data:{ user } } = await supabaseClient.auth.getUser();
  if (!user) { showToast('⚠️ Трябва да си логнат!'); return; }
  const { error } = await supabaseClient.from('Workout').insert([{
    date: new Date().toLocaleDateString('bg-BG'),
    calories, weight, km, notes, user_id: user.id
  }]);
  if (error) { showToast('❌ Грешка при запис'); return; }
  document.getElementById('caloriesInput').value = '';
  document.getElementById('weightInput').value   = '';
  document.getElementById('kmInput').value        = '';
  document.getElementById('notesInput').value     = '';
  showToast('✅ Тренировката е записана!');
  allLogs = await loadFromSupabase();
  renderLogs();
  updateStatsHeader();
  renderUnifiedToday();
}

async function deleteLog(id) {
  if (!confirm('Изтриване на записа?')) return;
  await supabaseClient.from('Workout').delete().eq('id', id);
  allLogs = await loadFromSupabase();
  renderLogs();
  updateStatsHeader();
  renderUnifiedToday();
  showToast('🗑️ Записът е изтрит');
}
