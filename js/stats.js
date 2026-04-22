let chartInstance = null;

window.switchChart = function (type) {
const ctx = document.getElementById("mainChart");
if (!ctx) return;

if (chartInstance) {
chartInstance.destroy();
}

let data = [];

if (type === "weight") {
data = workoutLogs.map(l => l.weight || 0);
} else if (type === "calories") {
data = workoutLogs.map(l => l.calories);
} else if (type === "km") {
data = workoutLogs.map(l => l.km);
}

chartInstance = new Chart(ctx, {
type: "line",
data: {
labels: workoutLogs.map(l => formatDate(l.date)),
datasets: [{
label: type,
data: data
}]
}
});
};
