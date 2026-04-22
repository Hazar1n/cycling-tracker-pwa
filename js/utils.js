window.showToast = function(message) {
let toast = document.querySelector(".toast");

if (!toast) {
toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);
}

toast.textContent = message;
toast.classList.add("show");

setTimeout(() => {
toast.classList.remove("show");
}, 2200);
};

window.formatDate = function(dateStr) {
const d = new Date(dateStr);
return d.toLocaleDateString("bg-BG");
};
