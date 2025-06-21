firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");
if (!username) window.location.href = "../../index.html";

const queryString = window.location.pathname.split("/").pop().replace(".html", "");
const nombrePelícula = decodeURIComponent(queryString);

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");
const cerrarSesionBtn = document.getElementById("cerrar-sesion");

const favoritoBtn = document.getElementById("favorito-btn");
const vistoBtn = document.getElementById("visto-btn");

cerrarSesionBtn.onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../../index.html";
};

let peliculaData = null;

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    const data = doc.data();
    profilePic.src = data.profilePic || "../default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
  } else {
    localStorage.clear();
    window.location.href = "../../index.html";
  }
}

async function actualizarEstadoBotones() {
  if (!peliculaData) return;

  // Referencias a los documentos favoritos y vistas
  const favRef = db.collection("usuarios").doc(username).collection("películas y series favoritas").doc(peliculaData.nombre);
  const vistoRef = db.collection("usuarios").doc(username).collection("películas y series vistas").doc(peliculaData.nombre);

  const [favDoc, vistoDoc] = await Promise.all([favRef.get(), vistoRef.get()]);

  if (favDoc.exists) {
    favoritoBtn.textContent = "Eliminar de Favoritos";
  } else {
    favoritoBtn.textContent = "Añadir a Favoritos";
  }

  if (vistoDoc.exists) {
    vistoBtn.textContent = "Eliminar de Vistas";
  } else {
    vistoBtn.textContent = "Añadir a Vistas";
  }
}

async function toggleFavorito() {
  if (!peliculaData) return;

  const favRef = db.collection("usuarios").doc(username).collection("películas y series favoritas").doc(peliculaData.nombre);
  const favDoc = await favRef.get();

  if (favDoc.exists) {
    // Eliminar favorito
    await favRef.delete();
    favoritoBtn.textContent = "Añadir a Favoritos";
  } else {
    // Añadir favorito con datos + fecha
    await favRef.set({
      ...peliculaData,
      fechaAñadido: new Date()
    });
    favoritoBtn.textContent = "Eliminar de Favoritos";
  }
}

async function toggleVisto() {
  if (!peliculaData) return;

  const vistoRef = db.collection("usuarios").doc(username).collection("películas y series vistas").doc(peliculaData.nombre);
  const vistoDoc = await vistoRef.get();

  if (vistoDoc.exists) {
    // Eliminar visto
    await vistoRef.delete();
    vistoBtn.textContent = "Añadir a Vistas";
  } else {
    // Añadir visto con datos + fecha
    await vistoRef.set({
      ...peliculaData,
      fechaVisto: new Date()
    });
    vistoBtn.textContent = "Eliminar de Vistas";
  }
}

async function cargarPelicula() {
  const snap = await db.collection("Películas y Series")
    .where("nombre", "==", nombrePelícula)
    .limit(1)
    .get();

  if (!snap.empty) {
    peliculaData = snap.docs[0].data();

    document.getElementById("imagen").src = peliculaData.imagenPortada || peliculaData.imagenPelícula;
    document.getElementById("nombre").textContent = peliculaData.nombre;
    document.getElementById("fechaEstreno").textContent = peliculaData.fechaEstreno || "Desconocida";
    document.getElementById("duracion").textContent = peliculaData.duracion || "N/A";
    document.getElementById("edadMinima").textContent = peliculaData.edadMinima || "N/A";
    document.getElementById("sinopsis").textContent = peliculaData.sinopsis || "No disponible";

    generarEnlaces("generos", peliculaData.generos, "../Categorías");
    generarEnlaces("listas", peliculaData.listas, "../listas");
    generarEnlaces("actores", peliculaData.actores, "../actores");

    const videoContainer = document.getElementById("video-container");
    const videoPlayer = document.getElementById("video-player");

    document.getElementById("ver-btn").onclick = () => {
      if (peliculaData.ver) {
        videoPlayer.src = peliculaData.ver;
        videoContainer.classList.remove("hidden");
        videoPlayer.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("No hay video disponible para esta película.");
      }
    };

    // Actualizar botones favoritos y vistos
    await actualizarEstadoBotones();

    // Listeners para botones
    favoritoBtn.onclick = toggleFavorito;
    vistoBtn.onclick = toggleVisto;

  } else {
    document.querySelector("main").innerHTML = "<p>Película no encontrada.</p>";
  }
}

function generarEnlaces(id, items, basePath) {
  const contenedor = document.getElementById(id);
  contenedor.innerHTML = "";

  if (Array.isArray(items)) {
    items.forEach(item => {
      const span = document.createElement("span");
      span.textContent = item;
      span.onclick = () => window.location.href = `${basePath}/${item}.html`;
      contenedor.appendChild(span);
    });
  } else {
    contenedor.textContent = "No disponible";
  }
}

cargarUsuario();
cargarPelicula();
