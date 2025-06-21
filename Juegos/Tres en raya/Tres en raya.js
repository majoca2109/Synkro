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

document.getElementById("cerrar-sesion").onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../../index.html";
};

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    const data = doc.data();
    profilePic.src = data.profilePic || "../../default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
  }
}
cargarUsuario();

const boardElement = document.getElementById("board");
const mensaje = document.getElementById("mensaje");
const reiniciarBtn = document.getElementById("reiniciar");
const dificultadSelect = document.getElementById("dificultad");

let board, turno, dificultad;
const jugador = "X";
const maquina = "O";

function iniciarJuego() {
  dificultad = dificultadSelect.value;
  board = Array(9).fill(null);
  turno = jugador;
  mensaje.textContent = "Tu turno";
  mensaje.classList.remove("victoria");
  reiniciarBtn.classList.add("hidden");
  renderizarTablero();
}

function renderizarTablero() {
  boardElement.innerHTML = "";
  board.forEach((valor, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (valor) cell.classList.add(valor.toLowerCase());
    cell.textContent = valor || "";
    cell.addEventListener("click", () => jugar(i));
    boardElement.appendChild(cell);
  });
}

function jugar(index) {
  if (board[index] || turno !== jugador) return;

  board[index] = jugador;
  turno = maquina;
  renderizarTablero();

  if (verificarGanador(jugador)) {
    victoria("¡Ganaste! 🎉 +5 Novas", true);
    return;
  }

  if (board.every(cell => cell)) {
    mensaje.textContent = "¡Empate!";
    reiniciarBtn.classList.remove("hidden");
    return;
  }

  setTimeout(turnoMaquina, 600);
}

function turnoMaquina() {
  let jugada;
  const vacias = board.map((v, i) => v ? null : i).filter(v => v !== null);

  if (dificultad === "facil") {
    jugada = vacias[Math.floor(Math.random() * vacias.length)];
  } else if (dificultad === "normal") {
    jugada = encontrarJugada(board, maquina) || vacias[Math.floor(Math.random() * vacias.length)];
  } else if (dificultad === "dificil") {
    jugada = encontrarMejorMovimiento(board, maquina);
  }

  board[jugada] = maquina;
  turno = jugador;
  renderizarTablero();

  if (verificarGanador(maquina)) {
    victoria("Perdiste 😢");
  } else if (board.every(cell => cell)) {
    mensaje.textContent = "¡Empate!";
    reiniciarBtn.classList.remove("hidden");
  } else {
    mensaje.textContent = "Tu turno";
  }
}

function verificarGanador(simbolo) {
  const combinaciones = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return combinaciones.some(comb => comb.every(i => board[i] === simbolo));
}

function encontrarJugada(tablero, simbolo) {
  for (let i = 0; i < 9; i++) {
    if (!tablero[i]) {
      tablero[i] = simbolo;
      if (verificarGanador(simbolo)) {
        tablero[i] = null;
        return i;
      }
      tablero[i] = null;
    }
  }
  return null;
}

// Minimax para dificultad difícil
function encontrarMejorMovimiento(tablero, simbolo) {
  const oponente = simbolo === jugador ? maquina : jugador;

  function minimax(tab, depth, isMaximizing) {
    if (verificarGanador(maquina)) return 10 - depth;
    if (verificarGanador(jugador)) return depth - 10;
    if (tab.every(cell => cell)) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tab[i]) {
          tab[i] = maquina;
          const eval = minimax(tab, depth + 1, false);
          tab[i] = null;
          maxEval = Math.max(maxEval, eval);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tab[i]) {
          tab[i] = jugador;
          const eval = minimax(tab, depth + 1, true);
          tab[i] = null;
          minEval = Math.min(minEval, eval);
        }
      }
      return minEval;
    }
  }

  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (!tablero[i]) {
      tablero[i] = maquina;
      const score = minimax(tablero, 0, false);
      tablero[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function victoria(texto, sumarNovas = false) {
  mensaje.textContent = texto;
  mensaje.classList.add("victoria");
  reiniciarBtn.classList.remove("hidden");
  if (sumarNovas) actualizarNovas(5);
}

async function actualizarNovas(puntos) {
  const ref = db.collection("usuarios").doc(username);
  await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const actuales = doc.data().novaPoints || 0;
    t.update(ref, { novaPoints: actuales + puntos });
    novaValue.textContent = actuales + puntos;
  });
}

reiniciarBtn.onclick = iniciarJuego;
dificultadSelect.onchange = iniciarJuego;

iniciarJuego();
