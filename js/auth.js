const SUPABASE_URL = "";
const SUPABASE_KEY = "";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.login = async function () {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await supabase.auth.signInWithPassword({
email,
password
});

if (error) {
showToast(error.message);
return;
}

document.getElementById("auth").style.display = "none";
document.getElementById("app").style.display = "block";

showToast("Влезе успешно");
};

window.signUp = async function () {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await supabase.auth.signUp({
email,
password
});

if (error) {
showToast(error.message);
return;
}

showToast("Регистрация успешна");
};

window.logout = async function () {
await supabase.auth.signOut();

document.getElementById("auth").style.display = "block";
document.getElementById("app").style.display = "none";

showToast("Излезе от профила");
};
