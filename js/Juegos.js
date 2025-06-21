firebase.initializeApp({
  apiKey: "AIzaSyAZekosHAhS84eh0bgPFJ9AuUcITtdxpKs",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");

if (!username) window.location.href = "index.html";

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");
const cerrarSesionBtn = document.getElementById("cerrar-sesion");
const container = document.getElementById("juegos-container");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");

let usuarioData = {};

function cerrarPopup() {
  popup.classList.add("hidden");
}

cerrarSesionBtn.onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "index.html";
};

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    usuarioData = doc.data();
    profilePic.src = usuarioData.profilePic || "default-profile.png";
    novaValue.textContent = usuarioData.novaPoints ?? 0;
  }
}

async function cargarJuegos() {
  const snap = await db.collection("Juegos").get();
  container.innerHTML = "";

  snap.forEach(doc => {
    const juego = doc.data();
    const card = document.createElement("div");
    card.className = "juego-card";

    card.innerHTML = `
      <img src="${juego.image}" alt="${juego.name}" />
      <h3>${juego.name}</h3>
    `;

    card.onclick = () => manejarAccesoJuego(juego);

    container.appendChild(card);
  });
}

function manejarAccesoJuego(juego) {
  const subsRequerida = juego.subs || [];
  const subsUsuario = usuarioData.subs || [];

  if (juego.type === "Gratis" || subsRequerida.some(sub => subsUsuario.includes(sub))) {
    window.location.href = `Juegos/${juego.name}/${juego.name}.html`;
  } else {
    popupText.textContent = `Subscripción - ${subsRequerida[0] || "Requerida"}`;
    popup.classList.remove("hidden");
  }
}

cargarUsuario();
cargarJuegos();
