// --- КОНФИГУРАЦИЯ И ДАННИ ---
let workouts = JSON.parse(localStorage.getItem('cycle_workouts')) || [];
let timerInterval;
let seconds = 0;
let isRunning = false;
let mainChart;

// --- 1. НАВИГАЦИЯ ---
function switchTab(screenId, tabElement) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + screenId).classList.add('active');
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');

    // Ако превключим на статистика, опресняваме графиката
    if(screenId === 'stats') {
        setTimeout(updateStats, 100); 
    }
}

// --- 2. ЛОГИКА НА ТАЙМЕРА ---
function timerToggle() {
    const btn = document.getElementById('timerStartBtn');
    const display = document.getElementById('timerDisplay');

    if (!isRunning) {
        isRunning = true;
        btn.innerText = '⏸ Пауза';
        btn.classList.replace('btn-green', 'btn-orange');
        display.classList.add('running');
        
        timerInterval = setInterval(() => {
            seconds++;
            const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const secs = String(seconds % 60).padStart(2, '0');
            display.innerText = `${hrs}:${mins}:${secs}`;
        }, 1000);
    } else {
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerText = '▶ Старт';
        btn.classList.replace('btn-orange', 'btn-green');
        display.classList.remove('running');
    }
}

function timerReset() {
    clearInterval(timerInterval);
    isRunning = false;
    seconds = 0;
    document.getElementById('timerDisplay').innerText = '00:00:00';
    document.getElementById('timerDisplay').classList.remove('running');
    const btn = document.getElementById('timerStartBtn');
    btn.innerText = '▶ Старт';
    btn.classList.replace('btn-orange', 'btn-green');
}

// --- 3. ЦЕЛИ И ГЛАВЕН ЕКРАН ---
function openGoalModal() { document.getElementById('goalModal').classList.add('open'); }
function closeGoalModal() { document.getElementById('goalModal').classList.remove('open'); }

function saveWeightGoal() {
    const start = document.getElementById('wgStart').value;
    const target = document.getElementById('wgTarget').value;
    const date = document.getElementById('wgDate').value;

    if (!start || !target || !date) return alert("Попълни всички полета!");

    const goal = { start: parseFloat(start), target: parseFloat(target), date: date };
    localStorage.setItem('cycle_goal', JSON.stringify(goal));
    closeGoalModal();
    updateUI();
}

function updateUI() {
    const goal = JSON.parse(localStorage.getItem('cycle_goal'));
    const container = document.getElementById('unifiedTodayContent');

    if (!goal) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Няма поставена цел за тегло.</p>
                <button class="btn btn-orange btn-sm" onclick="openGoalModal()" style="margin-top:10px">Постави цел</button>
            </div>`;
        return;
    }

    // Вземаме последното тегло от записите, ако има такова
    const lastWeight = workouts.length > 0 && workouts[0].weight ? parseFloat(workouts[0].weight) : goal.start;
    const totalToLose = goal.start - goal.target;
    const lostSoFar = goal.start - lastWeight;
    const progressPct = totalToLose > 0 ? Math.min(Math.max(Math.round((lostSoFar / totalToLose) * 100), 0), 100) : 100;

    container.innerHTML = `
        <div class="today-top-row">
            <div class="dual-ring">
                <svg width="120" height="120">
                    <circle class="dr-track" cx="60" cy="60" r="50" stroke-width="8"/>
                    <circle class="dr-plan" cx="60" cy="60" r="50" stroke-width="8" 
                        stroke-dasharray="314" stroke-dashoffset="${314 - (314 * progressPct / 100)}"/>
                </svg>
                <div class="dual-ring-center">
                    <div class="dr-plan-pct">${progressPct}%</div>
                    <div class="dr-lbl dr-lbl-plan">Прогрес</div>
                </div>
            </div>
            <div class="today-stats-col">
                <div class="today-plan-name">Цел: ${goal.target} кг</div>
                <div class="today-stats-grid">
                    <div class="today-stat">
                        <div class="today-stat-val">${lastWeight}</div>
                        <div class="today-stat-lbl">Текущо</div>
                    </div>
                    <div class="today-stat">
                        <div class="today-stat-val">${goal.start}</div>
                        <div class="today-stat-lbl">Старт</div>
                    </div>
                </div>
            </div>
        </div>
        <button class="edit-goal-btn" onclick="openGoalModal()">⚙️ Настройки на целта</button>
    `;
}

// --- 4. ЗАПИСИ (LOGGING) ---
function saveWorkoutLog() {
    const kcal = document.getElementById('caloriesInput').value;
    const weight = document.getElementById('weightInput').value;
    const km = document.getElementById('kmInput').value;
    const notes = document.getElementById('notesInput').value;

    if (!kcal || !km) return alert("Въведи км и калории!");

    const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' }),
        calories: parseFloat(kcal),
        weight: weight ? parseFloat(weight) : null,
        km: parseFloat(km),
        notes: notes
    };

    workouts.unshift(entry);
    localStorage.setItem('cycle_workouts', JSON.stringify(workouts));
    
    // Нулиране на полетата
    document.querySelectorAll('.log-input, .notes-input').forEach(i => i.value = '');
    
    renderHistory();
    updateUI();
    alert("Записано!");
}

function renderHistory() {
    const history = document.getElementById('history');
    if (workouts.length === 0) {
        history.innerHTML = '<p class="empty-state">Няма записи още.</p>';
        return;
    }

    history.innerHTML = workouts.map(w => `
        <div class="log-item">
            <div>
                <div class="log-date">${w.date}</div>
                <div class="log-stats">
                    <span class="log-chip">🔥 ${w.calories}</span>
                    <span class="log-chip">🛣️ ${w.km} км</span>
                    ${w.weight ? `<span class="log-chip">⚖️ ${w.weight} кг</span>` : ''}
                </div>
            </div>
            <button class="log-del" onclick="deleteWorkout(${w.id})">🗑️</button>
        </div>
    `).join('');
}

function deleteWorkout(id) {
    workouts = workouts.filter(w => w.id !== id);
    localStorage.setItem('cycle_workouts', JSON.stringify(workouts));
    renderHistory();
    updateUI();
}

// --- 5. ГРАФИКИ (STATS) ---
function updateStats() {
    const ctx = document.getElementById('mainChart').getContext('2d');
    const lastData = [...workouts].reverse().slice(-7);
    const labels = lastData.map(w => w.date);
    const dataKm = lastData.map(w => w.km);

    if (mainChart) mainChart.destroy();

    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataKm,
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

function switchChart(type, element) {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');

    const lastData = [...workouts].reverse().slice(-7);
    let data = [], color = '#f97316';

    if (type === 'km') data = lastData.map(w => w.km);
    if (type === 'calories') { data = lastData.map(w => w.calories); color = '#ef4444'; }
    if (type === 'weight') { data = lastData.map(w => w.weight); color = '#3b82f6'; }

    mainChart.data.datasets[0].data = data;
    mainChart.data.datasets[0].borderColor = color;
    mainChart.update();
}

// --- 6. AUTH МОК (За теста) ---
function login() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    updateUI();
}

function logout() {
    location.reload();
}

// СТАРТ
window.onload = () => {
    renderHistory();
    updateUI();
};