const firebaseConfig = {
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const username = localStorage.getItem("username");
let userData = null;

// Cargar usuario
async function loadUser() {
  if (!username) return;

  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    userData = doc.data();
    document.getElementById("profilePic").src = userData.profilePic || "default-profile.png";
    document.getElementById("novaPoints").textContent = userData.novaPoints ?? 0;
  }
}

// Ir a perfil y NovaPoints
document.getElementById("profilePic").onclick = () => window.location.href = "perfil.html";
document.getElementById("novaPointsContainer").onclick = () => window.location.href = "NovaPoints.html";

// Cerrar sesión
document.getElementById("logoutButton").onclick = async () => {
  if (username) {
    await db.collection("usuarios").doc(username).update({ line: false });
  }
  localStorage.clear();
  window.location.href = "index.html";
};

// Popup
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");
const popupContinue = document.getElementById("popupContinue");
const popupButtons = document.getElementById("popupButtons");

function showPopup(message, onContinue, isPremium = false) {
  popupMessage.textContent = message;
  popupButtons.innerHTML = "";

  const btnContinue = document.createElement("button");
  btnContinue.textContent = "Continuar";
  btnContinue.onclick = () => {
    popup.style.display = "none";
    if (onContinue) onContinue();
  };
  popupButtons.appendChild(btnContinue);

  const btnCancel = document.createElement("button");
  btnCancel.textContent = "Cancelar";
  btnCancel.onclick = closePopup;
  popupButtons.appendChild(btnCancel);

  if (isPremium) {
    const btnNova = document.createElement("button");
    btnNova.textContent = "Ir a NovaPoints";
    btnNova.onclick = () => {
      popup.style.display = "none";
      window.location.href = "NovaPoints.html";
    };
    popupButtons.appendChild(btnNova);
  }

  popup.style.display = "flex";
}

function closePopup() {
  popup.style.display = "none";
}

// Cargar secciones
async function loadSections() {
  const container = document.getElementById("sectionsContainer");
  const snapshot = await db.collection("secciones").get();

  snapshot.forEach(doc => {
    const { imagenUrl, name, type, subs = [] } = doc.data();

    const card = document.createElement("div");
    card.className = "section-card";
    card.innerHTML = `
      <img src="${imagenUrl}" alt="${name}">
      <p>${name}</p>
    `;

    card.onclick = () => {
      if (type === "Gratis") {
        window.location.href = `${name}.html`;
      } else if (type === "Mixta") {
        showPopup("No todo el contenido es gratuito", () => {
          window.location.href = `${name}.html`;
        });
      } else if (type === "Pago") {
        const userSubs = userData?.subs || [];
        const hasAccess = subs.some(s => userSubs.includes(s));
        if (hasAccess) {
          window.location.href = `${name}.html`;
        } else {
          showPopup(`Contenido de subscripción - (${subs.join(', ')})`, null, true);
        }
      }
    };

    container.appendChild(card);
  });
}

// Iniciar
loadUser();
loadSections();
