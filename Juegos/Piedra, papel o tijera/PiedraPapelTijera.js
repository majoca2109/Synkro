firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});
const db = firebase.firestore();

const username = localStorage.getItem("username");
if (!username) window.location.href = "../../index.html";

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    const data = doc.data();
    profilePic.src = data.profilePic || "../../default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
  }
}

document.getElementById("cerrar-sesion").onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../../index.html";
};

cargarUsuario();

const choices = document.querySelectorAll("#choices button");
const resultDiv = document.getElementById("result");
const animationDiv = document.getElementById("animation");
const playAgainBtn = document.getElementById("play-again");

const opciones = ["piedra", "papel", "tijera"];

choices.forEach(btn => {
  btn.addEventListener("click", () => {
    const userChoice = btn.dataset.choice;
    const computerChoice = opciones[Math.floor(Math.random() * 3)];

    resultDiv.textContent = "";
    animationDiv.classList.remove("hidden");
    playAgainBtn.classList.add("hidden");

    setTimeout(() => {
      animationDiv.classList.add("hidden");

      let resultado;
      if (userChoice === computerChoice) {
        resultado = "¡Empate!";
      } else if (
        (userChoice === "piedra" && computerChoice === "tijera") ||
        (userChoice === "papel" && computerChoice === "piedra") ||
        (userChoice === "tijera" && computerChoice === "papel")
      ) {
        resultado = "¡Ganaste! 🎉 +5 Novas";
        actualizarNovas(5);
      } else {
        resultado = "Perdiste 😢";
      }

      resultDiv.textContent = `Elegiste ${userChoice}, CPU eligió ${computerChoice}. ${resultado}`;
      playAgainBtn.classList.remove("hidden");
    }, 1500);
  });
});

playAgainBtn.onclick = () => {
  resultDiv.textContent = "";
  playAgainBtn.classList.add("hidden");
};

async function actualizarNovas(puntos) {
  const ref = db.collection("usuarios").doc(username);
  await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const actuales = doc.data().novaPoints || 0;
    t.update(ref, { novaPoints: actuales + puntos });
    novaValue.textContent = actuales + puntos;
  });
}
