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

const actorId = decodeURIComponent(window.location.pathname.split("/").pop().replace(".html", ""));
const contenedor = document.getElementById("peliculas-container");
const buscador = document.getElementById("buscador");
const popup = document.getElementById("popup-subs");
const popupText = document.getElementById("popup-text");

let usuarioData = {};
let peliculas = [];  // guardamos todas las películas para filtrar localmente

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    usuarioData = doc.data();
    profilePic.src = usuarioData.profilePic || "../default-profile.png";
    novaValue.textContent = usuarioData.novaPoints ?? 0;
  }
}

cerrarSesionBtn.onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../index.html";
};

function cerrarPopup() {
  popup.classList.add("hidden");
}

function mostrarPopup(nombreSubs) {
  popupText.textContent = `Subscripción - requerida (${nombreSubs})`;
  popup.classList.remove("hidden");
}

async function cargarActor() {
  const doc = await db.collection("actores").doc(actorId).get();
  if (!doc.exists) return;

  const data = doc.data();

  document.getElementById("foto-actor").src = data.foto || "";
  document.getElementById("nombre-actor").textContent = data.nombre || "";
  document.getElementById("fecha-nacimiento").textContent = data.fechanacimiento || "";
  document.getElementById("lugar-nacimiento").textContent = data.lugarnacimiento || "";
  document.getElementById("resumen").textContent = data.resumen || "";
}

function mostrarPeliculas(lista) {
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  lista.forEach(item => {
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

async function cargarPeliculas() {
  const snap = await db.collection("Películas y Series")
    .where("actores", "array-contains", actorId)
    .get();

  peliculas = [];
  snap.forEach(doc => {
    peliculas.push(doc.data());
  });

  filtrarYMostrarPeliculas();
}

function filtrarYMostrarPeliculas() {
  // Filtrar por edad del usuario y por texto buscado
  const edadUsuario = usuarioData.age ?? 0;
  const textoBusqueda = buscador.value.toLowerCase();

  // Filtrar películas que tienen edadMinima <= edadUsuario y que coincidan con búsqueda
  const filtradas = peliculas.filter(pel => {
    const edadMin = pel.edadMinima ?? 0;
    const nombre = pel.nombre ?? "";
    return edadMin <= edadUsuario && nombre.toLowerCase().includes(textoBusqueda);
  });

  mostrarPeliculas(filtradas);
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

buscador.addEventListener("input", () => {
  filtrarYMostrarPeliculas();
});

// Carga inicial
(async () => {
  await cargarUsuario();
  await cargarActor();
  await cargarPeliculas();
})();
