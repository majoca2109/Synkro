// Inicializar Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402",
});

const db = firebase.firestore();
const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "index.html";
}

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");

const btnVolver = document.getElementById("btn-volver");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

const btnSynkro = document.getElementById("btn-synkro");
const btnPeliculas = document.getElementById("btn-peliculas");
const btnSeries = document.getElementById("btn-series");
const btnListas = document.getElementById("btn-listas");

const categoriasContainer = document.getElementById("categorias-container");

const popup = document.getElementById("popup");
const popupMsg = document.getElementById("popup-message");
const btnCancelar = document.getElementById("popup-btn-cancelar");

// Navegación
btnVolver.onclick = () => history.back();
btnCerrarSesion.onclick = () => {
  localStorage.clear();
  window.location.href = "index.html";
};
profilePic.onclick = () => {
  window.location.href = "perfil.html";
};

btnSynkro.onclick = () => window.location.href = "Synkro.html";
btnPeliculas.onclick = () => window.location.href = "Películas y Series/películas.html";
btnSeries.onclick = () => window.location.href = "Películas y Series/series.html";
btnListas.onclick = () => window.location.href = "Películas y Series/listas.html";

btnCancelar.onclick = () => {
  popup.classList.add("hidden");
};

function mostrarPopup(mensaje) {
  popupMsg.textContent = mensaje;
  popup.classList.remove("hidden");
}

async function cargarUsuario() {
  try {
    const doc = await db.collection("usuarios").doc(username).get();
    if (!doc.exists) {
      localStorage.clear();
      window.location.href = "../index.html";
      return null;
    }
    const data = doc.data();
    profilePic.src = data.profilePic || "../default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
    return data;
  } catch (error) {
    console.error("Error al cargar usuario:", error);
    mostrarPopup("Error al cargar datos del usuario.");
    return null;
  }
}

async function cargarCategorias() {
  categoriasContainer.innerHTML = "";
  try {
    const snapshot = await db.collection("categorias").get();
    if (snapshot.empty) {
      categoriasContainer.textContent = "No hay categorías disponibles.";
      return;
    }

    snapshot.forEach(doc => {
      const cat = doc.data();
      const div = document.createElement("div");
      div.className = "tienda-card";
      div.style.cursor = "pointer";

      div.innerHTML = `
        <img src="${cat.image}" alt="${cat.name}" style="width:100%; border-radius: 15px 15px 0 0; max-height:150px; object-fit: cover;" />
        <h3>${cat.name}</h3>
      `;

      div.addEventListener("click", () => {
        // Navegar a la página de la categoría, nombre normalizado para URL
        const nombreURL = encodeURIComponent(cat.name);
        window.location.href = `Películas y Series/Categorías/${nombreURL}.html`;
      });

      categoriasContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    mostrarPopup("Error al cargar las categorías.");
  }
}

// Inicializar todo
(async () => {
  await cargarUsuario();
  await cargarCategorias();
})();
