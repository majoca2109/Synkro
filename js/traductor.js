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

document.getElementById("cerrar-sesion").onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "index.html";
};

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    const data = doc.data();
    profilePic.src = data.profilePic || "default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
  }
}

cargarUsuario();

// Traducción
const traducirBtn = document.getElementById("traducir-btn");
const inputText = document.getElementById("input-text");
const resultadoTexto = document.getElementById("resultado-texto");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");

const API_KEY = "AIzaSyAZekosHAhS84eh0bgPFJ9AuUcITtdxpKs";

const idiomas = {
  "es": "Español",
  "en": "Inglés",
  "fr": "Francés",
  "de": "Alemán",
  "it": "Italiano",
  "pt": "Portugués",
  "ro": "Rumano",
  "zh": "Chino (Simplificado)",
  "ja": "Japonés",
  "ko": "Coreano",
  "ar": "Árabe",
  "ru": "Ruso",
  "pl": "Polaco",
  "tr": "Turco",
  "nl": "Neerlandés",
  "sv": "Sueco",
  "hi": "Hindi",
  "th": "Tailandés"
};

// Cargar idiomas
Object.entries(idiomas).forEach(([code, name]) => {
  const optionFrom = document.createElement("option");
  optionFrom.value = code;
  optionFrom.textContent = name;

  const optionTo = optionFrom.cloneNode(true);

  fromSelect.appendChild(optionFrom);
  toSelect.appendChild(optionTo);
});

fromSelect.value = "es";
toSelect.value = "en";

traducirBtn.onclick = async () => {
  const texto = inputText.value.trim();
  const from = fromSelect.value;
  const to = toSelect.value;

  if (!texto) {
    resultadoTexto.textContent = "Por favor, escribe algo para traducir.";
    return;
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: texto,
          source: from,
          target: to,
          format: "text"
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      resultadoTexto.textContent = `Error: ${data.error.message}`;
    } else {
      resultadoTexto.textContent = data.data.translations[0].translatedText;
    }
  } catch (err) {
    resultadoTexto.textContent = "Error al traducir. Inténtalo más tarde.";
    console.error(err);
  }
};
