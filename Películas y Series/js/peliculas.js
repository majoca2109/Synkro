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
const contenedor = document.getElementById("peliculas-container");
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
  popupText.textContent = `Película con subscripción - (${nombreSubs})`;
  popup.classList.remove("hidden");
}

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    usuarioData = doc.data();
    profilePic.src = usuarioData.profilePic || "../default-profile.png";
    novaValue.textContent = usuarioData.novaPoints ?? 0;
    await cargarPeliculas(); // Se carga después de obtener edad
  } else {
    localStorage.clear();
    window.location.href = "../index.html";
  }
}

async function cargarPeliculas(filtro = "") {
  const snap = await db.collection("Películas y Series")
    .where("tipo", "==", "película")
    .get();

  contenedor.innerHTML = "";

  snap.forEach(doc => {
    const pelicula = doc.data();

    // Filtro por edad
    if (pelicula.edadMinima > usuarioData.age) return;

    // Filtro por búsqueda
    if (filtro && !pelicula.nombre.toLowerCase().includes(filtro)) return;

    const card = document.createElement("div");
    card.className = "pelicula-card";
    card.onclick = () => manejarAccesoPelicula(pelicula);

    card.innerHTML = `
      <img src="${pelicula.imagenCartelera}" alt="${pelicula.nombre}" />
      <div class="titulo">${pelicula.nombre}</div>
    `;

    contenedor.appendChild(card);
  });
}

async function manejarAccesoPelicula(pelicula) {
  const subsRequeridas = Array.isArray(pelicula.subs) ? pelicula.subs : ["Gratis"];
  const subsUsuario = usuarioData.subs || ""; // string

  const accesoPermitido =
    subsRequeridas.includes("Gratis") ||
    subsRequeridas.includes(subsUsuario);

  if (accesoPermitido) {
    window.location.href = `películas/${pelicula.nombre}.html`;
  } else {
    mostrarPopup(subsRequeridas.join(", "));
  }
}

buscador.addEventListener("input", async () => {
  const termino = buscador.value.toLowerCase();
  await cargarPeliculas(termino);
});

cargarUsuario();
