// Firebase setup
firebase.initializeApp({
  apiKey: "AIzaSyAZekosHAhS84eh0bgPFJ9AuUcITtdxpKs",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");

if (!username) window.location.href = "../../index.html";

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");
const cerrarSesionBtn = document.getElementById("cerrar-sesion");

let usuarioData = {};

cerrarSesionBtn.onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../../index.html";
};

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    usuarioData = doc.data();
    profilePic.src = usuarioData.profilePic || "../../default-profile.png";
    novaValue.textContent = usuarioData.novaPoints ?? 0;
  }
}

cargarUsuario();

// Juego
const palabras = ["javascript", "ahorcado", "frontend", "firebase", "desarrollo"];
let palabraSecreta = "";
let letrasAdivinadas = [];
let intentosRestantes = 6;

const wordDisplay = document.getElementById("word-display");
const letterButtons = document.getElementById("letter-buttons");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");
const canvas = document.getElementById("hangman-canvas");
const ctx = canvas.getContext("2d");

function iniciarJuego() {
  palabraSecreta = palabras[Math.floor(Math.random() * palabras.length)];
  letrasAdivinadas = [];
  intentosRestantes = 6;
  message.textContent = "";
  restartButton.classList.add("hidden");
  limpiarCanvas();
  mostrarPalabra();
  crearBotones();
}

function mostrarPalabra() {
  const display = palabraSecreta
    .split("")
    .map(l => (letrasAdivinadas.includes(l) ? l : "_"))
    .join(" ");
  wordDisplay.textContent = display;

  if (!display.includes("_")) {
    message.textContent = "¡Correcto! +5 NovaPoints";
    actualizarNovaPoints(5);
    deshabilitarBotones();
    restartButton.classList.remove("hidden");
  }
}

function crearBotones() {
  letterButtons.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letra = String.fromCharCode(i).toLowerCase();
    const btn = document.createElement("button");
    btn.textContent = letra;
    btn.onclick = () => manejarIntento(letra, btn);
    letterButtons.appendChild(btn);
  }
}

function manejarIntento(letra, btn) {
  btn.disabled = true;
  if (palabraSecreta.includes(letra)) {
    btn.classList.add("correct");
    letrasAdivinadas.push(letra);
    mostrarPalabra();
  } else {
    btn.classList.add("wrong");
    intentosRestantes--;
    dibujarParte(intentosRestantes);
    if (intentosRestantes === 0) {
      message.textContent = `¡Has perdido! Era "${palabraSecreta}".`;
      deshabilitarBotones();
      restartButton.classList.remove("hidden");
    }
  }
}

function deshabilitarBotones() {
  const buttons = letterButtons.querySelectorAll("button");
  buttons.forEach(b => (b.disabled = true));
}

async function actualizarNovaPoints(puntos) {
  const nuevos = (usuarioData.novaPoints || 0) + puntos;
  await db.collection("usuarios").doc(username).update({ novaPoints: nuevos });
  novaValue.textContent = nuevos;
  usuarioData.novaPoints = nuevos;
}

// Canvas
function limpiarCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Base
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, 240); ctx.lineTo(190, 240); // suelo
  ctx.moveTo(60, 240); ctx.lineTo(60, 20);   // poste
  ctx.lineTo(150, 20);                       // brazo
  ctx.lineTo(150, 40);                       // soga
  ctx.stroke();
}

function dibujarParte(intentos) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  switch (intentos) {
    case 5: // Cabeza
      ctx.beginPath();
      ctx.arc(150, 60, 20, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 4: // Cuerpo
      ctx.beginPath();
      ctx.moveTo(150, 80); ctx.lineTo(150, 140);
      ctx.stroke();
      break;
    case 3: // Brazo izq
      ctx.beginPath();
      ctx.moveTo(150, 90); ctx.lineTo(130, 120);
      ctx.stroke();
      break;
    case 2: // Brazo der
      ctx.beginPath();
      ctx.moveTo(150, 90); ctx.lineTo(170, 120);
      ctx.stroke();
      break;
    case 1: // Pierna izq
      ctx.beginPath();
      ctx.moveTo(150, 140); ctx.lineTo(130, 180);
      ctx.stroke();
      break;
    case 0: // Pierna der
      ctx.beginPath();
      ctx.moveTo(150, 140); ctx.lineTo(170, 180);
      ctx.stroke();
      break;
  }
}

restartButton.onclick = iniciarJuego;

iniciarJuego();
