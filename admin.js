
const SUPABASE_URL = "https://rxofcxaanozzrzjtelvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_NTubC_1gd5QZMksl_ni1fQ_5azeAchD";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (id) => document.getElementById(id);

const form = $("companyForm");
const newButton = $("newCompanyButton");
const cancelButton = $("cancelCompanyButton");
const saveButton = $("saveCompanyButton");
const message = $("companyMessage");
const tableBody = $("companyTableBody");

let currentUser = null;

function showMessage(text, error = false) {
  if (!message) return;
  message.textContent = text;
  message.style.color = error ? "#fca5a5" : "#a7f3d0";
}

function openCompanyForm() {
  if (!form) return;

  form.hidden = false;
  showMessage("");
  form.scrollIntoView({ behavior: "smooth", block: "start" });

  setTimeout(() => $("companyName")?.focus(), 250);
}

function closeCompanyForm() {
  if (!form) return;

  form.reset();
  form.hidden = true;
  showMessage("");
}

newButton?.addEventListener("click", openCompanyForm);
cancelButton?.addEventListener("click", closeCompanyForm);

// Navegação do painel
document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".menu-link").forEach((item) => {
      item.classList.remove("active");
    });
    link.classList.add("active");
  });
});

// Sair da conta
$("logoutButton")?.addEventListener("click", async () => {
  await db.auth.signOut();
  window.location.replace("index.html");
});

// Escapar conteúdo antes de inseri-lo na tabela HTML
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function statusLabel(status) {
  const labels = {
    active: "Ativa",
    pending: "Pendente",
    inactive: "Inativa"
  };
  return labels[status] || "Indefinido";
}

async function loadCompanies() {
  if (!tableBody) return;

  tableBody.innerHTML =
    '<tr><td colspan="4">Carregando empresas...</td></tr>';

  const { data, error } = await db
    .from("companies")
    .select("id, company_name, contact_name, email, phone, status")
    .order("created_at", { ascending: false });

  if (error) {
    tableBody.innerHTML =
      '<tr><td colspan="4">Não foi possível carregar. Verifique se a tabela companies foi criada no Supabase e se as permissões estão configuradas.</td></tr>';
    console.error("Erro ao carregar empresas:", error);
    return;
  }

  $("companyCount").textContent = data.length;

  if (!data.length) {
    tableBody.innerHTML =
      '<tr><td colspan="4">Nenhuma empresa cadastrada. Clique em “Nova empresa” para começar.</td></tr>';
    return;
  }

  tableBody.innerHTML = data.map((company) => `
    <tr>
      <td><strong>${escapeHTML(company.company_name)}</strong></td>
      <td>${escapeHTML(company.contact_name || "—")}</td>
      <td>
        ${escapeHTML(company.email || company.phone || "—")}
      </td>
      <td>
        <span class="company-status ${escapeHTML(company.status)}">
          ${escapeHTML(statusLabel(company.status))}
        </span>
      </td>
    </tr>
  `).join("");
}

// Criar uma empresa no banco
form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showMessage("Sua sessão não foi validada. Entre novamente.", true);
    return;
  }

  const companyName = $("companyName").value.trim();
  const contactName = $("companyContact").value.trim();
  const email = $("companyEmail").value.trim();
  const phone = $("companyPhone").value.trim();
  const status = $("companyStatus").value;

  if (!companyName) {
    showMessage("Digite o nome da empresa.", true);
    $("companyName").focus();
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Salvando...";
  showMessage("Salvando empresa...");

  try {
    const { error } = await db.from("companies").insert({
      company_name: companyName,
      contact_name: contactName || null,
      email: email || null,
      phone: phone || null,
      status,
      created_by: currentUser.id
    });

    if (error) throw error;

    showMessage("Empresa cadastrada com sucesso!");
    form.reset();

    await loadCompanies();

    setTimeout(() => {
      form.hidden = true;
      showMessage("");
    }, 1200);
  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);

    showMessage(
      error.code === "42P01" || error.code === "PGRST205"
        ? "O formulário abriu, mas falta criar a tabela companies no Supabase."
        : error.code === "42501"
          ? "O banco bloqueou o cadastro. Precisamos configurar as permissões RLS para administradores."
          : "Não foi possível salvar. Confira a tabela e as permissões no Supabase.",
      true
    );
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Salvar empresa";
  }
});

// Validar a sessão e confirmar o papel do usuário no banco
async function initializeAdmin() {
  const { data, error } = await db.auth.getSession();

  if (error || !data.session) {
    window.location.replace("index.html");
    return;
  }

  currentUser = data.session.user;

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("full_name, role")
    .eq("id", currentUser.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    await db.auth.signOut();
    window.location.replace("index.html");
    return;
  }

  if ($("adminName")) {
    $("adminName").textContent =
      profile.full_name || "Administrador";
  }

  if ($("connectionStatus")) {
    $("connectionStatus").textContent = "Conectado";
  }

  await loadCompanies();
}

initializeAdmin();
