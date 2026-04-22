let workoutLogs = [];

window.saveWorkoutLog = function () {
const calories = document.getElementById("caloriesInput").value;
const weight = document.getElementById("weightInput").value;
const km = document.getElementById("kmInput").value;
const notes = document.getElementById("notesInput").value;

const entry = {
date: new Date(),
calories: Number(calories) || 0,
weight: Number(weight) || null,
km: Number(km) || 0,
notes: notes || ""
};

workoutLogs.unshift(entry);

renderHistory();
updateSummary();

showToast("Тренировката е запазена");
};

function renderHistory() {
const container = document.getElementById("history");
if (!container) return;

if (workoutLogs.length === 0) {
container.innerHTML = `       <div class="empty-state">         <div class="es-icon">📭</div>         <p>Няма записи</p>       </div>
    `;
return;
}

container.innerHTML = workoutLogs.map(log => `    <div class="log-item">       <div>         <div class="log-date">${formatDate(log.date)}</div>         <div class="log-stats">           <span class="log-chip">🔥 ${log.calories} kcal</span>           <span class="log-chip">🛣️ ${log.km} km</span>
          ${log.weight ?`<span class="log-chip">⚖️ ${log.weight} kg</span>`: ""}         </div>
        ${log.notes ?`<div class="log-note">${log.notes}</div>`: ""}       </div>     </div>
 `).join("");
}

function updateSummary() {
const totalKcal = workoutLogs.reduce((sum, l) => sum + l.calories, 0);
const totalKm = workoutLogs.reduce((sum, l) => sum + l.km, 0);

const el = document.getElementById("summary");
if (!el) return;

el.innerHTML = `     <div>🔥 Общо kcal: ${totalKcal}</div>     <div>🛣️ Общо км: ${totalKm}</div>
  `;
}
