// Firebase config
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
const buscador = document.getElementById("buscador");
const seccionesContainer = document.getElementById("secciones-container");

btnVolver.onclick = () => history.back();

btnCerrarSesion.onclick = async () => {
  try {
    const ref = db.collection("usuarios").doc(username);
    await ref.update({ line: false });
  } catch (e) {
    console.error("Error cerrando sesión:", e);
  }
  localStorage.clear();
  window.location.href = "index.html";
};

profilePic.onclick = () => {
  window.location.href = "perfil.html";
};

async function cargarUsuario() {
  try {
    const doc = await db.collection("usuarios").doc(username).get();
    if (!doc.exists) {
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }
    const data = doc.data();
    profilePic.src = data.profilePic || "default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
  } catch (err) {
    console.error("Error cargando usuario:", err);
  }
}

let secciones = [];

async function cargarSecciones() {
  seccionesContainer.innerHTML = "";
  try {
    const snapshot = await db.collection("Archivium").get();
    secciones = snapshot.docs.map(doc => doc.data());
    mostrarSecciones(secciones);
  } catch (error) {
    console.error("Error al cargar Archivium:", error);
    seccionesContainer.textContent = "Error al cargar secciones.";
  }
}

function mostrarSecciones(lista) {
  seccionesContainer.innerHTML = "";
  if (lista.length === 0) {
    seccionesContainer.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  lista.forEach(sec => {
    const div = document.createElement("div");
    div.className = "archivium-card";
    div.innerHTML = `
      <img src="${sec.imagen}" alt="${sec.nombre}">
      <h3>${sec.nombre}</h3>
      <div class="texto-preview">${sec.texto || ""}</div>
    `;
    div.onclick = () => {
      const url = `Archivium/${encodeURIComponent(sec.nombre)}.html`;
      window.location.href = url;
    };
    seccionesContainer.appendChild(div);
  });
}

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase();
  const filtrado = secciones.filter(sec => sec.nombre.toLowerCase().includes(texto));
  mostrarSecciones(filtrado);
});

(async () => {
  await cargarUsuario();
  await cargarSecciones();
})();
