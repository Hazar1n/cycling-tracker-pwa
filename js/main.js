window.switchTab = function (tab, el) {
document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
const target = document.getElementById("screen-" + tab);
if (target) target.classList.add("active");

document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
if (el) el.classList.add("active");
};

window.changeWeek = function (dir) {
showToast("Смяна на седмица: " + dir);
};

document.addEventListener("DOMContentLoaded", () => {
console.log("App initialized");

// стартов таб
switchTab("today");
});
