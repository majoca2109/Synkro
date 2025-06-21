firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");

if (!username) window.location.href = "../../index.html";

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");
const cerrarSesionBtn = document.getElementById("cerrar-sesion");

const contenedor = document.getElementById("favoritas-container");
const buscador = document.getElementById("buscador");
const popup = document.getElementById("popup-subs");
const popupText = document.getElementById("popup-text");

let usuarioData = {};

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    usuarioData = doc.data();
    profilePic.src = usuarioData.profilePic || "../../default-profile.png";
    novaValue.textContent = usuarioData.novaPoints ?? 0;
  }
}

cerrarSesionBtn.onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../../index.html";
};

function cerrarPopup() {
  popup.classList.add("hidden");
}

function mostrarPopup(nombreSubs) {
  popupText.textContent = `Subscripción - requerida (${nombreSubs})`;
  popup.classList.remove("hidden");
}

async function cargarFavoritas() {
  const snap = await db.collection("usuarios")
    .doc(username)
    .collection("películas y series favoritas")
    .get();

  contenedor.innerHTML = "";

  snap.forEach(doc => {
    const item = doc.data();
    const card = document.createElement("div");
    card.className = "pelicula-card";

    card.onclick = () => manejarAcceso(item);

    card.innerHTML = `
      <img src="${item.imagenCartelera}" alt="${item.nombre}" />
      <div class="titulo">${item.nombre}</div>
    `;

    contenedor.appendChild(card);
  });
}

async function manejarAcceso(item) {
  const tipo = item.tipo;
  const nombreArchivo = item.nombre;
  const subsRequerida = item.subs || [];
  const subsUsuario = usuarioData.subs || [];

  if (item.type === "Gratis" || subsRequerida.some(sub => subsUsuario.includes(sub))) {
    const ruta = tipo === "película"
      ? `../películas/${encodeURIComponent(nombreArchivo)}.html`
      : `../series/${encodeURIComponent(nombreArchivo)}.html`;
    window.location.href = ruta;
  } else {
    mostrarPopup(subsRequerida.join(", "));
  }
}

buscador.addEventListener("input", async () => {
  const termino = buscador.value.toLowerCase();
  const snap = await db.collection("usuarios")
    .doc(username)
    .collection("películas y series favoritas")
    .get();

  contenedor.innerHTML = "";

  snap.forEach(doc => {
    const item = doc.data();
    if (item.nombre.toLowerCase().includes(termino)) {
      const card = document.createElement("div");
      card.className = "pelicula-card";

      card.onclick = () => manejarAcceso(item);

      card.innerHTML = `
        <img src="${item.imagenCartelera}" alt="${item.nombre}" />
        <div class="titulo">${item.nombre}</div>
      `;

      contenedor.appendChild(card);
    }
  });
});

cargarUsuario();
cargarFavoritas();
