
const loginForm = document.getElementById("loginForm");
const userType = document.getElementById("userType");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");

// Mostrar ou ocultar a senha
togglePassword.addEventListener("click", () => {
  const showingPassword = passwordInput.type === "password";

  passwordInput.type = showingPassword ? "text" : "password";
  togglePassword.textContent = showingPassword ? "Ocultar" : "Mostrar";
});

// Atualizar a mensagem quando o tipo de acesso mudar
userType.addEventListener("change", () => {
  loginMessage.textContent = "";
});

// Demonstração da tela de login
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    loginMessage.textContent = "Preencha todos os campos para continuar.";
    return;
  }

  if (userType.value === "admin") {
    loginMessage.textContent =
      "Painel administrativo selecionado. A autenticação será configurada em uma próxima etapa.";
  } else {
    loginMessage.textContent =
      "Painel da empresa selecionado. O acesso será configurado em uma próxima etapa.";
  }
});

// Efeito suave de entrada
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
});

