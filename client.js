
const SUPABASE_URL = "https://rxofcxaanozzrzjtelvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_NTubC_1gd5QZMksl_ni1fQ_5azeAchD";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const companySection = document.getElementById("companySection");

function showError(message) {
  loadingMessage.hidden = true;
  companySection.hidden = true;
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

async function loadClientArea() {
  try {
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getSession();

    if (sessionError) throw sessionError;

    const session = sessionData.session;

    if (!session) {
      window.location.replace("index.html");
      return;
    }

    const user = session.user;

    const { data: profile, error: profileError } =
      await supabaseClient
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) throw profileError;

    if (!profile || profile.role !== "client") {
      await supabaseClient.auth.signOut();
      window.location.replace("index.html");
      return;
    }

    const name = profile.full_name || user.email || "Cliente";

    document.getElementById("sidebarName").textContent = name;
    document.getElementById("welcomeTitle").textContent =
      `Olá, ${name.split(" ")[0]}!`;

    const { data: company, error: companyError } =
      await supabaseClient
        .from("companies")
        .select("company_name, contact_name, email, phone, status, created_at")
        .eq("client_user_id", user.id)
        .maybeSingle();

    if (companyError) throw companyError;

    loadingMessage.hidden = true;

    if (!company) {
      showError(
        "Sua conta foi criada, mas ainda não está vinculada a uma empresa. Entre em contato com a Oliveira Tech para concluir a configuração."
      );
      return;
    }

    document.getElementById("companyName").textContent =
      company.company_name || "—";

    document.getElementById("contactName").textContent =
      company.contact_name || "Não informado";

    document.getElementById("companyEmail").textContent =
      company.email || "Não informado";

    document.getElementById("companyPhone").textContent =
      company.phone || "Não informado";

    document.getElementById("companyCreated").textContent =
      company.created_at
        ? new Date(company.created_at).toLocaleDateString("pt-BR")
        : "—";

    const status = document.getElementById("companyStatus");
    const isActive = company.status === "active";

    status.textContent = isActive ? "Ativa" : "Inativa";
    status.classList.toggle("inactive", !isActive);

    companySection.hidden = false;
  } catch (error) {
    console.error("Erro na área do cliente:", error);
    showError(
      "Não foi possível carregar seus dados. Confira a conexão e as permissões do Supabase."
    );
  }
}

document.getElementById("logoutButton").addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Não foi possível sair da conta. Tente novamente.");
    return;
  }

  window.location.replace("index.html");
});

document.getElementById("currentYear").textContent =
  new Date().getFullYear();

loadClientArea();

