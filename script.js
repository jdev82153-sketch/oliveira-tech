
const SUPABASE_URL = "https://rxofcxaanozzrzjtelvb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NTubC_1gd5QZMksl_ni1fQ_5azeAchD";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const loginForm = document.getElementById("loginForm");
const userType = document.getElementById("userType");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");

function showMessage(message) {
  if (loginMessage) {
    loginMessage.textContent = message;
  }
}

// Mostrar ou ocultar a senha
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const showingPassword = passwordInput.type === "password";

    passwordInput.type = showingPassword ? "text" : "password";
    togglePassword.textContent = showingPassword
      ? "Ocultar"
      : "Mostrar";
  });
}

// Limpar mensagens ao mudar o tipo de acesso
if (userType) {
  userType.addEventListener("change", () => {
    showMessage("");
  });
}

// Login real com Supabase
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const selectedRole = userType.value;

    if (!email || !password) {
      showMessage("Preencha o e-mail e a senha.");
      return;
    }

    const submitButton = loginForm.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
    }

    showMessage("Verificando seus dados...");

    try {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        throw error;
      }

      const user = data.user;

      // Buscar o perfil vinculado ao usuário autenticado
      const { data: profile, error: profileError } =
        await supabaseClient
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

      if (profileError || !profile) {
        await supabaseClient.auth.signOut();
        throw new Error(
          "Seu perfil não foi encontrado. Entre em contato com o administrador."
        );
      }

      // O tipo de acesso selecionado precisa corresponder
      // ao papel registrado no banco de dados.
      if (profile.role !== selectedRole) {
        await supabaseClient.auth.signOut();

        throw new Error(
          profile.role === "admin"
            ? "Selecione Painel administrativo para entrar."
            : "Sua conta não tem permissão de administrador."
        );
      }

      showMessage("Login realizado! Abrindo seu painel...");

      if (profile.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "client.html";
      }
    } catch (error) {
      showMessage(
        error.message ||
        "Não foi possível entrar. Verifique seus dados e tente novamente."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

// Efeito suave de entrada
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
});
