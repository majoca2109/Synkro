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
const resultados = document.getElementById("resultados");
const buscador = document.getElementById("buscador");

const categoria = decodeURIComponent(window.location.pathname.split("/").pop().replace(".html", ""));
document.getElementById("titulo-categoria").textContent = `Categoría: ${categoria}`;

let usuarioData = null;
let contenidoFiltrado = [];

document.getElementById("cerrar-sesion").onclick = async () => {
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
  } else {
    localStorage.clear();
    window.location.href = "../../index.html";
  }
}

// Función que chequea si un item es apto para la edad del usuario
function esAptoPorEdad(item, edadUsuario) {
  // El campo edadMinima puede ser undefined o null o string, lo normalizamos
  let edadMinima = 0;
  if (item.edadMinima !== undefined && item.edadMinima !== null) {
    edadMinima = Number(item.edadMinima);
    if (isNaN(edadMinima)) edadMinima = 0; // fallback si edadMinima no es número válido
  }
  return edadMinima <= edadUsuario;
}

async function cargarContenido() {
  if (!usuarioData) return;

  const snap = await db.collection("Películas y Series")
    .where("generos", "array-contains", categoria)
    .get();

  const items = snap.docs.map(doc => doc.data());

  // Filtramos aquí y guardamos el resultado para búsquedas posteriores
  contenidoFiltrado = items.filter(item => esAptoPorEdad(item, usuarioData.age));

  mostrarResultados(contenidoFiltrado);

  buscador.oninput = () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = contenidoFiltrado.filter(item => item.nombre?.toLowerCase().includes(texto));
    mostrarResultados(filtrados);
  };
}

function mostrarResultados(lista) {
  resultados.innerHTML = lista.length === 0
    ? "<p>No se encontraron resultados.</p>"
    : lista.map(item => `
      <div class="item" onclick='verificarAcceso(${JSON.stringify(item)})'>
        <img src="${item.imagenCartelera}" alt="${item.nombre}" />
        <h3>${item.nombre}</h3>
      </div>
    `).join("");
}

async function verificarAcceso(item) {
  if (item.tipo === "Gratis") return navegar(item);

  if (!usuarioData) {
    alert("Error al obtener datos de usuario");
    return;
  }

  const subsUsuario = usuarioData.subs || [];

  let subsRequeridas = [];
  if (Array.isArray(item.subs)) {
    subsRequeridas = item.subs;
  } else if (typeof item.subs === "string") {
    subsRequeridas = [item.subs];
  }

  const acceso = subsRequeridas.length === 0 || subsRequeridas.some(sub => subsUsuario.includes(sub));
  acceso ? navegar(item) : mostrarPopup(subsRequeridas);
}

function navegar(item) {
  const tipoRuta = item.tipo === "película" ? "../películas" : "../series";
  window.location.href = `${tipoRuta}/${encodeURIComponent(item.nombre)}.html`;
}

function mostrarPopup(subsRequeridas) {
  const popup = document.getElementById("popup-subs");
  const mensaje = document.getElementById("popup-mensaje");

  mensaje.textContent = `Película con suscripción - (${subsRequeridas.join(", ")})`;
  popup.classList.remove("oculto");

  document.getElementById("btn-continuar").onclick = () => {
    window.location.href = "../../NovaPoints.html";
  };
  document.getElementById("btn-cancelar").onclick = () => {
    popup.classList.add("oculto");
  };
}

(async () => {
  await cargarUsuario();
  await cargarContenido();
})();
