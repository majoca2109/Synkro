firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");
if (!username) window.location.href = "../../index.html";

const queryString = window.location.pathname.split("/").pop().replace(".html", "");
const nombreSerie = decodeURIComponent(queryString);

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");

let datosSerieGlobal = null;

document.getElementById("cerrar-sesion").onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../../index.html";
};

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    const data = doc.data();
    profilePic.src = data.profilePic || "../default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
  }
}

async function cargarSerie() {
  const snap = await db.collection("Películas y Series")
    .where("nombre", "==", nombreSerie)
    .where("tipo", "==", "Serie")
    .limit(1)
    .get();

  if (snap.empty) {
    document.querySelector("main").innerHTML = "<p>Serie no encontrada.</p>";
    return;
  }

  const data = snap.docs[0].data();
  datosSerieGlobal = data;

  document.getElementById("imagenCartelera").src = data.imagenCartelera || "";
  document.getElementById("nombre").textContent = data.nombre || "";
  document.getElementById("sinopsis").textContent = data.sinopsis || "";
  document.getElementById("edadMinima").textContent = data.edadMinima || "";
  document.getElementById("numeroTemporadas").textContent = data.numeroTemporadas || "0";
  document.getElementById("numeroEpisodios").textContent = data.numeroEpisodios || "0";

  generarEnlaces("generos", data.generos, "../Categorías");
  generarEnlaces("listas", data.listas, "../listas");
  generarEnlaces("actores", data.actores, "../actores");

  const temporadas = data.imagenTemporada || {};
  const container = document.getElementById("temporadas-container");

  Object.keys(temporadas).sort().forEach(key => {
    const temporada = temporadas[key];

    const div = document.createElement("div");
    div.className = "temporada";

    div.innerHTML = `
      <img src="${temporada.imagentemporada}" alt="Temporada ${temporada.numerotemporada}" />
      <div class="temporada-info">
        <h3>Temporada ${temporada.numerotemporada}</h3>
        <p>${temporada.resumentemporada || ""}</p>
        <p><strong>Episodios:</strong> ${temporada.numeroepisodios || "?"}</p>
        <button onclick="window.location.href='temporadas/${encodeURIComponent(data.nombre)}${temporada.numerotemporada}.html'">Ver</button>
      </div>
    `;

    container.appendChild(div);
  });

  manejarFavoritosYVistos();
}

function generarEnlaces(id, items, basePath) {
  const contenedor = document.getElementById(id);
  contenedor.innerHTML = "";

  if (Array.isArray(items)) {
    items.forEach(item => {
      const span = document.createElement("span");
      span.textContent = item;
      span.onclick = () => window.location.href = `${basePath}/${encodeURIComponent(item)}.html`;
      contenedor.appendChild(span);
    });
  } else {
    contenedor.textContent = "No disponible";
  }
}

async function manejarFavoritosYVistos() {
  const docRef = db.collection("usuarios").doc(username);

  const favoritoBtn = document.getElementById("btn-favorito");
  const vistoBtn = document.getElementById("btn-visto");

  const favoritosRef = docRef.collection("películas y series favoritas").doc(datosSerieGlobal.nombre);
  const vistosRef = docRef.collection("películas y series vistas").doc(datosSerieGlobal.nombre);

  const [favDoc, vistoDoc] = await Promise.all([favoritosRef.get(), vistosRef.get()]);

  favoritoBtn.textContent = favDoc.exists ? "Eliminar de favoritos" : "Añadir a favoritos";
  vistoBtn.textContent = vistoDoc.exists ? "Eliminar de vistas" : "Vista";

  favoritoBtn.onclick = async () => {
    if (favDoc.exists) {
      await favoritosRef.delete();
      favoritoBtn.textContent = "Añadir a favoritos";
    } else {
      await favoritosRef.set({
        ...datosSerieGlobal,
        fechaAñadido: new Date().toISOString()
      });
      favoritoBtn.textContent = "Eliminar de favoritos";
    }
  };

  vistoBtn.onclick = async () => {
    if (vistoDoc.exists) {
      await vistosRef.delete();
      vistoBtn.textContent = "Vista";
    } else {
      await vistosRef.set({
        ...datosSerieGlobal,
        fechaVisto: new Date().toISOString()
      });
      vistoBtn.textContent = "Eliminar de vistas";
    }
  };
}

cargarUsuario();
cargarSerie();
