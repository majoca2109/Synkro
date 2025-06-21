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

// Juego Snake
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };
let food = {
  x: Math.floor(Math.random() * 19 + 1) * box,
  y: Math.floor(Math.random() * 19 + 1) * box
};
let score = 0;
let d;
let game;

document.addEventListener("keydown", direction);

function direction(event) {
  if (event.keyCode == 37 && d != "RIGHT") d = "LEFT";
  else if (event.keyCode == 38 && d != "DOWN") d = "UP";
  else if (event.keyCode == 39 && d != "LEFT") d = "RIGHT";
  else if (event.keyCode == 40 && d != "UP") d = "DOWN";
}

canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchmove", handleTouchMove, false);

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
  const firstTouch = evt.touches[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) return;

  let xUp = evt.touches[0].clientX;
  let yUp = evt.touches[0].clientY;

  let xDiff = xDown - xUp;
  let yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0 && d != "RIGHT") d = "LEFT";
    else if (xDiff < 0 && d != "LEFT") d = "RIGHT";
  } else {
    if (yDiff > 0 && d != "DOWN") d = "UP";
    else if (yDiff < 0 && d != "UP") d = "DOWN";
  }

  xDown = null;
  yDown = null;
}

function draw() {
  ctx.fillStyle = "#1e243d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? "#0dd85d" : "#2186eb";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = "#0d1128";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "#ff4f4f";
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (d == "LEFT") snakeX -= box;
  if (d == "UP") snakeY -= box;
  if (d == "RIGHT") snakeX += box;
  if (d == "DOWN") snakeY += box;

  if (snakeX == food.x && snakeY == food.y) {
    score++;
    food = {
      x: Math.floor(Math.random() * 19 + 1) * box,
      y: Math.floor(Math.random() * 19 + 1) * box
    };
  } else {
    snake.pop();
  }

  let newHead = {
    x: snakeX,
    y: snakeY
  };

  if (
    snakeX < 0 || snakeX >= canvas.width ||
    snakeY < 0 || snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    actualizarNovas(score);
    return;
  }

  snake.unshift(newHead);

  document.getElementById("score").textContent = "Puntuación: " + score;
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x == array[i].x && head.y == array[i].y) {
      return true;
    }
  }
  return false;
}

document.getElementById("startBtn").addEventListener("click", () => {
  snake = [];
  snake[0] = { x: 9 * box, y: 10 * box };
  score = 0;
  d = null;
  clearInterval(game);
  game = setInterval(draw, 100);
});

async function actualizarNovas(puntos) {
  const ref = db.collection("usuarios").doc(username);
  await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const actuales = doc.data().novaPoints || 0;
    t.update(ref, { novaPoints: actuales + puntos });
    novaValue.textContent = actuales + puntos;
  });
}
