let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

function updateTimerDisplay() {
const h = String(Math.floor(timerSeconds / 3600)).padStart(2, "0");
const m = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, "0");
const s = String(timerSeconds % 60).padStart(2, "0");

const el = document.getElementById("timerDisplay");
if (el) el.textContent = `${h}:${m}:${s}`;
}

window.timerToggle = function () {
const btn = document.getElementById("timerStartBtn");

if (timerRunning) {
clearInterval(timerInterval);
timerRunning = false;
if (btn) btn.textContent = "▶ Старт";
} else {
timerInterval = setInterval(() => {
timerSeconds++;
updateTimerDisplay();
}, 1000);

```
timerRunning = true;
if (btn) btn.textContent = "⏸ Пауза";
```

}
};

window.timerReset = function () {
clearInterval(timerInterval);
timerRunning = false;
timerSeconds = 0;
updateTimerDisplay();

const btn = document.getElementById("timerStartBtn");
if (btn) btn.textContent = "▶ Старт";
};
