let plans = [];
let activePlan = null;

window.savePlan = function () {
const name = document.getElementById("planNameInput").value;

if (!name) {
showToast("Въведи име на план");
return;
}

const plan = {
id: Date.now(),
name,
createdAt: new Date()
};

plans.push(plan);
renderPlans();

showToast("Планът е създаден");
};

window.repeatPlan = function () {
if (!activePlan) return;
showToast("Планът е рестартиран");
};

window.addWeekToBuilder = function () {
showToast("Добавена седмица");
};

function renderPlans() {
const container = document.getElementById("allPlansList");
if (!container) return;

if (plans.length === 0) {
container.innerHTML = `       <div class="empty-state">         <div class="es-icon">📋</div>         <p>Няма планове</p>       </div>
    `;
return;
}

container.innerHTML = plans.map(p => `     <div class="plan-item">       <div class="plan-item-name">${p.name}</div>     </div>
  `).join("");
}
