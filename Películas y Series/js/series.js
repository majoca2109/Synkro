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
const contenedor = document.getElementById("series-container");
const buscador = document.getElementById("buscador");

const popup = document.getElementById("popup-subs");
const popupText = document.getElementById("popup-text");

let usuarioData = {};

cerrarSesionBtn.onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../index.html";
};

function cerrarPopup() {
  popup.classList.add("hidden");
}

function mostrarPopup(nombreSubs) {
  popupText.textContent = `Serie con subscripción - (${nombreSubs})`;
  popup.classList.remove("hidden");
}

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    usuarioData = doc.data();
    profilePic.src = usuarioData.profilePic || "../default-profile.png";
    novaValue.textContent = usuarioData.novaPoints ?? 0;
    await cargarSeries(); // Se carga después de obtener edad
  } else {
    localStorage.clear();
    window.location.href = "../index.html";
  }
}

async function cargarSeries(filtro = "") {
  const snap = await db.collection("Películas y Series")
    .where("tipo", "==", "Serie")
    .get();

  contenedor.innerHTML = "";

  snap.forEach(doc => {
    const serie = doc.data();

    // Filtrar por edad
    if (serie.edadMinima > usuarioData.age) return;

    // Filtro por texto
    if (filtro && !serie.nombre.toLowerCase().includes(filtro)) return;

    const card = document.createElement("div");
    card.className = "pelicula-card";
    card.onclick = () => manejarAccesoSerie(serie);

    card.innerHTML = `
      <img src="${serie.imagenCartelera}" alt="${serie.nombre}" />
      <div class="titulo">${serie.nombre}</div>
    `;

    contenedor.appendChild(card);
  });
}

async function manejarAccesoSerie(serie) {
  const subsRequeridas = Array.isArray(serie.subs) ? serie.subs : ["Gratis"];
  const subsUsuario = usuarioData.subs || "";

  const accesoPermitido =
    subsRequeridas.includes("Gratis") ||
    subsRequeridas.includes(subsUsuario);

  if (accesoPermitido) {
    window.location.href = `series/${serie.nombre}.html`;
  } else {
    mostrarPopup(subsRequeridas.join(", "));
  }
}

buscador.addEventListener("input", async () => {
  const termino = buscador.value.toLowerCase();
  await cargarSeries(termino);
});

cargarUsuario();
