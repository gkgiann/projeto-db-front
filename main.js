const API_URL = "http://localhost:3000/user";
let isEditing = false;
let currentUserEmail = null;
const createTitle = document.querySelector(".create-title");
const btnCriar = document.querySelector(".btn-create");
const btnBuscar = document.querySelector(".btn-search");

async function fetchUsers() {
  const loadingMessage = document.getElementById("loading-message");
  loadingMessage.style.display = "block";

  try {
    const response = await fetch(`${API_URL}/all`);
    const data = await response.json();
    displayUsers(data.users);
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  } finally {
    loadingMessage.style.display = "none";
  }
}

function displayUsers(users) {
  const userList = document.getElementById("user-list");
  userList.innerHTML = users
    .map(
      (user) => `
        <div>
          <div class="user-info">
            <span class="user-name">${user.name}</span>
            <span class="user-email">${user.email}</span>
          </div>
          <div class="user-actions">
            <button onclick="startEditUser('${user.name}', '${user.email}')">Editar</button>
            <button class="btn-delete-${user.id}" onclick="deleteUser('${user.email}', '${user.id}')">Deletar</button>
          </div>
        </div>
      `
    )
    .join("");
}

document
  .getElementById("add-user-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;

    if (isEditing) {
      btnCriar.innerHTML = "Editando...";
      await fetch(`${API_URL}/${currentUserEmail}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      isEditing = false;
      currentUserEmail = null;
      btnCriar.innerHTML = "Adicionar Usuário";
      createTitle.innerHTML = "Criar Novo Usuário";
      document.getElementById("email").disabled = false;
    } else {
      btnCriar.innerHTML = "Salvando...";
      const email = document.getElementById("email").value;
      await fetch(`${API_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
    }

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    fetchUsers();
    btnCriar.innerHTML = "Adicionar Usuário";
  });

function startEditUser(name, email) {
  btnCriar.innerHTML = "Editar";
  createTitle.innerHTML = "Editar Usuário";
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("email").disabled = true;
  isEditing = true;
  currentUserEmail = email;
}

async function deleteUser(email, id) {
  document.querySelector(`.btn-delete-${id}`).innerHTML = "Deletando...";
  await fetch(`${API_URL}/${email}`, { method: "DELETE" });
  fetchUsers();
}

fetchUsers();

async function fetchUserByEmail(email) {
  const loadingMessage = document.getElementById("loading-message");
  loadingMessage.style.display = "block";

  try {
    const response = await fetch(`${API_URL}/${email}`);
    if (response.ok) {
      const data = await response.json();
      if (data.user === null) {
        alert("Usuário não encontrado!");
        fetchUsers();
      } else {
        displayUsers([data]);
      }
    } else {
      alert("Usuário não encontrado!");
      displayUsers([]);
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
  } finally {
    loadingMessage.style.display = "none";
  }
}

document
  .getElementById("search-user-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("search-email").value;
    await fetchUserByEmail(email);
  });
