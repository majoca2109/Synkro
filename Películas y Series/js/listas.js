firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");

if (!username) window.location.href = "../index.html";

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");
const cerrarSesionBtn = document.getElementById("cerrar-sesion");
const contenedor = document.getElementById("listas-container");
const buscador = document.getElementById("buscador");

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    const data = doc.data();
    profilePic.src = data.profilePic || "../default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
  } else {
    localStorage.clear();
    window.location.href = "../index.html";
  }
}

cerrarSesionBtn.onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../index.html";
};

async function cargarListas() {
  const snap = await db.collection("listas").get();

  contenedor.innerHTML = "";

  snap.forEach(doc => {
    const lista = doc.data();
    const card = document.createElement("div");
    card.className = "lista-card";
    card.onclick = () => {
      window.location.href = `listas/${lista.nombre}.html`;
    };

    card.innerHTML = `
      <img src="${lista.imagen}" alt="${lista.nombre}" />
      <div class="titulo">${lista.nombre}</div>
    `;

    contenedor.appendChild(card);
  });
}

buscador.addEventListener("input", async () => {
  const termino = buscador.value.toLowerCase();
  const snap = await db.collection("listas").get();

  contenedor.innerHTML = "";

  snap.forEach(doc => {
    const lista = doc.data();
    if (lista.nombre.toLowerCase().includes(termino)) {
      const card = document.createElement("div");
      card.className = "lista-card";
      card.onclick = () => {
        window.location.href = `listas/${lista.nombre}.html`;
      };

      card.innerHTML = `
        <img src="${lista.imagen}" alt="${lista.nombre}" />
        <div class="titulo">${lista.nombre}</div>
      `;

      contenedor.appendChild(card);
    }
  });
});

cargarUsuario();
cargarListas();
