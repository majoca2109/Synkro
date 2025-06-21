firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "index.html";
}

document.getElementById("btn-volver").onclick = () => history.back();
document.getElementById("btn-cerrar-sesion").onclick = () => {
  localStorage.clear();
  window.location.href = "index.html";
};

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");

profilePic.onclick = () => window.location.href = "perfil.html";

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  const data = doc.data();
  profilePic.src = data.profilePic || "default-profile.png";
  novaValue.textContent = data.novaPoints ?? 0;
}
cargarUsuario();

// Lógica de calculadora
const pantalla = document.getElementById("pantalla");
const botones = document.querySelectorAll(".teclado button");

let operacion = "";

botones.forEach(boton => {
  boton.addEventListener("click", () => {
    const valor = boton.textContent;

    if (valor === "=") {
      try {
        operacion = eval(operacion).toString();
      } catch {
        operacion = "Error";
      }
    } else if (valor === "C") {
      operacion = "";
    } else {
      operacion += valor;
    }

    pantalla.value = operacion;
  });
});
