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

const form = document.getElementById("form-contacto");
const status = document.getElementById("form-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();

  if (!nombre || !email || !mensaje) {
    status.textContent = "Por favor, completa todos los campos.";
    status.style.color = "orange";
    return;
  }

  try {
    await db.collection("mensajesContacto").add({
      username,
      nombre,
      email,
      mensaje,
      fecha: new Date().toISOString()
    });

    status.textContent = "¡Mensaje enviado con éxito!";
    status.style.color = "#2edb82";
    form.reset();
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    status.textContent = "Ocurrió un error. Inténtalo más tarde.";
    status.style.color = "red";
  }
});
